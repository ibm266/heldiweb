import { OG_CONTENT_TYPE, OG_SIZE, heldiOgImage } from "@/components/og/card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt =
  "Ways to use Heldi share card for practical cooking timings and amounts.";

export default function Image() {
  return heldiOgImage({
    eyebrow: "Ways to use",
    title: "When to add Heldi.",
    sub: "Practical guides for dal, dahi, takeaway, rotis and chai."
  });
}
