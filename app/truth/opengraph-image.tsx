import { OG_CONTENT_TYPE, OG_SIZE, heldiOgImage } from "@/components/og/card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "The honest truth: how much protein is in dal, really?";

export default function Image() {
  return heldiOgImage({
    eyebrow: "The honest truth",
    title: "How much protein is in dal, really?",
    sub: "The numbers, weighed honestly.",
    titleSize: 74
  });
}
