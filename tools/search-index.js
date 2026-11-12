/*
 * Builds the search index baked into search/index.html. Claude runs this whenever a story, dashboard,
 * or Stats, explained section is added or retitled; Shawn doesn't need to.
 *
 *   node tools/search-index.js           (rewrite the index in search/index.html)
 *   node tools/search-index.js --check   (exit 1 if the index is out of date; changes nothing)
 *
 * What it reads (all from this repo, so nothing is typed twice):
 *   - story cards on the topic pages (nba/, weather/, stories/): title, summary, topic, date, plus each story's meta description
 *   - Tall Takes cards (nba/takes/index.html)
 *   - dashboards index cards (nba/dashboards/index.html) and off-site dashboards on the hub (dashboards/index.html)
 *   - each Stats, explained section (explained/index.html): heading, "also called" line, summary, and its text
 *   - Charts, explained (explained/charts/, added Nov 11, 2026): the hub, then each chart page and Charts to avoid
 *     (built in misc-analytics/analysis/chart_guide/): heading, the question it answers, and its meta description
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

// Stories, from the story cards on the topic pages (NBA, Weather, More stories; Nov 8, 2026), newest first overall.
// Card links are relative to their page's folder, so each becomes a path from the site root.
const stories = [];
for (const [file, dir] of [["nba/index.html", "nba/"], ["weather/index.html", "weather/"], ["stories/index.html", "stories/"]]) {
  const h = read(file);
  for (const m of h.matchAll(/<a class="story" data-topic="([a-z-]+)"(?: data-series="[a-z-]+")? href="([^"]+)">([\s\S]*?)<\/a>\s*(?=<a class="story"|<!-- cards:end -->)/g)) {
    const [, topic, rel, body] = m;
    const href = path.posix.normalize(dir + rel);
    const kicker = pick(body, /<p class="kicker">([\s\S]*?)<\/p>/);
    const date = (kicker.match(/[A-Z][a-z]{2} \d{1,2}, \d{4}/) || [""])[0];
    let desc = "";
    try { desc = meta(read(path.join(href, "index.html")), "description"); } catch (e) { /* card points outside this repo */ }
    stories.push({ type: "Story", topic, title: pick(body, /<h2>([\s\S]*?)<\/h2>/), sum: pick(body, /<p class="dek">([\s\S]*?)<\/p>/),
      kw: kicker.replace(date, "").replace(/[·\s]+$/, ""), body: desc, url: href, date, t: Date.parse(date) || 0 });
  }
}
stories.sort((a, b) => b.t - a.t).forEach((s) => { delete s.t; items.push(s); });

// Tall Takes (opinion columns), from the takes index cards (nba/takes/ since Nov 8, 2026).
const takes = read("nba/takes/index.html");
for (const m of takes.matchAll(/<a class="take-card" href="([^"]+)">([\s\S]*?)<\/a>/g)) {
  const [, href, body] = m;
  const kicker = pick(body, /<p class="kicker">([\s\S]*?)<\/p>/);
  const date = (kicker.match(/[A-Z][a-z]{2} \d{1,2}, \d{4}/) || [""])[0];
  let desc = "";
  try { desc = meta(read(path.join("nba/takes", href, "index.html")), "description"); } catch (e) { /* missing page: still index the card */ }
  items.push({ type: "Take", topic: "nba", title: pick(body, /<h2>([\s\S]*?)<\/h2>/), sum: pick(body, /<p class="dek">([\s\S]*?)<\/p>/),
    kw: "tall takes opinion column " + kicker.replace(date, ""), body: desc, url: "nba/takes/" + href, date });
}

// Dashboards, from the dashboards index.
const dashIndex = read("nba/dashboards/index.html");
for (const m of dashIndex.matchAll(/<a class="dash" href="([^"]+)">([\s\S]*?)<\/a>/g)) {
  const [, href, body] = m;
  items.push({ type: "Dashboard", topic: "nba", title: pick(body, /<h2>([\s\S]*?)<\/h2>/), sum: pick(body, /<p class="dek">([\s\S]*?)<\/p>/),
    kw: "dashboard daily " + pick(body, /<p class="kicker">([\s\S]*?)<\/p>/), body: "", url: "nba/dashboards/" + href, date: "" });
}

// Dashboards that live on another site (e.g. the Weather Almanac), from the dashboards hub.
const hub = read("dashboards/index.html");
for (const m of hub.matchAll(/<a class="hub-card" data-topic="([a-z-]+)" href="(https?:[^"]+)">([\s\S]*?)<\/a>/g)) {
  const [, topic, href, body] = m;
  items.push({ type: "Dashboard", topic, title: pick(body, /<h2>([\s\S]*?)<\/h2>/), sum: pick(body, /<p class="dek">([\s\S]*?)<\/p>/),
    kw: "dashboard daily " + pick(body, /<p class="kicker">([\s\S]*?)<\/p>/) + " " + pick(body, /<p class="meta">([\s\S]*?)<\/p>/), body: "", url: href, date: "" });
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

// Charts, explained: one entry per chart page, from the cards on the guide's hub.
if (fs.existsSync(path.join(ROOT, "explained/charts/index.html"))) {
  const ch = read("explained/charts/index.html");
  for (const m of ch.matchAll(/<a class="card keep-state" href="([a-z0-9-]+)\/">([\s\S]*?)<\/a>/g)) {
    const [, slug, body] = m;
    let desc = "";
    try { desc = meta(read(path.join("explained/charts", slug, "index.html")), "description"); } catch (e) { /* missing page: still index the card */ }
    items.push({ type: "Charts, explained", topic: "", title: pick(body, /<b>([\s\S]*?)<\/b>/), sum: pick(body, /<span>([\s\S]*?)<\/span>/),
      kw: "chart type when to use visualization graph " + slug.replace(/-/g, " "), body: desc, url: "explained/charts/" + slug + "/", date: "" });
  }
}

// Pages.
const page = (url, file, title, kw) => { const h = read(file); items.push({ type: "Page", topic: "", title, sum: meta(h, "description"), kw, body: "", url, date: "" }); };
page("nba/", "nba/index.html", "NBA", "nba basketball stories check the take focus stories latest");
page("weather/", "weather/index.html", "Weather", "weather almanac climate records cities stories");
page("stories/", "stories/index.html", "More stories", "politics travel other stories more");
page("nba/check-the-take/", "nba/check-the-take/index.html", "Check the Take", "check the take series claims tested verdict");
page("dashboards/", "dashboards/index.html", "Dashboards", "dashboards daily updated every day nba weather almanac");
page("nba/dashboards/", "nba/dashboards/index.html", "NBA dashboards", "dashboards daily updated every morning");
page("nba/takes/", "nba/takes/index.html", "Tall Takes", "takes opinion columns claude's read predictions");
page("nba/weird-stat/", "nba/weird-stat/index.html", "Weird stat of the day", "weird stat of the day daily strange rare oddity fluke legit on purpose last night box scores");
page("explained/", "explained/index.html", "Stats, explained", "glossary reference terms definitions math");
page("explained/charts/", "explained/charts/index.html", "Charts, explained: one dataset, every chart", "chart types which chart should I use visualization graph guide reference");
page("about/", "about/index.html", "About", "Tall Order Digital contact form privacy cookies hire");

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
