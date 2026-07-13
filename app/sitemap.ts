import type { MetadataRoute } from "next";
import { HELDI_LIVING_POSTS } from "@/lib/heldi-living";
import { LEGAL_DOCS } from "@/lib/legal";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = HELDI_LIVING_POSTS.map((post) => ({
    url: `${SITE_URL}/heldi-living/${post.slug}`,
    lastModified: post.publishedAt ? new Date(post.publishedAt) : undefined
  }));

  return [
    { url: SITE_URL, priority: 1 },
    { url: `${SITE_URL}/shop`, priority: 0.9 },
    { url: `${SITE_URL}/truth`, priority: 0.9 },
    { url: `${SITE_URL}/heldi-living`, priority: 0.8 },
    { url: `${SITE_URL}/our-story`, priority: 0.6 },
    ...posts,
    ...LEGAL_DOCS.map((doc) => ({
      url: `${SITE_URL}/legal/${doc.slug}`,
      priority: 0.2
    }))
  ];
}
