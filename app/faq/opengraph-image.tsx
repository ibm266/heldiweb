import { OG_CONTENT_TYPE, OG_SIZE, heldiOgImage } from "@/components/og/card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Heldi FAQ: questions, answered honestly.";

export default function Image() {
  return heldiOgImage({
    eyebrow: "FAQ",
    title: "Questions, answered honestly.",
    sub: "How it works, the numbers, delivery."
  });
}
