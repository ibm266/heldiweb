import { OG_CONTENT_TYPE, OG_SIZE, heldiOgImage } from "@/components/og/card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt =
  "Heldi's story, from the founder's nani to the family kitchen trials.";

export default function Image() {
  return heldiOgImage({
    eyebrow: "Our story",
    title: "Healthy, the way my nani says it.",
    sub: "The word, the kitchen trials, the family table."
  });
}
