import { OG_CONTENT_TYPE, OG_SIZE, heldiOgImage } from "@/components/og/card";
import { HELDI_LIVING_POSTS, getAllPostSlugs } from "@/lib/heldi-living";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "A Heldi Living post";

// Pre-render a card per post at build time (matches the page's static params).
export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

// Long post titles step the display size down so satori never clips.
function titleSizeFor(title: string): number {
  if (title.length > 76) return 54;
  if (title.length > 52) return 62;
  return 72;
}

export default async function Image({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = HELDI_LIVING_POSTS.find((entry) => entry.slug === slug);
  const title = post?.title ?? "Heldi Living";
  const sub = post?.tags?.length
    ? post.tags.slice(0, 3).join(" · ")
    : "Honest reads and recipes from the Heldi kitchen.";

  return heldiOgImage({
    eyebrow: "Heldi Living",
    title,
    sub,
    titleSize: titleSizeFor(title)
  });
}
