# Showpiece backlog

Drafted November 16, 2026; re-ranked the same day. Owner: Shawn Nafziger. **This file is the master copy** (moved here from the Tall Order Digital project on Nov 19, 2026); the live status of each idea is in the "Showpieces" tab of the Story Pipeline sheet. How to build one: `docs/showpiece-build-guide.md`.

**Status (Nov 19, 2026):** "A year of daylight, every minute of it" (`weather/year-of-daylight-hours/`) published Nov 16. Ideas #1–#5 are being built, each in its own session (started Nov 16). Nothing else gets built until Shawn picks it.

A **showpiece** is one big interactive visual with its own look, built with no rules beyond data-viz best practice (see `docs/brand-decisions.md` → Showpieces). **Its job is to show off a remarkable visual, not to tell a long data story or chase a keyword** (Shawn, Nov 16, 2026). Search traffic is a welcome bonus: each showpiece still follows `docs/seo-standards.md` and gets a keyword-checked title, but an idea isn't ranked down for having little search demand. A `/featured/` collection page waits until there are two or three.

There are 23 ideas below, scored and ranked. Keyword data came from Ubersuggest (US) on Nov 16, 2026, the day before the subscription ended; the three newest ideas weren't checked. Three overlap the regular pipeline (T37 national debt, T40 Powerball, T72 permanent DST): build each as either the story or the showpiece, not both.

## What makes a good showpiece

1. **One picture people stop for.** It works at a glance and rewards ten minutes of exploring.
2. **Interaction answers "what about me?"** Your city, your sky, your team, your dollar.
3. **It feels alive:** computed in the browser, or fed by a public feed or a daily build.
4. **Free, public data.** US government data (NOAA, USGS, BLS, Census, Treasury) is ideal. NBA data waits on the open data-terms item.
5. **Search demand is a bonus**, not a requirement.

## How ideas were scored

Each idea gets 1–5 on seven criteria, weighted into a score out of 100:

| Criterion | Weight | How it was judged |
|---|---|---|
| W: wow | **40%** | Would people share the picture on its own? Is it unlike anything else on the site? |
| L: data and license | 15% | 5 = public domain and ready to pull |
| A: alive | 10% | 5 = updates itself daily or faster, or is computed live |
| E: effort | 10% | 5 = reuses existing code (the daylight piece, the Almanac) |
| F: fit | 10% | Fits a topic page and sits well with other pieces (weather and sky score highest) |
| D: search demand | 10% | US monthly volume for the best-fitting phrases (5 = 20,000+ … 1 = little or no data) |
| K: difficulty | 5% | Ubersuggest SEO difficulty of the realistic phrases (5 = 25 or less … 1 = over 50) |

Volumes are averages: seasonal phrases spike far above them. Navigational phrases (a site name plus a topic) won't come to us and appear only for scale.

## Ranked backlog

| # | Score | Idea | The picture and interaction | Data | Search bonus (US/month · difficulty) | Best timing |
|---|---|---|---|---|---|---|
| 1 | 96 | **Will you see the aurora tonight?** (Weather) | A live map of NOAA's 30-minute aurora forecast oval glowing over a night-side globe, with the line where it's visible on the horizon. Enter your city for tonight's chance. Below it, every geomagnetic storm since 1932 by how far south the aurora reached. | NOAA Space Weather Prediction Center JSON (Kp index, OVATION model), public domain, every few minutes. The feed allows browser requests (checked Nov 16, 2026). | northern lights forecast (74,000 · 48); northern lights forecast tonight (27,100 · 15); for tonight (18,100 · 11); alaska (9,900 · 8); fairbanks (5,400 · 28) | Now: long nights, and the solar cycle is still near its peak. |
| 2 | 90 | **Is tornado alley moving?** (Weather) | Every recorded US tornado track since 1950 as light streaks on a dark map, animated decade by decade as the center of activity drifts east. Click a county for its history. | NOAA Storm Prediction Center database; public domain. **Methods note required:** reporting and rating scales changed over time, so the shift claim needs a strong-tornado-only check. | tornado alley (90,500 · 52); tornado alley map (18,100 · 31); new tornado alley (6,600 · 26); tornado alley shift (5,400 · 31) | February–March. |
| 3 | 89 | **A year of moonlight** (Weather / sky) | The daylight piece's twin: moon phase, moonrise and moonset for every night of the year, drawn as a field of moons. Full-moon names, eclipses and supermoons marked; any place. | Computed (Meeus lunar equations); check against US Naval Observatory times. | moon phase calendar (49,500 · 39); moon phase calendar 2027 (90 · 20, rises in December) | Mid-December. |
| 4 | 88 | **Every hurricane since 1851** (Weather) | Every Atlantic and Pacific storm track on one dark map, colored by strength. Pick a state or year; "storms that passed within 50 miles of you". | NOAA HURDAT2; public domain. | hawaii hurricane tracks (14,800 · 28); hurricane tracks map (1,600 · 45); hurricane tracks last 50 years (260 · 31) | May. |
| 5 | 88 | **Every day since 1900 in your city** (Weather) | A wall, one row per year and one cell per day, colored by how far each day's high was from normal. The newest day fills in each morning. | Weather Almanac station data; reuses its build. | temperature history (1,300 · 67); city phrases 90–720 · 26–51 | Any time. Every Almanac city could link to it. |
| 6 | 88 | **The night sky right now** (Weather / sky) | A full-screen star map for your city at this minute: stars, planets and the moon in their real places, the Milky Way, constellation lines on hover. Scrub the clock through tonight, or jump to your birthday. | Computed: Yale Bright Star or Hipparcos catalog (public domain) plus planet positions (Meeus / VSOP87). | Not checked. | Any time. Sky series with #1, #3, #7. |
| 7 | 88 | **A year of light, the whole planet** (Weather / sky) | The daylight showpiece's picture for every latitude at once: pole to pole on one axis, the year on the other, colored by hours of daylight. The polar nights and midnight suns become two dark and bright lobes that trade places. Drag a line to pick your latitude. | Computed; reuses the daylight code almost entirely. | Not checked. | Quick win; could launch with the moon. |
| 8 | 83 | **The sun's path over your house** (Weather / sky) | A sun-path diagram for any place: the sun's arc on the solstices and today, plus hourly analemmas. Drag the date and watch the arc swing. | Computed; reuses the daylight code. | sun path (2,400 · 30); sun path over my house (1,000 · 30) | March. |
| 9 | 83 | **The wind right now** (Weather) | Thousands of moving streaks tracing today's winds across the US, faster and brighter where it blows hardest. Switch to the jet stream aloft. | NOAA GFS or HRRR model output (public domain), processed by a daily or hourly build in a data repo; the heaviest data work on the list. | Not checked. | Any time; most striking during big storms. |
| 10 | 82 | **What your dollar bought** (Data stories) | An inflation calculator built as a showpiece: a river of prices since 1913 (eggs, gas, rent, college, a movie ticket) behind the calculator. Refreshes monthly. | BLS CPI and average prices; public domain. | inflation calculator (550,000 · 18); cpi inflation calculator (27,100 · 10) | Any time. Absorbs T28 (egg prices) and the "Did your pay keep up?" draft. Biggest search bonus on the list. |
| 11 | 81 | **Every earthquake, live and since 1900** (Data stories / nature) | The last day of quakes pulsing on a globe, over every magnitude 5+ since 1900, which together draw the plate boundaries. | USGS feeds (live) and ComCat; public domain. | earthquake map (27,100 · 41); live earthquake map (6,600 · 26) | Any time. |
| 12 | 79 | **Where the clock and the sun disagree** (Weather / sky) | A map colored by how far clock noon is from the sun's noon, with and without daylight saving. Shows why Detroit's sunsets are late and why Indiana fought over time zones. | Computed, plus timezone-boundary-builder boundaries (ODbL: needs attribution). | time zone map (368,000 · 41); time zone map indiana (6,600 · 41); tennessee (5,400 · 32); florida (4,400 · 28) | Any time; spikes at the clock changes. |
| 13 | 78 | **One in 292 million** (Data stories) | A deep zoom: start on one winning Powerball ticket and zoom out until 292 million dots fill the screen. | Computed from the game's rules. | powerball odds to win (18,100 · 10; 110,000 in Sept. 2025) | Replaces pipeline T40; launch during a big jackpot. |
| 14 | 77 | **The national debt, live** (Data stories) | A live counter plus scale: per person, against GDP, over time. Nonpartisan, facts only. | Treasury "Debt to the Penny" (daily). | national debt clock (40,500 · 25) | Replaces pipeline T37. |
| 15 | 77 | **The all-time scoring race** (NBA) | Every player who led the all-time list, as a race through time; active players update nightly. | NBA.com statistics. **Waits on the NBA data terms.** | nba all time scoring list (110,000 · 50) | When the data terms are settled. |
| 16 | 76 | **Every shot of the season** (NBA) | A league-wide shot cloud that reshapes by team, player or quarter, updated each morning. | NBA.com shot data. **Waits on the data terms.** | nba shot chart (390 · 37) | The NBA side's signature visual. |
| 17 | 75 | **One day of US flights** (Travel) | Every domestic flight of one day as animated arcs; scrub the clock and watch the country light up. | BTS on-time data, already pulled for the flight-delays story. | Searchers want to track one flight, the wrong intent. | Share-first. |
| 18 | 73 | **Every rainy day** (Weather) | A city-by-city calendar wall of every day with rain or snow. | NOAA daily precipitation via the Almanac. | rainiest cities in america (2,900 · 25) | Spring. |
| 19 | 73 | **Every comeback** (NBA) | Every game's score margin as faint lines, the biggest blown leads lit up. | NBA.com play-by-play. **Waits on the data terms.** | biggest comeback nba history (5,400 · 29) | Mid-season. |
| 20 | 70 | **America filling in, 1790–2020** (Data stories) | Every county appearing census by census as the country fills westward. | Census counts; NHGIS boundaries need their citation. | us population by year (3,600 · 37) | Overlaps T66. |
| 21 | 69 | **Every launch since Sputnik** (Data stories) | Every orbital launch as a dot by year and site; the SpaceX era explodes off the chart. | GCAT (CC-BY, needs credit); Launch Library for upcoming launches. | space x rocket launch schedule (9,900 · 8) | Any time. |
| 22 | 68 | **Your sunsets with permanent daylight time** (Weather / sky) | Sunrise and sunset for every city under permanent standard vs. permanent daylight time. | Computed. | permanent daylight saving time (2,400 · 64) | Better as a view inside the daylight showpiece (pipeline T72). |
| 23 | 68 | **How names rise and fall** (Data stories) | Type a name; see its popularity since 1880 against every other name. | Social Security Administration; public domain. | No data returned (a data gap, not proof of no demand). | Any time. |

**Considered and left out:** a wildfire map. People searching it need official live safety information during an emergency, and a showpiece shouldn't compete for that.

## Recommendations

- **A sky series for `/featured/`:** daylight (live), then the aurora, the moon (#3) and the whole-planet light map (#7). The last two reuse the daylight code, so they're quick, and four sky pieces make a strong collection.
- **The most spectacular, given more effort:** tornado tracks (#2, February–March), hurricanes (#4, May), the live wind map (#9) and every day since 1900 (#5).
- **Biggest search bonus:** inflation (#10), if traffic ever becomes the goal for one of them.
- **Merge, don't duplicate:** the debt (#14) and Powerball (#13) showpieces replace pipeline T37 and T40; permanent DST (#22) becomes a view in the daylight piece.

## Notes for building

- **Live data on a static site:** showpieces get live data by (a) computing in the browser (moon, sky, sun path, time zones), (b) fetching a public feed from the browser, only if the feed allows it (check before promising "live"), or (c) a daily build in a data repo, like the Almanac.
- **Every showpiece still follows `docs/seo-standards.md`:** an answer-first sentence, step text and key-facts tables in the HTML, a still image, and a keyword-checked title, even when search isn't the point.
- **Credit lines:** ODbL (time-zone boundaries) and CC-BY (GCAT) require visible attribution.
