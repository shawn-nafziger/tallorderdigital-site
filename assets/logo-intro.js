/* Tall Order Digital: animated logo intro on the home page hero (added Nov 9, 2026).
   - Sixteen dots in the logo's colors, mixed up in a 4x4 grid, swirl about two turns.
     In the last stretch each dot stretches into its slice of a bar, so the bars come
     straight out of the swirl (7 + 4 + 3 + 2 dots for the 88 / 44 / 34 / 24 bars).
     The orange bar settles with a small bounce, then the wordmark wipes in.
   - Plays once per browser session (sessionStorage "tod-intro"), never with
     "reduce motion" on, and leaves the static logo untouched when it doesn't run.
   - index.html's <head> adds class "tod-intro" to <html> before drawing (hides the
     static bars and wordmark so they don't flash) and removes it after 2 s if this
     script never starts. Colors come from the existing m-o / m-2 / m-3 / m-4 classes,
     so the animation follows light/dark mode.
   - Design study: https://claude.ai/artifact/8j3xdU3sT76Q7Ess7mMKas */
(function () {
  var root = document.documentElement;
  if (!root.classList.contains("tod-intro")) return;
  var hero = document.querySelector(".hero-logo");
  var svg = hero && hero.querySelector(".mark");
  if (!svg) { root.classList.remove("tod-intro"); return; }
  window.todIntroStarted = true;
  try { sessionStorage.setItem("tod-intro", "1"); } catch (e) {}

  var NS = "http://www.w3.org/2000/svg";
  var T = 3.6, SW = 1.75;
  var BAR_X = [6, 30, 54, 78], BAR_W = 18, BASE = 94;
  var BAR_H = [88, 44, 34, 24], COUNTS = [7, 4, 3, 2];
  var CLS = ["m-o", "m-2", "m-3", "m-4"];
  var C = { x: 51, y: 52 }, R0 = 6, R1 = 5.4;
  var MIX = [0, 1, 0, 2, 3, 0, 2, 0, 0, 2, 0, 1, 1, 0, 3, 1];

  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ioc(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function outBack(t) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
  function ang(p) { return Math.atan2(p.y - C.y, p.x - C.x); }

  var grid = [], slots = [], dots = [];
  for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++)
    grid.push({ x: 15 + c * 24, y: 16 + r * 24, row: r, col: c, bar: MIX[r * 4 + c] });
  BAR_H.forEach(function (h, b) {
    var n = COUNTS[b], s = h / n;
    for (var j = 0; j < n; j++) slots.push({ bar: b, s: s, x: BAR_X[b] + BAR_W / 2, y: BASE - s * (j + .5) });
  });
  [0, 1, 2, 3].forEach(function (b) {
    var byAng = function (p, q) { return ang(p) - ang(q); };
    var gs = grid.filter(function (g) { return g.bar === b; }).sort(byAng);
    var ss = slots.filter(function (s) { return s.bar === b; }).sort(byAng);
    gs.forEach(function (g, k) {
      var s = ss[k], a0 = ang(g), d = ang(s) - a0;
      while (d < 2.4 * Math.PI) d += 2 * Math.PI;
      while (d >= 4.4 * Math.PI) d -= 2 * Math.PI;
      dots.push({ g: g, s: s, a0: a0, d: d, pop: (g.row + g.col) * .045,
                  r0: Math.hypot(g.x - C.x, g.y - C.y), r1: Math.hypot(s.x - C.x, s.y - C.y) });
    });
  });
  dots.slice().sort(function (p, q) { return p.a0 - q.a0; }).forEach(function (d, k) { d.swirl = .85 + k * .012; });
  var barEnd = [0, 1, 2, 3].map(function (b) {
    return Math.max.apply(null, dots.filter(function (d) { return d.s.bar === b; }).map(function (d) { return d.swirl + SW; }));
  });

  var bars = CLS.map(function (cl) { return svg.querySelector("." + cl); });
  var layer = document.createElementNS(NS, "g");
  svg.appendChild(layer);
  dots.forEach(function (d) {
    d.el = document.createElementNS(NS, "rect");
    d.el.setAttribute("class", CLS[d.s.bar]);
    layer.appendChild(d.el);
  });
  var w1 = hero.querySelector(".wm-1"), w2 = hero.querySelector(".wm-2");

  function render(t) {
    dots.forEach(function (d) {
      var a = clamp((t - d.pop) / .35);
      var e = ioc(clamp((t - d.swirl) / SW));
      var th = d.a0 + d.d * e;
      var rad = lerp(d.r0, d.r1, e) * (1 - .45 * Math.sin(Math.PI * e));
      var cx = C.x + rad * Math.cos(th), cy = C.y + rad * Math.sin(th);
      var m = ioc(clamp((e - .62) / .38));
      var rr = lerp(R0, R1, e) * (a < 1 ? outBack(a) : 1);
      var w = Math.max(0, lerp(2 * rr, BAR_W, m)), h = Math.max(0, lerp(2 * rr, d.s.s + .6, m));
      d.el.setAttribute("x", cx - w / 2); d.el.setAttribute("y", cy - h / 2);
      d.el.setAttribute("width", w); d.el.setAttribute("height", h);
      d.el.setAttribute("rx", Math.max(0, lerp(rr, 0, m)));
      d.el.style.opacity = t >= barEnd[d.s.bar] ? 0 : clamp(a * 1.4);
    });
    bars.forEach(function (bar, b) {
      if (!bar) return;
      var h = BAR_H[b];
      if (b === 0) { var p = clamp((t - 2.8) / .35); h *= 1 + .05 * Math.sin(Math.PI * p) * (1 - p * .3); }
      bar.setAttribute("y", BASE - h); bar.setAttribute("height", h);
      bar.style.opacity = t >= barEnd[b] ? 1 : 0;
    });
    var p1 = ioc(clamp((t - 2.72) / .55)), p2 = ioc(clamp((t - 2.97) / .6));
    if (w1) { w1.style.opacity = p1; w1.style.transform = "translateX(" + (1 - p1) * -14 + "px)"; w1.style.clipPath = "inset(-10% " + (1 - p1) * 100 + "% -10% 0)"; }
    if (w2) { w2.style.opacity = p2; w2.style.letterSpacing = lerp(.95, .52, p2) + "em"; }
  }

  function finish() {
    layer.remove();
    bars.forEach(function (bar, b) { if (bar) { bar.style.opacity = ""; bar.setAttribute("y", BASE - BAR_H[b]); bar.setAttribute("height", BAR_H[b]); } });
    [w1, w2].forEach(function (el) { if (el) el.removeAttribute("style"); });
    root.classList.remove("tod-intro");
  }

  render(0);
  root.classList.remove("tod-intro"); // inline styles from render() now control visibility
  var start = null;
  function frame(now) {
    if (start === null) start = now;
    var t = Math.min(T, (now - start) / 1000);
    render(t);
    if (t < T) requestAnimationFrame(frame); else finish();
  }
  requestAnimationFrame(frame);
})();
