import { OG_CONTENT_TYPE, OG_SIZE, heldiOgImage } from "@/components/og/card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt =
  "Heldi Living share card for referenced protein guides and desi recipes.";

export default function Image() {
  return heldiOgImage({
    eyebrow: "Heldi Living",
    title: "Protein, kitchens, and the numbers.",
    sub: "Referenced guides and recipes from the Heldi kitchen.",
    titleSize: 76
  });
}
