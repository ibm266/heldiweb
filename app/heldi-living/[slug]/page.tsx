import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HeldiLivingPostView } from "@/components/heldi-living-post";
import { SubpageFooter, SubpageNav } from "@/components/subpage-nav";
import {
  getAllPostSlugs,
  getPostBySlug,
  HELDI_LIVING_POSTS
} from "@/lib/heldi-living";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = HELDI_LIVING_POSTS.find((entry) => entry.slug === slug);
  if (!post) return { title: "Heldi Living" };

  return {
    title: `${post.title} · Heldi Living`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      images: [post.image]
    }
  };
}

export default async function HeldiLivingPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <main>
      <SubpageNav />
      <HeldiLivingPostView post={post} />
      <SubpageFooter />
    </main>
  );
}
