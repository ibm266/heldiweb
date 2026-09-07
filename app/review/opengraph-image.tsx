import { OG_CONTENT_TYPE, OG_SIZE, heldiOgImage } from "@/components/og/card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt =
  "Leave a Heldi review with your star rating, dish and spoon count.";

export default function Image() {
  return heldiOgImage({
    eyebrow: "FROM YOUR TABLE",
    title: "How did Heldi get on?",
    sub: "Leave your honest review, dish and spoon count."
  });
}
