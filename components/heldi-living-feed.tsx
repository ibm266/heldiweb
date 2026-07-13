"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import type { HeldiLivingPostMeta } from "@/lib/heldi-living";

type HeldiLivingFeedProps = {
  posts: HeldiLivingPostMeta[];
  tags: string[];
};

export function HeldiLivingFeed({ posts, tags }: HeldiLivingFeedProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTag = searchParams.get("tag");
  const activeTag =
    requestedTag && tags.includes(requestedTag) ? requestedTag : null;

  function setActiveTag(tag: string | null) {
    const next = new URLSearchParams(searchParams.toString());
    if (tag) next.set("tag", tag);
    else next.delete("tag");
    const query = next.toString();
    router.replace(query ? `/heldi-living?${query}` : "/heldi-living", {
      scroll: false
    });
  }

  const visiblePosts = useMemo(() => {
    if (!activeTag) return posts;
    return posts.filter((post) => post.tags.includes(activeTag));
  }, [activeTag, posts]);

  return (
    <div className="living-feed">
      <div className="living-tags" role="toolbar" aria-label="Filter by topic">
        <button
          type="button"
          className={`living-tag${activeTag === null ? " is-active" : ""}`}
          onClick={() => setActiveTag(null)}
          aria-pressed={activeTag === null}
        >
          All
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            className={`living-tag${activeTag === tag ? " is-active" : ""}`}
            onClick={() => setActiveTag(tag === activeTag ? null : tag)}
            aria-pressed={activeTag === tag}
          >
            {tag}
          </button>
        ))}
      </div>

      <p className="living-feed__count" aria-live="polite">
        {visiblePosts.length} {visiblePosts.length === 1 ? "piece" : "pieces"}
        {activeTag ? ` in ${activeTag}` : ""}
      </p>

      <div className="living-grid">
        {visiblePosts.map((post) => (
          <article key={post.slug} className="living-card">
            <a
              href={`/heldi-living/${post.slug}`}
              className="living-card__media"
            >
              <Image
                src={post.image}
                alt=""
                width={1200}
                height={1200}
                sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 360px"
              />
            </a>

            <div className="living-card__body">
              <ul className="living-card__tags">
                {post.tags.map((tag) => (
                  <li key={tag}>
                    <button
                      type="button"
                      className="living-card__tag"
                      onClick={() => setActiveTag(tag)}
                    >
                      {tag}
                    </button>
                  </li>
                ))}
              </ul>

              <h2 className="living-card__title">
                <a href={`/heldi-living/${post.slug}`}>{post.title}</a>
              </h2>

              <p className="living-card__lede">In short</p>
              <ul className="living-card__summary">
                {post.summary.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>

              <a className="pill-link" href={`/heldi-living/${post.slug}`}>
                Read more
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
