import bowlOfDahiFrame from "@/data/bowl-of-dahi-frame.json";

export type StirImageFrame = {
  source: string;
  x: number;
  y: number;
  scale: number;
};

export const BOWL_OF_DAHI_FRAME = bowlOfDahiFrame as StirImageFrame;

export function getStirImageFrame(
  dishName: string
): StirImageFrame | undefined {
  if (dishName === "Bowl of dahi") return BOWL_OF_DAHI_FRAME;
  return undefined;
}

export function getStirFrameStyle(frame: StirImageFrame | undefined) {
  if (!frame) return undefined;
  return {
    transform: `translate(${frame.x}px, ${frame.y}px) scale(${frame.scale})`
  };
}
