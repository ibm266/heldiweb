import type { Metadata } from "next";
import { CopyHighlight } from "@/components/copy-highlight";
import { PreviewModePanel } from "@/components/preview-mode-panel";
import { SubpageFooter, SubpageNav } from "@/components/subpage-nav";

export const metadata: Metadata = {
  title: "Preview · Heldi",
  description: "Team preview of the waitlist and selling storefronts.",
  alternates: { canonical: "/preview" },
  robots: { index: false, follow: false }
};

export default function PreviewPage() {
  return (
    <main>
      <SubpageNav tone="cream" />

      <section className="section section--cream story-hero" data-nav-hero>
        <div className="story-hero__inner">
          <p className="eyebrow">TEAM PREVIEW</p>
          <h1 className="story-hero__title">Both storefronts, one switch.</h1>
          <p className="story-hero__lede">
            For the Heldi team and reviewers. Unlock this browser to flip
            between the <CopyHighlight>waitlist</CopyHighlight> storefront and
            the selling storefront. Nothing changes for anyone else.
          </p>
        </div>
      </section>

      <div className="double-rule" aria-hidden="true" />

      <section className="section section--cream section--bordered">
        <PreviewModePanel />
      </section>

      <SubpageFooter />
    </main>
  );
}
