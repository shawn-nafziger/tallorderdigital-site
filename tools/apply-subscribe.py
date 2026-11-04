"""Puts the weekly-email signup card at the end of story pages, plus a "Get the weekly email" footer link.
Claude runs this; Shawn doesn't need to.

    python3 tools/apply-subscribe.py                       # every story page in this repo
    python3 tools/apply-subscribe.py path/to/template.html ...   # story templates in the data repos
    python3 tools/apply-subscribe.py --check               # report pages that are out of date, change nothing

Master copies: the ".subscribe" rules between "subscribe:start" / "subscribe:end" in assets/site.css, and
assets/subscribe.js. Story pages are self-contained, so each gets inline copies between the same markers; re-running
replaces them. To change the card: edit those two files, then re-run this here and on the templates.

The card goes last inside <main>, just above the footer. Story pages are the self-contained pages with a site header
(stories, not the home/About/search pages, which link assets/site.css and have the card or footer link already).
Skipped: the dashboards (a data tool gets only the menu link), redirect pages and the 404 page.
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


def apply(html, path):
    rel = str(path).replace("\\", "/")
    if 'class="site-bar' not in html or "<footer" not in html or "</main>" not in html:
        return None
    if re.search(r'href="[^"]*assets/site\.css"', html) or "/dashboards/" in rel or 'http-equiv="refresh"' in html:
        return None
    m = re.search(r'<a href="([^"]*)#stories"[^>]*>Stories</a>', html)
    if not m:
        raise SystemExit(f"{path}: can't find the Stories link to work out the path to the site root")
    root = m.group(1)

    # 1. The card: last thing inside the <main> that comes before the footer.
    html = HTML_RE.sub("", html)
    foot = html.index("<footer")
    end = html.rindex("</main>", 0, foot)
    html = html[:end] + card(root) + html[end:]

    # 2. Footer link, before the copyright line.
    html = FOOT_RE.sub("", html)
    foot = html.index("<footer")
    c = html.find("<p>©", foot)
    if c < 0:
        c = html.index("</footer>", foot)
    html = html[:c] + f'<p class="sub-foot"><a href="{root}subscribe/">Get the weekly email</a></p>\n  ' + html[c:]

    # 3. Styles, inside the page's last <style>.
    head_end = html.index("</head>")
    head = CSS_RE.sub("", html[:head_end])
    i = head.rindex("</style>")
    html = head[:i] + CSS + "\n" + head[i:] + html[head_end:]

    # 4. Script, before the analytics block (or </body>).
    html = JS_RE.sub("", html)
    tag = "<script>\n/* subscribe:start */\n" + JS + "\n/* subscribe:end */\n</script>\n"
    j = html.find("<!-- Analytics")
    if j < 0:
        j = html.rindex("</body>")
    html = html[:j] + tag + html[j:]
    return html


def main(argv):
    check = "--check" in argv
    files = [pathlib.Path(a) for a in argv if not a.startswith("--")]
    if not files:
        files = sorted(p for p in ROOT.rglob("index.html") if ".git" not in p.parts)
    stale = 0
    for f in files:
        old = f.read_text()
        new = apply(old, f.resolve() if not files else f)
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
