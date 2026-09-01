import { OG_CONTENT_TYPE, OG_SIZE, heldiOgImage } from "@/components/og/card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Heldi Chai. Protein that disappears into your chai.";

export default function Image() {
  return heldiOgImage({
    eyebrow: "The Chai pouch",
    title: "Same chai. More protein.",
    sub: "Stirs into chai, tea, coffee and hot chocolate.",
    art: "pouch-chai"
  });
}
