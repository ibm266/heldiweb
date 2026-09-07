import { OG_CONTENT_TYPE, OG_SIZE, heldiOgImage } from "@/components/og/card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt =
  "The terracotta Heldi Chai pouch for chai, tea, coffee and hot chocolate.";

export default function Image() {
  return heldiOgImage({
    eyebrow: "The Chai pouch",
    title: "Same chai. More protein.",
    sub: "For chai, tea, coffee and hot chocolate.",
    art: "pouch-chai"
  });
}
