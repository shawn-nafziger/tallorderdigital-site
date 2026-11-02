/*
 * Builds the search index baked into search/index.html. Claude runs this whenever a story, dashboard,
 * or Stats, explained section is added or retitled; Shawn doesn't need to.
 *
 *   node tools/search-index.js           (rewrite the index in search/index.html)
 *   node tools/search-index.js --check   (exit 1 if the index is out of date; changes nothing)
 *
 * What it reads (all from this repo, so nothing is typed twice):
 *   - home page story cards (index.html): title, summary, topic, date, plus each story's meta description
 *   - dashboards index cards (nba/dashboards/index.html)
 *   - each Stats, explained section (explained/index.html): heading, "also called" line, summary, and its text
 *   - the About, Stats explained and Dashboards pages themselves
 * Daily dashboard refreshes don't change titles or summaries, so they don't need a rebuild.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”", mdash: "—", ndash: "–", hellip: "…", minus: "−" };
const text = (h) => (h || "")
  .replace(/<(script|style|svg|details)[\s\S]*?<\/\1>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&(#\d+|[a-z]+);/gi, (m, e) => (ENT[e] !== undefined ? ENT[e] : e[0] === "#" ? String.fromCharCode(+e.slice(1)) : m))
  .replace(/\s+/g, " ").trim();
const pick = (h, re) => { const m = h.match(re); return m ? text(m[1]) : ""; };
const meta = (h, name) => { const m = h.match(new RegExp(`<meta name="${name}" content="([^"]*)"`)); return m ? text(m[1]) : ""; };

const items = [];

// Stories, from the home page cards (newest first, as on the home page).
const home = read("index.html");
for (const m of home.matchAll(/<a class="story" data-topic="([a-z-]+)" href="([^"]+)">([\s\S]*?)<\/a>\s*(?=<a class="story"|<p class="soon"|<\/section>)/g)) {
  const [, topic, href, body] = m;
  const kicker = pick(body, /<p class="kicker">([\s\S]*?)<\/p>/);
  const date = (kicker.match(/[A-Z][a-z]{2} \d{1,2}, \d{4}/) || [""])[0];
  let desc = "";
  try { desc = meta(read(path.join(href, "index.html")), "description"); } catch (e) { /* card points outside this repo */ }
  items.push({ type: "Story", topic, title: pick(body, /<h2>([\s\S]*?)<\/h2>/), sum: pick(body, /<p class="dek">([\s\S]*?)<\/p>/),
    kw: kicker.replace(date, "").replace(/[·\s]+$/, ""), body: desc, url: href, date });
}

// Dashboards, from the dashboards index.
const dashIndex = read("nba/dashboards/index.html");
for (const m of dashIndex.matchAll(/<a class="dash" href="([^"]+)">([\s\S]*?)<\/a>/g)) {
  const [, href, body] = m;
  items.push({ type: "Dashboard", topic: "nba", title: pick(body, /<h2>([\s\S]*?)<\/h2>/), sum: pick(body, /<p class="dek">([\s\S]*?)<\/p>/),
    kw: "dashboard daily " + pick(body, /<p class="kicker">([\s\S]*?)<\/p>/), body: "", url: "nba/dashboards/" + href, date: "" });
}

// Stats, explained: one entry per section, linked to its anchor.
const ex = read("explained/index.html");
const toc = Object.fromEntries([...ex.matchAll(/<li><a href="#([^"]+)">([\s\S]*?)<\/a><\/li>/g)].map((m) => [m[1], text(m[2])]));
for (const m of ex.matchAll(/<section class="entry" id="([^"]+)">([\s\S]*?)<\/section>/g)) {
  const [, id, body] = m;
  const ids = [id, ...[...body.matchAll(/<span id="([^"]+)"><\/span>/g)].map((x) => x[1])].map((x) => x.replace(/-/g, " "));
  items.push({ type: "Stats, explained", topic: "", title: pick(body, /<h2>([\s\S]*?)<\/h2>/), sum: pick(body, /<p class="short">([\s\S]*?)<\/p>/),
    kw: [pick(body, /<p class="aka">([\s\S]*?)<\/p>/), toc[id] || "", ...ids].join(" "), body: text(body).slice(0, 1800), url: "explained/#" + id, date: "" });
}

// Pages.
const page = (url, file, title, kw) => { const h = read(file); items.push({ type: "Page", topic: "", title, sum: meta(h, "description"), kw, body: "", url, date: "" }); };
page("nba/dashboards/", "nba/dashboards/index.html", "NBA dashboards", "dashboards daily updated every morning");
page("explained/", "explained/index.html", "Stats, explained", "glossary reference terms definitions math");
page("about/", "about/index.html", "About", "Shawn Nafziger contact email privacy cookies hire");

for (const it of items) if (!it.title) throw new Error("search index: an entry has no title: " + JSON.stringify(it));

const searchFile = path.join(ROOT, "search/index.html");
const html = fs.readFileSync(searchFile, "utf8");
const re = /\/\* search-index:start \*\/[\s\S]*?\/\* search-index:end \*\//;
if (!re.test(html)) throw new Error("search/index.html is missing the search-index markers");
const json = JSON.stringify(items).replace(/</g, "\\u003c");
const out = html.replace(re, () => `/* search-index:start */${json}/* search-index:end */`);
const counts = items.reduce((c, it) => ((c[it.type] = (c[it.type] || 0) + 1), c), {});
if (process.argv.includes("--check")) {
  if (out !== html) { console.log("search index is out of date: run node tools/search-index.js"); process.exit(1); }
  console.log("search index is current", counts);
} else {
  fs.writeFileSync(searchFile, out);
  console.log("wrote search/index.html", counts);
}
