import { OG_CONTENT_TYPE, OG_SIZE, heldiOgImage } from "@/components/og/card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Leave a Heldi review: stars, spoon count, straight talk.";

export default function Image() {
  return heldiOgImage({
    eyebrow: "FROM YOUR TABLE",
    title: "How did the dal take it?",
    sub: "Stars, spoon count, straight talk."
  });
}
