import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HeldiLivingPostView } from "@/components/heldi-living-post";
import { SubpageFooter, SubpageNav } from "@/components/subpage-nav";
import {
  getAllPostSlugs,
  getPostBySlug,
  getPostFaqs,
  HELDI_LIVING_POSTS
} from "@/lib/heldi-living";
import { SITE_URL } from "@/lib/site";

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
    alternates: { canonical: `/heldi-living/${post.slug}` },
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

  const postUrl = `${SITE_URL}/heldi-living/${post.slug}`;
  const faqs = getPostFaqs(post.html);

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: `${SITE_URL}${post.image}`,
    url: postUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
    ...(post.publishedAt
      ? { datePublished: post.publishedAt, dateModified: post.publishedAt }
      : {}),
    author: { "@type": "Person", name: "Mihir", url: `${SITE_URL}/our-story` },
    publisher: {
      "@type": "Organization",
      name: "Heldi",
      url: SITE_URL
    },
    keywords: post.tags.join(", ")
  };

  const faqSchema =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer }
          }))
        }
      : null;

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}
      <SubpageNav tone="gold" />
      <HeldiLivingPostView post={post} />
      <SubpageFooter />
    </main>
  );
}
