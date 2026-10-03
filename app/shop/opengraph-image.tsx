import { OG_CONTENT_TYPE, OG_SIZE, heldiOgImage } from "@/components/og/card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt =
  "Heldi shop share card showing the Khana and Chai pouches side by side.";

export default function Image() {
  return heldiOgImage({
    eyebrow: "The Heldi range",
    title: "The bowl, the mug, or both.",
    sub: "Heldi Khana for food, Heldi Chai for drinks. The recipes stay yours.",
    art: "pouches",
    titleSize: 64
  });
}
