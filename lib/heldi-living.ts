import { readFileSync } from "node:fs";
import { join } from "node:path";
import postsJson from "@/content/heldi-living/posts.json";

export type HeldiLivingRecipeMeta = {
  name: string;
  prepTime: string;
  cookTime?: string;
  totalTime: string;
  recipeYield: string;
  recipeCategory: string;
  recipeCuisine: string;
  keywords: string;
  calories: string;
  proteinContent: string;
  recipeIngredient: string[];
  recipeInstructions: string[];
};

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
  /** Present on recipe posts; drives the Recipe JSON-LD on the post page. */
  recipe?: HeldiLivingRecipeMeta;
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

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type PostFaq = { question: string; answer: string };

export function getPostFaqs(html: string): PostFaq[] {
  const block = html.match(/<div class="heldi-faq">([\s\S]*?)<\/div>/i);
  if (!block) return [];

  const faqs: PostFaq[] = [];
  const pair = /<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match: RegExpExecArray | null;
  while ((match = pair.exec(block[1])) !== null) {
    const question = stripTags(match[1]);
    const answer = stripTags(match[2]);
    if (question && answer) faqs.push({ question, answer });
  }
  return faqs;
}
