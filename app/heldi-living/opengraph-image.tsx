import { OG_CONTENT_TYPE, OG_SIZE, heldiOgImage } from "@/components/og/card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Heldi Living: protein, strength and desi kitchens.";

export default function Image() {
  return heldiOgImage({
    eyebrow: "Heldi Living",
    title: "Protein, strength and desi kitchens.",
    sub: "Honest reads and recipes from the Heldi kitchen.",
    titleSize: 76
  });
}
