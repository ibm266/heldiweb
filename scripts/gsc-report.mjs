// Pulls Google Search Console data for heldi.co.uk so an agent (or you) can read
// it from the terminal without opening the GSC UI.
//
//   node --env-file=.env.local scripts/gsc-report.mjs --sites
//   node --env-file=.env.local scripts/gsc-report.mjs                 # 28-day performance
//   node --env-file=.env.local scripts/gsc-report.mjs --days 7
//   node --env-file=.env.local scripts/gsc-report.mjs --sitemaps
//   node --env-file=.env.local scripts/gsc-report.mjs --inspect https://heldi.co.uk/shop
//   node --env-file=.env.local scripts/gsc-report.mjs --json          # machine-readable
//
// This is the data source for the weekly monitoring agent in
// docs/seo-automation.md §5: the "queries where you rank 5 to 20" block is the
// keyword backlog refill, and the coverage state from --inspect is how you tell
// whether an indexing problem is real or just Google being slow.
//
// AUTH, one-time setup (no OAuth flow, so it works headless and in CI):
//   1. Google Cloud Console -> new project -> enable the "Google Search Console API".
//   2. Create a service account, add a JSON key, download it.
//   3. Search Console -> Settings -> Users and permissions -> Add user ->
//      the service account's ...iam.gserviceaccount.com address, permission
//      FULL. Restricted returns 403 on searchAnalytics.query often enough that
//      it is not worth debugging.
//   4. Put the key somewhere OUTSIDE this repo and point GSC_SERVICE_ACCOUNT_KEY_FILE
//      at it, or paste the whole JSON into GSC_SERVICE_ACCOUNT_JSON.
//
// Env: GSC_SERVICE_ACCOUNT_KEY_FILE or GSC_SERVICE_ACCOUNT_JSON, and optionally
// GSC_PROPERTY (defaults to the domain property, which is the one to use: it
// covers apex, www, http and https together, so a hostname split cannot hide
// half your traffic from you).
//
// Deliberately zero dependencies. Signing a service-account JWT is ~20 lines of
// node:crypto, and googleapis is a 50MB tree for three endpoints.

import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";

const API = "https://searchconsole.googleapis.com";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

const PROPERTY = process.env.GSC_PROPERTY || "sc-domain:heldi.co.uk";
const AS_JSON = process.argv.includes("--json");

function flag(name, fallback = null) {
  const i = process.argv.indexOf(name);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function fail(message) {
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

// --- auth -----------------------------------------------------------------

function loadCredentials() {
  const { GSC_SERVICE_ACCOUNT_JSON, GSC_SERVICE_ACCOUNT_KEY_FILE } = process.env;
  const raw = GSC_SERVICE_ACCOUNT_JSON
    ? GSC_SERVICE_ACCOUNT_JSON
    : GSC_SERVICE_ACCOUNT_KEY_FILE
      ? readFileSync(GSC_SERVICE_ACCOUNT_KEY_FILE, "utf8")
      : null;

  if (!raw) {
    fail(
      "No credentials. Set GSC_SERVICE_ACCOUNT_KEY_FILE to the path of the\n" +
        "  service-account JSON key, or GSC_SERVICE_ACCOUNT_JSON to its contents.\n" +
        "  See the header of this file for the one-time setup."
    );
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    fail("The service-account credentials are not valid JSON.");
  }
  if (!parsed.client_email || !parsed.private_key) {
    fail("The service-account JSON is missing client_email or private_key.");
  }
  return parsed;
}

const base64url = (input) =>
  Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

async function getAccessToken(credentials) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(
    JSON.stringify({
      iss: credentials.client_email,
      scope: SCOPE,
      aud: TOKEN_URL,
      exp: now + 3600,
      iat: now
    })
  );

  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claim}`);
  // The key arrives with literal \n when it has been through an env var.
  const signature = signer
    .sign(credentials.private_key.replace(/\\n/g, "\n"), "base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claim}.${signature}`
    })
  });

  const body = await response.json();
  if (!response.ok) {
    fail(`Token exchange failed (${response.status}): ${body.error_description || JSON.stringify(body)}`);
  }
  return body.access_token;
}

async function call(token, path, { method = "GET", body } = {}) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      ...(body ? { "content-type": "application/json" } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });

  const text = await response.text();
  const parsed = text ? JSON.parse(text) : {};
  if (!response.ok) {
    const message = parsed.error?.message || text;
    if (response.status === 403) {
      fail(
        `403 from Search Console: ${message}\n\n` +
          `  Almost always one of two things:\n` +
          `    - the service account is not a user on ${PROPERTY}\n` +
          `      (Settings -> Users and permissions -> Add user -> permission FULL)\n` +
          `    - the property string is wrong. Run with --sites to see the exact\n` +
          `      strings your account can read.`
      );
    }
    fail(`${response.status} from Search Console: ${message}`);
  }
  return parsed;
}

// --- dates ----------------------------------------------------------------

const iso = (date) => date.toISOString().slice(0, 10);

// GSC finalises data on a 2-3 day lag, so a window ending today is always
// partly empty and reads as a traffic collapse. End three days back instead.
function window(days, offsetPeriods = 0) {
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 3 - offsetPeriods * days);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  return { startDate: iso(start), endDate: iso(end) };
}

// --- reports --------------------------------------------------------------

async function listSites(token) {
  const { siteEntry = [] } = await call(token, "/webmasters/v3/sites");
  if (AS_JSON) return console.log(JSON.stringify(siteEntry, null, 2));

  if (siteEntry.length === 0) {
    return console.log(
      "\n  No properties readable by this service account.\n" +
        "  Add its email as a user in Search Console -> Settings -> Users and permissions.\n"
    );
  }
  console.log("\n  Properties this service account can read:\n");
  for (const site of siteEntry) {
    console.log(`    ${site.siteUrl}  (${site.permissionLevel})`);
  }
  console.log(
    "\n  Use the sc-domain: one if there is one. It covers apex, www, http and\n" +
      "  https together, so a hostname split cannot hide half your traffic.\n"
  );
}

async function listSitemaps(token) {
  const { sitemap = [] } = await call(
    token,
    `/webmasters/v3/sites/${encodeURIComponent(PROPERTY)}/sitemaps`
  );
  if (AS_JSON) return console.log(JSON.stringify(sitemap, null, 2));

  if (sitemap.length === 0) {
    return console.log(
      `\n  No sitemap submitted for ${PROPERTY}.\n` +
        "  Search Console -> Sitemaps -> submit https://heldi.co.uk/sitemap.xml\n"
    );
  }
  console.log(`\n  Sitemaps on ${PROPERTY}:\n`);
  for (const entry of sitemap) {
    const submitted = entry.contents?.[0]?.submitted ?? "?";
    const indexed = entry.contents?.[0]?.indexed ?? "?";
    console.log(`    ${entry.path}`);
    console.log(`      last read     ${entry.lastDownloaded?.slice(0, 10) ?? "never"}`);
    console.log(`      URLs          ${submitted} submitted, ${indexed} indexed`);
    console.log(`      errors        ${entry.errors ?? 0}, warnings ${entry.warnings ?? 0}`);
  }
  console.log("");
}

async function inspect(token, url) {
  const result = await call(token, "/v1/urlInspection/index:inspect", {
    method: "POST",
    body: { inspectionUrl: url, siteUrl: PROPERTY, languageCode: "en-GB" }
  });
  if (AS_JSON) return console.log(JSON.stringify(result, null, 2));

  const index = result.inspectionResult?.indexStatusResult ?? {};
  console.log(`\n  ${url}\n`);
  console.log(`    verdict            ${index.verdict ?? "?"}`);
  console.log(`    coverage           ${index.coverageState ?? "?"}`);
  console.log(`    robots.txt         ${index.robotsTxtState ?? "?"}`);
  console.log(`    indexing allowed   ${index.indexingState ?? "?"}`);
  console.log(`    last crawled       ${index.lastCrawlTime?.slice(0, 10) ?? "never"}`);
  console.log(`    Google's canonical ${index.googleCanonical ?? "?"}`);
  console.log(`    your canonical     ${index.userCanonical ?? "?"}`);
  if (index.googleCanonical && index.userCanonical && index.googleCanonical !== index.userCanonical) {
    console.log(
      "\n    Those two disagree. Google has picked a different canonical from the\n" +
        "    one the page declares, which is what a hostname split looks like."
    );
  }
  console.log("");
}

async function query(token, { dimensions, days, offsetPeriods = 0, rowLimit = 25 }) {
  const { rows = [] } = await call(
    token,
    `/webmasters/v3/sites/${encodeURIComponent(PROPERTY)}/searchAnalytics/query`,
    {
      method: "POST",
      body: { ...window(days, offsetPeriods), dimensions, rowLimit, dataState: "final" }
    }
  );
  return rows;
}

const pad = (value, width) => String(value).padEnd(width).slice(0, width);
const num = (value, width) => String(value).padStart(width);

function table(title, rows, keyWidth) {
  console.log(`\n  ${title}\n`);
  if (rows.length === 0) return console.log("    (no data in this window)\n");
  console.log(`    ${pad("", keyWidth)} ${num("clicks", 7)} ${num("impr", 8)} ${num("pos", 6)}`);
  for (const row of rows) {
    console.log(
      `    ${pad(row.keys[0], keyWidth)} ${num(row.clicks, 7)} ${num(row.impressions, 8)} ${num(row.position.toFixed(1), 6)}`
    );
  }
  console.log("");
}

async function performance(token, days) {
  const [totalsNow, totalsPrev, queries, pages] = await Promise.all([
    query(token, { dimensions: [], days, rowLimit: 1 }),
    query(token, { dimensions: [], days, offsetPeriods: 1, rowLimit: 1 }),
    query(token, { dimensions: ["query"], days, rowLimit: 25 }),
    query(token, { dimensions: ["page"], days, rowLimit: 25 })
  ]);

  if (AS_JSON) {
    return console.log(
      JSON.stringify(
        { property: PROPERTY, window: window(days), totalsNow, totalsPrev, queries, pages },
        null,
        2
      )
    );
  }

  const { startDate, endDate } = window(days);
  const now = totalsNow[0] ?? { clicks: 0, impressions: 0, position: 0 };
  const prev = totalsPrev[0] ?? { clicks: 0, impressions: 0, position: 0 };
  const delta = (a, b) => (b ? `${a - b >= 0 ? "+" : ""}${(((a - b) / b) * 100).toFixed(0)}%` : "n/a");

  console.log(`\n  ${PROPERTY}   ${startDate} to ${endDate}   (${days} days)\n`);
  console.log(`    clicks        ${num(now.clicks, 7)}   vs previous period ${delta(now.clicks, prev.clicks)}`);
  console.log(
    `    impressions   ${num(now.impressions, 7)}   vs previous period ${delta(now.impressions, prev.impressions)}`
  );
  console.log(`    avg position  ${num(now.position.toFixed(1), 7)}`);

  table("Top queries", queries, 46);
  table("Top pages", pages.map((row) => ({ ...row, keys: [row.keys[0].replace(/^https?:\/\//, "")] })), 46);

  // The refill list for docs/seo-queue.json: things you nearly rank for.
  const nearMisses = queries.filter((row) => row.position >= 5 && row.position <= 20);
  if (nearMisses.length > 0) {
    table("Ranking 5 to 20 (queue candidates, see seo-automation.md §3)", nearMisses, 46);
  }
}

// --- main -----------------------------------------------------------------

const token = await getAccessToken(loadCredentials());
const inspectUrl = flag("--inspect");

if (process.argv.includes("--sites")) {
  await listSites(token);
} else if (process.argv.includes("--sitemaps")) {
  await listSitemaps(token);
} else if (inspectUrl) {
  await inspect(token, inspectUrl);
} else {
  await performance(token, Number(flag("--days", "28")));
}
