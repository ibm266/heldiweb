import { OG_CONTENT_TYPE, OG_SIZE, heldiOgImage } from "@/components/og/card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Heldi. Two pouches: Khana for the pot, Chai for the mug.";

export default function Image() {
  return heldiOgImage({
    eyebrow: "Two pouches",
    title: "One for the pot. One for the mug.",
    sub: "Khana for the food. Chai for the drink.",
    art: "pouches",
    titleSize: 64
  });
}
