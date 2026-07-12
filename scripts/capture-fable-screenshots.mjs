import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = path.join(process.cwd(), "fable/screenshots");
const BASE = process.env.BASE_URL ?? "http://localhost:3000";

const sections = [
  { name: "01-hero", selector: "#top", fullPage: false },
  { name: "02-ticker", selector: ".ticker", fullPage: false },
  { name: "03-pouch", selector: "#pouch", fullPage: false },
  { name: "04-stir-gallery", selector: "#stir", fullPage: false },
  { name: "05-how-it-works", selector: "#how", fullPage: false },
  { name: "06-menu-gallery", selector: "#thali", fullPage: false },
  { name: "07-audience", selector: "#thali + .section--gold", fullPage: false },
  { name: "08-faq", selector: "#faq", fullPage: false },
  { name: "09-jar", selector: "#jar", fullPage: false },
  { name: "10-final-cta", selector: "#join", fullPage: false },
  { name: "11-footer", selector: "footer", fullPage: false },
];

async function main() {
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(BASE, { waitUntil: "networkidle" });
  // Wait for hero reveal intro to finish
  await page.waitForTimeout(5500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);

  await page.screenshot({
    path: path.join(OUT, "00-full-page-desktop.png"),
    fullPage: true,
  });

  for (const { name, selector } of sections) {
    const el = page.locator(selector).first();
    if ((await el.count()) === 0) continue;
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await el.screenshot({ path: path.join(OUT, `${name}-desktop.png`) });
  }

  // Mobile viewport
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(5500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);

  await page.screenshot({
    path: path.join(OUT, "00-full-page-mobile.png"),
    fullPage: true,
  });

  for (const name of ["01-hero", "03-pouch", "04-stir-gallery", "06-menu-gallery", "10-final-cta"]) {
    const selector = sections.find((s) => s.name === name)?.selector;
    if (!selector) continue;
    const el = page.locator(selector).first();
    if ((await el.count()) === 0) continue;
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await el.screenshot({ path: path.join(OUT, `${name}-mobile.png`) });
  }

  await browser.close();
  console.log(`Screenshots saved to ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
