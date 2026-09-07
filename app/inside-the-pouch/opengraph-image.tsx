import { OG_CONTENT_TYPE, OG_SIZE, heldiOgImage } from "@/components/og/card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt =
  "Inside the pouch share card about Heldi ingredients, suppliers and nutrition sources.";

export default function Image() {
  return heldiOgImage({
    eyebrow: "Inside the pouch",
    title: "Inside each pouch.",
    sub: "The lists, suppliers and paperwork behind both pouches."
  });
}
