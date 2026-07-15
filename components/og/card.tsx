import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Shared template for every og:image on the site. Rendered by satori at build
// time (all routes are static), so the font/art reads below never run per
// request. Design follows BRAND.md §8: gold ground, cream sticker card with a
// hard offset ink shadow, Rozha One display over Gelasio.
//
// Satori cannot read CSS custom properties, so the tokens are mirrored here.
// If app/globals.css tokens change, change these too (BRAND.md §11.6).
const INK = "#011246";
const GOLD = "#eda31d";
const CREAM = "#f8f0de";
const TERRACOTTA = "#a8432b";
const BROWN = "#4a4238";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

async function asset(file: string): Promise<string> {
  const data = await readFile(join(process.cwd(), "assets", file));
  return `data:${file.endsWith(".ttf") ? "font/ttf" : "image/png"};base64,${data.toString("base64")}`;
}

async function fontData(file: string): Promise<ArrayBuffer> {
  const data = await readFile(join(process.cwd(), "assets/og-fonts", file));
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
}

export type HeldiOgCardProps = {
  eyebrow: string;
  title: string;
  /** Optional line under the title; defaults to the pronunciation line. */
  sub?: string;
  /** Right-hand artwork. Pouch for commercial surfaces, elephant elsewhere. */
  art?: "pouch" | "elephant";
  /** Override for long titles (blog posts). */
  titleSize?: number;
};

export async function heldiOgImage({
  eyebrow,
  title,
  sub = "/hel-dee/ adj. how my nani says “healthy.”",
  art = "elephant",
  titleSize = 84
}: HeldiOgCardProps): Promise<ImageResponse> {
  const [wordmark, artwork, rozha, gelasio, gelasioSemi, gelasioItalic] =
    await Promise.all([
      asset("og/wordmark.png"),
      asset(art === "pouch" ? "og/pouch.png" : "og/elephant.png"),
      fontData("RozhaOne-Regular.ttf"),
      fontData("Gelasio-normal-400.ttf"),
      fontData("Gelasio-normal-600.ttf"),
      fontData("Gelasio-italic-400.ttf")
    ]);

  const artWidth = art === "pouch" ? 300 : 340;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: GOLD,
          padding: 48
        }}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            background: CREAM,
            border: `6px solid ${INK}`,
            borderRadius: 32,
            boxShadow: `18px 18px 0 ${INK}`,
            padding: "52px 64px",
            alignItems: "center",
            gap: 48
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              height: "100%",
              justifyContent: "space-between"
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  color: TERRACOTTA,
                  fontFamily: "Gelasio",
                  fontWeight: 600,
                  fontSize: 26,
                  letterSpacing: 7
                }}
              >
                {eyebrow.toUpperCase()}
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 20,
                  color: INK,
                  fontFamily: "Rozha One",
                  fontSize: titleSize,
                  lineHeight: 1.06
                }}
              >
                {title}
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 26,
                  color: BROWN,
                  fontFamily: "Gelasio",
                  fontStyle: "italic",
                  fontSize: 30
                }}
              >
                {sub}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 22,
                marginTop: 30
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={wordmark} width={174} height={55} alt="" />
              <div
                style={{
                  display: "flex",
                  width: 6,
                  height: 42,
                  background: INK,
                  borderRadius: 3,
                  flexShrink: 0
                }}
              />
              <div
                style={{
                  display: "flex",
                  color: INK,
                  fontFamily: "Gelasio",
                  fontWeight: 600,
                  fontSize: 22,
                  letterSpacing: 3,
                  whiteSpace: "nowrap"
                }}
              >
                THEY SHAKE, WE STIR
              </div>
            </div>
          </div>
          {art === "pouch" ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                background: "#ffffff",
                border: `4px solid ${GOLD}`,
                borderRadius: 24,
                padding: "18px 14px"
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={artwork}
                width={artWidth - 40}
                height={Math.round((artWidth - 40) * 1.5)}
                alt=""
                style={{ objectFit: "contain" }}
              />
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                width: artWidth
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={artwork}
                width={artWidth}
                height={artWidth}
                alt=""
                style={{ objectFit: "contain" }}
              />
            </div>
          )}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Rozha One", data: rozha, weight: 400, style: "normal" },
        { name: "Gelasio", data: gelasio, weight: 400, style: "normal" },
        { name: "Gelasio", data: gelasioSemi, weight: 600, style: "normal" },
        { name: "Gelasio", data: gelasioItalic, weight: 400, style: "italic" }
      ]
    }
  );
}
