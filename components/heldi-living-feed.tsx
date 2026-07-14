"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { HeldiLivingPostMeta } from "@/lib/heldi-living";

const VISIBLE_TAG_COUNT = 4;

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
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const hasMoreTags = tags.length > VISIBLE_TAG_COUNT;
  const visibleTags = tagsExpanded
    ? tags
    : tags.slice(0, VISIBLE_TAG_COUNT);

  useEffect(() => {
    if (
      activeTag &&
      !tags.slice(0, VISIBLE_TAG_COUNT).includes(activeTag)
    ) {
      setTagsExpanded(true);
    }
  }, [activeTag, tags]);

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
      <div className="living-index__panel">
        <div className="living-index__hero">
          <p className="eyebrow">HELDI LIVING</p>
          <h1 className="living-index__title">Heldi Living</h1>
          <p className="living-index__lede">
            Honest writing on protein and desi cooking. What we wish more people
            knew about the food we already love.
          </p>
        </div>
        <div className="living-tags" role="toolbar" aria-label="Filter by topic">
          <button
            type="button"
            className={`living-tag${activeTag === null ? " is-active" : ""}`}
            onClick={() => setActiveTag(null)}
            aria-pressed={activeTag === null}
          >
            All
          </button>
          {visibleTags.map((tag) => (
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
          {hasMoreTags ? (
            <button
              type="button"
              className="living-tag living-tag--toggle"
              onClick={() => setTagsExpanded((open) => !open)}
              aria-expanded={tagsExpanded}
            >
              {tagsExpanded ? "Hide" : "See more"}
            </button>
          ) : null}
        </div>
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
