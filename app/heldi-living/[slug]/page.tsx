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
import { serializeJsonLd } from "@/lib/json-ld";
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

  const recipeSchema = post.recipe
    ? {
        "@context": "https://schema.org",
        "@type": "Recipe",
        name: post.recipe.name,
        description: post.description,
        image: [`${SITE_URL}${post.image}`],
        url: postUrl,
        author: {
          "@type": "Person",
          name: "Mihir",
          url: `${SITE_URL}/our-story`
        },
        ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
        prepTime: post.recipe.prepTime,
        ...(post.recipe.cookTime ? { cookTime: post.recipe.cookTime } : {}),
        totalTime: post.recipe.totalTime,
        recipeYield: post.recipe.recipeYield,
        recipeCategory: post.recipe.recipeCategory,
        recipeCuisine: post.recipe.recipeCuisine,
        keywords: post.recipe.keywords,
        nutrition: {
          "@type": "NutritionInformation",
          calories: post.recipe.calories,
          proteinContent: post.recipe.proteinContent
        },
        recipeIngredient: post.recipe.recipeIngredient,
        recipeInstructions: post.recipe.recipeInstructions.map((text) => ({
          "@type": "HowToStep",
          text
        }))
      }
    : null;

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(blogPostingSchema) }}
      />
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }}
        />
      ) : null}
      {recipeSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(recipeSchema) }}
        />
      ) : null}
      <SubpageNav tone="gold" />
      <HeldiLivingPostView post={post} />
      <SubpageFooter />
    </main>
  );
}
