import { NextResponse } from "next/server";
import { subscribeToKlaviyo } from "@/lib/klaviyo";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  WAITLIST_CONSENT_COPY,
  WAITLIST_EMAIL_MAX,
  WAITLIST_EMAIL_PATTERN
} from "@/lib/waitlist";

// Waitlist submissions land in the heldi-dev Supabase project (public.waitlist,
// schema in supabase/migrations/0002_create_waitlist.sql), the system of record
// we own. When the Klaviyo env vars exist each signup is also subscribed there
// (lib/klaviyo.ts): the waitlist list always, the weekly-letter list as well
// when the box was ticked. With no Klaviyo key the route still captures to
// Supabase and leaves synced_to_esp_at null, so early signups can be
// backfilled once the account exists
// (scripts/backfill-waitlist-to-klaviyo.mjs).

function cleanPlacement(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 40);
  return cleaned || null;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON." }, { status: 400 });
  }

  // Honeypot (same trick as the review form): bots get a polite success and
  // nothing stored.
  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const email =
    typeof body.email === "string"
      ? body.email.trim().toLowerCase().slice(0, WAITLIST_EMAIL_MAX)
      : "";
  if (!WAITLIST_EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { error: "That email does not look right." },
      { status: 400 }
    );
  }
  const marketingOptIn = body.marketingOptIn === true;
  const placement = cleanPlacement(body.placement);

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Waitlist storage is not configured." },
      { status: 503 }
    );
  }

  const now = new Date().toISOString();
  // What the row ends up saying about consent. Kept outside the try so the
  // Klaviyo call below subscribes to the same lists the row claims, rather
  // than to whatever this one submission happened to tick.
  let effectiveOptIn = marketingOptIn;
  try {
    const { data: existing, error: readError } = await supabase
      .from("waitlist")
      .select("email, marketing_opt_in")
      .eq("email", email)
      .maybeSingle();
    if (readError) throw readError;

    if (existing) {
      // Re-joining never revokes an earlier opt-in: withdrawal is the
      // unsubscribe link in every email, not an unticked box on a later visit.
      const firstOptIn = marketingOptIn && !existing.marketing_opt_in;
      effectiveOptIn = existing.marketing_opt_in || marketingOptIn;
      const { error: updateError } = await supabase
        .from("waitlist")
        .update({
          updated_at: now,
          marketing_opt_in: effectiveOptIn,
          ...(firstOptIn
            ? { marketing_opted_in_at: now, consent_copy: WAITLIST_CONSENT_COPY }
            : {})
        })
        .eq("email", email);
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase.from("waitlist").insert({
        email,
        joined_at: now,
        updated_at: now,
        source: placement,
        marketing_opt_in: marketingOptIn,
        marketing_opted_in_at: marketingOptIn ? now : null,
        consent_copy: marketingOptIn ? WAITLIST_CONSENT_COPY : null
      });
      if (insertError) throw insertError;
    }
  } catch {
    return NextResponse.json(
      { error: "Could not save that just now. Try again shortly." },
      { status: 500 }
    );
  }

  // Best-effort: the row is already safe in Supabase, so a Klaviyo hiccup (or
  // no account yet) never fails the signup. Unsynced rows keep
  // synced_to_esp_at null for a later backfill.
  try {
    const source = `heldi.co.uk waitlist (${placement ?? "unknown"})`;
    if (await subscribeToKlaviyo(email, effectiveOptIn, source)) {
      await supabase
        .from("waitlist")
        .update({ synced_to_esp_at: now })
        .eq("email", email);
    }
  } catch {
    // Backfill picks it up.
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
