# Tall Order Digital — SEO Standards

Adopted November 10, 2026. Owner: Shawn Nafziger.

**Master copy: `docs/seo-standards.md` in the `tallorderdigital-site` repo.** Every repo that builds pages for tallorderdigital.com (nba-analytics, weather-intelligence, weather-live, politics-analytics, travel-analytics) points here from its `CLAUDE.md`, and the Claude Projects keep a reference copy. If a copy disagrees with this file, this file wins. Change it by PR, in the same PR as the change that needs it.

**Who follows it:** anyone, person or Claude, who adds or changes a page, template, generator, address or publishing step. Read it before starting, not after. Where it conflicts with `design-system-and-dataviz-playbook.md` on a design question, the playbook wins; where it conflicts on what search engines can read, raise it with Shawn.

**Why it exists:** on Nov 9–10, 2026 an audit found that pages were readable to people but much less so to search engines and AI tools: titles nobody searches for, no structured data, chart findings visible only after scripts ran, and 327 Almanac city pages that no plain link reached. Each rule below prevents one of those. The plan, the checklist and the reasoning behind each decision are in `docs/seo-plan.md`.

---

## 1. Rules for every page

**Be readable without JavaScript.** Most AI crawlers, and Google's first pass, read the HTML as delivered. Anything that matters must be in it:
- The headline, intro, section headings and the sentence that states each finding.
- Each chart's takeaway as a sentence next to the chart, and its key numbers as a small HTML table (the playbook's "every chart has a table view", written into the page, not built by script).
- Every link a reader or crawler needs to reach another page (`<a href>`, not a click handler or a `#` route).
- Scripts may redraw or enhance any of this. They must never be the only place it exists.

**One page, one address, one subject.** If a reader can pick a team, player, city or game and the page changes, that choice needs its own address (`nba/teams/ind/`), not a `#` or `?` on a shared one. Search engines ignore everything after `#`.

**Head tags**, all present and filled from the page's own content:
- `<title>`: the searchable version, about 50–60 characters, finding or subject first, ending "· Tall Order Digital". It may differ from the `<h1>`, which stays the headline (see §3).
- `<meta name="description">`: 120–160 characters, a plain summary with the main number in it.
- `<link rel="canonical">` with the page's full https address on tallorderdigital.com.
- Open Graph and Twitter tags (title, description, url, a 1200×630 image and its alt text).
- `lang="en"`, exactly one `<h1>`.
- Structured data (§4).

**Dates in plain sight and in the markup.** Show the published date and, for data, the "data through" date. Put the same dates in structured data and the sitemap. Never show a date the data doesn't support.

**Images:** every chart image and share image has alt text that states what it shows, including the finding. No text that matters lives only inside an image.

**Speed and stability:** pages are self-contained and fast. Don't add a third-party script, font or embed without checking it doesn't slow the first view or move the layout.

## 2. Addresses, redirects and indexing

- **Addresses are permanent.** Pattern: `/<topic>/<slug>/`, lowercase words joined by hyphens, the story's name plus one or two plain keywords (`nba/role-call-minutes-usage/`). Decide it before publishing.
- **Never break one.** A moved page leaves a redirect: a 301 where Cloudflare can do it (whole hosts or folders), otherwise the site's redirect page (meta refresh, `location.replace`, `noindex`, canonical and share tags pointing at the new address). Update every internal link to the new address in the same PR.
- **Everything lives on tallorderdigital.com**, in folders, not subdomains (decided Nov 10, 2026, when the Almanac moved from `weather.` to `weather/almanac/`). A new section or tool gets a folder.
- **`noindex` is a decision, not a default.** Only redirect pages, search results and the 404 page carry it. A page that isn't ready shouldn't be linked, rather than published hidden. Adding or removing `noindex` anywhere else needs Shawn's OK and a note in `seo-plan.md`.
- **A page that was published never just disappears.** Generated pages (the Almanac, future NBA pages) keep their last good version when today's build can't produce them, and a build that drops many pages at once publishes nothing (`weather-live/almanac/carry_over.py` is the pattern). Retiring a page on purpose means a redirect to its nearest replacement, decided by Shawn.
- **Sitemaps list every indexable page** with a true `lastmod`. The main site's is built by `tools/sitemap.js`; generated sections publish their own and are listed in `robots.txt`.

## 3. Writing for search and AI answers

- **Answer first.** The first two sentences state the finding, with its number and sample (Role Call's finding, say: after four games, minutes and usage predict the rest of a season and shooting percentages don't, followed by how many players that covers). This is the playbook's "lead with the answer"; it is also what search snippets and AI answers quote.
- **Headlines vs titles.** The `<h1>` and share card can be a headline ("Role Call"). The `<title>` is what someone would type ("Role Call: Which NBA Players' Roles Changed This Season"). Pick the title phrase from the keyword check in `seo-plan.md` when one has been run; otherwise write the plainest version of the question the page answers. (Rule proposed Nov 9, 2026; confirm with Shawn before rewriting existing titles.)
- **Section headings ask or answer a real question** ("Does early net rating predict the season?"), and the first sentence under each answers it.
- **Name things fully the first time:** full player and team names, city and state, the stat's full name with a link to Stats, explained.
- **Say where the numbers come from** in the text, by name, and how many games, years or places they cover.
- **Quotable sentences:** each key fact stands on its own, with its subject, number and date, so it still makes sense when quoted alone.
- **Target long-tail questions.** A new site ranks for specific questions few others answer with data, not for "NBA stats". Every page should answer at least one question someone actually asks.

## 4. Structured data

Every indexable page carries one schema.org JSON-LD block. The site's ids are shared so search engines see one publisher:
- Organization: `https://tallorderdigital.com/#organization` (Tall Order Digital, legal name Tall Order Digital LLC). Website: `https://tallorderdigital.com/#website`. Author: `https://tallorderdigital.com/#shawn-nafziger` where the byline names Shawn.
- Stories: `Article` (Tall Takes: `OpinionNewsArticle`) with headline, description, image, `datePublished`, `dateModified`, author, publisher, breadcrumbs.
- Topic and hub pages: `CollectionPage` with breadcrumbs.
- Data pages (Almanac cities, future team and player pages): `WebPage` plus `Dataset` (what's measured, years covered, source, `dateModified`), plus the subject (`Place`, `SportsTeam`, `Person`) and breadcrumbs.
- Site pages are written by `tools/structured-data.js`. Generated pages write their own block in their generator, using the same ids. Never hand-edit a generated block.
- Validate a sample with Google's Rich Results Test when a type is added or changed.

## 5. Links between pages

- **Every page is reachable by plain links** from a page that's reachable from the home page. Lists drawn by script (maps, filters, search) need a plain-link version too (the Almanac's "Every place, by state").
- **Related pages link to each other:** a story links the dashboards and data pages it draws on; data pages link their nearest neighbors (the Almanac's six nearest places) and the stories that use them; series pages link every piece in the series.
- **Links use relative paths** inside the site (see `CLAUDE.md`). Descriptive link text ("Chicago's record book"), never "click here".
- When a page moves, its inbound links are updated in the same PR. Redirects are for outside links, not ours.

## 6. Generated pages at scale

Rules for anything that publishes many similar pages (the Almanac, future NBA team, player and game pages):
- **Only publish a page that says something real and specific.** Every sentence is chosen from that page's own numbers and checked; a page without enough data isn't published. Thousands of near-identical pages can drag down how search engines judge the whole site.
- **Built pages are not committed to `main`.** They go to a build branch that's replaced each run, and the site's publish workflow adds them (the Almanac pattern). Expected scale: about 1,000 Almanac places at most.
- **Keep last good pages; refuse mass drops** (§2).
- Each page links to its section's front page and to its neighbors, and is in the section's sitemap.

## 7. Before publishing: checklist

For every new or changed page or template:
- [ ] Headline, intro, headings, findings, chart takeaways and chart tables are in the HTML with scripts off.
- [ ] Title, description, canonical, share tags and one `<h1>` are filled and accurate.
- [ ] Structured data is present and uses the shared ids.
- [ ] The address follows the pattern and nothing published was broken; moved pages redirect.
- [ ] The page is linked from its topic or section page by a plain link, and links to related pages.
- [ ] Dates and sources are stated.
- [ ] No `noindex` unless it's a redirect, search or 404 page.
- [ ] On the main site, `build-hubs.js`, `search-index.js`, `structured-data.js` and `sitemap.js` were run in that order, each `--check` clean.

## 8. Off the site

Search engines and AI tools lean heavily on what other sites say. When a piece is published, consider where its best chart belongs (data communities, local media for city findings, the weekly email, LinkedIn, shawnnafziger.com). Shares credit and link back, per the footer's reuse line.
