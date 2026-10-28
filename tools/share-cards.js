/*
 * Builds the 1200x630 link-preview images (LinkedIn, X, Slack, iMessage).
 * Claude runs this; Shawn doesn't need to.
 *
 *   node tools/share-cards.js
 *
 * Needs Playwright (Chromium) and these fonts installed locally: Barlow Semi
 * Condensed, IBM Plex Sans, IBM Plex Mono. Look at
 * the PNGs before committing: a missing font silently falls back.
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const C = { ink: "#1f2638", mist: "#f2f3f7", orange: "#e8912d", slateDark: "#8a97b7", sub: "#b4bfd6", rule: "#3a4560" };

const mark = (h) => `<svg width="${h}" height="${h}" viewBox="0 0 100 100">
  <rect x="6" y="6" width="18" height="88" rx="3" fill="${C.orange}"/>
  <rect x="30" y="50" width="18" height="44" rx="3" fill="${C.slateDark}"/>
  <rect x="54" y="60" width="18" height="34" rx="3" fill="${C.slateDark}"/>
  <rect x="78" y="70" width="18" height="24" rx="3" fill="${C.slateDark}"/></svg>`;

const lockup = (h) => `<div class="lockup" style="--h:${h}px">${mark(h)}<div class="wm"><b>Tall Order</b><span>Digital</span></div></div>`;

const base = `<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; background: ${C.ink}; color: ${C.mist}; font-family: "IBM Plex Sans"; overflow: hidden; }
  .lockup { display: flex; align-items: center; gap: calc(var(--h) * .24); }
  .wm { display: grid; font-family: "Barlow Semi Condensed"; text-transform: uppercase; line-height: 1; }
  .wm b { font-weight: 700; font-size: calc(var(--h) * .5); letter-spacing: .01em; }
  .wm span { font-weight: 600; font-size: calc(var(--h) * .17); letter-spacing: .52em; color: ${C.sub}; margin: calc(var(--h) * .05) 0 0 calc(var(--h) * .06); }
  .url { font: 500 22px "IBM Plex Mono"; color: ${C.sub}; letter-spacing: .02em; }
</style>`;

function storyCard(curve) {
  const W = 380, H = 250, P = 10;
  const x = (k) => P + (k - 1) * (W - 2 * P) / 40, y = (v) => H - 30 - v * (H - 60);
  const d = "M" + curve.map((r) => `${x(r.k).toFixed(1)},${y(r.net).toFixed(1)}`).join(" L");
  const hit = curve.find((r) => r.net >= 0.7);
  return `${base}<style>
    .wrap { position: absolute; inset: 64px 72px 56px; display: grid; grid-template-columns: 1fr ${W}px; grid-template-rows: 1fr auto; column-gap: 48px; }
    .kicker { font: 500 20px "IBM Plex Mono"; letter-spacing: .16em; text-transform: uppercase; color: ${C.orange}; margin-bottom: 22px; }
    h1 { font: 700 84px/.95 "Barlow Semi Condensed"; text-transform: uppercase; }
    .dek { font-size: 26px; line-height: 1.35; color: ${C.sub}; margin-top: 22px; }
    .chart { align-self: center; }
    .chart text { font-family: "IBM Plex Mono"; font-size: 17px; fill: ${C.sub}; }
    .foot { grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; border-top: 2px solid ${C.rule}; padding-top: 26px; }
  </style>
  <div class="wrap">
    <div><p class="kicker">NBA · Data story</p><h1>The Early-Season Mirage</h1>
      <p class="dek">When does a team's net rating start telling the truth? About game ${hit.k}.</p></div>
    <svg class="chart" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <line x1="${P}" x2="${W - P}" y1="${y(0.7)}" y2="${y(0.7)}" stroke="${C.rule}" stroke-width="2" stroke-dasharray="6 6"/>
      <text x="${W - P}" y="${y(0.7) - 12}" text-anchor="end">0.7 = good guide</text>
      <path d="${d}" fill="none" stroke="${C.mist}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="${x(hit.k)}" cy="${y(hit.net)}" r="10" fill="${C.orange}"/>
      <text x="${x(hit.k)}" y="${y(hit.net) + 38}" text-anchor="middle" style="fill:${C.mist}">game ${hit.k}</text>
      <text x="${P}" y="${H - 2}">game 1</text><text x="${W - P}" y="${H - 2}" text-anchor="end">game 41</text>
    </svg>
    <div class="foot">${lockup(64)}<span class="url">tallorderdigital.com</span></div>
  </div>`;
}

function shotDietCard(curve) {
  const W = 380, H = 250, P = 10;
  const x = (k) => P + (k - 1) * (W - 2 * P) / (curve.length - 1), y = (v) => H - 30 - Math.max(-0.1, v) * (H - 60);
  const d = (key) => "M" + curve.map((r) => `${x(r.k).toFixed(1)},${y(r[key]).toFixed(1)}`).join(" L");
  const a4 = curve[3];
  return `${base}<style>
    .wrap { position: absolute; inset: 64px 72px 56px; display: grid; grid-template-columns: 1fr ${W}px; grid-template-rows: 1fr auto; column-gap: 48px; }
    .kicker { font: 500 20px "IBM Plex Mono"; letter-spacing: .16em; text-transform: uppercase; color: ${C.orange}; margin-bottom: 22px; }
    h1 { font: 700 96px/.95 "Barlow Semi Condensed"; text-transform: uppercase; }
    .dek { font-size: 26px; line-height: 1.35; color: ${C.sub}; margin-top: 22px; }
    .chart { align-self: center; }
    .chart text { font-family: "IBM Plex Mono"; font-size: 17px; fill: ${C.sub}; }
    .foot { grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; border-top: 2px solid ${C.rule}; padding-top: 26px; }
  </style>
  <div class="wrap">
    <div><p class="kicker">NBA · Data story</p><h1>The Shot Diet</h1>
      <p class="dek">One week in, where teams shoot is real. Whether the shots go in isn't.</p></div>
    <svg class="chart" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <path d="${d("p3")}" fill="none" stroke="${C.slateDark}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="${d("r3")}" fill="none" stroke="${C.orange}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
      <line x1="${x(4)}" x2="${x(4)}" y1="20" y2="${H - 30}" stroke="${C.rule}" stroke-width="2" stroke-dasharray="6 6"/>
      <circle cx="${x(4)}" cy="${y(a4.r3)}" r="9" fill="${C.orange}"/><circle cx="${x(4)}" cy="${y(a4.p3)}" r="9" fill="${C.slateDark}"/>
      <text x="${W - P}" y="${y(curve[curve.length - 1].r3) - 14}" text-anchor="end" style="fill:${C.mist}">where they shoot</text>
      <text x="${W - P}" y="${y(curve[curve.length - 1].p3) + 52}" text-anchor="end">whether it goes in</text>
      <text x="${x(4) + 12}" y="${H - 2}">game 4</text><text x="${W - P}" y="${H - 2}" text-anchor="end">game 20</text>
    </svg>
    <div class="foot">${lockup(64)}<span class="url">tallorderdigital.com</span></div>
  </div>`;
}

function roleCallCard(stab) {
  const rows = stab.map((s) => `<div class="rb"><span>${s.label}</span><i><b style="width:${Math.max(0, s.r) * 100}%;background:${s.group === "role" ? C.orange : C.slateDark}"></b></i><em>${s.r.toFixed(2)}</em></div>`).join("");
  return `${base}<style>
    .wrap { position: absolute; inset: 64px 72px 56px; display: grid; grid-template-columns: 1fr 430px; grid-template-rows: 1fr auto; column-gap: 48px; }
    .kicker { font: 500 20px "IBM Plex Mono"; letter-spacing: .16em; text-transform: uppercase; color: ${C.orange}; margin-bottom: 22px; }
    h1 { font: 700 104px/.95 "Barlow Semi Condensed"; text-transform: uppercase; }
    .dek { font-size: 26px; line-height: 1.35; color: ${C.sub}; margin-top: 22px; }
    .bars { align-self: center; display: grid; gap: 14px; }
    .rb { display: grid; grid-template-columns: 190px 1fr 50px; align-items: center; gap: 12px; font: 400 18px "IBM Plex Sans"; color: ${C.sub}; }
    .rb i { height: 14px; background: ${C.rule}; border-radius: 3px; position: relative; }
    .rb b { position: absolute; inset: 0 auto 0 0; border-radius: 3px; }
    .rb em { font: 500 18px "IBM Plex Mono"; font-style: normal; color: ${C.mist}; text-align: right; }
    .foot { grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; border-top: 2px solid ${C.rule}; padding-top: 26px; }
  </style>
  <div class="wrap">
    <div><p class="kicker">NBA · Data story</p><h1>Role Call</h1>
      <p class="dek">One week in, a player's role is real. His shooting isn't, yet.</p></div>
    <div class="bars">${rows}</div>
    <div class="foot">${lockup(64)}<span class="url">tallorderdigital.com</span></div>
  </div>`;
}

function newSpotsCard(pl) {
  const R = 15, pts = [30, 90, 150, 210, 270, 330].map((d) => [Math.cos(d * Math.PI / 180) * R, Math.sin(d * Math.PI / 180) * R]);
  const courtSvg = (hexes, total, label) => {
    const hx = hexes.map(([x, y, c]) => `<polygon points="${pts.map(([dx, dy]) => `${(x + dx).toFixed(1)},${(y + dy).toFixed(1)}`).join(" ")}" fill="${C.mist}" fill-opacity="${Math.max(0.12, Math.min(1, Math.sqrt(c / total / 0.06))).toFixed(2)}"/>`).join("");
    const c3 = Math.sqrt(237.5 ** 2 - 220 ** 2), ln = `stroke="${C.slateDark}" stroke-width="3" fill="none"`;
    return `<div class="ct"><p>${label}</p><svg viewBox="-250 -52 500 330">${hx}
      <rect x="-80" y="-47.5" width="160" height="190" ${ln}/><path d="M -60 142.5 A 60 60 0 0 0 60 142.5" ${ln}/>
      <line x1="-250" y1="-47.5" x2="250" y2="-47.5" ${ln}/><line x1="-220" y1="-47.5" x2="-220" y2="${c3}" ${ln}/><line x1="220" y1="-47.5" x2="220" y2="${c3}" ${ln}/>
      <path d="M -220 ${c3} A 237.5 237.5 0 0 0 220 ${c3}" ${ln}/><circle cx="0" cy="0" r="7.5" ${ln}/></svg></div>`;
  };
  return `${base}<style>
    .wrap { position: absolute; inset: 56px 72px 56px; display: grid; grid-template-columns: 1fr 470px; grid-template-rows: 1fr auto; column-gap: 40px; }
    .kicker { font: 500 20px "IBM Plex Mono"; letter-spacing: .16em; text-transform: uppercase; color: ${C.orange}; margin-bottom: 20px; }
    h1 { font: 700 88px/.95 "Barlow Semi Condensed"; text-transform: uppercase; }
    .dek { font-size: 25px; line-height: 1.35; color: ${C.sub}; margin-top: 20px; }
    .courts { align-self: center; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .ct p { font: 500 17px "IBM Plex Mono"; color: ${C.sub}; margin-bottom: 8px; }
    .ct svg { width: 100%; display: block; }
    .foot { grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; border-top: 2px solid ${C.rule}; padding-top: 24px; }
  </style>
  <div class="wrap">
    <div><p class="kicker">NBA · Data story</p><h1>New Team, New Spots</h1>
      <p class="dek">${pl.name}'s shot map, ${pl.from} vs ${pl.t}. One week in, where players shoot is already real.</p></div>
    <div class="courts">${courtSvg(pl.hexl, pl.nl, "2025-26 · " + pl.from)}${courtSvg(pl.hexn, pl.n, "2026-27 · " + pl.t)}</div>
    <div class="foot">${lockup(64)}<span class="url">tallorderdigital.com</span></div>
  </div>`;
}

function homeCard() {
  return `${base}<style>
    .wrap { position: absolute; inset: 0 96px; display: grid; align-content: center; gap: 46px; }
    .tag { font-size: 34px; color: ${C.sub}; line-height: 1.35; }
    .url { position: absolute; left: 96px; bottom: 56px; }
  </style>
  <div class="wrap">${lockup(200)}<p class="tag">Data stories &amp; visualization, starting with the NBA.</p></div>
  <span class="url">tallorderdigital.com</span>`;
}

(async () => {
  const story = fs.readFileSync(path.join(ROOT, "stories/early-season-mirage/index.html"), "utf8");
  const D = JSON.parse(story.match(/const D = (\{.*?\});\n/s)[1]);
  const sd = fs.readFileSync(path.join(ROOT, "stories/shot-diet/index.html"), "utf8");
  const SD = JSON.parse(sd.match(/const D = (\{.*?\});\n/s)[1]);
  const rc = fs.readFileSync(path.join(ROOT, "stories/role-call/index.html"), "utf8");
  const RC = JSON.parse(rc.match(/const D = (\{.*?\});\n/s)[1]);
  const ns = fs.readFileSync(path.join(ROOT, "stories/new-spots/index.html"), "utf8");
  const NS = JSON.parse(ns.match(/const D = (\{.*?\});\n/s)[1]);
  const cards = [
    ["stories/early-season-mirage/share.png", storyCard(D.curve5.avg)],
    ["stories/shot-diet/share.png", shotDietCard(SD.curve.avg)],
    ["stories/role-call/share.png", roleCallCard(RC.stab)],
    ["stories/new-spots/share.png", newSpotsCard(NS.players.find((p) => p.name === "LeBron James"))],
    ["assets/share-home.png", homeCard()],
  ];
  const browser = await chromium.launch();
  for (const [out, html] of cards) {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
    await page.setContent(`<!doctype html><meta charset="utf-8">${html}`);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(ROOT, out) });
    console.log("wrote", out);
    await page.close();
  }
  await browser.close();
})();
