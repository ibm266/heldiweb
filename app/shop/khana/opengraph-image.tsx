import { OG_CONTENT_TYPE, OG_SIZE, heldiOgImage } from "@/components/og/card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Heldi Khana. One pouch. The whole table.";

export default function Image() {
  return heldiOgImage({
    eyebrow: "The Heldi pouch",
    title: "One pouch. The whole table.",
    sub: "Stirs into dal, curry, sabzi and raita.",
    art: "pouch"
  });
}
