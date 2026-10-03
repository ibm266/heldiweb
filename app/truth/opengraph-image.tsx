import { OG_CONTENT_TYPE, OG_SIZE, heldiOgImage } from "@/components/og/card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt =
  "The honest truth about how much protein is in a cooked bowl of dal.";

export default function Image() {
  return heldiOgImage({
    eyebrow: "The honest truth",
    title: "How much protein is in dal, really?",
    sub: "Cooked portions, daily targets and the sources behind them.",
    titleSize: 74
  });
}
