import type { Metadata } from "next";
import { HeldiHomepage } from "@/components/heldi-homepage";
import { HOME_FAQS } from "@/components/home-faqs";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" }
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Heldi",
  url: SITE_URL,
  slogan: "They shake, we stir",
  description:
    "Heldi makes whey protein isolate blends designed to stir invisibly into Indian home cooking: dal, curry, raita and other home-cooked favourites. 100% vegetarian, made in the UK.",
  founder: { "@type": "Person", name: "Mihir" }
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOME_FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer }
  }))
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HeldiHomepage
        grams={10}
        heroLayout="reveal"
        ticker
      />
    </>
  );
}
