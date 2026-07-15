import { OG_CONTENT_TYPE, OG_SIZE, heldiOgImage } from "@/components/og/card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt =
  "Heldi, desi protein for Indian food. The same food, just a little Heldier.";

export default function Image() {
  return heldiOgImage({
    eyebrow: "Desi protein",
    title: "The same food, just a little Heldier.",
    art: "pouch"
  });
}
