import { readFile } from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";
import { marked } from "marked";
import { COMMERCE_MODE } from "@/lib/commerce/config";
import { PREVIEW_COOKIE } from "@/lib/preview";

// The markdown files in docs/legal are the source of truth; the /legal/*
// pages render them at build time. Edit the .md files, not the pages.

export type LegalDoc = {
  slug: string;
  title: string;
  file: string;
};

export const LEGAL_DOCS: LegalDoc[] = [
  { slug: "terms", title: "Terms & Conditions", file: "terms-and-conditions.md" },
  { slug: "privacy", title: "Privacy Policy", file: "privacy-policy.md" },
  { slug: "returns", title: "Returns & Refunds", file: "returns-refunds-policy.md" },
  { slug: "shipping", title: "Shipping Policy", file: "shipping-policy.md" },
  { slug: "cookies", title: "Cookie Policy", file: "cookie-policy.md" }
];

// The shipping policy lists delivery rates, and no price is shown anywhere
// while the site is in waitlist mode, so the page stays unpublished until
// the commerce mode flips to live. Development keeps every doc so both
// modes can be previewed with the dev toggle without touching the env.
const WAITLIST_HIDDEN_SLUGS = new Set(["shipping"]);

export function isLegalDocPublished(doc: LegalDoc): boolean {
  if (process.env.NODE_ENV === "development") return true;
  return COMMERCE_MODE === "live" || !WAITLIST_HIDDEN_SLUGS.has(doc.slug);
}

export const PUBLISHED_LEGAL_DOCS: LegalDoc[] =
  LEGAL_DOCS.filter(isLegalDocPublished);

export function getLegalDoc(slug: string): LegalDoc | null {
  return PUBLISHED_LEGAL_DOCS.find((doc) => doc.slug === slug) ?? null;
}

// Request-time lookup: published docs always; unpublished ones (the shipping
// policy in waitlist mode) only for preview-unlocked browsers, so a consultant
// reviewing selling mode can still open it. cookies() makes the render
// dynamic, so only the hidden-slug path pays for it.
export async function getLegalDocForRequest(slug: string): Promise<LegalDoc | null> {
  const published = getLegalDoc(slug);
  if (published) return published;
  const store = await cookies();
  if (!store.get(PREVIEW_COOKIE)) return null;
  return LEGAL_DOCS.find((doc) => doc.slug === slug) ?? null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function renderLegalDoc(doc: LegalDoc): Promise<string> {
  const raw = await readFile(
    path.join(process.cwd(), "docs", "legal", doc.file),
    "utf-8"
  );
  let html = await marked.parse(raw, { async: true });
  // Cross-references between the markdown files become site routes; links
  // to unpublished docs keep their wording but lose the anchor, so nothing
  // points at a page that 404s in waitlist mode.
  for (const target of LEGAL_DOCS) {
    if (isLegalDocPublished(target)) {
      html = html.replaceAll(`./${target.file}`, `/legal/${target.slug}`);
    } else {
      html = html.replace(
        new RegExp(`<a href="\\./${escapeRegExp(target.file)}">([^<]*)</a>`, "g"),
        "$1"
      );
    }
  }
  return html;
}
