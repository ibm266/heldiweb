import type { Metadata } from "next";
import { SubpageFooter, SubpageNav } from "@/components/subpage-nav";
import { TruthPage } from "@/components/truth-page";
import { TRUTH_FAQS } from "@/components/truth-faqs";
import { serializeJsonLd } from "@/lib/json-ld";

export const metadata: Metadata = {
  title: "How much protein is in dal? The honest truth · Heldi",
  description:
    "A standard cooked bowl of dal has 5 to 7g of protein, while 18g usually refers to dry lentils. See how an Indian vegetarian day adds up and compare practical ways to add more protein.",
  alternates: { canonical: "/truth" }
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: TRUTH_FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer
    }
  }))
};

export default function TruthRoute() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }}
      />
      <SubpageNav tone="cream" />
      <TruthPage />
      <SubpageFooter />
    </main>
  );
}
