# Tall Order Digital website: notes for Claude

Public site for Shawn Nafziger's data stories. The project memory, data and analysis live in private repos: `shawn-nafziger/nba-analytics` (NBA stories) and `shawn-nafziger/weather-intelligence` (weather stories). Read the relevant repo's `CLAUDE.md` for who Shawn is and how we work.

## Rules
- **Changes arrive as pull requests.** Shawn reviews and merges; GitHub Pages publishes `main`.
- **Static only:** self-contained HTML, data baked in. No server, database, login or build step.
- **Relative links only** (`about/`, `../../`), never `/about/`, so pages work both at the GitHub Pages project address and on the custom domain. Exception: `404.html` (served from any depth).
- **No NBA or team logos.** Names, abbreviations and stats are fine.
- **Credit the data source on every page.** NBA stories keep the "not affiliated with the NBA" line in the footer; weather stories credit NOAA instead.
- **Every published claim follows `knowledge/reference/methods.md`** in the story's data repo: honest sample sizes, ranges where uncertain (and, for NBA, totals not averages).
- **Story addresses:** weather stories live at `weather/<slug>/` (NBA stories are still at `stories/<slug>/`). **Never break a published address:** when a page moves, leave a redirect page in the old folder (meta refresh plus `location.replace` to the new relative path, `noindex`, a canonical link and the story's link-preview tags pointing at the new address), and update the home card. Example: `stories/phoenix-after-dark/`.
- **Story pages are generated** from `<repo>/analysis/<story>/` in the data repos. Edit the template there and re-run, then copy the output here; don't hand-edit the copy.
- Test before every PR: serve locally, check desktop and phone widths, light and dark, no script errors, and no broken internal links.

## Design
Logo kit in `assets/brand/` (see its README; updated Oct 29, 2026): four bars, tallest first. The tall bar is orange #F99A2B; the three shorter bars step down and fade toward the background (light: #0A3746, #366F80, #62A8BB; dark: #7FC4D6, #4F8D9E, #2E6272). Wordmark in Barlow Semi Condensed: "TALL ORDER" Ink #201914 / Paper #F3F4EF on dark, "DIGITAL" Bark #4A403A / Stone #DDDAD3. The header and home hero draw the mark as inline SVG (bar classes `m-o`, `m-2`, `m-3`, `m-4`; colors from the `--logo-*` tokens) so it follows light/dark mode; story templates in the data repos carry the same rules. Logo shades are not chart colors. No other logos.

Color keys: orange = the real signal, light orange = "at the edge", gray = noise. Each color key sits on its own line, starting with the color word shown in that color. See `nba-analytics/CLAUDE.md`.

Barlow Semi Condensed (headlines and logo), IBM Plex Sans (body), IBM Plex Mono (data and labels). Navy #172B40, amber #F5A623 / #E8940F for the one thing that matters, muted grays elsewhere. Tokens in `assets/site.css`; **story data colors come only from these tokens**. The full new palette (Paper / Ink / Teal / Sky / Orange) is adopted but not rolled out yet; see the design playbook in the Claude Projects.
