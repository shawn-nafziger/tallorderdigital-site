/*
 * Puts the home page story cards in date order, newest first, using the date in each card's kicker
 * ("NBA · Nov 3, 2026"). Cards from the same day keep their current order. Claude runs this; Shawn doesn't need to.
 *
 *   node tools/sort-home.js           (reorder the cards in index.html)
 *   node tools/sort-home.js --check   (exit 1 if they're out of order; changes nothing)
 *
 * Run it in the same PR as any new home card (then node tools/search-index.js, which reads the cards in this order).
 * A card without a date in its kicker stops the script, so nothing lands in a random spot.
 */
const fs = require("fs");
const path = require("path");

const FILE = path.join(path.resolve(__dirname, ".."), "index.html");
const html = fs.readFileSync(FILE, "utf8");
const CARD = /<a class="story"[^>]*>[\s\S]*?<\/a>(?=\s*(?:<a class="story"|<p class="soon"|<\/section>))/g;

const cards = [...html.matchAll(CARD)];
if (!cards.length) throw new Error("sort-home: no story cards found in index.html");
const start = cards[0].index, last = cards[cards.length - 1], end = last.index + last[0].length;
for (let i = 0; i < cards.length - 1; i++) {
  const gapText = html.slice(cards[i].index + cards[i][0].length, cards[i + 1].index);
  if (/\S/.test(gapText)) throw new Error("sort-home: something other than story cards sits between the cards; not reordering");
}
const gap = html.slice(cards[0].index + cards[0][0].length, cards.length > 1 ? cards[1].index : end) || "\n    ";

const dated = cards.map((m, i) => {
  const kicker = (m[0].match(/<p class="kicker">([\s\S]*?)<\/p>/) || [])[1] || "";
  const d = kicker.match(/([A-Z][a-z]{2}) (\d{1,2}), (\d{4})/);
  const href = (m[0].match(/href="([^"]+)"/) || [])[1];
  if (!d) throw new Error(`sort-home: no date in the kicker of the card for ${href}`);
  return { html: m[0], t: Date.parse(`${d[1]} ${d[2]}, ${d[3]}`), i, href, date: d[0] };
});
const sorted = [...dated].sort((a, b) => b.t - a.t || a.i - b.i);
const out = html.slice(0, start) + sorted.map((c) => c.html).join(gap) + html.slice(end);

if (process.argv.includes("--check")) {
  if (out !== html) { console.log("home story cards are out of date order: run node tools/sort-home.js"); process.exit(1); }
  console.log(`home story cards are in order (${cards.length})`);
} else {
  fs.writeFileSync(FILE, out);
  console.log(out === html ? "already in order" : "reordered:");
  if (out !== html) sorted.forEach((c) => console.log("  " + c.date.padEnd(13) + c.href));
}
