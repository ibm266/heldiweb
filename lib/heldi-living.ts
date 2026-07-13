import { readFileSync } from "node:fs";
import { join } from "node:path";
import postsJson from "@/content/heldi-living/posts.json";

export type HeldiLivingPostMeta = {
  slug: string;
  title: string;
  tags: string[];
  summary: string[];
  description: string;
  image: string;
  publishedAt: string | null;
  htmlFile: string;
  order: number;
};

export type HeldiLivingPost = HeldiLivingPostMeta & {
  html: string;
};

const CONTENT_DIR = join(process.cwd(), "content/heldi-living");

export const HELDI_LIVING_POSTS = postsJson as HeldiLivingPostMeta[];

export function getAllTags(): string[] {
  const tags = new Set<string>();
  for (const post of HELDI_LIVING_POSTS) {
    for (const tag of post.tags) tags.add(tag);
  }
  return Array.from(tags).sort((a, b) => a.localeCompare(b));
}

export function getPostBySlug(slug: string): HeldiLivingPost | null {
  const meta = HELDI_LIVING_POSTS.find((post) => post.slug === slug);
  if (!meta) return null;

  const raw = readFileSync(join(CONTENT_DIR, meta.htmlFile), "utf8");
  const html = raw
    .replace(/^[\s\S]*?<article[^>]*>/i, "")
    .replace(/<\/article>\s*$/i, "")
    .trim();

  return { ...meta, html };
}

export function getAllPostSlugs(): string[] {
  return HELDI_LIVING_POSTS.map((post) => post.slug);
}
