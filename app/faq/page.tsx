import type { Metadata } from "next";
import { FaqPageList } from "@/components/faq-page-list";
import { SITE_FAQ_GROUPS } from "@/components/site-faqs";
import { SubpageFooter, SubpageNav } from "@/components/subpage-nav";
import { serializeJsonLd } from "@/lib/json-ld";

export const metadata: Metadata = {
  title: "FAQ · Heldi",
  description:
    "Straight answers to everything people ask about Heldi: how to use it, the protein numbers, vegetarian and halal questions, using it alongside GLP-1 medicines, what is in the pouch, and delivery.",
  alternates: { canonical: "/faq" }
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: SITE_FAQ_GROUPS.flatMap((group) =>
    group.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer }
    }))
  )
};

export default function FaqPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }}
      />
      <SubpageNav tone="cream" />

      <section className="section section--cream story-hero" data-nav-hero>
        <div className="story-hero__inner">
          <p className="eyebrow">FAQ</p>
          <h1 className="story-hero__title">Questions, answered honestly.</h1>
          <p className="story-hero__lede">
            Everything people ask us about Heldi, in one place. If yours is
            not here, email{" "}
            <a href="mailto:info@heldi.co.uk">info@heldi.co.uk</a> and a human
            will answer. Usually the founder, usually quickly.
          </p>
        </div>
      </section>

      <div className="double-rule" aria-hidden="true" />

      <section className="section section--cream section--bordered">
        <FaqPageList groups={SITE_FAQ_GROUPS} />
        <div className="faq">
          <p className="heldi-disclaimer">
            Heldi is a food supplement. Do not exceed the recommended daily
            intake. Food supplements are not a substitute for a varied and
            balanced diet and a healthy lifestyle. Keep out of reach of
            children. Contains milk (whey).
          </p>
        </div>
      </section>

      <SubpageFooter />
    </main>
  );
}
