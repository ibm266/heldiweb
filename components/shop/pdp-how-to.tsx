import Image from "next/image";
import type { MethodStep } from "./nutrition-data";

// The "how to use" row both product pages carry under their photo: the three
// steps printed on the back of the pouch, each with its drawing. Same shell,
// same place, on Khana and Chai; the steps, the routine's name and the tile
// colour come from the product (KHANA_METHOD in nutrition-data.ts, CHAI_METHOD
// in chai-data.ts), so neither page can show the other's spoon.
//
// The tile takes the pouch's own ground: ink for Khana's navy pack, terracotta
// for Chai's. The drawings are two-ink cutouts on a transparent canvas
// (scripts/method-art.mjs), so the colour is CSS and nothing else.
export function PdpHowTo({
  routine,
  steps,
  tone
}: {
  /** "THE BOWL ROUTINE", "THE MUG ROUTINE": the label's second half. */
  routine: string;
  steps: readonly MethodStep[];
  tone: "ink" | "terracotta";
}) {
  return (
    <div className={`pdp__how pdp__how--${tone}`}>
      <p className="pdp__group-label">
        HOW TO USE: <strong>{routine}</strong>
      </p>
      {/* role="list" because list-style:none drops list semantics in
          Safari/VoiceOver. No step numbers: the pack has none either, the
          drawings and the order carry the sequence. The art is decorative
          (its title sits beside it), so alt is empty. */}
      <ol className="pdp__method" role="list">
        {steps.map((step) => (
          <li key={step.title} className="pdp__method-step">
            <span className="pdp__method-art" aria-hidden="true">
              <Image
                src={step.art.src}
                alt=""
                width={step.art.width}
                height={step.art.height}
                sizes="(max-width: 899px) 80px, 130px"
              />
            </span>
            <span className="pdp__method-text">
              <span className="pdp__method-title">{step.title}</span>
              <span className="pdp__method-body">{step.body}</span>
            </span>
          </li>
        ))}
      </ol>
      {/* The pack's QR caption, word for word (BRAND.md §11.10.6). */}
      <a className="pdp__how-more" href="/ways-to-use">
        See more ways to use <b aria-hidden="true">→</b>
      </a>
    </div>
  );
}
