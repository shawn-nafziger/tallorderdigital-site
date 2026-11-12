# Tall Order Digital — SEO, AEO and GEO Plan

Started November 9, 2026. Owner: Shawn Nafziger.

**Master copy: `docs/seo-plan.md` in the `tallorderdigital-site` repo.** Project copies are for reference.

**The rules every page follows are in `docs/seo-standards.md`** (adopted Nov 10, 2026); this file holds the plan, decisions and open work.

**Terms.** SEO: ranking in Google and Bing results. AEO (answer engine optimization): being the direct answer in AI Overviews, featured snippets and voice answers. GEO (generative engine optimization): being cited by ChatGPT, Perplexity, Gemini, Claude and Copilot. All three reward the same base: pages crawlers can read, that state facts plainly, with clear authorship and dates, from a site other people link to and mention.

## Where things stand (audit, Nov 9, 2026)

**Already in place:** every page has a `<title>`, meta description, canonical link, Open Graph and Twitter share tags (with 1200×630 share images and alt text), `lang="en"`, one `<h1>`. `robots.txt` allows every crawler, including AI crawlers, and points to `sitemap.xml`, which `tools/sitemap.js` keeps current. Moved pages redirect with `noindex` and a canonical. Story text is plain HTML (about 900–1,900 words per story), each story has a visible byline, and the playbook's "lead with the answer" rule is already answer-first writing. GoatCounter and Cloudflare Web Analytics run on every page.

**Gaps found:**
1. Titles are headlines, not searches ("Role Call", "Ready Now", "The Shot Diet"). Nobody types them.
2. No structured data (schema.org JSON-LD) on any page. **Fixed Nov 9, 2026** (below).
3. Dates are visible but not machine-readable, and the sitemap had no `lastmod`. **Fixed Nov 9, 2026.**
4. Charts are drawn by JavaScript. Most AI crawlers don't run scripts, so they see the story text but not what a chart shows or its numbers.
5. No RSS feed.
6. Some meta descriptions run past ~160 characters and get cut off in results (Team Ratings 279, Game Overview 223, the Memphis take 215).
7. The Weather Almanac (then at weather.tallorderdigital.com, 327 city pages, built daily in the `weather-live` repo) was `noindex` (marked "Preview") with no canonical link, share tags or sitemap, and its section headings and sentences were drawn by JavaScript. It is probably the largest search opportunity on the site (people search "record high [city] today" every day). **Fixed Nov 9, 2026** (below).
8. Brand searches for "Tall Order" are crowded by TallOrder (a South African point-of-sale company) and others. Structured data with the LLC name helps search engines tell them apart.
9. Not yet confirmed: whether Google has indexed the site (it launched ~Nov 2–4). A web search for the domain returned nothing from it on Nov 9.

## Done: the Almanac goes into search (Nov 9, 2026)

In `weather-live/almanac/` (built and published by the daily run, so it takes effect on the next run after merging):
- `noindex` removed from both templates; the "Preview" labels on the Weather and Dashboards pages come off in the same change.
- Each city page has a canonical link, share tags (the home share image until cities get their own), and JSON-LD: `WebPage`, `Dataset` (the city's daily record, its years, its NOAA source and a link to the page's `data.json`), `Place` (city, state, coordinates) and breadcrumbs (Home › Weather › Weather Almanac › city). The front page is a `CollectionPage`.
- Titles name the state ("Chicago, IL Weather Almanac"); the front page says how many cities it covers.
- The section headings and sentences are written into the HTML as well as by the page script, so crawlers that don't run JavaScript read them.
- A sitemap with one entry per city and its data date.

## Decided: the Almanac moves into the main site (Nov 10, 2026)

The Almanac moves from `weather.tallorderdigital.com/almanac/` to **`tallorderdigital.com/weather/almanac/`**. Google says it has no preference between subdomains and folders, but it treats a subdomain as a separate site, and in practice a folder lets links and mentions build one domain. That matters most for a new site with little authority, and the Almanac is set to grow well past 327 pages and become the site's main search traffic. It was decided while the pages had been open to search engines for about a day, so nothing ranked yet and nothing was lost; a later move would mean redirecting thousands of ranked pages.

How: the Almanac is still built daily in `weather-live`, which pushes the pages to its `almanac-build` branch and asks this repo to republish. This repo's publish workflow copies them into `weather/almanac/`, so the Almanac is an ordinary folder of the site, on the same hosting and certificate as every other page (nothing sits in between, so readers can't see any new warnings or errors). The old `weather.tallorderdigital.com` addresses redirect permanently (301), page for page, through Cloudflare redirect rules on that subdomain only. The main domain's DNS and certificate don't change. The sitemap is `tallorderdigital.com/weather/almanac/sitemap.xml`, listed in `robots.txt`, so one Search Console property covers everything. Thousands of pages a day are no problem this way, because the daily pages never pile up in git history.

Checked before the move (Nov 10, 2026):
- **Fixed:** city pages were reachable only through scripts or the sitemap (the front page's map and table are drawn by JavaScript, and city pages linked only back up). Now the front page lists every place as plain links, by state, and each city links to its six nearest places.
- **Fixed:** a city whose checks failed on a given day used to drop out of that day's build. Once indexed, that would show search engines a page vanishing and coming back. Now it keeps its last good page, and a run that builds far fewer pages than the last one publishes nothing.
- **Fixed in the setup steps:** the old `weather.` name points at a Cloudflare placeholder instead of GitHub, and the domain is verified in GitHub, so no one else can claim it. The Cloudflare certificate is checked before the old name is proxied, so old links never show a certificate warning.
- **Known trade-off:** the site now publishes through one workflow. If the Almanac's build branch were missing, nothing would publish (dashboard commits included) until it's fixed; the live site stays as it was meanwhile. Each morning's dashboard commit also republishes with the newest Almanac, so the Almanac stays current even if the republish request ever fails.
- **Size:** about 180 KB per place. The Almanac tops out around 1,000 places (Shawn, Nov 10, 2026), about 180 MB, well inside GitHub Pages' 1 GB site limit, with room left for NBA pages.
- **Small things:** GoatCounter counts Almanac visits under `/weather/almanac/` from Nov 10, so its history splits on that day. The two weather stories link to the old address until their weather-intelligence templates are updated (the links redirect meanwhile).

Guard rail for growth: add Almanac pages only when they carry real, checked, city-specific data. Thousands of similar pages that Google judged thin could drag on the whole domain, which is the one real argument for a subdomain.

## Proposed: NBA pages that answer live questions (Nov 10, 2026)

AI tools answer evergreen NBA questions from memory. They need a live source for this-season questions: "What's the Pacers' net rating this season?", "Is [player] shooting better than last year?", "Who's the hottest three-point shooter over the last 10 games?", "What decided Pacers–Celtics last night?" The site already computes these answers every morning, but inside five dashboards where every team, player and game sits behind one address with a `#` (Team Profile `#IND`). Search engines ignore everything after the `#`, so 30 teams, about 460 players and every game add up to five pages in search.

The plan is an NBA reference built like the Almanac:
- **A page per team** (`nba/teams/<team>/`, 30) and **per rotation player** (`nba/players/<player>/`), rebuilt daily. Each leads with 3–5 plain, dated sentences chosen from the numbers and checked ("Through Nov 9, 2026, the Pacers' net rating is +4.1, 8th of 30 teams, over 11 games"), then the charts, a small data table in the HTML, structured data (`SportsTeam` / `Person`, `Dataset`) and a sitemap with dates. The dashboards stay as the place to explore and link to these pages.
- **A page per game** (`nba/games/<date>-<away>-<home>/`) from Game Overview: who won and what decided it, in sentences, kept permanently.
- **Same rules as the Almanac:** every sentence checked, honest samples ("over 11 games", totals not averages), and no page for a player without enough minutes to say something real.
- **Hosting:** the Almanac pattern: nba-analytics publishes the built pages to a branch and this repo's publish workflow adds them under `nba/`, so daily pages never pile up in git history.
- **First, check the NBA data source's terms** for republishing derived stats daily (an open item in `brand-decisions.md`).
- **Stories:** phrase Check the Take titles and section headings as the question people ask ("Are the Pacers really a top-10 defense?") and answer it in the first sentence.

## Done: structured data and sitemap dates (PR, Nov 9, 2026)

`node tools/structured-data.js` writes a JSON-LD block before `</head>` on every indexable page, between `<!-- seo:start -->` / `<!-- seo:end -->`:
- **Home:** `WebSite` and `Organization` (name Tall Order Digital, legal name Tall Order Digital LLC, logo).
- **Stories:** `Article` (Tall Takes: `OpinionNewsArticle`) with headline, summary, share image, `datePublished`/`dateModified`, author, publisher and a breadcrumb trail (Home › NBA › story), plus `article:published_time`.
- **Topic and site pages:** `CollectionPage` / `AboutPage` / `WebPage` with breadcrumbs; topic pages carry their newest card's date as `dateModified`.

Facts come from the page itself (h1, description, share image, canonical) and the date in its card kicker, so nothing is typed twice. Author is Shawn Nafziger where the byline says so, otherwise the site. `tools/sitemap.js` now writes `lastmod` from those dates, and leaves it off where there's no reliable date. Skipped: redirects, search, 404, the seaweed story (canonical on shawnnafziger.com) and the daily pages, whose morning publish would overwrite the block.

Re-run `node tools/structured-data.js` (before `tools/sitemap.js`) whenever a page is added, moved or retitled, or a story page is re-copied from a data repo. `--check` reports pages out of date.

## Keyword data so far (Ubersuggest, US monthly searches, Nov 10, 2026)

| Page | Title chosen | Searches it targets |
| --- | --- | --- |
| Chart guide hub (`explained/charts/`) | Types of Charts and When to Use Them | types of charts 6,600 · different types of charts 1,900 · types of charts and graphs 1,000 |
| Chart pages | "[Chart]: when to use it" (kept) | when to use a bar chart 880 |
| How much is a billion? | How Much Is a Billion? Dollars, Time and Things to Scale | how much is a billion 3,600 · ... dollars 2,400 · ... seconds 880 |
| How big is your state, really? | US State Size Comparison: Your State vs. Any Country | state size comparison 880 · us state size comparison 880 |

Opportunities spotted: "alaska state size comparison" gets 1,900 a month on its own, so a page per state (`numbers/state-vs-country-size/<state>/`) could each rank for its state. The chart pages draw their example charts with scripts; **done Nov 11, 2026:** each chart's takeaway, readout and data table are now written into the HTML (Indiana, the default state) by `misc-analytics/analysis/chart_guide/prerender.py`, and every guide page shows "Published Nov 11, 2026 · Data through 2025", which `tools/structured-data.js` now reads as the page's dates (the hub is a `CollectionPage`).

## Keyword strategy: long tail first

A new site can't rank for "NBA stats" or "weather records". It can rank for specific questions few sites answer with real data. Target phrases of 4+ words that match how people ask, and that the story actually answers:

| Story | Long-tail phrases to test (volumes not yet checked) |
|---|---|
| Role Call | which nba players roles changed this season; nba minutes usage early season predictive |
| The Shot Diet | nba three point attempt rate by team 2026; are nba teams shooting more threes |
| The Early-Season Mirage | is early season net rating predictive nba; how many games before nba net rating matters |
| Ready Now | nba rookies who contribute immediately by age; does draft age predict nba rookie success |
| The Injury Tax | how much do injuries cost nba teams wins; nba star injuries net rating impact |
| New Team, New Spots | nba shot chart new team 2026 |
| Every season starts fast | why is nba scoring high early season; nba pace and fouls start of season |
| Phoenix After Dark | phoenix nights not cooling off; phoenix overnight low temperature records |
| Record Lows Are Disappearing | are record low temperatures becoming rare; us cities record lows vs record highs |
| Fall's First Freeze Is Running Late | first freeze date later than normal 2026; first frost date trend by city |
| The later you fly | do later flights get delayed more; best time of day to fly to avoid delays |
| Weather Almanac (once indexed) | record high [city] today; [city] weather records by date; is today unusually warm in [city] |

**Volume data:** none connected yet. Options: Semrush, Ahrefs or Ubersuggest connectors (Ubersuggest is cheapest); Google Keyword Planner (free with a Google Ads account, no spend; shows ranges); Google Trends for direction; and Search Console's Performance report once impressions arrive, the best source of real long-tail queries for this site. Long-tail phrases often show "0–10" in tools yet still bring readers, so pick by match to the story first and volume second.

**Title rule (proposed, needs Shawn's OK):** keep the headline on the page (`<h1>`, og:title and share card stay as they are) and give `<title>` the searchable version, about 50–60 characters, finding first, site name last. For example:
- `Role Call: Which NBA Players' Roles Really Changed This Season` (vs "Role Call · Tall Order Digital")
- `Do Later Flights Get Delayed More? 2026 US Airline Data`

Titles live in the story templates in the data repos, so the change is made there and re-copied.

## Checklist

**Shawn (accounts and decisions)**
- [x] Merge PR #87 (structured data, sitemap dates, this plan)
- [x] Merge the Almanac pair together: weather-live (search-ready pages) and this repo (Preview labels off)
- [x] Almanac move (Nov 10, 2026): deploy token added (expires Nov 1, 2027; reminder scheduled Oct 18, 2027), both PRs merged, this repo publishes through GitHub Actions, Cloudflare 301s from `weather.` (checked in a browser: city pages and the front page land on the new address with the query string kept), weather-live's own Pages unpublished, and `tallorderdigital.com` verified in GitHub's account settings
- [x] Google Search Console: add a **Domain property** for `tallorderdigital.com` (verified with a DNS TXT record). It covers the whole site, including the Almanac at `weather/almanac/` and the old `weather.` addresses while they redirect.
- [x] Search Console: submit `https://tallorderdigital.com/sitemap.xml` and `https://tallorderdigital.com/weather/almanac/sitemap.xml` (no separate weather property needed since the move; to see the Almanac on its own, filter Pages by `/weather/almanac/`)
- [x] Search Console: URL Inspection → Request indexing for the Almanac front page and the Weather page (Nov 10, 2026); later, each new story as it's published
- [x] Bing Webmaster Tools: import the site from Search Console (one click; Bing feeds ChatGPT search and Copilot)
- [ ] Rich Results Test on one story URL after the merge
- [x] Keyword tool: Ubersuggest account, unlimited access for 7 days from Nov 10, 2026 (through about Nov 17)
- [x] Connect the Ubersuggest connector in claude.ai, so Claude can pull volumes and AI visibility directly during the trial (connected Nov 10, 2026)
- [x] Approve the title rule (searchable `<title>`, headline unchanged on the page): approved Nov 10, 2026
- [ ] Decide: author data links to shawnnafziger.com (`sameAs`), yes or no
- [x] Decide: when the Almanac comes out of preview (Nov 9, 2026: now)
- [x] Decide: Almanac as a folder, not a subdomain (Nov 10, 2026)
- [ ] Decide: go ahead with NBA team, player and game pages (after checking the data terms)
- [ ] Decide: a formal license for the data and charts (CC BY 4.0 says what the footer already says). Google Dataset Search flags datasets without one; the Almanac's structured data leaves it out until you decide

**Claude (PRs)**
- [x] Structured data and sitemap `lastmod` on the main site (PR #87)
- [ ] Titles: check volumes, rewrite `<title>` in the data-repo story templates, re-copy
- [ ] Static chart summaries and data tables in the story templates
- [ ] Structured data in the daily dashboard and weird-stat templates (nba-analytics)
- [x] IndexNow pings after every publish (Nov 10, 2026): changed site pages and Almanac cities go to Bing and the other IndexNow engines right away
- [ ] RSS feed
- [ ] Shorten meta descriptions over ~160 characters
- [x] Almanac (weather-live): `noindex` off; canonical links, share tags, per-city structured data (WebPage, Dataset, Place, breadcrumbs), static headings and sentences, robots.txt and a city sitemap
- [x] Almanac move: new address in `build.py` and the branch handoff (weather-live); the publish workflow, links and `robots.txt` here
- [ ] Weather stories (weather-intelligence templates): point their Almanac links at the new address (they redirect until then)
- [ ] NBA team, player and game pages (once approved)
- [ ] Almanac: a share image per city, and city titles from the keyword check ("record high [city] today" and similar)
- [ ] llms.txt (optional)

**Every month**
- [ ] Search Console queries and pages; GoatCounter AI referrers; ask ChatGPT, Perplexity and Google a few target questions

## Next steps, in order

1. **Search Console and Bing Webmaster Tools.** Confirm both are verified, the sitemap is submitted and pages are indexed. Bing also feeds ChatGPT search and Copilot. Use URL Inspection → Request indexing on the newest stories.
2. **Keyword check and title PR.** Get volumes for the phrases above, settle the title rule, update titles in the data-repo templates.
3. **Static chart summaries (data repos).** Each chart gets its finding as a sentence and its key numbers as a small HTML table that's in the page without JavaScript (the playbook's "every chart has a table view", built server-side). This is the single biggest GEO fix: it gives AI tools the data, not just the prose.
4. **Daily pages.** Add the structured-data block to the dashboard and weird-stat templates in `nba-analytics` (Dataset or WebPage with a daily `dateModified`), so they carry it after each morning publish.
5. **RSS feed** (`feed.xml`) built from the hub cards; link it in each page's `<head>`.
6. **Weather Almanac.** Done Nov 9, 2026: off `noindex`, with per-city structured data, a city sitemap and the section text in plain HTML. Still to do: a share image per city, and titles tuned by the keyword check.
7. **Shorten meta descriptions** over ~160 characters (data-repo templates for the dashboards).
8. **Author page.** Decide whether the structured data's author links to shawnnafziger.com (`sameAs`). It strengthens authorship signals but the About page deliberately leaves Shawn's name off; the byline already names him. Shawn to decide.
9. **llms.txt** (optional, low evidence of effect, five minutes to write): a plain list of the site's main pages and what each covers.

## Done: internal links to the chart guide (PR, Nov 12, 2026)

The chart guide had almost no links pointing at it (only from Stats, explained), so search engines and readers rarely reached it. Added: a feature card at the top of More stories, a line on the home page, and 18 "How to read a <chart> →" links under charts in 14 stories (`tools/apply-chart-howto.py`), each pointing at the matching chart-type page. Still to do: the guide's own "Where we've used it" lists (in `misc-analytics`) can link back to these stories, and a menu entry waits on a menu decision (`brand-decisions.md` → Open items).

## GEO and AEO habits for every new story

- Put the finding in the first two sentences, with its number and sample (as the og:image alt on Role Call does: after 4 games, minutes and usage predict the rest of a season; shooting percentages don't).
- Phrase section headings as the questions people ask; answer each in the first sentence under it.
- Name things fully the first time (Luka Dončić, not Luka; net rating with a link to Stats, explained).
- State dates plainly: published date and "data through" date.
- Cite the data source by name; link primary sources.

## Off-site: earned mentions

AI search leans heavily on what other sites say about you, more than on your own pages. The site's "share with credit and a link" policy fits this.
- Post the best chart from each story where data people gather: r/dataisbeautiful (OC rules), r/nba and team subreddits (chart-first, no spam), weather and climate communities.
- Pitch standout weather findings to local TV meteorologists and newspapers in the cities covered; they cite sources.
- Link to the site from shawnnafziger.com, LinkedIn and the Buttondown archive.
- Submit to data-viz roundups and newsletters.

## Measuring it

- **Search Console:** impressions, clicks and the queries behind them, per page.
- **GoatCounter referrers:** watch for chatgpt.com, perplexity.ai, gemini.google.com, copilot.microsoft.com and bing.com.
- **Monthly spot check:** ask ChatGPT, Perplexity and Google a handful of the target questions and note whether the site is cited.
