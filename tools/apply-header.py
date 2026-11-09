"""Puts the sitewide header pieces into pages: the whole menu (NBA, Weather, More stories, About, Subscribe, the
search icon and the light/dark button; Nov 8, 2026), the saved-theme line in <head>, the sticky-header CSS, the phone
hide-on-scroll script and the light/dark script. Claude runs this; Shawn doesn't need to.
The path to the site root comes from the logo link (class="brand"); the current menu item from the page's folder
(or, for story templates in the data repos, from the repo they're in).

    python3 tools/apply-header.py                      # every page in this repo
    python3 tools/apply-header.py path/to/template.html ...   # specific files (e.g. story templates in the data repos)
    python3 tools/apply-header.py --check              # report pages that are out of date, change nothing

Master copies: assets/site-header.css and assets/site-header.js; for the light/dark button, assets/theme.js and the
".theme-toggle" rules in assets/site.css.
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
THEME_JS = (ROOT / "assets/theme.js").read_text().strip().replace("</", "<\\/")  # a literal "</script>" in a comment would end the inline script
_site_css = (ROOT / "assets/site.css").read_text()
THEME_CSS = "\n".join(l for l in _site_css.splitlines() if l.startswith(".theme-toggle") or l.startswith("  border: 0; border-radius: 50%"))
# Applies a saved light/dark choice before the page draws (no flash of the wrong theme).
SAVED = '<script>try{var t=localStorage.getItem("tod-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}</script>'
TOGGLE = ('<button type="button" class="theme-toggle" aria-label="Switch theme">'
          '<svg class="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>'
          '<svg class="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>'
          '</button>')
MAIL = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" '
        'stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.5 7 8.5 6.5L20.5 7"/></svg>')
TBLOCK = re.compile(r"/\* theme-toggle:start \*/.*?/\* theme-toggle:end \*/", re.S)
TSCRIPT = re.compile(r"<script>\s*/\* theme-toggle:start \*/.*?/\* theme-toggle:end \*/\s*</script>\n?", re.S)
BLOCK = re.compile(r"/\* site-header:start \*/.*?/\* site-header:end \*/", re.S)
SCRIPT = re.compile(r"<script>\s*/\* site-header:start \*/.*?/\* site-header:end \*/\s*</script>\n?", re.S)


def section_of(path):
    """Which menu item a page belongs to: "nba", "weather", "stories" (More stories), "about", "subscribe",
    "search" or "" (none). Pages in this repo go by their folder; story templates in the data repos go by
    the repo they live in."""
    p = pathlib.Path(path).resolve()
    try:
        rel = p.relative_to(ROOT).as_posix()
    except ValueError:
        parts = [x.lower() for x in p.parts]
        if "nba-analytics" in parts:
            return "nba"
        if "weather-intelligence" in parts:
            return "weather"
        if any(x in parts for x in ("politics-analytics", "travel-analytics", "misc-analytics")):
            return "stories"
        return ""
    top = rel.split("/", 1)[0] if "/" in rel else ""
    return {"nba": "nba", "takes": "nba", "weather": "weather", "stories": "stories", "politics": "stories",
            "travel": "stories", "about": "about", "subscribe": "subscribe", "search": "search"}.get(top, "")


def menu(root, here):
    """The whole menu, written fresh every time (Nov 8, 2026): NBA, Weather, More stories, | About, Subscribe,
    then the search icon and the light/dark button. A thin divider before About (Nov 9, 2026) separates the topics
    from the site links (.nav-about in assets/site-header.css). The section the page belongs to is marked as current."""
    cur = lambda s: ' aria-current="page"' if here == s else ""
    return ('<nav class="site-nav" aria-label="Site">'
            f'<a href="{root}nba/"{cur("nba")}>NBA</a>'
            f'<a href="{root}weather/"{cur("weather")}>Weather</a>'
            f'<a href="{root}stories/" aria-label="More stories"{cur("stories")}>More<span class="nav-long"> stories</span></a>'
            f'<a class="nav-about" href="{root}about/"{cur("about")}>About</a>'
            f'<a class="nav-sub" href="{root}subscribe/"{cur("subscribe")}><span class="t">Subscribe</span>{MAIL}</a>'
            f'<a class="nav-search" href="{root}search/" aria-label="Search"{cur("search")}>{ICON}</a>'
            f'{TOGGLE}</nav>')


def apply(html, path):
    if 'class="site-bar' not in html or 'class="site-nav"' not in html:
        return None
    # The logo links home, so its address is the path to the site root ("./", "../", "../../", ...).
    m = re.search(r'<a class="brand" href="([^"]*)"', html)
    if not m:
        raise SystemExit(f"{path}: can't find the logo link (class=\"brand\") to work out the path to the site root")
    root = m.group(1)
    if root in ("", "./") or not root.endswith("/"):
        root = "" if root in ("", "./") else root + "/"

    # 1. The menu.
    nav = re.search(r'<nav class="site-nav"[^>]*>.*?</nav>', html, re.S)
    html = html[: nav.start()] + menu(root, section_of(path)) + html[nav.end():]

    # 1b. Light/dark: the saved-choice line first thing in <head> (the button is part of the menu).
    if "tod-theme" not in html.split("</head>", 1)[0]:
        html = html.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n' + SAVED, 1)

    # 3 and 4. Styles and script.
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
        # Light/dark styles and script, unless the page already links assets/theme.js.
        if "assets/theme.js" not in html:
            tcss = "/* theme-toggle:start */\n/* Light/dark button. Master copy: tallorderdigital-site/assets/site.css (.theme-toggle). */\n" + THEME_CSS + "\n/* theme-toggle:end */"
            if TBLOCK.search(html):
                html = TBLOCK.sub(lambda _: tcss, html, count=1)
            else:
                i = html.index("</style>")
                html = html[:i] + tcss + "\n" + html[i:]
            ttag = "<script>\n/* theme-toggle:start */\n" + THEME_JS + "\n/* theme-toggle:end */\n</script>\n"
            if TSCRIPT.search(html):
                html = TSCRIPT.sub(lambda _: ttag, html, count=1)
            else:
                j = html.find("<!-- Analytics")
                if j < 0:
                    j = html.rindex("</body>")
                html = html[:j] + ttag + html[j:]
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
        # The daily pages (the dashboards and the weird stat of the day) are skipped: they're rebuilt from the
        # nba-analytics templates every morning, so run this on those templates instead.
        daily = re.compile(r"nba/(dashboards/[^/]+|weird-stat)/index\.html$")
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
