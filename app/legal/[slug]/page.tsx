import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SubpageFooter, SubpageNav } from "@/components/subpage-nav";
import { LEGAL_DOCS, getLegalDoc, renderLegalDoc } from "@/lib/legal";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return LEGAL_DOCS.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = getLegalDoc(slug);
  if (!doc) return {};
  return {
    title: `${doc.title} · Heldi`,
    alternates: { canonical: `/legal/${doc.slug}` }
  };
}

export default async function LegalPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = getLegalDoc(slug);
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
      </section>

      <SubpageFooter />
    </main>
  );
}
