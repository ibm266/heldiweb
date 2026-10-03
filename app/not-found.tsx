import type { Metadata } from "next";
import Link from "next/link";
import { SubpageFooter, SubpageNav } from "@/components/subpage-nav";

export const metadata: Metadata = {
  title: "Page not found · Heldi",
  description:
    "This page has gone missing. Find your way back to Heldi, the shop, the honest truth or the family FAQ."
};

export default function NotFound() {
  return (
    <main>
      <SubpageNav tone="cream" />

      <section className="section section--cream story-hero" data-nav-hero>
        <div className="story-hero__inner">
          <p className="eyebrow">404</p>
          <h1 className="story-hero__title">This page missed dinner.</h1>
          <p className="story-hero__lede">
            We checked the kitchen twice. Whatever you were looking for is not
            here, but the rest of Heldi is just where we left it.
          </p>
          <div className="pill-links">
            <Link className="pill-link" href="/">
              Back to the start &#8594;
            </Link>
            <Link className="pill-link" href="/shop">
              See the pouch &#8594;
            </Link>
            <Link className="pill-link" href="/truth">
              Read the honest truth &#8594;
            </Link>
            <Link className="pill-link" href="/faq">
              Ask us anything &#8594;
            </Link>
          </div>
        </div>
      </section>

      <div className="double-rule" aria-hidden="true" />

      <SubpageFooter />
    </main>
  );
}
