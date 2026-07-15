import type { Metadata } from "next";
import Link from "next/link";
import { SubpageFooter, SubpageNav } from "@/components/subpage-nav";

export const metadata: Metadata = {
  title: "Page not found · Heldi",
  description: "That page is not on the table. The rest of the kitchen is."
};

export default function NotFound() {
  return (
    <main>
      <SubpageNav tone="cream" />

      <section className="section section--cream story-hero" data-nav-hero>
        <div className="story-hero__inner">
          <p className="eyebrow">404</p>
          <h1 className="story-hero__title">This page vanished clean.</h1>
          <p className="story-hero__lede">
            Normally that is exactly what we want. Not this time. Whatever you
            were looking for is not in this pot, but the rest of the table is
            where it always was.
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
