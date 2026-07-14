import Image from "next/image";
import Link from "next/link";
import { ScrollToTopButton } from "@/components/scroll-to-top-button";
import { WaitlistOrShopCta } from "@/components/waitlist-or-shop-cta";
import type { HeldiLivingPost } from "@/lib/heldi-living";

type HeldiLivingPostViewProps = {
  post: HeldiLivingPost;
};

export function HeldiLivingPostView({ post }: HeldiLivingPostViewProps) {
  return (
    <section className="section section--gold living-post-section" data-nav-hero>
      <div className="living-post-shell">
        <a className="living-back" href="/heldi-living">
          ← Heldi Living
        </a>

        <header className="living-post-header">
          <h1 className="living-post-header__title">{post.title}</h1>
          <p className="living-post-header__desc">{post.description}</p>
          <ul className="living-post-header__tags">
            {post.tags.map((tag) => (
              <li key={tag}>
                <a
                  className="living-card__tag"
                  href={`/heldi-living?tag=${encodeURIComponent(tag)}`}
                >
                  {tag}
                </a>
              </li>
            ))}
          </ul>
        </header>

        <div className="living-post-hero">
          <Image
            src={post.image}
            alt=""
            width={1200}
            height={1200}
            priority
            sizes="(max-width: 820px) 100vw, 720px"
          />
        </div>

        <article
          className="living-post-panel heldi-post"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        <nav className="living-post-cta" aria-label="What next">
          <Link className="pill-link living-post-cta__back" href="/heldi-living">
            ← All Heldi Living
          </Link>
          <WaitlistOrShopCta className="button button--pill" />
        </nav>
      </div>

      <ScrollToTopButton />
    </section>
  );
}
