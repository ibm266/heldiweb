import { OG_CONTENT_TYPE, OG_SIZE, heldiOgImage } from "@/components/og/card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt =
  "Heldi, desi protein for Indian food, with the Khana and Chai pouches.";

export default function Image() {
  return heldiOgImage({
    eyebrow: "Heldi",
    title: "Desi protein for Indian food.",
    sub: "For the recipes your family already cooks.",
    art: "pouches",
    titleSize: 64
  });
}
