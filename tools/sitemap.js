/*
 * Builds sitemap.xml: the list of pages search engines should find
 * (Google Search Console and Bing Webmaster Tools read it from robots.txt).
 * Claude runs this; Shawn doesn't need to.
 *
 *   node tools/sitemap.js
 *
 * Re-run it in the same PR as any new or moved page. Every folder with an
 * index.html is listed, except redirect pages (marked noindex), the search
 * page and the 404 page. Addresses come from each page's canonical link when
 * it has one, so the sitemap always agrees with what the page says about itself.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SITE = "https://tallorderdigital.com/";
const SKIP_DIRS = new Set([".git", "assets", "docs", "tools", "search"]);

function pages(dir, rel = "") {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory() || SKIP_DIRS.has(e.name)) continue;
    out.push(...pages(path.join(dir, e.name), rel + e.name + "/"));
  }
  const file = path.join(dir, "index.html");
  if (fs.existsSync(file)) out.push({ rel, html: fs.readFileSync(file, "utf8") });
  return out;
}

const urls = pages(ROOT)
  .filter(p => !/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(p.html))
  .map(p => {
    const canon = p.html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
    const url = canon ? canon[1] : SITE + p.rel;
    if (!url.startsWith(SITE)) throw new Error(`${p.rel || "home"}: canonical points off-site: ${url}`);
    return url;
  })
  .sort((a, b) => (a === SITE ? -1 : b === SITE ? 1 : a.localeCompare(b)));

const dupes = urls.filter((u, i) => urls.indexOf(u) !== i);
if (dupes.length) throw new Error("Two pages claim the same address: " + dupes.join(", "));

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc></url>`).join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml);
console.log(`sitemap.xml: ${urls.length} pages`);
urls.forEach(u => console.log("  " + u));
