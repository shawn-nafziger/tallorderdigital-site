/*
 * IndexNow (Nov 10, 2026): after each publish, tell Bing (and the other engines that share IndexNow: Yandex,
 * Seznam, Naver, Yep) exactly which pages changed, so they recrawl them now instead of whenever they next visit.
 * Bing's index feeds ChatGPT search and Copilot, so this keeps AI answers current with the daily Almanac and
 * dashboards. Google doesn't use IndexNow; it reads the sitemaps. Run by .github/workflows/publish.yml; Shawn
 * doesn't need to run it.
 *
 *   node tools/indexnow.js --changed <file listing changed repo paths> --prev-almanac <previous live sitemap>
 *                          [--dry-run]
 *
 * Which pages are sent:
 *   - Site pages whose index.html changed in this push (story merges, the morning dashboard commits), skipping
 *     redirect pages and anything else marked noindex, the search page and the 404 page.
 *   - Almanac pages whose <lastmod> in the new weather/almanac/sitemap.xml differs from the sitemap that was live
 *     before this publish (each place's page changes when its data does; repeat builds on the same day send none).
 *
 * The key is public by design: IndexNow checks that https://tallorderdigital.com/<key>.txt holds it, which
 * proves the site sent the list. Never fails the publish: problems are printed as warnings.
 */
const fs = require("fs");
const path = require("path");

const SITE = "https://tallorderdigital.com/";
const HOST = "tallorderdigital.com";
const KEY = "ae23ceaa6c5f1a6c5981972474b2f176";
const ROOT = path.resolve(__dirname, "..");
const SKIP = /^(search\/|404\.html$|weather\/almanac\/)/;

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : undefined; };
const DRY = process.argv.includes("--dry-run");
const read = (p) => { try { return fs.readFileSync(p, "utf8"); } catch { return ""; } };

function sitePages(listFile) {
  const urls = [];
  for (const rel of read(listFile).split("\n").map((s) => s.trim()).filter(Boolean)) {
    if (!/(^|\/)index\.html$/.test(rel) || SKIP.test(rel)) continue;
    const html = read(path.join(ROOT, rel));
    if (!html || /<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html)) continue; // deleted, redirect or hidden
    urls.push(SITE + rel.replace(/index\.html$/, ""));
  }
  return urls;
}

function lastmods(xml) {
  const out = new Map();
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>(?:<lastmod>([^<]*)<\/lastmod>)?/g)) out.set(m[1], m[2] || "");
  return out;
}

function almanacPages(prevFile) {
  const now = lastmods(read(path.join(ROOT, "weather/almanac/sitemap.xml")));
  const before = lastmods(read(prevFile));
  return [...now].filter(([u, d]) => before.get(u) !== d).map(([u]) => u);
}

async function main() {
  const urls = [...new Set([...sitePages(arg("--changed")), ...almanacPages(arg("--prev-almanac"))])];
  if (!urls.length) { console.log("IndexNow: no changed pages to send."); return; }
  const body = { host: HOST, key: KEY, keyLocation: `${SITE}${KEY}.txt`, urlList: urls.slice(0, 10000) };
  console.log(`IndexNow: ${urls.length} changed page(s), e.g. ${urls.slice(0, 3).join(", ")}`);
  if (DRY) { console.log(JSON.stringify(body, null, 1)); return; }
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify(body),
    });
    // 200/202 = accepted. 403 = key file not live yet (first run), 422 = a URL isn't on this host, 429 = too often.
    console.log(`IndexNow answered ${res.status}`);
    if (res.status >= 300) console.log(`::warning::IndexNow answered ${res.status}: ${(await res.text()).slice(0, 200)}`);
  } catch (e) {
    console.log(`::warning::IndexNow could not be reached: ${e.message}`);
  }
}
main();
