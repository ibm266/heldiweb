import type { Metadata } from "next";
import { SubpageFooter, SubpageNav } from "@/components/subpage-nav";
import { TruthPage } from "@/components/truth-page";
import { TRUTH_FAQS } from "@/components/truth-faqs";

export const metadata: Metadata = {
  title: "How much protein is in dal? The honest truth · Heldi",
  description:
    "A cooked bowl of dal has 5 to 7g of protein, not 18. What a vegetarian Indian day really delivers, why dal isn't complete, and how to get more protein without shakes."
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <SubpageNav />
      <TruthPage />
      <SubpageFooter />
    </main>
  );
}
