# Tall Order Digital

Data stories and visualization by Shawn Nafziger. Live at **tallorderdigital.com** (once the domain is connected; until then, GitHub's address for this repo).

## How it works

- Plain HTML pages, no build step. GitHub Pages publishes whatever is on `main`, about a minute after a merge.
- Each story is one self-contained page with its data built in: weather stories in `weather/<slug>/index.html`, NBA stories in `nba/<slug>/index.html`.
- Stories are built in the private `nba-analytics` and `weather-intelligence` repos (for example `analysis/early_season_mirage/analyze.py`) and copied here by pull request.
- When a page moves, its old folder keeps a small redirect page so old links and shares still work.

## Layout

| Path | What |
| --- | --- |
| `index.html` | Home page: latest stories |
| `about/` | About and contact |
| `explained/` | Stats, explained: plain-language reference for the numbers in every story (anchors per concept; story pop-ups link here) |
| `weather/` | One folder per weather story |
| `nba/` | One folder per NBA story |
| `nba/dashboards/` | Index of the daily NBA dashboards; `team-ratings/` and `game-overview/` are generated in `nba-analytics` and committed to `main` each morning (see CLAUDE.md) |
| `stories/` | Redirect pages only, for stories that moved (old NBA addresses → `nba/...`, `phoenix-after-dark` → `weather/...`) |
| `assets/brand/` | Logo kit: mark, full logo, app icon (favicon.ico sits at the root) |
| `assets/site.css` | Shared styles for home and About (story pages carry their own) |
| `404.html` | Page-not-found |
| `tools/share-cards.js` | Builds the link-preview images (`share.png` per story and per dashboard, `assets/share-home.png`). Claude runs it. |
