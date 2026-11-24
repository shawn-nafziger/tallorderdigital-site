/* Saved stories and charts (Nov 24, 2026). A reader can save a whole page (the Save button next to Share under the
   intro, and "Save this story" next to Share at the end) or one chart (a small "Save chart" button under each chart's
   title, added by this script). The list lives only in the reader's browser (localStorage "tod-saved"): no login, no
   server, nothing sent anywhere. It's shown on saved/, which can also turn the list into a link to open on another
   device. A save counts in GoatCounter as save/<page> or save/<page>/<chart> (title says top, end or chart); the
   reader isn't identified.
   Charts are found by markup, so new stories get the button with no setup: each <figure>, class="figure",
   <section class="chart"> or element marked data-save-chart inside <main> that has a title (data-save-title,
   aria-labelledby, .fig-title, figcaption, h2 or h3 inside it, or else the heading of the block just before it, as in
   the interactive "prose, then figure" pages). A chart with no id gets one from its title ("chart-" + slug), so links to it stay stable while
   the title does. data-no-save on an element leaves it out.
   Master copy: tallorderdigital-site/assets/saved.js. Site pages link it; story pages carry an inline copy written by
   tools/apply-subscribe.py (with the Save buttons themselves). Styles: "saved:start" / "saved:end" in assets/site.css. */
(function () {
  var KEY = "tod-saved", MAX = 300;
  var NS = "http://www.w3.org/2000/svg";

  // The site root: the logo links home ("../../", or the main site's address on Almanac pages).
  var brand = document.querySelector(".site-bar .brand");
  var root;
  try { root = new URL(brand ? brand.getAttribute("href") : "/", location.href); } catch (e) { root = new URL("/", location.href); }
  // This page's path from the site root, e.g. "nba/role-call-minutes-usage/".
  function rel(u) {
    var p = u.pathname.replace(/index\.html$/, "");
    if (u.origin === root.origin && p.indexOf(root.pathname) === 0) return p.slice(root.pathname.length);
    return p.replace(/^\//, "");
  }
  var here = rel(location);
  var pageName = (here.split("/").filter(Boolean).pop() || "home");

  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(v) ? v.filter(function (x) { return x && typeof x.k === "string" && typeof x.p === "string"; }) : [];
    } catch (e) { return []; }
  }
  function write(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX))); return true; } catch (e) { return false; }
  }
  function keyOf(p, c) { return p + (c ? "#" + c : ""); }
  function has(k) { return read().some(function (x) { return x.k === k; }); }
  function add(item) {
    var list = read().filter(function (x) { return x.k !== item.k; });
    list.unshift(item);
    return write(list);
  }
  function remove(k) { return write(read().filter(function (x) { return x.k !== k; })); }
  function count(path, title) {
    var gc = window.goatcounter;
    if (gc && gc.count) gc.count({ path: path, title: title || path, event: true });
  }

  var clean = function (s) { return (s || "").replace(/\s+/g, " ").trim(); };
  function slug(s) {
    return clean(s).toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48).replace(/-+$/, "") || "chart";
  }
  function metaOf(doc, sel) { var m = doc.querySelector(sel); return m ? clean(m.getAttribute("content")) : ""; }
  // A page's title, picture and summary (from its link-preview tags).
  function pageInfo(doc) {
    var h1 = doc.querySelector("main h1, h1");
    var t = metaOf(doc, 'meta[property="og:title"]').replace(/\s*·\s*Tall Order Digital$/, "") ||
            (h1 ? clean(h1.textContent) : "") || clean(doc.title).replace(/\s*·\s*Tall Order Digital$/, "");
    return { t: t, img: metaOf(doc, 'meta[property="og:image"]'), d: metaOf(doc, 'meta[name="description"]') };
  }

  // The charts on a page (this one, or one fetched for an imported list), in page order.
  function findCharts(doc) {
    var main = doc.querySelector("main") || doc.body;
    if (!main) return [];
    var out = [], ids = {};
    main.querySelectorAll("figure, .figure, section.chart, [data-save-chart]").forEach(function (el) {
      if (el.closest("[data-no-save], .subscribe, .share-row")) return;
      for (var i = 0; i < out.length; i++) if (out[i].el.contains(el)) return; // a chart inside a chart counts once
      var titleEl = null, title = el.getAttribute("data-save-title") || "";
      var lab = el.getAttribute("aria-labelledby");
      if (!title && lab && doc.getElementById(lab.split(" ")[0])) titleEl = doc.getElementById(lab.split(" ")[0]);
      if (!title && !titleEl) titleEl = el.querySelector(".fig-title, figcaption, h2, h3");
      if (!title && titleEl) title = titleEl.textContent;
      if (!title) {
        // No title of its own: the heading just before it ("<div class=prose><h2>…</h2><p>…</p></div>", then the figure).
        var prev = el.previousElementSibling;
        var h = prev && (prev.matches("h2, h3") ? prev : prev.querySelector("h2, h3"));
        if (h && !prev.matches("figure, .figure, section.chart")) title = h.textContent;
      }
      title = clean(title);
      if (!title) return;
      var id = el.id || "chart-" + slug(title);
      if (ids[id]) { var n = 2; while (ids[id + "-" + n]) n++; id = id + "-" + n; }
      ids[id] = true;
      var sub = el.querySelector(".fig-sub, .sub");
      out.push({ el: el, id: id, title: title, titleEl: titleEl, sub: sub ? clean(sub.textContent).slice(0, 220) : "" });
    });
    return out;
  }

  function icon() {
    var s = document.createElementNS(NS, "svg");
    s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("aria-hidden", "true");
    var p = document.createElementNS(NS, "path");
    p.setAttribute("d", "M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4.6-6.5 4.6v-16a1 1 0 0 1 1-1z");
    s.appendChild(p);
    return s;
  }
  // "Saved. See your list" with a link to saved/.
  function say(msg, text, link) {
    if (!msg) return;
    msg.textContent = text;
    if (link) {
      msg.appendChild(document.createTextNode(" "));
      var a = document.createElement("a");
      a.href = new URL("saved/", root).href;
      a.textContent = "See your saved list";
      msg.appendChild(a);
    }
    msg.hidden = false;
  }

  // Every Save button on the page, so they all show the same state (the top and end buttons save the same page).
  var buttons = [];
  function label(b, on) {
    b.setAttribute("aria-pressed", on ? "true" : "false");
    var t = b.querySelector(".save-t");
    if (t) t.textContent = on ? (b.getAttribute("data-on") || "Saved") : (b.getAttribute("data-off") || "Save");
  }
  function refresh() { buttons.forEach(function (b) { label(b.el, has(b.k)); }); }

  function wire(btn, msg, makeItem, where) {
    if (!btn.querySelector("svg")) btn.insertBefore(icon(), btn.firstChild);
    var item = makeItem();
    buttons.push({ el: btn, k: item.k });
    label(btn, has(item.k));
    btn.addEventListener("click", function () {
      if (has(item.k)) {
        remove(item.k);
        say(msg, "Removed from your saved list.");
      } else {
        var it = makeItem();
        it.at = Date.now();
        if (add(it)) {
          say(msg, it.c ? "Chart saved on this device." : "Saved on this device.", true);
          count("save/" + pageName + (it.c ? "/" + it.c : ""), "save/" + pageName + (it.c ? "/" + it.c : "") + " (" + where + ")");
        } else {
          say(msg, "This browser isn't letting the site save anything (private browsing can do that).");
        }
      }
      refresh();
    });
  }

  function init() {
    var info = pageInfo(document);
    function pageItem() { return { k: keyOf(here, ""), p: here, c: "", t: info.t, s: "", d: info.d, img: info.img }; }

    // 1. Whole-page buttons, written into the page by tools/apply-subscribe.py.
    document.querySelectorAll("button.save-btn[data-save='page']").forEach(function (b) {
      var box = b.closest(".share-top, .share-row");
      wire(b, box && box.querySelector(".save-msg"), pageItem, b.closest(".share-top") ? "top" : "end");
    });

    // 2. A "Save chart" button under each chart's title. Only on pages that carry the page buttons (stories), so
    //    site pages that load this file just for saved/ or the home link don't sprout chart buttons.
    if (document.querySelector("button.save-btn[data-save='page']")) {
      var hadHash = location.hash && !document.getElementById(decodeURIComponent(location.hash.slice(1)));
      findCharts(document).forEach(function (ch) {
        if (!ch.el.id) ch.el.id = ch.id;
        var line = document.createElement("p");
        line.className = "save-chart";
        var b = document.createElement("button");
        b.type = "button";
        b.className = "save-btn";
        b.setAttribute("data-off", "Save chart");
        b.setAttribute("aria-label", "Save chart: " + ch.title);
        var t = document.createElement("span");
        t.className = "save-t";
        b.appendChild(t);
        var msg = document.createElement("span");
        msg.className = "save-msg"; msg.setAttribute("role", "status"); msg.hidden = true;
        line.appendChild(b); line.appendChild(msg);
        // Right under the title and the lines that belong to it (subtitle, "How to read" link), or at the top of the chart.
        var after = ch.titleEl && ch.el.contains(ch.titleEl) ? ch.titleEl : null;
        if (after) {
          var n = after.nextElementSibling;
          while (n && n.matches(".fig-sub, .sub, .chart-howto, .fig-dek")) { after = n; n = n.nextElementSibling; }
          after.parentNode.insertBefore(line, after.nextSibling);
        } else {
          ch.el.insertBefore(line, ch.el.firstChild);
        }
        wire(b, msg, function () {
          return { k: keyOf(here, ch.id), p: here, c: ch.id, t: ch.title, s: info.t, d: ch.sub, img: info.img };
        }, "chart");
      });
      // A link to a chart whose id was just given out: go to it now that it exists.
      if (hadHash) {
        var target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (target) target.scrollIntoView();
      }
    }

    // 3. Saving in another tab updates these buttons too.
    window.addEventListener("storage", function (e) { if (e.key === KEY) refresh(); });
  }

  window.todSaved = { read: read, write: write, add: add, remove: remove, has: has, keyOf: keyOf, rel: rel, root: root,
                      findCharts: findCharts, pageInfo: pageInfo, count: count };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
