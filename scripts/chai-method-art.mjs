#!/usr/bin/env node
// Rebuilds public/images/shop/chai-method/{brew,cool,stir}.webp from the
// pouch-back drawings in HeldiPM (design/pouch-v2/generated, print round 13).
//
// Each drawing becomes a two-ink cutout in the site's own tokens (cream
// #f8f0de, gold #eda31d) on a transparent ground, so the tile colour comes from
// CSS. Mirrors compose_back_v8.py: sample the render's ground and its two inks,
// then classify every pixel as cream, gold or ground by which reconstruction
// explains it best, keeping the alpha along that ink's axis. Each cutout is
// then centred on its own 400 x 400 canvas, scaled to fill it, so the tile
// CSS can simply centre the image and every drawing sits in the middle of its
// box at a similar size. (The pack keeps a shared floor line instead; the site
// deliberately does not, so the cups do not hang low in their tiles.)
//
// Run: node scripts/chai-method-art.mjs   (needs the HeldiPM checkout beside
// this repo; masters land in the gitignored public/images/originals/ tree).
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const G = "/Users/mihir/Projects/HeldiPM/design/pouch-v2/generated/";
const OUT = "public/images/shop/chai-method";
const MASTERS = "public/images/originals/pre-webp/shop/chai-method";
const CREAM = [0xf8, 0xf0, 0xde];
const GOLD = [0xed, 0xa3, 0x1d];
const CANVAS = 400;
const MARGIN = 8;

// Boxes from DRAWINGS_CHAI in compose_back_v8.py; BREW is the round-13 tea-bag override.
const SPECS = [
  { key: "brew", file: "chai-brew-teabag.png", box: null },
  { key: "cool", file: "v3-chai-upper-r1-raw.png", box: [1804, 1187, 2364, 1792] },
  { key: "stir", file: "v3-chai-upper-r1-raw.png", box: [2482, 977, 3341, 1793] }
];

async function loadRGB(file, box) {
  let img = sharp(G + file).removeAlpha();
  if (box) img = img.extract({ left: box[0], top: box[1], width: box[2] - box[0], height: box[3] - box[1] });
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}
const median = (arr) => [...arr].sort((a, b) => a - b)[arr.length >> 1];

function sampleInks({ data, w, h }) {
  const bgPx = [[], [], []];
  for (let y = (h >> 1) - 40; y < (h >> 1) + 40; y++) {
    for (let x = 0; x < 30; x++) {
      const i = (y * w + x) * 3;
      bgPx[0].push(data[i]); bgPx[1].push(data[i + 1]); bgPx[2].push(data[i + 2]);
    }
  }
  const bg = bgPx.map(median);
  const cream = [[], [], []], gold = [[], [], []];
  for (let i = 0; i < data.length; i += 3) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (Math.abs(r - bg[0]) + Math.abs(g - bg[1]) + Math.abs(b - bg[2]) <= 60) continue;
    if (r + g + b > 560) { cream[0].push(r); cream[1].push(g); cream[2].push(b); }
    else if (r > 150 && b < 120) { gold[0].push(r); gold[1].push(g); gold[2].push(b); }
  }
  return { bg, cream: cream.map(median), gold: gold.map(median) };
}

function cutout({ data, w, h }, { bg, cream, gold }) {
  const axC = cream.map((v, i) => v - bg[i]), axG = gold.map((v, i) => v - bg[i]);
  const nC = axC.reduce((s, v) => s + v * v, 0), nG = axG.reduce((s, v) => s + v * v, 0);
  const out = Buffer.alloc(w * h * 4);
  let minX = w, maxX = -1, minY = h, maxY = -1;
  for (let p = 0; p < w * h; p++) {
    const d = [data[p * 3] - bg[0], data[p * 3 + 1] - bg[1], data[p * 3 + 2] - bg[2]];
    const aC = Math.max(0, Math.min(1, (d[0] * axC[0] + d[1] * axC[1] + d[2] * axC[2]) / nC));
    const aG = Math.max(0, Math.min(1, (d[0] * axG[0] + d[1] * axG[1] + d[2] * axG[2]) / nG));
    // Which ink explains the pixel: rebuild it along each axis and keep the
    // closer one. Projection alone favours the shorter (gold) axis for every
    // cream pixel, which is how a first pass painted the cups gold.
    const rC = d.reduce((s, v, i) => s + Math.abs(v - aC * axC[i]), 0);
    const rG = d.reduce((s, v, i) => s + Math.abs(v - aG * axG[i]), 0);
    let a, col;
    if (rG < rC && aG > 0.3) { a = aG; col = GOLD; } else { a = aC; col = CREAM; }
    if (a < 0.1) a = 0;
    if (a > 0) {
      const x = p % w, y = (p / w) | 0;
      if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    out[p * 4] = col[0]; out[p * 4 + 1] = col[1]; out[p * 4 + 2] = col[2]; out[p * 4 + 3] = Math.round(a * 255);
  }
  return { out, w, h, bbox: [minX, minY, maxX + 1, maxY + 1] };
}

for (const s of SPECS) {
  const src = await loadRGB(s.file, s.box);
  const c = cutout(src, sampleInks(src));
  const [x0, y0, x1, y1] = c.bbox;
  const tight = await sharp(c.out, { raw: { width: c.w, height: c.h, channels: 4 } })
    .extract({ left: x0, top: y0, width: x1 - x0, height: y1 - y0 }).png().toBuffer();
  const m = await sharp(tight).metadata();
  const fit = (CANVAS - 2 * MARGIN) / Math.max(m.width, m.height);
  const w = Math.round(m.width * fit), h = Math.round(m.height * fit);
  const resized = await sharp(tight).resize(w, h, { kernel: "lanczos3" }).png().toBuffer();
  const canvas = await sharp({ create: { width: CANVAS, height: CANVAS, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: resized, left: Math.round((CANVAS - w) / 2), top: Math.round((CANVAS - h) / 2) }]).png().toBuffer();
  await sharp(canvas).png({ compressionLevel: 9 }).toFile(`${MASTERS}/${s.key}.png`);
  const webp = await sharp(canvas).webp({ nearLossless: true, quality: 60 }).toBuffer();
  writeFileSync(`${OUT}/${s.key}.webp`, webp);
  console.log(`${s.key}.webp ${CANVAS}x${CANVAS} (art ${w}x${h}) ${(webp.length / 1024).toFixed(1)}KB`);
}
