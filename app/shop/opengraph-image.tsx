import { OG_CONTENT_TYPE, OG_SIZE, heldiOgImage } from "@/components/og/card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt =
  "Heldi shop share card showing the Khana and Chai pouches side by side.";

export default function Image() {
  return heldiOgImage({
    eyebrow: "The Heldi range",
    title: "Pick the pouch for your kitchen.",
    sub: "Compare Khana and Chai, then see what goes in and when to stir.",
    art: "pouches",
    titleSize: 64
  });
}
