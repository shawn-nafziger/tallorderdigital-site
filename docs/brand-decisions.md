# Tall Order Digital — Brand Decisions

Last updated: November 9, 2026

**Master copy: `docs/brand-decisions.md` in the `tallorderdigital-site` repo.** Project copies are for reference.

**Colors, typography and chart rules now live in `design-system-and-dataviz-playbook.md`** (adopted Oct 29, 2026). Where this doc and the playbook disagree, the playbook wins.

## Positioning: DECIDED (revised Nov 4, 2026)
**Tall Order Digital is a data visualization and data storytelling site, not a portfolio or services site.** It shows Shawn's data viz and storytelling skills through the work itself: data stories (NBA first, other subjects when the data is good) and public dashboards.

- **Portfolio and Power BI live on shawnnafziger.com.** Tall Order Digital doesn't promote Power BI or consulting work. The About page mentions the day job (BI and data-visualization analyst using tools like Power BI and Contentsquare) as background, and links to shawnnafziger.com.
- Home page description as live (Nov 8, 2026, when the site widened beyond the NBA): "Data stories and visualization: the NBA, the weather, and anything else where the data is too good to pass up." The intro under the logo says the same: "Stories built from the numbers up: the NBA, the weather, and anything else where the data is too good to pass up." (Was "with a focus on NBA analytics.") The home share image (`assets/share-home.png`, from `tools/share-cards.js`) reads "Data stories & visualization: the NBA, the weather, and more." (was "starting with the NBA").
- Tagline candidate: "Find what stands out." (ties to the logo's standout bar; not yet decided)

## Site structure: DECIDED (Nov 8, 2026)
Readers come for NBA, for weather, or for everything else, and NBA will publish far more often than the rest (a daily automated piece is coming). So the site splits into **topic pages** plus one page for everything else, and nothing is listed twice.

- **Menu:** NBA · Weather · More stories | About · Subscribe (a thin divider before About since Nov 9, 2026, setting the topics apart from the site links; Shawn chose it over moving About after Subscribe or a plain wider gap), then search and the light/dark button. "More stories" shortens to "More" on narrow phones. Dashboards left the menu: each topic page shows its own, and the home page links the dashboards hub (`dashboards/`), which stays live.
- **Strict split:** NBA content appears only under NBA, weather only under Weather. **More stories** (`stories/`) holds everything else (politics and travel today) and is expected to grow quickly.
- **Series:** every NBA and weather story carries a series (NBA: Check the Take, Weird Stat, Focus stories; weather: Month in review, Record watch, Focus stories; names to be settled once the real mix is known). Each topic page lists every piece newest first with a series filter, and adds "By series" once two or more series have pieces. The existing non-Check-the-Take stories are Focus stories.
- **NBA page (`nba/`):** Latest Tall Take box, the full NBA list, Browse by series (one small card per series that links to all of it; no story lists, so nothing repeats the Latest list; Nov 8, 2026), the NBA dashboards, the email sign-up. A predictions scorecard is added only once there are graded predictions.
  - Tall Takes moved to `nba/takes/`; every old `takes/` address redirects.
  - Check the Take has a series page at `nba/check-the-take/`; its stories stay at `nba/<slug>/`.
- **Weather page (`weather/`):** the Weather Almanac first (it lives at `weather/almanac/`, served from the weather-live repo; at weather.tallorderdigital.com until Nov 10, 2026), then weather stories. The planned "Today in your city" and "Most unusual today" blocks (300+ cities) wait until weather-live publishes a small daily file the page can read. Commit only to a cadence that can be kept.
- **Home page:** three doors (NBA, Weather, More stories), each with its newest pieces; the Weather door leads with the Almanac. **All three doors are the same size (Nov 8, 2026):** the site is becoming a general data-stories site, and the NBA focus lives on the menu and the `nba/` page. The NBA door shows the game summaries (Game Overview, as "Last night's games, and what decided each one"), the weird stat and the newest focus story; Tall Takes and Check the Take stay on the NBA page, as they draw fewer new readers. Old `?topic=` links forward to the matching page.
- **How it's kept current:** story cards live on their topic page; `tools/build-hubs.js` sorts them and writes the series sections, series pages, Latest Tall Take box and home doors. Later, the data repos could write a list of pieces the site reads instead.
- **Reader's city (when the live weather blocks arrive):** chosen once and remembered in the browser (`localStorage`, like `tod-theme`), never a cookie sent to the server and never in a URL; no location or IP detection; a "Change city" control always visible.
- Later, maybe: per-topic options for the weekly email (Buttondown tags).
- Design canvas (Home, NBA, Check the Take, Weather; light and dark): https://claude.ai/artifact/Txb3Rr3KS4HA6iekMaBn7G. The built pages use the site's existing look (story cards with chart previews) rather than the canvas's cards.

## Copyright and reuse: DECIDED (Nov 9, 2026)
- **Owner:** Tall Order Digital LLC (a registered LLC). Use the exact legal name from the state filing.
- **Footer notice on every page** (live Nov 9, 2026), on its own line; any footer links that used to share that line ("More stories", "NBA" and so on) now sit on the line below:
  > © 2026 Tall Order Digital LLC. Charts and text may be shared with credit and a link.
  - Same line on the Weather Almanac (city pages and its main page, from `weather-live/almanac/` templates).
  - Story pages and daily dashboards are generated in the data repos, so their templates carry the line too; a new template copied from an existing one gets it.
  - Each page's data credit stays where it is (playbook §6.8). When the site runs into 2027, update the year or use a range ("© 2026–2027").
- **Reuse:** readers may share charts and text with credit and a link, because shared charts spread the name. If a formal license is wanted later, CC BY 4.0 says the same thing in standard terms.
- **What the notice covers:** the analysis, charts, writing, code and design. Raw facts and stats can't be copyrighted, and US government weather data (NOAA) is public domain. Check each data source's terms of use (especially NBA data) for credit or commercial-use limits.
- **AI-assisted work:** only the human-authored parts are protected, so don't rely on the notice for mostly generated pieces.
- **Ownership:** work Shawn creates belongs to him personally until he assigns it, so the notice is fully accurate only once a written IP assignment to the LLC is signed (see open items). Trademark search and any filing go in the LLC's name; once the mark is in use, "™" can follow it without registration ("®" only after registration).
- Copyright registration is optional (needed only before suing); the Copyright Office's group option for short online articles keeps it cheap if it's ever wanted.
- Not legal advice; see a lawyer if the site starts earning money or important work gets copied.

## Privacy notes (working, Nov 8, 2026)
- Saving the reader's theme and city in their own browser is a user-chosen preference; no cookie banner is expected for it. Not legal advice; revisit if the site adds location detection or third-party embeds.
- Third-party embeds (Power BI publish-to-web, video, social) can set their own cookies: use the image fallback, and consider "click to load" on desktop.

## Business direction (working, revised Nov 4, 2026)
- Tall Order Digital: data stories, dashboards and the weekly email build an audience and show the skills.
- shawnnafziger.com: the portfolio, including Power BI work and case studies.
- Launch: soft launch to friends by text (Nov 4, 2026), asking for feedback; links carry `?ref=text` so GoatCounter shows them as their own source.

## Superseded positioning (Oct 28-29, 2026, kept for history)
- "Tall Order Digital turns scattered data sources into Power BI dashboards and data visualizations that tell stories people understand", aimed at small and mid-sized businesses, with the NBA and weather projects as Power BI case studies, Power BI and data viz project work as early revenue, productized templates/retainers/training later, and weather-sensitive businesses as a niche to test.

## Logo: DECIDED — Direction "A+", colors "Option 3: teal-to-sky steps" (Oct 29, 2026)
- Mark: four bars sorted tallest to shortest, left to right. The first bar is orange and much taller than the rest; the three shorter bars step down evenly in height **and fade in color toward the background**. It reads as "tall" + "order" and as the outlier.
- Bar geometry (100 × 100 grid, bar width 18, gap 6, corner radius 3, shared baseline at y = 94):
  - Orange: height 88
  - Shorter bars: heights 44, 34, 24

### Logo colors
| Element | Light backgrounds (Paper / white) | Dark backgrounds (Deep) |
|---|---|---|
| Tall bar | Orange `#F99A2B` | Orange `#F99A2B` |
| Bar 2 (h 44) | Teal `#0A3746` | Sky `#7FC4D6` |
| Bar 3 (h 34) | Mid `#366F80` | `#4F8D9E` |
| Bar 4 (h 24) | Light `#62A8BB` (Sky darkened so it holds at favicon size) | `#2E6272` |
| "TALL ORDER" | Ink `#201914` | Paper `#F3F4EF` |
| "DIGITAL" | Bark `#4A403A` | Stone `#DDDAD3` |
| App-icon tile | — | Deep `#03222C` (bars use the dark-background colors) |

- Principle: on both themes the shorter bars fade **toward the background**; only orange stays fully saturated.
- `#366F80`, `#62A8BB`, `#4F8D9E` and `#2E6272` are logo-only shades derived from the playbook's Sky → Teal → Deep ramp; they are not chart tokens.
- Wordmark: "TALL ORDER" in Barlow Semi Condensed Bold, with "DIGITAL" below in Barlow Semi Condensed SemiBold, widely letterspaced (0.52em) and indented to start under the stem of the T.
- Order stays tallest-first. Flipping was considered and rejected: rising bars look like a phone signal-strength icon and a generic growth chart.
- Logo kit rebuilt Oct 29 with these colors (Tall-Order-Digital-logo-kit.zip) and live on the website (`assets/brand/`). The logo colors are also in the playbook.
- Design canvas (artboard "A+ new palette · 3 Teal-to-sky steps"): https://claude.ai/artifact/RwgWsq1ir3xf8Ni8wPvNt2

### Animated logo: DECIDED (Nov 9, 2026)
- **The motion:** sixteen dots in a 4×4 grid, already in the logo's colors but mixed up, swirl about two turns around the center. In the last stretch of the spiral each dot widens into its slice of a bar, so the bars come straight out of the swirl (7 + 4 + 3 + 2 dots for the 88 / 44 / 34 / 24 bars). The orange bar settles with a small bounce, then "TALL ORDER" wipes in and "DIGITAL" tightens to its 0.52em spacing. About 3.6 seconds.
- **Where it runs:** once per visit, on whichever page the reader lands on (`sessionStorage` key `tod-intro`, shared across the site): the big hero logo on the home page, or the small header logo on any other page. Every page after that in the same visit shows the static logo. Readers with "reduce motion" on, or without JavaScript, always see the static logo. Shawn chose "first page per visit" over every page load, a shorter every-page version, or hover-only (Nov 9, 2026).
- **Code:** part of the sitewide header. The intro code sits in `assets/site-header.js`, the rule that hides the static logo until it starts sits in `assets/site-header.css`, and a one-line guard script goes in each page's `<head>` right after the saved-theme line (it shows the static logo after 2 s if the intro never starts). `tools/apply-header.py` writes all three, so every page that carries the header gets it. Colors come from the existing `m-o`/`m-2`/`m-3`/`m-4` classes, so it follows light/dark mode.
- **Still to do:** run `tools/apply-header.py` on the templates in the data repos (nba-analytics stories, daily dashboards and weird stat; weather-intelligence; politics-analytics; travel-analytics; the Almanac templates in weather-live), so regenerated pages keep the intro.
- Motion study (replay, scrubber, slow motion; v3 is the one chosen): https://claude.ai/artifact/8j3xdU3sT76Q7Ess7mMKas
- Later, maybe: an MP4/GIF export for video intros and social clips, and a looping version as a dashboard loading state.

### Rejected directions
- Original scatter plot with magnifier and basketball: too detailed for small sizes; basketball ties the brand to sports only.
- B "The outlier" (dot grid with one orange dot): liked the concept, but it blurs at small sizes and doesn't connect to the name.
- Oct 29 bar-color options not chosen: solid teal (too heavy), bark/stone (stone competes with orange on dark), orange + burnt.

## Superseded (Oct 28, kept for history)
- Colors: orange #E8912D, slate #46536F, ink #1F2638, mist #F2F3F7. Replaced by the playbook's Paper / Ink / Teal / Orange palette and the logo colors above.
- Body type: Barlow. Replaced by IBM Plex Sans (body) and IBM Plex Mono (data); Barlow Semi Condensed stays for headlines and the logo.

- Site menu "Stories · Dashboards · About" with one mixed, filterable story list on the home page (Nov 2-7, 2026): replaced by the topic pages above, because daily NBA pieces would bury everything else.

## Open items
- Sign a written IP assignment from Shawn to Tall Order Digital LLC covering existing and future site content, charts, code and the logo.
- Each January, update the footer year (or switch to a range, "© 2026–2027") across the site, the data-repo templates and the Almanac templates.
- Weather page live blocks ("Today in your city", "Most unusual today"), once weather-live publishes a daily file.
- Run `tools/apply-header.py` on the data-repo and Almanac templates so they carry the animated logo intro.
- Run `tools/apply-header.py` on the story templates in politics-analytics and travel-analytics (their published copies here already have the new menu).
- Settle the NBA and weather series names and cadences once the real mix is known.
- Create a one-color version of the mark (for single-color printing, embroidery, stamps).
- Have a human designer produce the final logo files (vector master, icon set), fine-tuning the "DIGITAL" alignment. Their contract must assign the rights to Tall Order Digital LLC. AI-only artwork generally can't be copyrighted in the US.
- Trademark search (USPTO), domain, and social handle checks; any filing in the LLC's name. A quick web search found no exact "Tall Order Digital" match; nearby names include Tall Order Creatives, TallOrder (South Africa), and Tall (UK agency).
- Decide on a tagline ("Find what stands out." is the leading candidate).
- Get one-page case study briefs from the NBA analytics and Weather intelligence projects.
