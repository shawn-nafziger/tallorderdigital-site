# Tall Order Digital website: notes for Claude

Public site for Shawn Nafziger's data stories. The project memory, data and analysis live in private repos: `shawn-nafziger/nba-analytics` (NBA stories) and `shawn-nafziger/weather-intelligence` (weather stories). Read the relevant repo's `CLAUDE.md` for who Shawn is and how we work.

## Rules
- **Changes arrive as pull requests.** Shawn reviews and merges; GitHub Pages publishes `main`.
  - **One exception, the daily dashboard publish (decided Oct 30, 2026):** every morning Shawn commits the two dashboard pages, `nba/dashboards/team-ratings/index.html` and `nba/dashboards/game-overview/index.html`, straight to `main` with no PR. They are generated in `nba-analytics`, whose build scripts check the data before writing. The exception covers only those two `index.html` files and only that daily data refresh. Everything else still comes as a PR, including the dashboards' share images (`nba/dashboards/*/share.png`) and the dashboards index (`nba/dashboards/index.html`). Changes to a dashboard's layout or design are made in the `nba-analytics` template. Don't hand-edit the two dashboard pages here: the next morning's publish overwrites them.
- **Static only:** self-contained HTML, data baked in. No server, database, login or build step.
- **Relative links only** (`about/`, `../../`), never `/about/`, so pages work both at the GitHub Pages project address and on the custom domain. Exception: `404.html` (served from any depth).
- **No NBA or team logos.** Names, abbreviations and stats are fine.
- **Credit the data source on every page.** NBA stories keep the "not affiliated with the NBA" line in the footer; weather stories credit NOAA instead.
- **Every published claim follows `knowledge/reference/methods.md`** in the story's data repo: honest sample sizes, ranges where uncertain (and, for NBA, totals not averages).
- **Story addresses:** `/<topic>/<slug>/`: weather stories at `weather/<slug>/`, NBA stories at `nba/<slug>/` (e.g. `nba/role-call-minutes-usage/`). The slug is the story's name plus one or two plain keywords, lowercase with hyphens. **Never break a published address:** when a page moves, leave a redirect page in the old folder (meta refresh plus `location.replace` to the new relative path, `noindex`, a canonical link and the story's link-preview tags pointing at the new address), and update the home card. Example: `stories/phoenix-after-dark/`.
- **Story pages are generated** from `<repo>/analysis/<story>/` in the data repos. Edit the template there and re-run, then copy the output here; don't hand-edit the copy.
- **Analytics on every page** except redirect pages: the block before `</body>` (GoatCounter for visits and reader events, Cloudflare Web Analytics for page speed; both cookie-free) plus the footer privacy line linking to `about/#privacy`. Story templates in the data repos carry the same block, so new stories copied from a template get it. Events: `glossary/<page>/<term>` (pop-up open 0.6 s or more) and `read-to-end/<page>` (footer reached on long pages). Dashboards: tallorderdigital.goatcounter.com and Cloudflare → Web Analytics.
- **Stats, explained (`explained/`)** is the shared plain-language reference for every subject. One section per concept, each with an `id` anchor (`#chance-wobble`, `#correlation`, `#efg`, `#expected`, `#pp`, `#per-36`, `#net-rating`, `#usage`, `#median`, `#totals`, `#regression`, `#colors`, `#zones`, `#three-point-rate`). Story glossary pop-ups end with a "More on this →" link to `../../explained/#<anchor>`. Add a section here (one PR) before a story links to a concept that isn't covered yet; never rename an anchor.
- Test before every PR: serve locally, check desktop and phone widths, light and dark, no script errors, and no broken internal links.

## Design
Logo kit in `assets/brand/` (see its README; updated Oct 29, 2026): four bars, tallest first. The tall bar is orange #F99A2B; the three shorter bars step down and fade toward the background (light: #0A3746, #366F80, #62A8BB; dark: #7FC4D6, #4F8D9E, #2E6272). Wordmark in Barlow Semi Condensed: "TALL ORDER" Ink #201914 / Paper #F3F4EF on dark, "DIGITAL" Bark #4A403A / Stone #DDDAD3. The header and home hero draw the mark as inline SVG (bar classes `m-o`, `m-2`, `m-3`, `m-4`; colors from the `--logo-*` tokens) so it follows light/dark mode; story templates in the data repos carry the same rules. Logo shades are not chart colors. No other logos.

**Read `docs/design-system-and-dataviz-playbook.md` before designing anything.** This repo's `docs/` folder is the **master copy** of the playbook and of `docs/brand-decisions.md`. Copies in Claude Projects are reference only; if one disagrees with `docs/`, `docs/` wins. Update `docs/` in the same pull request as any design change, so the docs always match what's live.

**Who owns what:**
- **Sitewide (owned by the "Tall Order Digital" Claude Project):** `assets/site.css` tokens, the light/dark theme and toggle (`assets/theme.js`), header, footer, navigation, logo kit and favicon, the home, About and 404 pages, and `docs/`.
- **Stories (owned by the weather and NBA data repos and their projects):** story pages, their templates and charts. Stories use the shared tokens, header and logo rules as they are; they don't define new colors or change the shell. If a story needs a new sitewide token or component, add it to `docs/` and `assets/site.css` first, in its own PR.

**Palette (rolled out Oct 29, 2026):** ink on paper.
- **Light:** Paper `#F3F4EF` background, white cards, Ink `#201914` text, Bark `#4A403A` secondary.
- **Dark:** Deep `#03222C` background, Teal `#0A3746` cards, Paper text, Stone `#DDDAD3` secondary.

**Chart roles** (tokens in `assets/site.css` and each story template; story data colors come only from these):
- `--amber` = signal: Burnt `#B36000` light, Orange `#F99A2B` dark
- `--edge` = at the edge: Peach `#E3B88A` light (a pale tint of Burnt, so it reads weaker than the signal; changed from Orange on Oct 29), `#8F6230` dark
- `--ghost` = noise: `#CDC9C1` / `#3A5762`
- `--navy` = comparison: Teal / Sky `#7FC4D6`
- `--funnel` = bands: Sky at 25-30%
- `--ink-3` = small labels: derived `#6E645D` / `#9FB1B8`, 4.5:1 or better

**Color rules:**
- **Text wears text colors.** A highlighted number stays ink, with a small colored chip beside it (classes `.big`, `.near`, `.up`). Light orange is never used for text.
- **Color keys:** orange = the real signal, light orange = "at the edge", gray = noise. Each key goes on its own line, starting with the color word.

**Type:** Barlow Semi Condensed (headlines, big numbers, logo), IBM Plex Sans (body), IBM Plex Mono (data and labels).

**Light/dark toggle:** the first visit follows the reader's system setting; the sun/moon button in the header switches and saves the choice in localStorage (`tod-theme`). Each page needs (1) the one-line script right after `<meta charset>` that applies a saved choice before drawing (copy it from `index.html`), (2) the `.theme-toggle` button as the last item in `.site-nav`, and (3) `assets/theme.js` with its CSS from `assets/site.css`. Home and About have the button; 404 honors a saved choice. **Story templates in the data repos still need it** (their pages already redraw charts when `data-theme` changes); until then story pages follow the system setting only.

**Share cards** (`tools/share-cards.js`) use the dark palette: Deep background, Sky comparison, Orange signal, and the logo's on-dark bar colors.
