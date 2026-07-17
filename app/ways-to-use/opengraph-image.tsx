import { OG_CONTENT_TYPE, OG_SIZE, heldiOgImage } from "@/components/og/card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Ways to use Heldi: ek, do, protein.";

export default function Image() {
  return heldiOgImage({
    eyebrow: "Ways to use",
    title: "Ek. Do. Protein.",
    sub: "Dal, dahi, takeaway, rotis. Three steps each."
  });
}
