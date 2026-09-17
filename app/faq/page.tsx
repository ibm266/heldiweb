import type { Metadata } from "next";
import { FaqPageList } from "@/components/faq-page-list";
import { siteFaqGroupsForMode } from "@/components/site-faqs";
import { SubpageFooter, SubpageNav } from "@/components/subpage-nav";
import { COMMERCE_MODE } from "@/lib/commerce/config";
import { serializeJsonLd } from "@/lib/json-ld";
import { SERVING_GRAMS } from "@/components/shop/nutrition-data";
import { StatutoryStatements } from "@/components/shop/statutory-statements";
import { getWaitlistPairsOpen } from "@/lib/waitlist-count";

export const metadata: Metadata = {
  title: "FAQ · Heldi",
  description:
    "Plain answers about using Heldi, protein portions, vegetarian and halal questions, GLP-1 medicines, ingredients, orders and delivery.",
  alternates: { canonical: "/faq" }
};

// Built from the same mode-aware groups as the visible list, so waitlist
// builds keep delivery prices out of the structured data too. `pairsOpen` is
// the same cached answer the root layout gives the visible list, so the
// structured data never offers a free sample pair the page has stopped offering.
function faqSchemaFor(pairsOpen: boolean) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: siteFaqGroupsForMode(COMMERCE_MODE, pairsOpen).flatMap((group) =>
      group.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer }
      }))
    )
  };
}

export default async function FaqPage() {
  const faqSchema = faqSchemaFor(await getWaitlistPairsOpen());
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
          <h1 className="story-hero__title">Questions, answered plainly.</h1>
          <p className="story-hero__lede">
            We have gathered the questions people ask us most. If yours is not
            here, email{" "}
            <a href="mailto:info@heldi.co.uk">info@heldi.co.uk</a> and a human
            will answer. At the moment, that is usually the founder.
          </p>
        </div>
      </section>

      <div className="double-rule" aria-hidden="true" />

      <section className="section section--cream section--bordered">
        <FaqPageList />
        <div className="faq">
          <StatutoryStatements servingGrams={SERVING_GRAMS} allergens="Contains milk (whey)." />
        </div>
      </section>

      <SubpageFooter />
    </main>
  );
}
