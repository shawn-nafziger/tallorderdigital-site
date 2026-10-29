# Tall Order Digital website: notes for Claude

Public site for Shawn Nafziger's data stories. The project memory, data and analysis live in private repos: `shawn-nafziger/nba-analytics` (NBA stories) and `shawn-nafziger/weather-intelligence` (weather stories). Read the relevant repo's `CLAUDE.md` for who Shawn is and how we work.

## Rules
- **Changes arrive as pull requests.** Shawn reviews and merges; GitHub Pages publishes `main`.
- **Static only:** self-contained HTML, data baked in. No server, database, login or build step.
- **Relative links only** (`about/`, `../../`), never `/about/`, so pages work both at the GitHub Pages project address and on the custom domain. Exception: `404.html` (served from any depth).
- **No NBA or team logos.** Names, abbreviations and stats are fine.
- **Credit the data source on every page.** NBA stories keep the "not affiliated with the NBA" line in the footer; weather stories credit NOAA instead.
- **Every published claim follows `knowledge/reference/methods.md`** in the story's data repo: honest sample sizes, ranges where uncertain (and, for NBA, totals not averages).
- **Story addresses:** `/<topic>/<slug>/`: weather stories at `weather/<slug>/`, NBA stories at `nba/<slug>/` (e.g. `nba/role-call-minutes-usage/`). The slug is the story's name plus one or two plain keywords, lowercase with hyphens. **Never break a published address:** when a page moves, leave a redirect page in the old folder (meta refresh plus `location.replace` to the new relative path, `noindex`, a canonical link and the story's link-preview tags pointing at the new address), and update the home card. Example: `stories/phoenix-after-dark/`.
- **Story pages are generated** from `<repo>/analysis/<story>/` in the data repos. Edit the template there and re-run, then copy the output here; don't hand-edit the copy.
- Test before every PR: serve locally, check desktop and phone widths, light and dark, no script errors, and no broken internal links.

## Design
Logo kit in `assets/brand/` (see its README; updated Oct 29, 2026): four bars, tallest first. The tall bar is orange #F99A2B; the three shorter bars step down and fade toward the background (light: #0A3746, #366F80, #62A8BB; dark: #7FC4D6, #4F8D9E, #2E6272). Wordmark in Barlow Semi Condensed: "TALL ORDER" Ink #201914 / Paper #F3F4EF on dark, "DIGITAL" Bark #4A403A / Stone #DDDAD3. The header and home hero draw the mark as inline SVG (bar classes `m-o`, `m-2`, `m-3`, `m-4`; colors from the `--logo-*` tokens) so it follows light/dark mode; story templates in the data repos carry the same rules. Logo shades are not chart colors. No other logos.

**Read `docs/design-system-and-dataviz-playbook.md` before designing anything.** It's a copy; the master lives in the "Weather intelligence" Claude Project. Brand decisions are in `docs/brand-decisions.md`.

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

**Share cards** (`tools/share-cards.js`) use the dark palette: Deep background, Sky comparison, Orange signal, and the logo's on-dark bar colors.
