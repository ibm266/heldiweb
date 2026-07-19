import { OG_CONTENT_TYPE, OG_SIZE, heldiOgImage } from "@/components/og/card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Heldi team preview: both storefronts, one switch.";

export default function Image() {
  return heldiOgImage({
    eyebrow: "TEAM PREVIEW",
    title: "Both storefronts, one switch.",
    sub: "For the Heldi team and reviewers."
  });
}
