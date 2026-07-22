import { HELDI_LIVING_POSTS } from "@/lib/heldi-living";
import { SITE_URL } from "@/lib/site";

// RSS 2.0 feed for Heldi Living. Two consumers: the email platform's
// RSS-to-email automation (a new item here is what triggers the weekly
// letter, no manual send) and anything else that watches feeds. Content is
// posts.json, so the feed updates exactly when a post ships with the deploy.

export const dynamic = "force-static";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const posts = HELDI_LIVING_POSTS.filter((post) => post.publishedAt)
    .slice()
    .sort(
      (a, b) =>
        new Date(b.publishedAt as string).getTime() -
        new Date(a.publishedAt as string).getTime()
    );

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/heldi-living/${post.slug}`;
      const image = post.image ? `${SITE_URL}${post.image}` : null;
      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${new Date(post.publishedAt as string).toUTCString()}</pubDate>`,
        `      <description>${escapeXml(post.description)}</description>`,
        image
          ? `      <enclosure url="${image}" length="0" type="image/webp" />`
          : null,
        "    </item>"
      ]
        .filter((line): line is string => line !== null)
        .join("\n");
    })
    .join("\n");

  const lastBuildDate = posts[0]
    ? new Date(posts[0].publishedAt as string).toUTCString()
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Heldi Living</title>
    <link>${SITE_URL}/heldi-living</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Honest reading on protein, desi food and health from Heldi.</description>
    <language>en-gb</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
