# Tall Order Digital website: notes for Claude

Public site for Shawn Nafziger's data stories. The project memory, data and analysis live in the private repo `shawn-nafziger/nba-analytics`; read its `CLAUDE.md` for who Shawn is and how we work.

## Rules
- **Changes arrive as pull requests.** Shawn reviews and merges; GitHub Pages publishes `main`.
- **Static only:** self-contained HTML, data baked in. No server, database, login or build step.
- **Relative links only** (`about/`, `../../`), never `/about/`, so pages work both at the GitHub Pages project address and on the custom domain. Exception: `404.html` (served from any depth).
- **No NBA or team logos.** Names, abbreviations and stats are fine.
- **Credit the data source on every page**, and keep the "not affiliated with the NBA" line in the footer.
- **Every published claim follows `knowledge/reference/methods.md`** in `nba-analytics`: totals not averages, honest sample sizes, ranges where uncertain.
- **Story pages are generated** from `nba-analytics/analysis/<story>/`. Edit the template there and re-run, then copy the output here; don't hand-edit the copy.
- Test before every PR: serve locally, check desktop and phone widths, light and dark, no script errors, and no broken internal links.

## Design
Logo kit in `assets/brand/` (see its README): bar mark with the orange standout, wordmark in Barlow Semi Condensed. Orange #E8912D, slate #46536F (#8A97B7 on dark), ink #1F2638. The header and home hero draw the mark as inline SVG so it follows light/dark mode. No other logos.

Big Shoulders Display (headlines), IBM Plex Sans (body), IBM Plex Mono (data and labels). Navy #172B40, amber #F5A623 / #E8940F for the one thing that matters, muted grays elsewhere. Tokens in `assets/site.css`.
