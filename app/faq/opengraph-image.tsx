import { OG_CONTENT_TYPE, OG_SIZE, heldiOgImage } from "@/components/og/card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt =
  "Heldi FAQ share card about ingredients, protein numbers, using Heldi and orders.";

export default function Image() {
  return heldiOgImage({
    eyebrow: "FAQ",
    title: "Answers from our kitchen.",
    sub: "Ingredients, protein numbers, how to use it and orders."
  });
}
