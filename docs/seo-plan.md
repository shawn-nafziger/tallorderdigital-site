# Tall Order Digital — SEO, AEO and GEO Plan

Started November 9, 2026. Owner: Shawn Nafziger.

**Master copy: `docs/seo-plan.md` in the `tallorderdigital-site` repo.** Project copies are for reference.

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
7. The Weather Almanac (weather.tallorderdigital.com, 327 city pages, built daily in the `weather-live` repo) was `noindex` (marked "Preview") with no canonical link, share tags or sitemap, and its section headings and sentences were drawn by JavaScript. It is probably the largest search opportunity on the site (people search "record high [city] today" every day). **Fixed Nov 9, 2026** (below).
8. Brand searches for "Tall Order" are crowded by TallOrder (a South African point-of-sale company) and others. Structured data with the LLC name helps search engines tell them apart.
9. Not yet confirmed: whether Google has indexed the site (it launched ~Nov 2–4). A web search for the domain returned nothing from it on Nov 9.

## Done: the Almanac goes into search (Nov 9, 2026)

In `weather-live/almanac/` (built and published by the daily run, so it takes effect on the next run after merging):
- `noindex` removed from both templates; the "Preview" labels on the Weather and Dashboards pages come off in the same change.
- Each city page has a canonical link, share tags (the home share image until cities get their own), and JSON-LD: `WebPage`, `Dataset` (the city's daily record, its years, its NOAA source and a link to the page's `data.json`), `Place` (city, state, coordinates) and breadcrumbs (Home › Weather › Weather Almanac › city). The front page is a `CollectionPage`.
- Titles name the state ("Chicago, IL Weather Almanac"); the front page says how many cities it covers.
- The section headings and sentences are written into the HTML as well as by the page script, so crawlers that don't run JavaScript read them.
- `robots.txt` and `sitemap.xml` at the root of weather.tallorderdigital.com, one entry per city with its data date.

## Done: structured data and sitemap dates (PR, Nov 9, 2026)

`node tools/structured-data.js` writes a JSON-LD block before `</head>` on every indexable page, between `<!-- seo:start -->` / `<!-- seo:end -->`:
- **Home:** `WebSite` and `Organization` (name Tall Order Digital, legal name Tall Order Digital LLC, logo).
- **Stories:** `Article` (Tall Takes: `OpinionNewsArticle`) with headline, summary, share image, `datePublished`/`dateModified`, author, publisher and a breadcrumb trail (Home › NBA › story), plus `article:published_time`.
- **Topic and site pages:** `CollectionPage` / `AboutPage` / `WebPage` with breadcrumbs; topic pages carry their newest card's date as `dateModified`.

Facts come from the page itself (h1, description, share image, canonical) and the date in its card kicker, so nothing is typed twice. Author is Shawn Nafziger where the byline says so, otherwise the site. `tools/sitemap.js` now writes `lastmod` from those dates, and leaves it off where there's no reliable date. Skipped: redirects, search, 404, the seaweed story (canonical on shawnnafziger.com) and the daily pages, whose morning publish would overwrite the block.

Re-run `node tools/structured-data.js` (before `tools/sitemap.js`) whenever a page is added, moved or retitled, or a story page is re-copied from a data repo. `--check` reports pages out of date.

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
- [ ] Merge the Almanac pair together: weather-live (search-ready pages) and this repo (Preview labels off)
- [ ] Google Search Console: add a **Domain property** for `tallorderdigital.com` (verified with a DNS TXT record). One Domain property covers the main site and `weather.tallorderdigital.com`. A URL-prefix property for `https://tallorderdigital.com/` does not cover the subdomain.
- [ ] Search Console: submit `https://tallorderdigital.com/sitemap.xml` and, once the Almanac PRs are merged and the next daily run has published, `https://weather.tallorderdigital.com/sitemap.xml`
- [ ] Search Console: URL Inspection → Request indexing for the home page and the 3–5 newest stories
- [ ] Bing Webmaster Tools: import the site from Search Console (one click; Bing feeds ChatGPT search and Copilot)
- [ ] Rich Results Test on one story URL after the merge
- [ ] Keyword volumes: connect Ubersuggest, Semrush or Ahrefs, or open Google Keyword Planner
- [ ] Approve the title rule (searchable `<title>`, headline unchanged on the page)
- [ ] Decide: author data links to shawnnafziger.com (`sameAs`), yes or no
- [x] Decide: when the Almanac comes out of preview (Nov 9, 2026: now)

**Claude (PRs)**
- [x] Structured data and sitemap `lastmod` on the main site (PR #87)
- [ ] Titles: check volumes, rewrite `<title>` in the data-repo story templates, re-copy
- [ ] Static chart summaries and data tables in the story templates
- [ ] Structured data in the daily dashboard and weird-stat templates (nba-analytics)
- [ ] RSS feed
- [ ] Shorten meta descriptions over ~160 characters
- [x] Almanac (weather-live): `noindex` off; canonical links, share tags, per-city structured data (WebPage, Dataset, Place, breadcrumbs), static headings and sentences, robots.txt and a city sitemap
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
