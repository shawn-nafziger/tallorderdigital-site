/*
 * Topic pages and home doors (Nov 8, 2026; replaces tools/sort-home.js). Claude runs this; Shawn doesn't need to.
 *
 *   node tools/build-hubs.js           (rewrite the generated parts)
 *   node tools/build-hubs.js --check   (exit 1 if anything is out of date; changes nothing)
 *
 * Where story cards live (the one place each card is written by hand):
 *   nba/index.html      NBA stories      <a class="story" data-topic="nba" data-series="..." href="<slug>/">
 *   weather/index.html  weather stories  <a class="story" data-topic="weather" data-series="..." href="<slug>/">
 *   stories/index.html  More stories     <a class="story" data-topic="politics" href="../politics/...">
 * Cards go between the "cards:start" / "cards:end" markers, anywhere in the list: this tool sorts them newest
 * first by the date in each card's kicker ("Check the Take · NBA · Nov 7, 2026"; every card needs one).
 *
 * What it writes (between markers; don't edit these by hand):
 *   - "Browse by series" on nba/ and weather/ (only when 2 or more series have pieces): one small card per series
 *     (name, what it is, a link to all of it). It lists no stories, so nothing repeats the Latest list (Nov 8, 2026).
 *   - nba/check-the-take/: every Check the Take card
 *   - nba/: the Latest Tall Take box (the first card on nba/takes/index.html) and the NBA dashboards list
 *     (from the cards on nba/dashboards/index.html)
 *   - index.html: the three doors (NBA, Weather, More stories), three pieces each, all the same size. The NBA door
 *     shows its two daily pages (game summaries, the weird stat) and the newest focus story; Tall Takes and Check the
 *     Take stay on the NBA page (Nov 8, 2026; "extra" and "homeSeries" in PAGES).
 * A new series: add it to SERIES below and a button to that page's filter. A new topic page: add it to PAGES.
 * Then run node tools/search-index.js and node tools/sitemap.js.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CHECK = process.argv.includes("--check");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

// Series on each topic page, in the order their sections appear. "page" = a series page under the topic folder.
// "one" = the name of a single piece; each card's kicker is rewritten as "<one> · <date>" (Nov 8, 2026), so every
// card names its series the same way. Anything after the date in a hand-written kicker is dropped.
const SERIES = {
  nba: [
    { key: "check-the-take", name: "Check the Take", one: "Check the Take", dek: "A popular claim about a player or team, tested against the data.", page: "check-the-take/" },
    { key: "focus", name: "Focus stories", one: "Focus story", dek: "A longer look at one question, chart by chart." },
  ],
  weather: [
    { key: "month-in-review", name: "Month in review", one: "Month in review", dek: "How last month ranked against every year on record." },
    { key: "record-watch", name: "Record watch", one: "Record watch", dek: "A record broken, or a streak still running." },
    { key: "focus", name: "Focus stories", one: "Focus story", dek: "A longer look at one weather question." },
  ],
};
// How many pieces each topic page's Latest list shows before "Show all" (assets/topic-filter.js reads data-limit).
const LIMIT = 5;
const PAGES = [
  { key: "nba", file: "nba/index.html", dir: "nba/", name: "NBA", dek: "Stories, popular takes checked against the data, opinion columns and dashboards that update every morning.",
    homeSeries: ["focus"],
    // Daily pages lead the NBA door, game summaries first (Nov 8, 2026): they're what brings readers back every morning.
    extra: [
      { k: "Game summaries · Every morning", t: "Last night's games, and what decided each one", href: "nba/dashboards/game-overview/" },
      { k: "Weird stat of the day · New every morning", t: "The strangest thing in last night's box scores", href: "nba/weird-stat/" },
    ] },
  { key: "weather", file: "weather/index.html", dir: "weather/", name: "Weather", dek: "Each city's weather against its own official record, and how the climate has changed.",
    extra: { k: "Weather Almanac · Updated daily", t: "Your city, against its own record", href: "https://tallorderdigital.com/weather/almanac/" } },
  { key: "stories", file: "stories/index.html", dir: "stories/", name: "More stories", dek: "Politics, travel and everything else with data too good to pass up." },
];
const TOPIC_NAMES = { politics: "Politics", travel: "Travel" };

const CARD = /<a class="story"[^>]*>[\s\S]*?<\/a>(?=\s*(?:<a class="story"|<!-- cards:end -->))/g;
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const between = (html, name) => {
  const re = new RegExp(`(<!-- ${esc(name)}:start -->)[\\s\\S]*?(<!-- ${esc(name)}:end -->)`);
  if (!re.test(html)) throw new Error(`missing <!-- ${name}:start --> / <!-- ${name}:end --> markers`);
  return re;
};
const fill = (html, name, body, indent = "  ") => html.replace(between(html, name), (_, a, b) => `${a}\n${body ? body + "\n" : ""}${indent}${b}`);
const text = (s) => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

function parseCards(page) {
  const html = read(page.file);
  const region = html.match(between(html, "cards"))[0];
  const cards = [...region.matchAll(CARD)].map((m, i) => {
    const h = m[0];
    const attr = (n) => (h.match(new RegExp(`^<a class="story"[^>]*\\s${n}="([^"]*)"`)) || [])[1];
    const kicker = text((h.match(/<p class="kicker">([\s\S]*?)<\/p>/) || [])[1] || "");
    const d = kicker.match(/([A-Z][a-z]{2}) (\d{1,2}), (\d{4})/);
    const card = { html: h, i, topic: attr("data-topic"), series: attr("data-series"), href: attr("href"),
      title: text((h.match(/<h2>([\s\S]*?)<\/h2>/) || [])[1] || ""), kicker };
    if (!d) throw new Error(`${page.file}: no date in the kicker of the card for ${card.href}`);
    card.date = d[0];
    card.t = Date.parse(`${d[1]} ${d[2]}, ${d[3]}`);
    if (SERIES[page.key]) {
      if (card.topic !== page.key) throw new Error(`${page.file}: card ${card.href} has data-topic="${card.topic}"`);
      const s = SERIES[page.key].find((x) => x.key === card.series);
      if (!s) throw new Error(`${page.file}: card ${card.href} needs a data-series from: ${SERIES[page.key].map((x) => x.key).join(", ")}`);
      card.html = card.html.replace(/<p class="kicker">[\s\S]*?<\/p>/, `<p class="kicker">${s.one} · ${card.date || d[0]}</p>`);
    } else if (card.topic === "nba" || card.topic === "weather") {
      throw new Error(`${page.file}: ${card.topic} stories belong on ${card.topic}/, not More stories (${card.href})`);
    }
    return card;
  });
  cards.sort((a, b) => b.t - a.t || a.i - b.i);
  return { html, cards };
}

const mini = (items, indent) => `${indent}<ul class="mini">\n` +
  items.map((x) => `${indent}  <li><a href="${x.href}"><span class="k">${x.k}</span><span class="t">${x.t}</span></a></li>`).join("\n") +
  `\n${indent}</ul>`;

const out = {}; // file -> new content
const get = (f) => (f in out ? out[f] : read(f));
const lists = {};

for (const page of PAGES) {
  const { html, cards } = parseCards(page);
  lists[page.key] = cards;
  let h = fill(html, "cards", cards.map((c) => "    " + c.html).join("\n"), "    ");

  // Browse by series: only worth showing once two or more series have pieces. No story lists here: the Latest list
  // above already shows them, and its filter buttons pick a series (Nov 8, 2026).
  if (SERIES[page.key]) {
    const present = SERIES[page.key].filter((s) => cards.some((c) => c.series === s.key));
    let body = "";
    if (present.length >= 2) {
      body = `  <section aria-labelledby="series-h">\n    <div class="section-head"><p class="kicker" id="series-h">Browse by series</p></div>\n    <div class="series-grid">\n` +
        present.map((s) => {
          const mine = cards.filter((c) => c.series === s.key);
          const all = s.page ? s.page : `?series=${s.key}#latest`;
          return `      <a class="series" href="${all}">\n        <h3>${s.name}</h3>\n        <p class="dek">${s.dek}</p>\n` +
            `        <span class="more-link">All ${mine.length} →</span>\n      </a>`;
        }).join("\n") + `\n    </div>\n  </section>`;
    }
    h = fill(h, "series", body);
  }
  out[page.file] = h;
}

// Check the Take series page: every Check the Take card, links one folder up.
{
  const f = "nba/check-the-take/index.html";
  const cards = lists.nba.filter((c) => c.series === "check-the-take")
    .map((c) => "    " + c.html.replace(`href="${c.href}"`, `href="../${c.href}"`));
  out[f] = fill(get(f), "series-cards", cards.join("\n"), "    ");
}

// NBA page: Latest Tall Take box and the dashboards list.
{
  const f = "nba/index.html";
  const takes = read("nba/takes/index.html");
  const tk = takes.match(/<a class="take-card" href="([^"]+)">([\s\S]*?)<\/a>/);
  if (!tk) throw new Error("nba/takes/index.html: no take cards");
  const tDate = (text(tk[2].match(/<p class="kicker">([\s\S]*?)<\/p>/)[1]).match(/[A-Z][a-z]{2} \d{1,2}, \d{4}/) || [""])[0];
  const tTitle = text(tk[2].match(/<h2>([\s\S]*?)<\/h2>/)[1]);
  const tDek = text((tk[2].match(/<p class="dek">([\s\S]*?)<\/p>/) || [])[1] || "");
  // The two boxes sit side by side near the top of the page (Nov 8, 2026), so neither is buried under the story list.
  const take = `    <aside class="box" aria-labelledby="lt-h">\n      <p class="kicker" id="lt-h">Latest Tall Take · ${tDate}</p>\n` +
    `      <a class="box-title" href="takes/${tk[1]}">${tTitle}</a>\n` + (tDek ? `      <p class="dek">${tDek}</p>\n` : "") +
    `      <a class="more-link" href="takes/">All Tall Takes →</a>\n    </aside>`;
  let h = fill(get(f), "take", take, "    ");

  const dash = read("nba/dashboards/index.html");
  const items = [...dash.matchAll(/<a class="dash" href="([^"]+)">([\s\S]*?)<\/a>/g)].map((m) => ({
    href: "dashboards/" + m[1], k: text(m[2].match(/<p class="kicker">([\s\S]*?)<\/p>/)[1]).split(" · ")[0], t: text(m[2].match(/<h2>([\s\S]*?)<\/h2>/)[1]) }));
  if (!items.length) throw new Error("nba/dashboards/index.html: no dashboard cards");
  const body = `    <aside class="box" aria-labelledby="dash-h">\n      <p class="kicker" id="dash-h">Dashboards · updated every morning</p>\n` +
    mini(items, "      ").replace('<ul class="mini">', '<ul class="mini tight">') + `\n      <a class="more-link" href="dashboards/">All NBA dashboards →</a>\n    </aside>`;
  out[f] = fill(h, "dashboards", body, "    ");
}

// Home: one door per topic page, newest three pieces each.
{
  const f = "index.html";
  const doors = PAGES.map((p) => {
    const series = Object.fromEntries((SERIES[p.key] || []).map((s) => [s.key, s.one]));
    // Three pieces per door, counting its daily pages (game summaries, weird stat, Almanac), so the doors stay even. homeSeries limits a
    // door to the series that draw new readers (NBA: focus stories, not Check the Take; Nov 8, 2026).
    const pool = p.homeSeries ? lists[p.key].filter((c) => p.homeSeries.includes(c.series)) : lists[p.key];
    const extras = [].concat(p.extra || []);
    const items = pool.slice(0, 3 - extras.length).map((c) => ({
      href: p.key === "stories" ? c.href.replace(/^\.\.\//, "") : p.dir + c.href,
      k: `${series[c.series] || TOPIC_NAMES[c.topic] || c.topic} · ${c.date}`, t: c.title }));
    items.unshift(...extras);
    return `    <div class="door">\n      <h2><a href="${p.dir}">${p.name}</a></h2>\n      <p class="dek">${p.dek}</p>\n` +
      mini(items, "      ") + `\n      <a class="more-link" href="${p.dir}">All ${p.name === "More stories" ? "more stories" : p.name} →</a>\n    </div>`;
  }).join("\n");
  out[f] = fill(get(f), "doors", doors, "    ");
}

let stale = 0;
for (const [f, s] of Object.entries(out)) {
  if (s === read(f)) continue;
  stale++;
  if (CHECK) console.log("out of date:", f);
  else { fs.writeFileSync(path.join(ROOT, f), s); console.log("updated:", f); }
}
for (const p of PAGES) console.log(`${p.file}: ${lists[p.key].length} cards, newest ${lists[p.key][0] ? lists[p.key][0].date : "-"}`);
if (CHECK && stale) { console.log("run node tools/build-hubs.js"); process.exit(1); }
if (!stale) console.log("everything up to date");
