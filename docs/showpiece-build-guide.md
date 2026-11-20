# How to build a showpiece

Learned on "A year of daylight" (Nov 16, 2026) and extended by the aurora, moon, tornado and hurricane builds. **This file is the master copy** (moved here from the Tall Order Digital project on Nov 19, 2026, so every repo's sessions can read it); copies in Claude Projects are reference only.

A showpiece is one big interactive picture that rewards exploring, with a short story around it. It is visual first: search demand is a bonus, not the reason. Backlog and ranking: `docs/showpiece-backlog.md` (also the "Showpieces" tab of the Story Pipeline sheet).

## Rules that still apply
- This repo is the source of truth. Read `CLAUDE.md` (the "Showpieces" paragraph), `docs/brand-decisions.md` → Showpieces and `docs/seo-standards.md` before starting.
- Look and type are free (Shawn: "no rules beyond data-viz best practice"), but the page keeps the site shell: header (`tools/apply-header.py`), share row and subscribe card (`tools/apply-subscribe.py`), analytics block, copyright footer, data credit (NOAA, USGS and so on), structured data, sitemap.
- Address: `<topic>/<slug>/`, slug = name + one or two plain keywords. Card goes on the topic page with `data-series="showpiece"`.
- Every claim honest: sample sizes, ranges, and a methods note when the data has known biases.
- D3 comes from the site: `../../assets/vendor/d3-7.9.0.min.js`, not cdnjs.

## Getting the data
- The workspace's network is an allowlist. If a data host is refused (for example spc.noaa.gov), Shawn can add it on claude.ai under **Settings → Capabilities** (allowed domains), and it works right away in the same session (Nov 16, 2026, tornado piece). Ask him for that before falling back to mirrors: the GitHub mirror of SPC's file was missing three years and a few hundred revised rows.
- Allowed so far: `www.spc.noaa.gov`.
- Another route when the shell is blocked (aurora piece): open the file in the built-in browser pane (Shawn approves the site), do the heavy lifting in the page with JavaScript, and return only a compact result (for example, 3,636 storms encoded in 11 KB). Check the transcription with a checksum.
- **Live feeds:** before promising "live", fetch the feed from a page on tallorderdigital.com in the browser pane. NOAA SWPC's JSON allows cross-site requests (checked Nov 16, 2026). Live pages need a visible fallback when the feed is down.

## The pattern that worked
1. **Story first, in five steps.** A step card under the controls ("1 of 5", Back / Next pill under the paragraph, not above it). Each step changes the picture and asks one question as its heading.
2. **Answer-first lead paragraph** with real numbers, the same for every reader (not tied to the default place). The step cards change with the reader's choices; the lead does not.
3. **All step text in the HTML**, not only written by script, so search engines read it.
4. **A still image** (WebP) of the default view, sized like the chart, which the live chart replaces once it draws. Plus a 1200×630 `share.png`.
5. **A key-facts table** and a month-by-month table in the HTML, computed offline by a small Python script (`stats.py`) and pasted in as fragments.
6. **Controls:** a searchable place picker (accent-insensitive), a mode toggle, a slider for "anywhere". Hemisphere and edge cases (polar night, one-event days, windows that cut a run in half) need explicit handling: test the extremes.
7. **Dark-only pages:** fix the shell tokens to the dark palette and hide `.theme-toggle` on that page.
8. **Big datasets inline** (tornado piece, 73,000 tracks): pack columns as typed arrays, gzip and base64 them into a `<script type="application/octet-stream">`, and decode with `DecompressionStream`. That came to about 600 KB; the still image covers the wait.
9. **Tooltips everywhere a reader might point** (Shawn, Nov 16, 2026: "keep the hover/tooltip features in mind"). Every mark in the main picture and every secondary chart gets one.
   - **Hover on desktop, tap on phones.** Phones have no hover: a tap without a drag shows the tooltip, and a tap elsewhere hides it. Use `pointerType` to tell a mouse from a finger, and don't let a drag (rotating a globe, scrubbing) count as a tap.
   - **On touch, reading never moves the picture.** If a click on the picture changes the view (drops a pin, zooms), a tap first shows what's under the finger in a tooltip that stays put, with a button for the view change ("Storms within 50 miles of this spot"; hurricane piece). Give fingers a wider reach than the mouse (about 22 px vs 12).
   - **Keep tooltips inside the picture.** Flip them left of the pointer near the right edge and above it near the bottom, measured after the content is set.
   - **Highlight what's being read**: outline the hovered bar, draw a line along the hovered track or streak. Hovering or focusing a list item (the "strongest storms" chips) highlights its mark too.
   - **Say more than the axis does.** Give the exact value, the date or time in the place's own time zone, what it means for the reader's chosen place (the storm's strength within 50 miles of the place; "1.3 short of the Kp South Bend needs"), and a familiar reference (the nearest listed city, a place at the same latitude).
   - **Hovering the reader's own pin** should describe their place.
   - **Hide tooltips whenever the picture redraws** (step change, filter change), so a stale one never sits over a new view.
   - **Mention it in the step text** ("hover or tap anywhere for the odds there").
10. **Filters mean the same thing as the numbers next to them** (hurricane piece). With a place chosen, a strength filter ("at least Cat 5") applies to the strength *at the place*, not the storm's peak elsewhere: Florida at 5 shows 4 storms, not 16. The panel label, the list under it, the timeline and the step text all say which measure they use.
11. **The step card follows the reader.** When the reader's own choice changes what the picture is about (picking a place), move the card to the step that describes it ("How many have passed near you?") without resetting their other choices; when they clear it, go back to step 1.
12. **A legend can be a control.** Clickable legend keys that set the same filter as the buttons, fading the keys that are filtered out; tapping the chosen key again resets.
13. **Don't compete with our own stories for a phrase.** Check the topic pages and `docs/seo-plan.md` for a story that already owns a search phrase; give the showpiece's headings its own phrase and link to the story instead (Nov 16, 2026: the daylight showpiece handed "earliest sunset" to `weather/shortest-day-of-the-year/`).

## Testing
- Headless Chrome via Playwright (`/usr/bin/google-chrome`), with D3 and fonts vendored from npm (`@fontsource`) because the shell can't reach CDNs. The built-in browser pane can't open the artifact preview or localhost.
- Check desktop and phone widths, every step, the extreme places, no script errors, labels not clipped or overlapping.
- **Test tooltips both ways:** `mouse.move` at desktop width, and `touchscreen.tap` in a `has_touch`, `is_mobile` context at phone width. Scroll the element into view first, because events outside the viewport don't fire. Include points near the right and bottom edges.
- Cross-check computed numbers against an independent source (daylight: the Astral library and the published solstice time; aurora: magnetic latitudes against aacgmv2, MLT within about 0.2 h; hurricanes: "within 50 miles" counts against a geodesic calculation for four cities).
- Publish a private artifact preview for Shawn before the PR. The artifact sandbox blocks fetches to other sites, so a live-feed page needs a frozen snapshot and a banner saying so. The preview can't load the site's own `assets/vendor/` D3, so publish a preview copy whose script tag points at cdnjs (allowed there); the PR keeps the vendor path.

## Shipping
- One PR per showpiece; run `build-hubs.js`, `search-index.js`, `structured-data.js`, `sitemap.js` in that order.
- `gh pr create` fails (GraphQL blocked): open PRs with `gh api repos/shawn-nafziger/tallorderdigital-site/pulls -f title=… -f head=… -f base=main -f body=…` (add `-F draft=true` for a piece with a future publish date).
- Generated files (`search/index.html`, `sitemap.xml`, topic pages) conflict when two showpiece PRs are open at once: rebuild them from `main` rather than hand-merging. After Shawn merges, never push more to the old branch: start a new branch from `main`.
- After publishing: Rich Results Test, request indexing in Search Console.
