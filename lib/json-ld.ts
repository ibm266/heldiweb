// Serialise a JSON-LD object for embedding in an inline <script> tag.
//
// JSON.stringify alone is unsafe inside HTML: it does not escape "<", so a
// value containing "</script>" (or "<!--") would break out of the script
// element. Escaping the HTML-significant characters as \\uXXXX keeps the output
// valid JSON while making a tag breakout impossible. U+2028/U+2029 are escaped
// too (valid in JSON but line terminators to some JS parsers).
//
// Every JSON-LD block in the app passes through here instead of raw
// JSON.stringify.
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/[\u2028\u2029]/g, (c) =>
      "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0")
    );
}
