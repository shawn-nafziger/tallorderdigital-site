# Tall Order Digital

Data stories and visualization by Shawn Nafziger. Live at **tallorderdigital.com** (once the domain is connected; until then, GitHub's address for this repo).

## How it works

- Plain HTML pages, no build step. GitHub Pages publishes whatever is on `main`, about a minute after a merge.
- Each story is one self-contained page with its data built in: weather stories in `weather/<slug>/index.html`, NBA stories (for now) in `stories/<slug>/index.html`.
- Stories are built in the private `nba-analytics` and `weather-intelligence` repos (for example `analysis/early_season_mirage/analyze.py`) and copied here by pull request.
- When a page moves, its old folder keeps a small redirect page so old links and shares still work.

## Layout

| Path | What |
| --- | --- |
| `index.html` | Home page: latest stories |
| `about/` | About and contact |
| `weather/` | One folder per weather story |
| `stories/` | One folder per NBA story, plus redirect pages for stories that moved (`stories/phoenix-after-dark/` → `weather/phoenix-after-dark/`) |
| `assets/brand/` | Logo kit: mark, full logo, app icon (favicon.ico sits at the root) |
| `assets/site.css` | Shared styles for home and About (story pages carry their own) |
| `404.html` | Page-not-found |
| `tools/share-cards.js` | Builds the link-preview images (`share.png` per story, `assets/share-home.png`). Claude runs it. |
