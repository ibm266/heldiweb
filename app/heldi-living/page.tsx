import type { Metadata } from "next";
import { Suspense } from "react";
import { HeldiLivingFeed } from "@/components/heldi-living-feed";
import { SubpageFooter, SubpageNav } from "@/components/subpage-nav";
import { getAllTags, HELDI_LIVING_POSTS } from "@/lib/heldi-living";

export const metadata: Metadata = {
  title: "Heldi Living · Protein and desi cooking",
  description:
    "Referenced guides, family-kitchen truths and recipes for protein, strength and the desi food we already cook.",
  alternates: { canonical: "/heldi-living" }
};

export default function HeldiLivingPage() {
  return (
    <main>
      <SubpageNav tone="gold" />

      <section className="section section--gold living-index" data-nav-hero>
        <Suspense fallback={null}>
          <HeldiLivingFeed posts={HELDI_LIVING_POSTS} tags={getAllTags()} />
        </Suspense>
      </section>

      <SubpageFooter />
    </main>
  );
}
