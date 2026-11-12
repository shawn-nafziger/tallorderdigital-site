#!/usr/bin/env python3
"""
"How to read a <chart> →" links from story charts to the chart guide (Nov 12, 2026). Claude runs this; Shawn doesn't need to.

    python3 tools/apply-chart-howto.py           (write the links on every page listed below)
    python3 tools/apply-chart-howto.py --check   (exit 1 if any page is out of date; changes nothing)

Each link goes on its own line right under a chart's subtitle, between <!-- chart-howto:start --> / <!-- chart-howto:end -->
markers, and points at that chart type's page in the guide (explained/charts/<slug>/). Story pages are generated in the
data repos, so a story re-copied from its repo loses its links: re-run this in the same PR (before structured-data.js
and sitemap.js), as with apply-subscribe.py. A chart whose title can't be found is reported and skipped, so a story that
was rebuilt with new chart titles never gets a link in the wrong place; update LINKS when that happens.

LINKS: page folder -> list of (text that starts the chart's title, guide page). Only charts whose type was checked by
eye (Nov 12, 2026); add a chart when a story using one of the guide's types is published.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NAMES = {  # guide page -> the name in the link ("How to read a <name>")
    "bar-chart": "bar chart", "dot-plot": "dot plot", "dumbbell": "dumbbell chart", "line-chart": "line chart",
    "slope-chart": "slope chart", "heatmap": "heatmap", "waffle-chart": "waffle chart", "beeswarm": "beeswarm",
    "scatter-plot": "scatter plot", "dot-map": "dot map", "tile-grid-map": "tile grid map", "histogram": "histogram",
    "stacked-bar": "100% stacked bar",
}
LINKS = {
    "culture/blockbusters-got-longer": [("The gap between big hits and ordinary films more than tripled", "line-chart"),
                                        ("Animated hits stay much shorter than live action", "line-chart"),
                                        ("Shared editing rooms aren't new", "stacked-bar")],
    "nba/check-the-take-heat-luck": [("Opponent shooting vs what their shot locations predict", "scatter-plot")],
    "nba/check-the-take-luka-unguardable": [("Shot making, every qualified player", "beeswarm")],
    "nba/early-season-mirage-net-rating": [("Net rating after each game", "line-chart"),
                                           ("Net-rating rank after 4 games vs. final rank", "slope-chart")],
    "nba/every-season-starts-fast-pace-fouls": [("Pace: the first 13 days vs the rest of the season", "dumbbell")],
    "nba/injury-tax-missing-stars": [("How much better each team was with its 20+ point scorer", "dot-plot")],
    "nba/new-team-shot-maps": [("Average shot distance, 2025-26 to 2026-27", "dumbbell")],
    "nba/ready-now-rookie-age": [("Rookie minutes per game by age", "scatter-plot")],
    "nba/role-call-minutes-usage": [("Change since 2025-26: minutes per game and usage", "scatter-plot")],
    "politics/midterms-2026": [("Where the seats are: every district the same size", "tile-grid-map")],
    "politics/midterms-2026/results": [("218 seats make a majority", "waffle-chart")],
    "travel/flight-delays-us-airlines": [("Where flights leaving most often arrive late", "dot-map"),
                                         ("Some airlines are worse than average on both counts", "scatter-plot")],
    "weather/phoenix-after-dark": [("How low did it get? Every summer night in Phoenix", "heatmap"),
                                   ("Nights per year that stayed at 90", "bar-chart")],
    "weather/record-lows-disappearing": [("Record lows set since 2000, compared with chance", "dot-map"),
                                         ("Records since 2000 for every 100 chance would give, by group", "dot-plot")],
    "weather/first-freeze-running-late": [("This fall's first freeze, place by place", "dot-map")],
}
BLOCK = re.compile(r"<!-- chart-howto:start -->.*?<!-- chart-howto:end -->\n?", re.S)
SUB = re.compile(r'<p class="(?:fig-sub|sub)"[^>]*>.*?</p>', re.S)


def link(page, slug):
    depth = page.count("/") + 1
    href = "../" * depth + f"explained/charts/{slug}/"
    return ('<!-- chart-howto:start --><p class="chart-howto" style="margin:4px 0 0;font:500 13px/1.4 var(--font-data, monospace)">'
            f'<a href="{href}" style="color:var(--ink-2, inherit);text-underline-offset:2px">How to read a {NAMES[slug]} →</a></p><!-- chart-howto:end -->\n')


def apply(page, html, problems):
    html = BLOCK.sub("", html)
    for title, slug in LINKS[page]:
        i = html.find(title, html.find("<main"))
        if i < 0:
            problems.append(f"{page}: chart not found: {title!r}"); continue
        m = SUB.search(html, i)
        nxt = html.find("<h2", i + len(title))
        if not m or (0 <= nxt < m.start()):
            problems.append(f"{page}: no subtitle under {title!r}"); continue
        html = html[:m.end()] + "\n" + link(page, slug) + html[m.end():].lstrip("\n")
    return html


def main():
    check = "--check" in sys.argv
    stale, problems, n = 0, [], 0
    for page in LINKS:
        f = ROOT / page / "index.html"
        old = f.read_text()
        new = apply(page, old, problems)
        n += new.count("chart-howto:start")
        if new != old:
            stale += 1
            if check:
                print(f"out of date: {page}/")
            else:
                f.write_text(new); print(f"links written: {page}/")
    for p in problems:
        print("skipped", p)
    if check:
        print(f"{stale} page(s) out of date" if stale else "chart links are current")
        sys.exit(1 if stale or problems else 0)
    print(f"{n} links on {len(LINKS)} pages")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
