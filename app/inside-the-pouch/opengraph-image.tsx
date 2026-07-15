import { OG_CONTENT_TYPE, OG_SIZE, heldiOgImage } from "@/components/og/card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Inside the pouch: four ingredients, nothing to hide.";

export default function Image() {
  return heldiOgImage({
    eyebrow: "Inside the pouch",
    title: "Four ingredients. Nothing to hide.",
    sub: "Short label. Long paper trail."
  });
}
