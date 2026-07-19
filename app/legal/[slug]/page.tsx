import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnalyticsChoices } from "@/components/analytics-choices";
import { SubpageFooter, SubpageNav } from "@/components/subpage-nav";
import {
  PUBLISHED_LEGAL_DOCS,
  getLegalDocForRequest,
  renderLegalDoc
} from "@/lib/legal";

type PageProps = { params: Promise<{ slug: string }> };

// The shipping policy is unpublished in waitlist mode but must open for a
// preview-unlocked browser, which means reading the request cookie
// (getLegalDocForRequest). A cookie read forces a dynamic render, and that
// cannot be mixed with the static generation of the other slugs, so the whole
// route renders per request. These are five small, low-traffic markdown pages,
// so the cost is negligible.
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return PUBLISHED_LEGAL_DOCS.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getLegalDocForRequest(slug);
  if (!doc) return {};
  return {
    title: `${doc.title} · Heldi`,
    alternates: { canonical: `/legal/${doc.slug}` }
  };
}

export default async function LegalPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = await getLegalDocForRequest(slug);
  if (!doc) notFound();

  const html = await renderLegalDoc(doc);

  return (
    <main>
      <SubpageNav />

      <section className="section section--cream">
        <article
          className="legal"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {doc.slug === "cookies" ? <AnalyticsChoices /> : null}
      </section>

      <SubpageFooter />
    </main>
  );
}
