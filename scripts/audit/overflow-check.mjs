#!/usr/bin/env node
// Mobile/desktop overflow audit: document scrollWidth must equal the viewport (390 and 1440) on key pages of both
// leagues, and pages must not log console errors. Needs Playwright + Chromium (CI installs them; not a project dep).
//   npx -y -p playwright@1 node scripts/audit/overflow-check.mjs [--site URL]   (or set PW_CHROMIUM=/path/to/chrome)
const i = process.argv.indexOf("--site");
const SITE = (i > 0 ? process.argv[i + 1] : process.env.SITE ?? "https://rupturereport.com").replace(/\/$/, "");
let chromium;
try { ({ chromium } = await import("playwright")); } catch {
  const { createRequire } = await import("node:module");
  ({ chromium } = createRequire(process.cwd() + "/")("playwright"));
}
const sm = await (await fetch(`${SITE}/sitemap.xml`, { headers: { "User-Agent": "Mozilla/5.0 RuptureReport-audit" } })).text();
const all = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE, "") || "/");
const pick = (re) => all.find((p) => re.test(p));
const paths = [...new Set(["/", "/players", "/stats", "/nba", "/nba/players", "/nba/stats", "/contact", "/terms",
  pick(/^\/players\/[^/]+$/), pick(/^\/nba\/players\/[^/]+$/), "/this-page-does-not-exist", "/nba/not-a-season"].filter(Boolean))];
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const fails = [];
for (const w of [390, 1440]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, userAgent: "Mozilla/5.0 (RuptureReport-audit) Chrome" });
  for (const p of paths) {
    const page = await ctx.newPage();
    const errs = [];
    page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
    page.on("pageerror", (e) => errs.push(String(e)));
    let ok = false;
    for (let t = 0; t < 3 && !ok; t++) {
      try { await page.goto(SITE + p, { waitUntil: "networkidle", timeout: 45000 }); ok = true; } catch (e) { if (t === 2) fails.push(`${p} @${w}: load failed ${e.message}`); }
    }
    if (ok) {
      await page.waitForTimeout(800);
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      if (sw > w) fails.push(`${p} @${w}: scrollWidth ${sw} > ${w} (horizontal overflow)`);
      if (errs.length) fails.push(`${p} @${w}: console errors: ${errs.slice(0, 2).join(" | ")}`);
      console.log(`  ${sw > w || errs.length ? "FAIL" : "ok  "} ${p} @${w} scrollWidth=${sw}`);
    }
    await page.close();
  }
  await ctx.close();
}
await browser.close();
console.log(`Overflow audit: ${paths.length} pages x 2 widths, ${fails.length} problem(s)`);
for (const f of fails) console.log(`  FAIL ${f}`);
process.exit(fails.length ? 1 : 0);
