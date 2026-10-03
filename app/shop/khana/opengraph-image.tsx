import { OG_CONTENT_TYPE, OG_SIZE, heldiOgImage } from "@/components/og/card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt =
  "The navy Heldi Khana pouch for dal, curry, sabzi and raita.";

export default function Image() {
  return heldiOgImage({
    eyebrow: "The savoury pouch",
    title: "Same bowl. More protein.",
    sub: "Stirs into dal, curry, sabzi and raita.",
    art: "pouch"
  });
}
