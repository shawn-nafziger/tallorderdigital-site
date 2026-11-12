/*
 * Structured data for search engines and AI answer tools (Nov 9, 2026). Claude runs this; Shawn doesn't need to.
 *
 *   node tools/structured-data.js           (write the block on every page)
 *   node tools/structured-data.js --check   (exit 1 if any page is out of date; changes nothing)
 *
 * Writes one block just before </head>, between <!-- seo:start --> / <!-- seo:end --> markers (don't edit it by
 * hand). The block is a JSON-LD script describing the page in schema.org terms (what Google, Bing and AI search
 * tools read to know what a page is, who wrote it and when), plus article:published_time for stories.
 *
 *   home page          WebSite + Organization (Tall Order Digital, Tall Order Digital LLC)
 *   stories, takes     Article (Tall Takes: OpinionNewsArticle) with headline, summary, share image, dates and
 *                      author, plus a breadcrumb trail (Home > NBA > story)
 *   topic and other    CollectionPage / AboutPage / WebPage plus the breadcrumb trail
 *   site pages
 *
 * Where the facts come from, so nothing here is typed twice:
 *   - headline: the page's <h1>; summary: its meta description; image: its og:image; address: its canonical link
 *   - published date: the date in the story's card kicker on its topic page (nba/, weather/, stories/, nba/takes/),
 *     the same date readers see. A topic page's dateModified is its newest card's date.
 *   - pages with no card (the chart guide, explained/charts/, Nov 11, 2026): the date shown under the intro,
 *     <p class="meta">Published <time datetime="YYYY-MM-DD">…</time>, as datePublished and dateModified
 *   - author: Shawn Nafziger when the page's byline says "By Shawn Nafziger"; otherwise the site itself
 *
 * Skipped: redirect pages (noindex), search/, the 404 page, pages whose canonical points to another site (the
 * seaweed story), and the daily pages Shawn commits straight to main (nba/dashboards/<name>/, nba/weird-stat/):
 * their next morning's publish would overwrite the block, so those get it from their nba-analytics templates instead.
 *
 * Re-run in the same PR as any new, moved or retitled page (after build-hubs.js, before sitemap.js, which reads
 * the dates written here). Story pages copied in from a data repo lose the block until this runs again.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SITE = "https://tallorderdigital.com/";
const CHECK = process.argv.includes("--check");
const SKIP_DIRS = new Set([".git", "assets", "docs", "tools", "search"]);
const DAILY = /^nba\/(dashboards\/[^/]+\/|weird-stat\/)$/;

const ORG_ID = SITE + "#organization";
const SITE_ID = SITE + "#website";
const PERSON_ID = SITE + "#shawn-nafziger";
const ORG = {
  "@type": "Organization", "@id": ORG_ID, name: "Tall Order Digital", legalName: "Tall Order Digital LLC", url: SITE,
  logo: { "@type": "ImageObject", url: SITE + "assets/brand/tod-app-icon-512.png", width: 512, height: 512 },
};
const PERSON = { "@type": "Person", "@id": PERSON_ID, name: "Shawn Nafziger" };

// Topic pages whose story cards carry the published dates, and what each one is called in a breadcrumb.
const HUBS = {
  "nba/": "NBA", "weather/": "Weather", "stories/": "More stories", "nba/takes/": "Tall Takes",
};
// Pages that sit under "More stories" rather than under a folder with its own topic page.
const UNDER_STORIES = /^(politics|travel|numbers)\//;
// Breadcrumb names for site pages that aren't topic pages.
const NAMES = {
  "about/": "About", "subscribe/": "The weekly email", "explained/": "Stats, explained", "dashboards/": "Dashboards",
  "nba/dashboards/": "NBA dashboards", "nba/check-the-take/": "Check the Take", "explained/charts/": "Types of charts",
};

const MONTHS = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
const iso = (mon, day, year) => `${year}-${String(MONTHS[mon]).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
const text = (s) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#39;|&rsquo;/g, "’").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
const meta = (html, re) => { const m = html.match(re); return m ? m[1].replace(/&amp;/g, "&").replace(/&quot;/g, '"') : undefined; };

function pages(dir, rel = "") {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory() || SKIP_DIRS.has(e.name)) continue;
    out.push(...pages(path.join(dir, e.name), rel + e.name + "/"));
  }
  const file = path.join(dir, "index.html");
  if (fs.existsSync(file)) out.push({ rel, file, html: fs.readFileSync(file, "utf8") });
  return out;
}

// Card dates: every <a ... href="..."> card on a topic page whose kicker holds "Mon D, YYYY".
const published = {};       // page rel -> ISO date
const newest = { "": "" };  // hub rel -> newest card date ("" = home: newest anywhere)
for (const hub of Object.keys(HUBS)) {
  const html = fs.readFileSync(path.join(ROOT, hub, "index.html"), "utf8");
  for (const m of html.matchAll(/<a class="(?:story|take-card)[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
    const k = m[2].match(/<p class="kicker">([\s\S]*?)<\/p>/);
    const d = k && text(k[1]).match(/([A-Z][a-z]{2}) (\d{1,2}), (\d{4})/);
    if (!d || /^https?:/.test(m[1])) continue;
    const rel = path.posix.normalize(hub + m[1]).replace(/\/?$/, "/");
    const date = iso(d[1], d[2], d[3]);
    published[rel] = date;
    if (!newest[hub] || date > newest[hub]) newest[hub] = date;
    if (date > newest[""]) newest[""] = date;
  }
}

function crumbs(rel, title) {
  const trail = [["Home", SITE]];
  const parts = rel.split("/").filter(Boolean);
  if (UNDER_STORIES.test(rel)) {
    trail.push([HUBS["stories/"], SITE + "stories/"]);
    // Politics sub-pages hang under their main story (politics/midterms-2026/ > districts/).
    for (let i = 2; i < parts.length; i++) {
      const up = parts.slice(0, i).join("/") + "/";
      const f = path.join(ROOT, up, "index.html");
      if (fs.existsSync(f)) trail.push([text((fs.readFileSync(f, "utf8").match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || up), SITE + up]);
    }
  } else {
    for (let i = 1; i < parts.length; i++) {
      const up = parts.slice(0, i).join("/") + "/";
      if (HUBS[up] || NAMES[up]) trail.push([HUBS[up] || NAMES[up], SITE + up]);
    }
  }
  trail.push([title, SITE + rel]);
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map(([name, item], i) => ({ "@type": "ListItem", position: i + 1, name, item })),
  };
}

function graph(p, url) {
  const { rel, html } = p;
  const h1 = text((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || "");
  const ogTitle = meta(html, /<meta property="og:title" content="([^"]*)"/);
  const title = h1 || ogTitle || text((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "");
  const description = meta(html, /<meta name="description" content="([^"]*)"/);
  const image = meta(html, /<meta property="og:image" content="([^"]*)"/);
  const byShawn = /By Shawn Nafziger/.test(html);
  const base = { "@id": url + "#webpage", url, name: title, description, inLanguage: "en-US", isPartOf: { "@id": SITE_ID } };

  if (rel === "") {
    return [
      { "@type": "WebSite", "@id": SITE_ID, url: SITE, name: "Tall Order Digital", description, inLanguage: "en-US", publisher: { "@id": ORG_ID } },
      ORG,
      { "@type": "WebPage", ...base, about: { "@id": ORG_ID }, ...(newest[""] && { dateModified: newest[""] }) },
    ];
  }
  const date = published[rel];
  if (date) {
    const article = {
      "@type": rel.startsWith("nba/takes/") ? "OpinionNewsArticle" : "Article",
      "@id": url + "#article",
      headline: title.slice(0, 110),
      description,
      ...(image && { image: [image] }),
      datePublished: date,
      dateModified: date,
      author: byShawn ? { "@id": PERSON_ID } : { "@id": ORG_ID },
      publisher: { "@id": ORG_ID },
      copyrightHolder: { "@id": ORG_ID },
      isAccessibleForFree: true,
      inLanguage: "en-US",
      mainEntityOfPage: { "@id": url + "#webpage" },
    };
    return [
      article,
      { "@type": "WebPage", ...base, breadcrumb: { "@id": url + "#breadcrumb" } },
      { ...crumbs(rel, title), "@id": url + "#breadcrumb" },
      ORG,
      ...(byShawn ? [PERSON] : []),
    ];
  }
  const type = rel === "about/" ? "AboutPage" : HUBS[rel] || /dashboards\/$|check-the-take\/$|^explained\/charts\/$/.test(rel) ? "CollectionPage" : "WebPage";
  // A page with no story card can state its own date under the intro (the chart guide): <p class="meta">Published <time datetime>.
  const shown = (html.match(/<p class="meta">Published <time datetime="(\d{4}-\d{2}-\d{2})">/) || [])[1];
  const page = { "@type": type, ...base, breadcrumb: { "@id": url + "#breadcrumb" },
    ...(shown && { datePublished: shown, dateModified: shown, ...(image && { image: [image] }), publisher: { "@id": ORG_ID } }),
    ...(newest[rel] && { dateModified: newest[rel] }) };
  return [page, { ...crumbs(rel, NAMES[rel] || HUBS[rel] || title), "@id": url + "#breadcrumb" }];
}

let stale = 0, written = 0;
for (const p of pages(ROOT)) {
  if (/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(p.html) || DAILY.test(p.rel)) continue;
  const url = (p.html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) || [])[1] || SITE + p.rel;
  if (!url.startsWith(SITE)) { console.log(`skipped ${p.rel}: canonical is ${url}`); continue; }

  const g = graph(p, url);
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": g })
    .replace(/<\//g, "<\\/"); // never let a "</" inside the data close the script tag
  const date = published[p.rel];
  const block = [
    "<!-- seo:start -->",
    ...(date ? [`<meta property="article:published_time" content="${date}">`] : []),
    `<script type="application/ld+json">\n${json}\n</script>`,
    "<!-- seo:end -->",
  ].join("\n");

  const has = /<!-- seo:start -->[\s\S]*?<!-- seo:end -->/;
  const next = has.test(p.html) ? p.html.replace(has, () => block) : p.html.replace(/<\/head>/i, () => block + "\n</head>");
  if (next === p.html) continue;
  stale++;
  if (CHECK) { console.log(`out of date: ${p.rel || "(home)"}`); continue; }
  fs.writeFileSync(p.file, next);
  written++;
  console.log(`${date ? "article " + date : "page"}  ${p.rel || "(home)"}`);
}
if (CHECK) { console.log(stale ? `${stale} page(s) out of date` : "structured data is current"); process.exit(stale ? 1 : 0); }
console.log(`structured data written on ${written} page(s)`);
