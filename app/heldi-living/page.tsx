import type { Metadata } from "next";
import { Suspense } from "react";
import { HeldiLivingFeed } from "@/components/heldi-living-feed";
import { SubpageFooter, SubpageNav } from "@/components/subpage-nav";
import { getAllTags, HELDI_LIVING_POSTS } from "@/lib/heldi-living";

export const metadata: Metadata = {
  title: "Heldi Living · Honest writing on protein and desi cooking",
  description:
    "What we wish more people knew about the food we already love. Protein, strength, ageing, and desi kitchens — without the gym-bro noise.",
  alternates: { canonical: "/heldi-living" }
};

export default function HeldiLivingPage() {
  return (
    <main>
      <SubpageNav tone="gold" />

      <section className="section section--gold living-index" data-nav-hero>
        <Suspense fallback={null}>
          <HeldiLivingFeed
            posts={HELDI_LIVING_POSTS}
            tags={getAllTags()}
            header={
              <div className="living-index__hero">
                <p className="eyebrow">HELDI LIVING</p>
                <h1 className="living-index__title">Heldi Living</h1>
                <p className="living-index__lede">
                  Honest writing on protein and desi cooking. What we wish more
                  people knew about the food we already love.
                </p>
              </div>
            }
          />
        </Suspense>
      </section>

      <SubpageFooter />
    </main>
  );
}
