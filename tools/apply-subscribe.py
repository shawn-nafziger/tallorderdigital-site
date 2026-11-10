"""Puts the share row and the weekly-email signup card at the end of story pages, plus a "Get the weekly email" footer link.
Claude runs this; Shawn doesn't need to.

    python3 tools/apply-subscribe.py                       # every story page in this repo
    python3 tools/apply-subscribe.py path/to/template.html ...   # story templates in the data repos
    python3 tools/apply-subscribe.py --check               # report pages that are out of date, change nothing
    python3 tools/apply-subscribe.py --share-only path/to/template.html   # daily pages: share row only (see below)

Master copies: the ".subscribe" rules between "subscribe:start" / "subscribe:end" in assets/site.css, and
assets/subscribe.js; the share row's rules between "share:start" / "share:end" in assets/site.css, and assets/share.js
(added Nov 8, 2026). Story pages are self-contained, so each gets inline copies between the same markers; re-running
replaces them. To change the card: edit those two files, then re-run this here and on the templates.

The share row and then the card go last inside <main>, just above the footer. Story pages are the self-contained pages with a site header
(stories, not the home/About/search pages, which link assets/site.css and have the card or footer link already).
Skipped: the dashboards (a data tool gets only the menu link), the weird stat of the day (rebuilt in nba-analytics
every morning), redirect pages and the 404 page.
--share-only (added Nov 8, 2026) is for daily pages that get the share row but no subscribe card, like the weird stat of
the day. The page must already carry a <!-- share:start --> ... <!-- share:end --> block where the row should sit (placed
by hand, once); the tool leaves that block where it is and refreshes the share styles and script.
Never run this on the travel-analytics template: it builds shawnnafziger.com's copy, which has no Tall Order links.
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
FORM_ACTION = "https://buttondown.com/api/emails/embed-subscribe/tallorderdigital"

_css = (ROOT / "assets/site.css").read_text()
CSS = re.search(r"/\* subscribe:start \*/.*?/\* subscribe:end \*/", _css, re.S).group(0)
# Story pages don't all carry the site's .sr-only helper, so the card brings a scoped copy, and spacing for its spot.
CSS = CSS.replace("/* subscribe:end */",
                  ".subscribe .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }\n"
                  ".subscribe.sub-end { margin-top: 8px; width: 100%; }\n.subscribe, .subscribe * { box-sizing: border-box; }\n/* subscribe:end */")
JS = (ROOT / "assets/subscribe.js").read_text().strip().replace("</", "<\\/")
SHARE_CSS = re.search(r"/\* share:start \*/.*?/\* share:end \*/", _css, re.S).group(0)
SHARE_JS = (ROOT / "assets/share.js").read_text().strip().replace("</", "<\\/")
SHARE_HTML = '''  <!-- share:start -->
  <div class="share-row">
    <p class="share-ask">Know someone who'd like this?</p>
    <button type="button" class="share-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>Share this story</button>
    <p class="share-msg" role="status" hidden></p>
  </div>
  <!-- share:end -->
'''
SHARE_TOP_HTML = ('\n  <!-- share-top:start --><p class="share-top"><button type="button" class="share-btn">'
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" '
    'aria-hidden="true"><path d="M12 3v12"/><path d="M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>'
    'Share</button><span class="share-msg" role="status" hidden></span></p><!-- share-top:end -->')
SHARE_TOP_RE = re.compile(r"\n?[ \t]*<!-- share-top:start -->.*?<!-- share-top:end -->", re.S)
# Where the small top Share button goes (added Nov 8, 2026): on its own line right after the first line under the
# headline that says who and when (byline), or the line a page's script fills with dates (meta, status; scripts rewrite
# those, so never inside them). Pages with none of them get it after the intro paragraph (dek).
TOP_AFTER = [r'<p class="byline"', r'<p class="meta"', r'<p class="status"', r'<p class="dek"']
END_OPEN = '  <!-- story-end:start --><div class="story-end">\n'
END_CLOSE = '  </div><!-- story-end:end -->\n'
END_OPEN_RE = re.compile(r"[ \t]*<!-- story-end:start --><div class=\"story-end\">\n?")
END_CLOSE_RE = re.compile(r"[ \t]*</div><!-- story-end:end -->\n?")
SHARE_CSS_RE = re.compile(r"/\* share:start \*/.*?/\* share:end \*/\n?", re.S)
SHARE_HTML_RE = re.compile(r"[ \t]*<!-- share:start -->.*?<!-- share:end -->\n?", re.S)
SHARE_JS_RE = re.compile(r"<script>\s*/\* share:start \*/.*?/\* share:end \*/\s*</script>\n?", re.S)

CSS_RE = re.compile(r"/\* subscribe:start \*/.*?/\* subscribe:end \*/\n?", re.S)
HTML_RE = re.compile(r"[ \t]*<!-- subscribe:start -->.*?<!-- subscribe:end -->\n?", re.S)
JS_RE = re.compile(r"<script>\s*/\* subscribe:start \*/.*?/\* subscribe:end \*/\s*</script>\n?", re.S)
FOOT_RE = re.compile(r'[ \t]*<p class="sub-foot">.*?</p>\n?', re.S)


def card(root):
    return f'''  <!-- subscribe:start -->
  <section class="subscribe sub-end" id="subscribe" aria-labelledby="sub-h">
    <p class="kicker">The weekly email</p>
    <h2 id="sub-h">Get each new story by email</h2>
    <p class="sub-dek">One email a week with the newest stories and what they found. Unsubscribe anytime.</p>
    <form class="sub-form" action="{FORM_ACTION}" method="post" target="_blank">
      <label for="sub-email" class="sr-only">Email address</label>
      <input id="sub-email" type="email" name="email" required autocomplete="email" placeholder="you@example.com">
      <input type="hidden" name="embed" value="1">
      <input type="hidden" name="metadata__signup-page" value="">
      <button type="submit">Subscribe</button>
    </form>
    <p class="sub-done" role="status" hidden>Almost done: check your inbox for a confirmation email.</p>
    <p class="sub-note">Sent with Buttondown. Your address is used only for this email (<a href="{root}about/#privacy">privacy</a>).</p>
  </section>
  <!-- subscribe:end -->
'''


def apply_share_only(html, path):
    if not SHARE_HTML_RE.search(html):
        raise SystemExit(f"{path}: --share-only needs a <!-- share:start --> ... <!-- share:end --> block where the row should sit")
    head_end = html.index("</head>")
    head = SHARE_CSS_RE.sub("", html[:head_end])
    i = head.rindex("</style>")
    html = head[:i] + SHARE_CSS + "\n" + head[i:] + html[head_end:]
    html = SHARE_JS_RE.sub("", html)
    tag = "<script>\n/* share:start */\n" + SHARE_JS + "\n/* share:end */\n</script>\n"
    j = html.find("<!-- Analytics")
    if j < 0:
        j = html.rindex("</body>")
    return html[:j] + tag + html[j:]


def apply(html, path):
    rel = str(path).replace("\\", "/")
    if 'class="site-bar' not in html or "<footer" not in html or "</main>" not in html:
        return None
    if re.search(r'href="[^"]*assets/site\.css"', html) or "/dashboards/" in rel or "/weird-stat/" in rel or 'http-equiv="refresh"' in html:
        return None
    # The path to the site root comes from the logo link, as in tools/apply-header.py (the menu has had no
    # "Stories" link since Nov 8, 2026). "./" (a page at the site root) becomes "".
    m = re.search(r'<a class="brand" href="([^"]*)"', html)
    if not m:
        raise SystemExit(f"{path}: can't find the logo link (class=\"brand\") to work out the path to the site root")
    root = "" if m.group(1) in ("./", ".") else m.group(1)

    # 1. The share row, then the card: last things inside the <main> that comes before the footer. On stories whose
    #    sections carry their own side margins (class "wrap", the travel stories), <main> is full width, so the two go
    #    inside a centered column (.story-end, added Nov 8, 2026) instead of running to the edge of the screen.
    # The button keeps the wording a page already has (the Almanac says "Share this page", Nov 9, 2026);
    # new pages get "Share this story".
    old = SHARE_HTML_RE.search(html)
    label = re.search(r"</svg>([^<]+)</button>", old.group(0)) if old else None
    share = SHARE_HTML.replace("</svg>Share this story</button>", "</svg>" + label.group(1) + "</button>") if label else SHARE_HTML
    html = SHARE_HTML_RE.sub("", HTML_RE.sub("", END_OPEN_RE.sub("", END_CLOSE_RE.sub("", html))))
    foot = html.index("<footer")
    end = html.rindex("</main>", 0, foot)
    body = share + card(root)
    if re.search(r'<section class="(?:[^"]*\s)?wrap(?:\s[^"]*)?"', html[html.index("<body"):end][html[html.index("<body"):end].index("<main"):]):
        body = END_OPEN + body + END_CLOSE
    html = html[:end] + body + html[end:]

    # 1b. The small Share button under the intro.
    html = SHARE_TOP_RE.sub("", html)
    start = html.index("<body")
    start += html[start:].index("<main")
    for pat in TOP_AFTER:
        mm = re.compile(pat).search(html, start)
        if mm:
            close = html.index("</p>", mm.end()) + len("</p>")
            html = html[:close] + SHARE_TOP_HTML + html[close:]
            break

    # 2. Footer link, before the copyright line.
    html = FOOT_RE.sub("", html)
    foot = html.index("<footer")
    c = html.find("<p>©", foot)
    if c >= 0:
        html = html[:c] + f'<p class="sub-foot"><a href="{root}subscribe/">Get the weekly email</a></p>\n  ' + html[c:]
    else:
        # No "<p>©" line (the Almanac's footer is spans): last line of the footer, on a line of its own.
        c = html.index("</footer>", foot)
        c = html.rindex("\n", 0, c) + 1
        html = html[:c] + f'  <p class="sub-foot"><a href="{root}subscribe/">Get the weekly email</a></p>\n' + html[c:]

    # 3. Styles, inside the page's last <style>.
    head_end = html.index("</head>")
    head = SHARE_CSS_RE.sub("", CSS_RE.sub("", html[:head_end]))
    i = head.rindex("</style>")
    html = head[:i] + CSS + "\n" + SHARE_CSS + "\n" + head[i:] + html[head_end:]

    # 4. Script, before the analytics block (or </body>).
    html = SHARE_JS_RE.sub("", JS_RE.sub("", html))
    tag = ("<script>\n/* subscribe:start */\n" + JS + "\n/* subscribe:end */\n</script>\n"
           "<script>\n/* share:start */\n" + SHARE_JS + "\n/* share:end */\n</script>\n")
    j = html.find("<!-- Analytics")
    if j < 0:
        j = html.rindex("</body>")
    html = html[:j] + tag + html[j:]
    return html


def main(argv):
    check = "--check" in argv
    share_only = "--share-only" in argv
    if share_only and not [a for a in argv if not a.startswith("--")]:
        raise SystemExit("--share-only needs the page paths")
    files = [pathlib.Path(a) for a in argv if not a.startswith("--")]
    if not files:
        files = sorted(p for p in ROOT.rglob("index.html") if ".git" not in p.parts)
    stale = 0
    for f in files:
        old = f.read_text()
        new = (apply_share_only if share_only else apply)(old, f.resolve() if not files else f)
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
