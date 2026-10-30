/*
 * Builds the 1200x630 link-preview images (LinkedIn, X, Slack, iMessage).
 * Claude runs this; Shawn doesn't need to.
 *
 *   node tools/share-cards.js                 (every card)
 *   node tools/share-cards.js nba/dashboards  (only cards whose output path starts with this)
 *
 * Needs Playwright (Chromium) and these fonts installed locally: Barlow Semi
 * Condensed, IBM Plex Sans, IBM Plex Mono. Look at
 * the PNGs before committing: a missing font silently falls back.
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
// Playbook palette (Oct 29, 2026), dark theme: Deep background, Paper text, Stone secondary, Sky comparison, Orange signal
const C = { ink: "#03222c", mist: "#f3f4ef", orange: "#f99a2b", slateDark: "#3a5762", sky: "#7fc4d6", sub: "#dddad3", rule: "#1e3a44", logo2: "#7fc4d6", logo3: "#4f8d9e", logo4: "#2e6272" };

const mark = (h) => `<svg width="${h}" height="${h}" viewBox="0 0 100 100">
  <rect x="6" y="6" width="18" height="88" rx="3" fill="${C.orange}"/>
  <rect x="30" y="50" width="18" height="44" rx="3" fill="${C.logo2}"/>
  <rect x="54" y="60" width="18" height="34" rx="3" fill="${C.logo3}"/>
  <rect x="78" y="70" width="18" height="24" rx="3" fill="${C.logo4}"/></svg>`;

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
      <path d="${d}" fill="none" stroke="${C.sky}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
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
    const hx = hexes.map(([x, y, c]) => `<polygon points="${pts.map(([dx, dy]) => `${(x + dx).toFixed(1)},${(y + dy).toFixed(1)}`).join(" ")}" fill="${C.sky}" fill-opacity="${Math.max(0.12, Math.min(1, Math.sqrt(c / total / 0.06))).toFixed(2)}"/>`).join("");
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

function injuryCard(stars, med) {
  const R = stars.filter((r) => r.ppg >= 25).sort((a, b) => b.diff - a.diff);
  const W = 430, row = 24, H = R.length * row + 34, ext = 26, x = (v) => 10 + (v + ext) / (2 * ext) * (W - 20);
  const rows = R.map((r, i) => {
    const y = 12 + i * row, clear = r.lo > 0 || r.hi < 0;
    return `<line x1="${x(r.lo)}" x2="${x(r.hi)}" y1="${y}" y2="${y}" stroke="${C.sky}" stroke-opacity=".3" stroke-width="9" stroke-linecap="round"/>
      <circle cx="${x(r.diff)}" cy="${y}" r="6.5" fill="${clear ? C.orange : C.slateDark}" stroke="${C.ink}" stroke-width="2"/>`;
  }).join("");
  return `${base}<style>
    .wrap { position: absolute; inset: 56px 72px 56px; display: grid; grid-template-columns: 1fr ${W}px; grid-template-rows: 1fr auto; column-gap: 48px; }
    .kicker { font: 500 20px "IBM Plex Mono"; letter-spacing: .16em; text-transform: uppercase; color: ${C.orange}; margin-bottom: 20px; }
    h1 { font: 700 96px/.95 "Barlow Semi Condensed"; text-transform: uppercase; }
    .dek { font-size: 25px; line-height: 1.35; color: ${C.sub}; margin-top: 22px; }
    .chart { align-self: center; } .chart p { font: 500 16px "IBM Plex Mono"; color: ${C.sub}; margin-bottom: 8px; }
    .foot { grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; border-top: 2px solid ${C.rule}; padding-top: 24px; }
  </style>
  <div class="wrap">
    <div><p class="kicker">NBA · Data story</p><h1>The Injury Tax</h1>
      <p class="dek">Last season, teams played a typical ${med.toFixed(1)} points per 100 possessions worse without their 25-point scorer. Haliburton is out again.</p></div>
    <div class="chart"><p>25-point scorers, 2025-26</p><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <line x1="${x(0)}" x2="${x(0)}" y1="0" y2="${H - 26}" stroke="${C.sub}" stroke-opacity=".5" stroke-width="2"/>${rows}
      <text x="${x(0)}" y="${H - 4}" text-anchor="middle" font-family="IBM Plex Mono" font-size="15" fill="${C.sub}">0</text>
      <text x="${W - 10}" y="${H - 4}" text-anchor="end" font-family="IBM Plex Mono" font-size="15" fill="${C.sub}">better with him →</text></svg></div>
    <div class="foot">${lockup(64)}<span class="url">tallorderdigital.com</span></div>
  </div>`;
}

function readyNowCard(D) {
  const W = 470, H = 330, m = { l: 34, r: 10, t: 10, b: 34 }, a0 = 18.5, a1 = 28.5;
  const x = (a) => m.l + (a - a0) / (a1 - a0) * (W - m.l - m.r), y = (v) => H - m.b - v / 40 * (H - m.t - m.b);
  const jit = (id) => ((id * 9301 + 49297) % 233280) / 233280 - 0.5;
  const pts = D.pts.filter((p) => p.age <= a1).map((p) => {
    const big = p.mpg >= D.model.big_mpg;
    return `<circle cx="${x(p.age + jit(p.id) * .6)}" cy="${y(p.mpg)}" r="${big ? 5.5 : 3.5}" fill="${big ? C.sky : C.slateDark}"/>`;
  }).join("");
  const me = D.me;
  return `${base}<style>
    .wrap { position: absolute; inset: 56px 72px 56px; display: grid; grid-template-columns: 1fr ${W}px; grid-template-rows: 1fr auto; column-gap: 44px; }
    .kicker { font: 500 20px "IBM Plex Mono"; letter-spacing: .16em; text-transform: uppercase; color: ${C.orange}; margin-bottom: 20px; }
    h1 { font: 700 96px/.95 "Barlow Semi Condensed"; text-transform: uppercase; }
    .dek { font-size: 25px; line-height: 1.35; color: ${C.sub}; margin-top: 22px; }
    .chart { align-self: center; }
    .foot { grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; border-top: 2px solid ${C.rule}; padding-top: 24px; }
  </style>
  <div class="wrap">
    <div><p class="kicker">NBA · Data story</p><h1>Ready Now</h1>
      <p class="dek">No rookie 23 or older has averaged 30 minutes since 2020-21. Yaxel Lendeborg, 24, is playing ${me.mpg} a night.</p></div>
    <div class="chart"><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <rect x="${x(22.5)}" y="${m.t}" width="${W - m.r - x(22.5)}" height="${H - m.t - m.b}" fill="${C.sky}" fill-opacity=".08"/>
      <line x1="${m.l}" x2="${W - m.r}" y1="${y(30)}" y2="${y(30)}" stroke="${C.sub}" stroke-opacity=".5" stroke-dasharray="6 5" stroke-width="2"/>
      ${pts}
      <circle cx="${x(me.age)}" cy="${y(me.mpg)}" r="10" fill="${C.orange}" stroke="${C.ink}" stroke-width="3"/>
      <text x="${x(me.age) + 16}" y="${y(me.mpg) - 10}" font-family="IBM Plex Mono" font-size="17" font-weight="600" fill="${C.mist}">Lendeborg</text>
      <text x="${W - m.r - 4}" y="${y(30) + 22}" text-anchor="end" font-family="IBM Plex Mono" font-size="15" fill="${C.sub}">30 min a game</text>
      <text x="${(m.l + W - m.r) / 2}" y="${H - 6}" text-anchor="middle" font-family="IBM Plex Mono" font-size="15" fill="${C.sub}">age as a rookie →</text>
      <text x="${x(20)}" y="${H - 22}" text-anchor="middle" font-family="IBM Plex Mono" font-size="14" fill="${C.sub}">20</text>
      <text x="${x(24)}" y="${H - 22}" text-anchor="middle" font-family="IBM Plex Mono" font-size="14" fill="${C.sub}">24</text>
      <text x="${x(28)}" y="${H - 22}" text-anchor="middle" font-family="IBM Plex Mono" font-size="14" fill="${C.sub}">28</text></svg></div>
    <div class="foot">${lockup(64)}<span class="url">tallorderdigital.com</span></div>
  </div>`;
}

function takeHeatCard(D) {
  const c3 = Math.sqrt(237.5 ** 2 - 220 ** 2), Z = Object.fromEntries(D.mix.map((r) => [r.key, r]));
  const zone = (d) => `<path d="${d}" fill="${C.sky}" fill-opacity=".14" stroke="${C.ink}" stroke-width="5" fill-rule="evenodd"/>`;
  const lab = (k, x, y, name) => { const r = Z[k], big = r.tier === "big", gap = r.team - r.lg;
    return `<rect x="${x - 170}" y="${y - 34}" width="340" height="70" rx="10" fill="${C.ink}" fill-opacity=".92"/>
      ${big ? `<rect x="${x - 156}" y="${y + 9}" width="15" height="15" rx="3" fill="${C.orange}"/>` : ""}
      <text x="${x}" y="${y - 4}" text-anchor="middle" font-family="IBM Plex Mono" font-size="28" font-weight="600" fill="${C.mist}">${name} ${r.team.toFixed(1)}%</text>
      <text x="${x + (big ? 10 : 0)}" y="${y + 23}" text-anchor="middle" font-family="IBM Plex Mono" font-size="20" fill="${C.sub}">league ${r.lg.toFixed(1)}% (${gap > 0 ? "+" : "−"}${Math.abs(gap).toFixed(1)} pp)</text>`; };
  return `${base}<style>
    .wrap { position: absolute; inset: 56px 72px 56px; display: grid; grid-template-columns: 1fr 470px; grid-template-rows: 1fr auto; column-gap: 40px; }
    .kicker { font: 500 20px "IBM Plex Mono"; letter-spacing: .16em; text-transform: uppercase; color: ${C.orange}; margin-bottom: 18px; }
    h1 { font: 700 84px/.95 "Barlow Semi Condensed"; text-transform: uppercase; }
    .dek { font-size: 25px; line-height: 1.35; color: ${C.sub}; margin-top: 20px; }
    .verdict { font: 600 22px "IBM Plex Mono"; color: ${C.mist}; margin-top: 18px; }
    .court { align-self: center; }
    .foot { grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; border-top: 2px solid ${C.rule}; padding-top: 24px; }
  </style>
  <div class="wrap">
    <div><p class="kicker">Check the Take · NBA</p><h1>Is Miami just unlucky?</h1>
      <p class="dek">A pundit says the Heat are bound to improve. We checked what public shot data can reach.</p>
      <p class="verdict">Verdict: holds up, on the part we can check</p></div>
    <div class="court"><svg width="470" height="400" viewBox="-250 -50 500 425">
      ${zone(`M -250 ${c3} L -220 ${c3} A 237.5 237.5 0 0 0 220 ${c3} L 250 ${c3} L 250 365 L -250 365 Z`)}
      ${zone(`M -220 -47.5 L -220 ${c3} A 237.5 237.5 0 0 0 220 ${c3} L 220 -47.5 Z M -80 -47.5 L -80 142.5 L 80 142.5 L 80 -47.5 Z`)}
      ${zone(`M -250 -47.5 L -250 ${c3} L -220 ${c3} L -220 -47.5 Z M 220 -47.5 L 220 ${c3} L 250 ${c3} L 250 -47.5 Z`)}
      ${zone("M -80 -47.5 L -80 142.5 L 80 142.5 L 80 -47.5 Z M -40 -47.5 L -40 0 A 40 40 0 0 0 40 0 L 40 -47.5 Z")}
      ${zone("M -40 -47.5 L -40 0 A 40 40 0 0 0 40 0 L 40 -47.5 Z")}
      <line x1="-250" y1="-47.5" x2="250" y2="-47.5" stroke="${C.sub}" stroke-width="3"/>
      <circle cx="0" cy="0" r="7.5" fill="none" stroke="${C.sub}" stroke-width="3"/>
      ${lab("rim", 0, 80, "Rim")}${lab("ab3", 0, 300, "Above-break 3")}
    </svg></div>
    <div class="foot">${lockup(64)}<span class="url">tallorderdigital.com</span></div>
  </div>`;
}

// Dashboard cards: built once, so they show the dashboard's shape, not today's numbers or team names.
function teamRatingsCard(D) {
  const T = [...D.teams].sort((a, b) => b.net.v - a.net.v);
  const W = 450, row = 9, top = 6, H = top + T.length * row + 34;
  const ext = Math.max(...T.map((t) => Math.abs(t.net.v) + t.net.band)) * 1.05;
  const x = (v) => 10 + (v + ext) / (2 * ext) * (W - 20);
  const fill = { sig: C.orange, edge: "#8f6230", noise: C.slateDark };
  const rows = T.map((t, i) => {
    const y = top + i * row + row / 2;
    return `<line x1="${x(t.net.v - t.net.band)}" x2="${x(t.net.v + t.net.band)}" y1="${y}" y2="${y}" stroke="${C.sky}" stroke-opacity=".22" stroke-width="6" stroke-linecap="round"/>
      <circle cx="${x(t.net.v)}" cy="${y}" r="4" fill="${fill[t.net.cls] || C.slateDark}"/>`;
  }).join("");
  return `${base}<style>
    .wrap { position: absolute; inset: 56px 72px 56px; display: grid; grid-template-columns: 1fr ${W}px; grid-template-rows: 1fr auto; column-gap: 44px; }
    .kicker { font: 500 20px "IBM Plex Mono"; letter-spacing: .16em; text-transform: uppercase; color: ${C.orange}; margin-bottom: 20px; }
    h1 { font: 700 104px/.95 "Barlow Semi Condensed"; text-transform: uppercase; }
    .dek { font-size: 26px; line-height: 1.35; color: ${C.sub}; margin-top: 22px; }
    .chart { align-self: center; }
    .chart text { font-family: "IBM Plex Mono"; font-size: 15px; fill: ${C.sub}; }
    .foot { grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; border-top: 2px solid ${C.rule}; padding-top: 24px; }
  </style>
  <div class="wrap">
    <div><p class="kicker">NBA · Dashboard · Updated daily</p><h1>Team Ratings</h1>
      <p class="dek">All 30 teams, every morning: who is really good or bad so far, and who is still within luck's range.</p></div>
    <svg class="chart" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <line x1="${x(0)}" x2="${x(0)}" y1="0" y2="${H - 30}" stroke="${C.sub}" stroke-opacity=".5" stroke-width="2"/>${rows}
      <text x="${x(0)}" y="${H - 8}" text-anchor="middle">league average</text>
      <text x="10" y="${H - 8}">worse</text><text x="${W - 10}" y="${H - 8}" text-anchor="end">better</text>
    </svg>
    <div class="foot">${lockup(64)}<span class="url">tallorderdigital.com</span></div>
  </div>`;
}

function gameOverviewCard() {
  // Court and shot-zone tints from the playbook (dark theme); home = solid Sky, away = Teal fill with a Sky outline.
  const c3 = Math.sqrt(237.5 ** 2 - 220 ** 2);
  const Zf = { rim: "#2c2c4a", paint: "#273a42", mid: "#353528", c3: "#1d3b31", ab3: "#143c4c" };
  const zone = (d, f) => `<path d="${d}" fill="${f}" fill-rule="evenodd"/>`;
  const ln = `stroke="${C.sub}" stroke-opacity=".55" stroke-width="3" fill="none"`;
  // A fixed, made-up scatter of shots: the card shows the dashboard's look, not a real game.
  let s = 4; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const shots = [];
  for (let i = 0; i < 46; i++) {
    const zoneRoll = rnd(), side = rnd() < 0.5 ? -1 : 1, home = i % 2 === 0;
    let px, py;
    if (zoneRoll < 0.3) { const a = rnd() * Math.PI, r = 8 + rnd() * 34; px = Math.cos(a) * r; py = Math.sin(a) * r - 10; }
    else if (zoneRoll < 0.45) { px = side * (10 + rnd() * 62); py = 40 + rnd() * 95; }
    else if (zoneRoll < 0.6) { const a = 0.35 + rnd() * 2.4, r = 150 + rnd() * 60; px = Math.cos(a) * r; py = Math.sin(a) * r; }
    else if (zoneRoll < 0.72) { px = side * (228 + rnd() * 14); py = -30 + rnd() * 110; }
    else { const a = 0.7 + rnd() * 1.75, r = 252 + rnd() * 34; px = Math.cos(a) * r; py = Math.sin(a) * r; }
    shots.push(home
      ? `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="9" fill="${C.sky}"/>`
      : `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="8" fill="#0a3746" stroke="${C.sky}" stroke-width="3"/>`);
  }
  return `${base}<style>
    .wrap { position: absolute; inset: 56px 72px 56px; display: grid; grid-template-columns: minmax(0, 1fr) 440px; grid-template-rows: 1fr auto; column-gap: 40px; }
    .kicker { font: 500 20px "IBM Plex Mono"; letter-spacing: .16em; text-transform: uppercase; color: ${C.orange}; margin-bottom: 20px; }
    h1 { font: 700 96px/.95 "Barlow Semi Condensed"; text-transform: uppercase; }
    .dek { font-size: 26px; line-height: 1.35; color: ${C.sub}; margin-top: 22px; }
    .key { display: flex; gap: 22px; margin-top: 22px; font: 500 18px "IBM Plex Mono"; color: ${C.sub}; align-items: center; }
    .key i { display: inline-block; width: 16px; height: 16px; border-radius: 50%; margin-right: 8px; vertical-align: -2px; }
    .court { align-self: center; }
    .foot { grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; border-top: 2px solid ${C.rule}; padding-top: 24px; }
  </style>
  <div class="wrap">
    <div><p class="kicker">NBA · Dashboard · Updated daily</p><h1>Game Overview</h1>
      <p class="dek">Last night's games: where each team shot from, and the one factor that decided it.</p>
      <p class="key"><span><i style="background:${C.sky}"></i>Home</span><span><i style="background:#0a3746;box-shadow:inset 0 0 0 3px ${C.sky}"></i>Away</span></p></div>
    <div class="court"><svg width="440" height="352" viewBox="-250 -50 500 400">
      ${zone(`M -250 ${c3} L -220 ${c3} A 237.5 237.5 0 0 0 220 ${c3} L 250 ${c3} L 250 350 L -250 350 Z`, Zf.ab3)}
      ${zone(`M -220 -47.5 L -220 ${c3} A 237.5 237.5 0 0 0 220 ${c3} L 220 -47.5 Z M -80 -47.5 L -80 142.5 L 80 142.5 L 80 -47.5 Z`, Zf.mid)}
      ${zone(`M -250 -47.5 L -250 ${c3} L -220 ${c3} L -220 -47.5 Z M 220 -47.5 L 220 ${c3} L 250 ${c3} L 250 -47.5 Z`, Zf.c3)}
      ${zone("M -80 -47.5 L -80 142.5 L 80 142.5 L 80 -47.5 Z M -40 -47.5 L -40 0 A 40 40 0 0 0 40 0 L 40 -47.5 Z", Zf.paint)}
      ${zone("M -40 -47.5 L -40 0 A 40 40 0 0 0 40 0 L 40 -47.5 Z", Zf.rim)}
      <rect x="-80" y="-47.5" width="160" height="190" ${ln}/><path d="M -60 142.5 A 60 60 0 0 0 60 142.5" ${ln}/>
      <line x1="-250" y1="-47.5" x2="250" y2="-47.5" ${ln}/><line x1="-220" y1="-47.5" x2="-220" y2="${c3}" ${ln}/><line x1="220" y1="-47.5" x2="220" y2="${c3}" ${ln}/>
      <line x1="-250" y1="${c3}" x2="-220" y2="${c3}" ${ln}/><line x1="220" y1="${c3}" x2="250" y2="${c3}" ${ln}/>
      <path d="M -220 ${c3} A 237.5 237.5 0 0 0 220 ${c3}" ${ln}/><circle cx="0" cy="0" r="7.5" ${ln}/>
      ${shots.join("")}
    </svg></div>
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
  const story = fs.readFileSync(path.join(ROOT, "nba/early-season-mirage-net-rating/index.html"), "utf8");
  const D = JSON.parse(story.match(/const D = (\{.*?\});\n/s)[1]);
  const sd = fs.readFileSync(path.join(ROOT, "nba/shot-diet-three-point-rate/index.html"), "utf8");
  const SD = JSON.parse(sd.match(/const D = (\{.*?\});\n/s)[1]);
  const rc = fs.readFileSync(path.join(ROOT, "nba/role-call-minutes-usage/index.html"), "utf8");
  const RC = JSON.parse(rc.match(/const D = (\{.*?\});\n/s)[1]);
  const ns = fs.readFileSync(path.join(ROOT, "nba/new-team-shot-maps/index.html"), "utf8");
  const NS = JSON.parse(ns.match(/const D = (\{.*?\});\n/s)[1]);
  const it = fs.readFileSync(path.join(ROOT, "nba/injury-tax-missing-stars/index.html"), "utf8");
  const IT = JSON.parse(it.match(/const D = (\{.*?\});\n/s)[1]);
  const rn = fs.readFileSync(path.join(ROOT, "nba/ready-now-rookie-age/index.html"), "utf8");
  const RN = JSON.parse(rn.match(/const D = (\{.*?\});\n/s)[1]);
  const th = fs.readFileSync(path.join(ROOT, "nba/check-the-take-heat-luck/index.html"), "utf8");
  const TH = JSON.parse(th.match(/const D = (\{.*?\});\n/s)[1]);
  const tr = fs.readFileSync(path.join(ROOT, "nba/dashboards/team-ratings/index.html"), "utf8");
  const TR = JSON.parse(tr.match(/const D = (\{.*?\});\n/s)[1]);
  const cards = [
    ["nba/early-season-mirage-net-rating/share.png", storyCard(D.curve5.avg)],
    ["nba/shot-diet-three-point-rate/share.png", shotDietCard(SD.curve.avg)],
    ["nba/role-call-minutes-usage/share.png", roleCallCard(RC.stab)],
    ["nba/new-team-shot-maps/share.png", newSpotsCard(NS.players.find((p) => p.name === "LeBron James"))],
    ["nba/injury-tax-missing-stars/share.png", injuryCard(IT.stars, IT.tiers.star.median)],
    ["nba/ready-now-rookie-age/share.png", readyNowCard(RN)],
    ["nba/check-the-take-heat-luck/share.png", takeHeatCard(TH)],
    ["nba/dashboards/team-ratings/share.png", teamRatingsCard(TR)],
    ["nba/dashboards/game-overview/share.png", gameOverviewCard()],
    ["assets/share-home.png", homeCard()],
  ];
  // Only build the cards named on the command line, if any (e.g. node tools/share-cards.js nba/dashboards).
  const only = process.argv.slice(2);
  if (only.length) cards.splice(0, cards.length, ...cards.filter(([out]) => only.some((o) => out.startsWith(o))));
  for (const [out] of cards) fs.mkdirSync(path.dirname(path.join(ROOT, out)), { recursive: true });
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
