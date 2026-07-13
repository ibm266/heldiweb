import { readFile } from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";

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

export function getLegalDoc(slug: string): LegalDoc | null {
  return LEGAL_DOCS.find((doc) => doc.slug === slug) ?? null;
}

export async function renderLegalDoc(doc: LegalDoc): Promise<string> {
  const raw = await readFile(
    path.join(process.cwd(), "docs", "legal", doc.file),
    "utf-8"
  );
  let html = await marked.parse(raw, { async: true });
  // Cross-references between the markdown files become site routes.
  for (const target of LEGAL_DOCS) {
    html = html.replaceAll(`./${target.file}`, `/legal/${target.slug}`);
  }
  return html;
}
