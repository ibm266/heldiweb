import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { PREVIEW_COOKIE } from "@/lib/preview";

// Unlocks the consultant preview (/preview). The password lives in the
// server-only PREVIEW_PASSWORD env var, so it never ships in the client
// bundle; a correct guess mints an httpOnly cookie the server honours for
// waitlist-hidden pages (the shipping policy).

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

// Hash both sides to equal length so timingSafeEqual never throws and the
// comparison stays constant-time.
function passwordMatches(candidate: string, expected: string): boolean {
  const a = createHash("sha256").update(candidate).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const expected = process.env.PREVIEW_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { error: "Preview isn't configured yet. Set PREVIEW_PASSWORD and redeploy." },
      { status: 503 }
    );
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    if (typeof body.password === "string") password = body.password;
  } catch {
    // Malformed body falls through to the wrong-password path.
  }

  if (!password || !passwordMatches(password, expected)) {
    // A small flat delay keeps casual brute-forcing boring.
    await new Promise((resolve) => setTimeout(resolve, 400));
    return NextResponse.json({ error: "That password isn't right." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(PREVIEW_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(PREVIEW_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
