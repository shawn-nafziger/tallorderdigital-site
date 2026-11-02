"""Puts the sitewide header pieces into pages: the search icon in the menu, the sticky-header CSS and
the phone hide-on-scroll script. Claude runs this; Shawn doesn't need to.

    python3 tools/apply-header.py                      # every page in this repo
    python3 tools/apply-header.py path/to/template.html ...   # specific files (e.g. story templates in the data repos)
    python3 tools/apply-header.py --check              # report pages that are out of date, change nothing

Master copies: assets/site-header.css and assets/site-header.js.
- Pages that use assets/site.css (home, About, Stats explained, dashboards index, search) link those two files.
- Self-contained pages (stories, dashboards, and their templates in nba-analytics / weather-intelligence) get an
  inline copy between "site-header:start" / "site-header:end" markers. Re-running replaces the copy, so to change
  the header: edit the two asset files, then re-run this on the site pages and on the templates.
Pages without a .site-bar header (404, redirect pages) are skipped, and so are the daily dashboard pages
(nba/dashboards/<name>/index.html): run this on their templates in nba-analytics instead.
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
CSS = (ROOT / "assets/site-header.css").read_text().strip()
JS = (ROOT / "assets/site-header.js").read_text().strip()
ICON = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" '
        'aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg>')
BLOCK = re.compile(r"/\* site-header:start \*/.*?/\* site-header:end \*/", re.S)
SCRIPT = re.compile(r"<script>\s*/\* site-header:start \*/.*?/\* site-header:end \*/\s*</script>\n?", re.S)


def apply(html, path):
    if 'class="site-bar' not in html or 'class="site-nav"' not in html:
        return None
    m = re.search(r'<a href="([^"]*)#stories"[^>]*>Stories</a>', html)
    if not m:
        raise SystemExit(f"{path}: can't find the Stories link to work out the path to the site root")
    root = m.group(1)
    on_search = re.search(r"(^|/)search/index\.html$", str(path).replace("\\", "/")) is not None
    link = (f'<a class="nav-search" href="{"./" if on_search else root + "search/"}" aria-label="Search"'
            f'{" aria-current=\"page\"" if on_search else ""}>{ICON}</a>')

    # 1. Search icon: before the light/dark button, or last in the menu.
    html = re.sub(r'<a class="nav-search"[^>]*>.*?</a>', "", html, flags=re.S)
    nav = re.search(r'<nav class="site-nav"[^>]*>.*?</nav>', html, re.S)
    inner = nav.group(0)
    if '<button type="button" class="theme-toggle"' in inner:
        inner = inner.replace('<button type="button" class="theme-toggle"', link + '<button type="button" class="theme-toggle"', 1)
    else:
        inner = inner[: -len("</nav>")] + link + "</nav>"
    html = html[: nav.start()] + inner + html[nav.end():]

    # 2 and 3. Styles and script.
    if re.search(r'href="[^"]*assets/site\.css"', html):
        if "assets/site-header.css" not in html:
            html = re.sub(r'(<link rel="stylesheet" href="([^"]*)assets/site\.css">)',
                          r'\1\n<link rel="stylesheet" href="\2assets/site-header.css">', html, count=1)
        if "assets/site-header.js" not in html:
            anchor = re.search(r'<script src="([^"]*)assets/theme\.js" defer></script>', html)
            tag = f'<script src="{root}assets/site-header.js" defer></script>'
            html = html.replace(anchor.group(0), anchor.group(0) + "\n" + tag, 1) if anchor else html.replace("</head>", tag + "\n</head>", 1)
    else:
        if BLOCK.search(html):
            html = BLOCK.sub(lambda _: CSS, html, count=1)
        else:
            i = html.index("</style>")
            html = html[:i] + CSS + "\n" + html[i:]
        tag = "<script>\n" + JS + "\n</script>\n"
        if SCRIPT.search(html):
            html = SCRIPT.sub(lambda _: tag, html, count=1)
        else:
            j = html.find("<!-- Analytics")
            if j < 0:
                j = html.rindex("</body>")
            html = html[:j] + tag + html[j:]
    return html


def main(argv):
    check = "--check" in argv
    files = [pathlib.Path(a) for a in argv if not a.startswith("--")]
    if not files:
        # The daily dashboard pages are skipped: they're rebuilt from the nba-analytics templates every morning.
        daily = re.compile(r"nba/dashboards/[^/]+/index\.html$")
        files = sorted(p for p in ROOT.rglob("*.html")
                       if ".git" not in p.parts and not daily.search(p.relative_to(ROOT).as_posix()))
    stale = 0
    for f in files:
        old = f.read_text()
        new = apply(old, f)
        if new is None or new == old:
            continue
        stale += 1
        if check:
            print("out of date:", f)
        else:
            f.write_text(new)
            print("updated:", f)
    if check and stale:
        sys.exit(1)


if __name__ == "__main__":
    main(sys.argv[1:])
