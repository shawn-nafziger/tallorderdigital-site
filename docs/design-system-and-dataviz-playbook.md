# Tall Order Digital: Design System and Data Viz Playbook

*The shared design rules for everything Tall Order Digital publishes: the website, weather and NBA stories, the live weather page, and Power BI dashboards. Read it before designing any page, chart, story or Power BI visual. Adopted October 29, 2026. Owner: Shawn Nafziger.*

*Kept in the Claude Projects "Weather intelligence", "Tall Order Digital" and "NBA analytics". The master copy is in "Weather intelligence"; when it changes, re-upload it to the other two.*

---

## 0. Why these colors (brand rationale, in Shawn's words)

**Primary colors: ink on paper.** We're moving away from the black-on-white of most interfaces, toward a dark brown "ink" on off-white "paper" backgrounds. Why:
1. **A human touch.** These natural colors feel handcrafted. They reflect the human judgment needed to get the most out of emerging technologies.
2. **A quiet base that lets the data speak.** A neutral foundation means other colors appear only where they highlight a key insight or decision point.
3. **Easier on the eyes.** Warm off-white has less glare than stark white, which makes long reading and dense charts more comfortable. (A comfort benefit, not a measured one: research on background color and reading speed is mixed, so don't claim it's "proven".)

**Secondary colors (teal, sky and orange)** fit the logo, and they:
1. work well for data visualization;
2. are friendlier to common types of color blindness (blue/teal against orange is the classic color-blind-safe pairing);
3. make insights and decision points extremely clear, **as long as they're used sparingly**. The highlight color is reserved for the signal, never decoration.

**Checked, not just asserted:**
- Ink on Paper is 15.7:1 contrast, so the warmer look costs no readability.
- In color-blind simulations (protanopia, deuteranopia, tritanopia), teal and orange stay far apart (ΔE 67-86), and Sky vs Orange stays at ΔE 81 or more. Signal, edge and noise also stay distinct (ΔE ≥ 20), because they differ in lightness as well as hue.
- **One exception:** Mint and Blush look nearly identical to people with deuteranopia, the most common type (ΔE 3.4). That's why the status tints must always carry an icon and a word.

## 1. Color palette

Shawn's palette (12 swatches, adopted Oct 29, 2026; Sky added the same day) is the base for the website and most data visualization. A few **derived** shades (marked †) fill roles the swatches can't fill safely, especially for dark mode. Every role below passed contrast and color-blind separation checks.

### Brand swatches

| Swatch | Hex | Name |
|---|---|---|
| Light neutral | `#F3F4EF` | Paper |
| Warm gray | `#DDDAD3` | Stone |
| Warm dark brown | `#4A403A` | Bark |
| Near-black | `#201914` | Ink |
| Light blue | `#7FC4D6` | Sky |
| Deep teal | `#0A3746` | Teal |
| Deepest teal | `#03222C` | Deep |
| Orange | `#F99A2B` | Orange |
| Burnt orange | `#B36000` | Burnt |
| Pale yellow | `#FFFCBF` | Butter |
| Pale mint | `#D2F4E0` | Mint |
| Pale pink | `#FFD6D6` | Blush |

### Tokens by role

| Role | Light mode | Dark mode | Notes |
|---|---|---|---|
| Page background | Paper `#F3F4EF` | Deep `#03222C` | Stone works as an alternate "paper" for bands and sections |
| Card / surface | `#FFFFFF`† | Teal `#0A3746` | |
| Primary text | Ink `#201914` (15.7:1) | Paper `#F3F4EF` (15:1) | |
| Secondary text | Bark `#4A403A` (9.1:1) | Stone `#DDDAD3` (11.9:1) | |
| Rules, gridlines, borders | Stone `#DDDAD3` | `#1E3A44`† | Recessive |
| **Signal** (the one thing that matters) | **Burnt `#B36000`** | **Orange `#F99A2B`** | Orange is too light on Paper for text or thin marks (1.96:1); Burnt carries the signal in light mode |
| **At the edge** | Orange `#F99A2B` | `#8F6230`† | |
| **Noise** (ordinary marks) | `#CDC9C1`† | `#3A5762`† | Slightly stronger than gridlines so dots don't vanish |
| **Comparison** series (lines, dots, labels) | Teal `#0A3746` | **Sky `#7FC4D6`** (8.5:1 on Deep, 6.5:1 on Teal) | |
| Bands and fills (normal range, shaded areas) | Sky at about 25-30% opacity | Sky at about 25-30% opacity | In light mode Sky is **fills only**: as text or thin lines it's too pale on Paper (1.8:1) |
| Brand accent (logo bar, headline highlights) | Orange `#F99A2B` | Orange `#F99A2B` | **Decided Oct 29, 2026:** the logo moves from `#E8912D` to `#F99A2B` |
| Warm side of a diverging scale | Burnt → Orange | Orange | |
| Cold side of a diverging scale | Teal → Sky | Sky | |
| Diverging midpoint ("normal") | Paper / Stone | `#1E3A44` | Never a hue at the midpoint |
| Status backgrounds | Butter (notable), Mint (normal / OK), Blush (alert, e.g. heat advisory) | Same hues at about 15% opacity on Deep | **UI state only, never a data encoding.** Always paired with an icon and a label: Mint and Blush are indistinguishable with deuteranopia |

### Color rules

1. **Color keys:** orange = the real signal; light orange = "at the edge"; gray = noise. The key words stay the same in both themes, even though the shades shift.
2. **Above / below normal** (temperature anomalies, a player vs league average) uses the **teal/sky ↔ orange diverging scale** with a neutral midpoint: below = blue, above = orange. Never a rainbow.
3. **Magnitude** (precipitation, counts, shot volume) uses a **single-hue sequential ramp**: Sky → Teal → Deep.
4. **Color follows meaning, never rank.** Filtering must not repaint the remaining series.
5. **Text wears text colors.** Labels and values stay Ink/Bark (Paper/Stone in dark mode); a colored mark beside them carries the meaning.
6. **Every chart states its colors.** Each key goes on its own line, starting with the color word shown in that color.
7. **No color-only meaning.** Pair color with a label, position or icon; every chart also has a table view.
8. **Run the palette validator** on any new color combination before shipping it.
9. **Orange is earned.** If more than one or two things on a view are orange, the highlight stops working (Von Restorff, §5).
10. **NBA stories:** the old Game Overview colors (navy home, slate away, amber advantage) map to Teal / Sky for home and away and Burnt/Orange for the primary advantage. No team colors or logos.

### Rollout (not yet done; one PR set)
- Website: rewrite the `assets/site.css` tokens, then regenerate the stories (four NBA stories plus Phoenix After Dark) from their templates.
- Logo: `#E8912D` → `#F99A2B` in the logo kit (`assets/brand/`), the inline header and home-hero marks, the favicon and icons, and the `CLAUDE.md` notes in all three repos that call `#E8912D` "the logo orange".
- Power BI: a theme JSON built from these tokens (weather and NBA models).

## 2. Typography

Current (under review; Shawn revisits the website fonts on Nov 3, 2026):
- **Barlow Semi Condensed:** headlines, big numbers, logo.
- **IBM Plex Sans:** body text.
- **IBM Plex Mono:** data, labels, axes and timestamps (tabular figures).

Keep body text near 65 characters per line. Use one type scale per page.

## 3. Choosing the chart: start from the question

Pick the form by the **question**, then the data shape. The chart families (from the DataViz Clarity *Chart Chooser*) are **comparison, composition, distribution, chronology** and **cartography**. Each chart carries a risk profile: cognitive load, need for context, and risk of misleading.

### Weather questions → chart forms

| Question | Best forms | Notes |
|---|---|---|
| How unusual is today / yesterday? | **Strip / beeswarm** of every same-date value, with today highlighted; **percentile bar** | The core view. Show the record, normal range and today's position at once |
| How far to the record? | **Leapfrog-style dot + gap bar** (value → record or → normal) | Adapted from Playfair Data's Leapfrog chart |
| What's normal through the year? | **Band chart:** normal range shaded (Sky fill), record high/low as faint lines, this year as a line | The classic NYT-style weather chart |
| How has a month or season changed? | **Line or dots with a trend line**, plus the 95% range; **dumbbell** (then vs now) | Avoid zero-based bars for temperature |
| Warming pattern across months × decades | **Heatmap of anomalies** (difference from each month's normal), diverging colors | Keep months and years in time order; sort by value only for categories |
| Streaks: heat waves, dry spells, 90° nights | **Pilula (pill) chart:** one row per year, a pill for each consecutive run | Adapted from Playfair Data's Pilula chart. Ideal for "longest streak of 100°F days" |
| Every day at once | **Calendar or night grid** (one row per year, one cell per day) | The Phoenix After Dark hero view |
| Distribution by month or city | **Box plot, ridgeline, histogram** | A box plot hides two-peak shapes; check with a histogram |
| Comparing cities | **Small multiples, slope charts, dot plots** | Same scale in every panel |
| How accurate are forecasts by lead time? | **Error distribution by lead time** (box or strip); **dumbbell** forecast vs actual; bias by season (diverging bars) | 1-, 3-, 5-, 7- and 10-day leads |
| Why did forecasts miss? | **Root-cause chain:** decomposition tree (by city, season, lead time) → box plot (is it a slow tail?) → Pareto (which conditions?) | See §4 |
| Where? | **Dot map or hex map** of cities, colored by anomaly | Avoid choropleths of station data (stations are points, not areas) |
| Headline number | **A big number with context**: "88°F, 3rd warmest of 155" | Not a gauge |

### NBA questions → chart forms

| Question | Best forms | Notes |
|---|---|---|
| Where does a player or team shoot, and how well? | **Hex shot chart**: size = volume, color = above/below league average (diverging) | Needs enough shots per hex; follow the sample-size minimums in `methods.md` |
| How does one player compare with the league? | **Beeswarm** of all qualifying players, the player highlighted | Shows rank and spread at once |
| What changed from last season? | **Dumbbell** (last season → this season), colored signal / edge / noise | Ring = last season, per the NBA style rules |
| Which factor created the separation? | **Diverging bars** of the gap per factor; a **waterfall** if the parts add up | Lead with the answer ("Second chances created the separation") |
| Comparing teams | **Small multiples or dot plots**, same scale | Exclude the "Unknown / Unassigned" team from rank pools |
| How a game unfolded | **Line of the score margin over time**, key runs annotated | |

**Avoid everywhere:** gauges, pies and donuts (except a single simple share), 3-D, radar charts, dual axes, rainbow color scales, and stacked areas for anything people need to read precisely.

## 4. Reporting vs diagnosing (from *Charts for Root Cause Analysis*)

Most dashboards **report** a number ("forecast error rose to 4°F") and stop. A great one also answers **why**. Seven diagnostic charts, each answering one question:

| Chart | Question it answers | Watch out |
|---|---|---|
| Decomposition tree | Which part of the number is dragging it down? | The biggest branch is where to *start* looking, not the answer |
| Pareto | Which few causes actually matter? | 80/20 is a pattern, not a law |
| Waterfall | What moved the number from then to now? | Only honest when the parts add up |
| Heatmap | Which *combination* of two things is the problem? | Sort axes by value (time stays in time order) |
| Box plot | What is the average hiding? | Can hide two peaks; use a histogram when shape matters |
| Scatter | Do these two things really move together? | Correlation is never causation |
| Sankey | Where does the volume go, and where does it leak? | Too many nodes turns into spaghetti |

They work **in sequence**, each one narrowing what the next has to explain. Use this on the **forecast accuracy** pages (where errors grew, whether it's a tail, which conditions) and for NBA questions like "why did the offense drop?" (which lineups, which shot zones, which game situations).

## 5. UX principles applied (from Laws of UX, lawsofux.com)

| Law | What it means here |
|---|---|
| **Jakob's Law:** users expect your site to work like the ones they already use | Keep familiar conventions (weather: city name on top, big current temperature, an hourly strip, a daily list; NBA: box-score order, team abbreviations). Put the *new* things (context, ranks) inside that familiar frame |
| **Doherty Threshold:** responses under ~400 ms keep people engaged | Pages load instantly from pre-computed files; no spinners for the core view |
| **Aesthetic-Usability Effect:** attractive designs feel easier and more trustworthy | Visual polish is part of credibility for a data source |
| **Von Restorff Effect:** the item that stands out is remembered | Only the signal is orange. If everything is highlighted, nothing is |
| **Hick's Law / Choice Overload:** more choices mean slower decisions | One primary question per view; few filters; good defaults (the user's city, °F, the current season) |
| **Miller's Law / Cognitive Load / Chunking:** working memory is small | Group numbers into chunks (Now, Today, Tomorrow, Yesterday), at most about 5-7 items per group |
| **Law of Proximity / Common Region / Similarity:** layout implies relationships | A number sits next to its context (rank, normal, record); related numbers share a card; the same color means the same thing everywhere |
| **Peak-End Rule:** people remember the high point and the ending | Lead with the most striking fact; end each page with a clear takeaway or next question |
| **Serial Position Effect:** first and last items are remembered | The headline insight goes first; the "what it means" line goes last |
| **Tesler's Law:** some complexity can't be removed, only moved | Hide the statistics (ranges, methods) behind "How to read this" and "How this was measured", but never remove them |
| **Paradox of the Active User:** people skip instructions | Charts must explain themselves: titles that state the finding, direct labels, short notes |
| **Fitts's Law:** small, distant targets are slow to hit | Large tap targets on phones (at least 44 px), with filters close to what they control |
| **Mental Model:** people expect "high" to mean the day's maximum | Always label final / so far / forecast, and show "as of" times |
| **Goal-Gradient / Zeigarnik:** progress and unfinished tasks pull people back | "Day 6 of a 90° streak" and "on pace for a record" give a reason to return |

## 6. Page and dashboard standards

1. **Lead with the answer**: titles state the finding ("Phoenix nights stopped cooling off"), not the topic ("Temperature by year").
2. **Every number has context:** the normal or league average, the record, the rank with its count, and an *as of* time.
3. **Final / so far / forecast** are always labeled differently, in text and in style (forecast marks are hollow or dashed).
4. **Phone first:** single column, no sideways scrolling, large tap targets. Power BI embeds get an image version on phones.
5. **Both themes**, designed separately rather than auto-inverted.
6. **Accessibility:** color never carries meaning alone, every chart has a table view, keyboard focus is visible, and motion respects "reduce motion".
7. **Interaction:** hover/tap tooltips on every mark, with hit targets larger than the marks; filters in one row above the charts.
8. **Trust signals:** the data source on every page, a methods note, and clearly labeled modeled data. NBA pages keep the "not affiliated with the NBA" line.
9. **Sample sizes:** say how many years (or games, or shots) a figure is out of; mark uncertain changes as "at the edge" or "noise", not "signal".

## 7. Reference sources

- *Chart Chooser: 56 Charts Analysis*, DataViz Clarity (datavizclarity.com): chart families and per-chart risk profiles.
- Playfair Data chart examples: custom charts ([Leapfrog](https://playfairdata.com/introducing-leapfrog-charts-in-tableau/), [Pilula](https://playfairdata.com/introducing-pilula-aka-dr-mario-charts-in-tableau/)) and families for change over time, comparison, correlation, distribution, location, magnitude and part-to-whole.
- *Charts for Root Cause Analysis* (Shawn's reference doc): seven diagnostic charts and how they chain.
- [Laws of UX](https://lawsofux.com/): 30 principles; the most relevant are applied in §5.
