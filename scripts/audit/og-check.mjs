#!/usr/bin/env node
// Link-preview audit: every sitemap page + /contact + /terms must have og:title/description/url/image,
// twitter:card=summary_large_image, and every og:image / twitter:image / JSON-LD card must be 200 image/png 1200x630.
// NBA pages must not use field wording. Exit 1 on any failure.   node scripts/audit/og-check.mjs [--site URL]
const i = process.argv.indexOf("--site");
const SITE = (i > 0 ? process.argv[i + 1] : process.env.SITE ?? "https://rupturereport.com").replace(/\/$/, "");
const UA = { "User-Agent": "Mozilla/5.0 (compatible; Twitterbot/1.0; RuptureReport-audit)" };

// Fetch + read the whole body inside the retry loop, so a reset mid-body is retried too. After the last try it
// returns status 0 with the error, which callers report as a FAIL (never a silent pass, never an uncaught crash).
async function get(url, tries = 4) {
  for (let t = 1; ; t++) {
    try {
      const r = await fetch(url, { headers: UA, redirect: "follow", signal: AbortSignal.timeout(30000) });
      const body = Buffer.from(await r.arrayBuffer());
      if (r.status >= 500 && t < tries) throw new Error(`HTTP ${r.status}`);
      return { status: r.status, ct: r.headers.get("content-type") ?? "", body, text: () => body.toString("utf8") };
    } catch (e) {
      if (t >= tries) return { status: 0, ct: "", body: Buffer.alloc(0), text: () => "", error: `${e.message}${e.cause ? ` (${e.cause.code ?? e.cause.message})` : ""}` };
      await new Promise((s) => setTimeout(s, 1500 * t));
    }
  }
}
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const meta = (h, k) => { const m = new RegExp(`<meta (?:property|name)="${k.replace(/[:.]/g, "\\$&")}" content="([^"]*)"`).exec(h); return m ? decode(m[1]) : ""; };

async function pool(items, n, fn) {
  const out = new Array(items.length); let k = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (k < items.length) { const j = k++; out[j] = await fn(items[j]); } }));
  return out;
}

const smr = await get(`${SITE}/sitemap.xml`);
if (smr.status !== 200) { console.log(`OG audit: FAIL sitemap.xml ${smr.status} ${smr.error ?? ""}`); process.exit(1); }
const sm = smr.text();
const pages = [...new Set([...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).concat([`${SITE}/contact`, `${SITE}/terms`]))];
const fails = [];
const images = new Map();
await pool(pages, 6, async (u) => {
  const r = await get(u);
  if (r.status !== 200) return fails.push(`${u}: page ${r.status}${r.error ? ` ${r.error}` : ""}`);
  const h = r.text();
  const m = Object.fromEntries(["og:title", "og:description", "og:url", "og:image", "twitter:card", "twitter:image"].map((k) => [k, meta(h, k)]));
  for (const k of ["og:title", "og:description", "og:url", "og:image"]) if (!m[k]) fails.push(`${u}: missing ${k}`);
  if (m["twitter:card"] !== "summary_large_image") fails.push(`${u}: twitter:card=${m["twitter:card"] || "(none)"}`);
  if (m["og:url"] && m["og:url"].replace(/\/$/, "") !== u.replace(/\/$/, "")) fails.push(`${u}: og:url=${m["og:url"]}`);
  if (/\/nba(\/|$)/.test(u.replace(SITE, "")) && /\b(field|gridiron|turf)\b/i.test(m["og:title"] + " " + m["og:description"])) fails.push(`${u}: NBA copy uses field wording`);
  const ld = [...h.matchAll(/"image":\[?"([^"]*opengraph-image[^"]*)"/g)].map((x) => decode(x[1]));
  for (const img of [m["og:image"], m["twitter:image"], ...ld].filter(Boolean)) (images.get(img) ?? images.set(img, []).get(img)).push(u);
});
await pool([...images.keys()], 6, async (img) => {
  const r = await get(img);
  const b = r.body, ct = r.ct;
  const png = b.subarray(0, 4).toString("latin1") === "\x89PNG";
  const w = png ? b.readUInt32BE(16) : 0, hh = png ? b.readUInt32BE(20) : 0;
  if (r.status !== 200 || !ct.startsWith("image/png") || w !== 1200 || hh !== 630)
    fails.push(`${img}: ${r.status}${r.error ? ` ${r.error}` : ""} ${ct} ${w}x${hh} (used by ${images.get(img).length} page(s), e.g. ${images.get(img)[0]})`);
});
console.log(`OG audit: ${pages.length} pages, ${images.size} images, ${fails.length} problem(s)`);
for (const f of fails) console.log(`  FAIL ${f}`);
process.exit(fails.length ? 1 : 0);
