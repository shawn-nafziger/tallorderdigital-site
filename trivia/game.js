// Trivia games (weather, NBA, ...): shared game code. Configured by data attributes on #play.
// Generated from the Tall Order Digital project, claude/trivia/shared/; don't hand-edit the copy in the site.
// Each game page: Today's 5 (same set for everyone each day) and Keep playing (a streak from the whole bank).
// Progress is kept only in the reader's own browser (localStorage), and every read/write is wrapped in try/catch.
(function () {
  var root = document.getElementById("play");
  var BANK_URL = root.getAttribute("data-bank") || "bank.json";
  var GAME = root.getAttribute("data-game");                 // "weather", "nba": keys, events and share text
  var TITLE = root.getAttribute("data-title");               // "Tall Order Weather Trivia"
  var BASE = root.getAttribute("data-base") || "../../";     // path to the site root
  var URL0 = "https://tallorderdigital.com/trivia/" + GAME + "/?ref=share";
  var K = "tod-trivia-" + GAME + "-";
  var $ = function (id) { return document.getElementById(id); };
  var b, mode = "daily", state, endless;

  // Progress saved under the first address (trivia/, Nov 17, 2026) moves to the per-game keys once.
  try {
    Object.keys(localStorage).forEach(function (k) {
      var m = GAME === "weather" && k.match(/^tod-trivia-(day-\d+|stats|best)$/);
      if (m) { if (localStorage.getItem("tod-trivia-weather-" + m[1]) === null) localStorage.setItem("tod-trivia-weather-" + m[1], localStorage.getItem(k)); localStorage.removeItem(k); }
    });
  } catch (e) {}
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function send(path) {
    var gc = window.goatcounter, tries = 0;
    (function go() { gc = window.goatcounter; if (gc && gc.count) gc.count({ path: path, title: path, event: true }); else if (tries++ < 20) setTimeout(go, 500); })();
  }
  function localDay(d) { return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5; }
  function dayNumber() {
    var e = b.epoch.split("-");
    var n = localDay(new Date()) - Date.UTC(+e[0], +e[1] - 1, +e[2]) / 864e5;
    return Math.max(0, Math.floor(n));
  }

  // ------------------------------------------------------------ drawing one question
  var current, answered;
  function show(qi, label) {
    current = Trivia.render(b, qi, BASE);
    answered = false;
    $("tv-label").textContent = label;
    $("tv-ask").textContent = current.ask;
    $("tv-sub").textContent = current.sub;
    var box = $("tv-opts");
    box.innerHTML = "";
    box.className = "tv-opts" + (current.options.length > 2 ? " four" : "");
    current.options.forEach(function (o, j) {
      var bt = document.createElement("button");
      bt.type = "button";
      bt.innerHTML = '<span class="l"></span>' + (o.sub ? '<span class="s"></span>' : "") + '<span class="mark" hidden></span>';
      bt.querySelector(".l").textContent = o.label;
      if (o.sub) bt.querySelector(".s").textContent = "Records " + o.sub;
      bt.addEventListener("click", function () { pick(j); });
      box.appendChild(bt);
    });
    $("tv-reveal").hidden = true;
    $("tv-done").hidden = true;
    $("tv-question").hidden = false;
  }

  function pick(j) {
    if (answered) return;
    answered = true;
    var ok = j === current.answer;
    var btns = $("tv-opts").querySelectorAll("button");
    btns.forEach(function (bt, i) {
      bt.disabled = true;
      var m = bt.querySelector(".mark");
      if (i === current.answer) { bt.classList.add("right"); m.hidden = false; m.textContent = "Answer"; }
      else if (i === j) { bt.classList.add("wrong"); m.hidden = false; m.textContent = "Your pick"; }
      var o = current.options[i];
      if (o.shown) { var v = document.createElement("span"); v.className = "s"; v.textContent = o.shown; bt.insertBefore(v, m); }
    });
    $("tv-verdict").textContent = ok ? "Right!" : "Not quite";
    $("tv-explain").textContent = current.explain;
    var more = $("tv-more");
    more.href = current.more.href;
    more.textContent = current.more.label + " →";
    drawChart();
    $("tv-reveal").hidden = false;
    $("tv-status").textContent = (ok ? "Right. " : "Not quite. ") + current.explain;
    onAnswer(ok);
    $("tv-next").focus({ preventScroll: true });
  }

  function drawChart() {
    var c = $("tv-chart"), rows = current.chart || current.options.filter(function (o) { return o.shown; });
    c.innerHTML = "";
    if (!rows.length || current.viz === "none") { c.hidden = true; return; }
    c.hidden = false;
    var vals = rows.map(function (r) { return r.value; });
    var isDot = current.viz === "dot";
    var lo = isDot ? Math.min.apply(null, vals) : 0, hi = Math.max.apply(null, vals);
    if (isDot) { var pad = Math.max(3, (hi - lo) * 0.25); lo -= pad; hi += pad; }
    var span = hi - lo || 1;
    rows.forEach(function (r, i) {
      var win = current.chart ? i === 0 : current.options.indexOf(r) === current.answer;
      var row = document.createElement("div");
      row.className = "tv-row" + (win ? " win" : "");
      var name = document.createElement("span");
      name.className = "n";
      if (r.href) { var a = document.createElement("a"); a.href = r.href; a.textContent = r.label; name.appendChild(a); } else name.textContent = r.label;
      var tr = document.createElement("span");
      tr.className = "tv-track";
      var pct = (r.value - lo) / span * (isDot ? 100 : 56);
      var val = document.createElement("span");
      val.className = "tv-val";
      val.textContent = r.shown;
      if (isDot) {
        tr.innerHTML = '<span class="tv-line"></span><span class="tv-dot"></span>';
        tr.querySelector(".tv-dot").style.left = pct + "%";
        // label to the side with room
        if (pct > 60) { val.style.right = (100 - pct) + "%"; val.style.paddingRight = "14px"; val.style.paddingLeft = "0"; }
        else val.style.left = "calc(" + pct + "% + 6px)";
      } else {
        tr.innerHTML = '<span class="tv-bar"></span>';
        tr.querySelector(".tv-bar").style.width = Math.max(pct, 0.6) + "%";
        val.style.left = Math.max(pct, 0.6) + "%";
      }
      tr.appendChild(val);
      row.appendChild(name);
      row.appendChild(tr);
      c.appendChild(row);
    });
  }

  // ------------------------------------------------------------ Today's 5
  function dailyKey() { return K + "day-" + dayNumber(); }
  function startDaily() {
    mode = "daily";
    tabs();
    var n = dayNumber(), set = b.days[n % b.days.length];
    state = store(dailyKey()) || { n: n, ids: set, picks: [] };
    if (state.picks.length >= 5) return finishDaily(false);
    nextDaily();
  }
  function nextDaily() {
    var k = state.picks.length;
    dots();
    show(state.ids[k], "Daily #" + (state.n + 1) + " · Question " + (k + 1) + " of 5");
    $("tv-next").textContent = k === 4 ? "See your score" : "Next question";
  }
  function dots() {
    var d = $("tv-dots");
    d.innerHTML = "";
    for (var i = 0; i < 5; i++) {
      var el = document.createElement("i");
      if (i < state.picks.length) el.className = state.picks[i] ? "ok" : "no";
      else if (i === state.picks.length) el.className = "now";
      d.appendChild(el);
    }
  }
  function onAnswer(ok) {
    if (mode === "daily") {
      state.picks.push(ok ? 1 : 0);
      store(dailyKey(), state);
      dots();
      if (state.picks.length === 5) {
        var st = store(K + "stats") || { played: 0, total: 0, last: -1, run: 0 };
        if (st.last !== state.n) {
          st.played++; st.total += state.picks.reduce(function (a, c) { return a + c; }, 0);
          st.run = st.last === state.n - 1 ? st.run + 1 : 1; st.last = state.n;
          store(K + "stats", st);
        }
        send("trivia/" + GAME + "/daily-done/" + state.picks.reduce(function (a, c) { return a + c; }, 0));
      }
    } else {
      endless.seen.push(current.id);
      if (ok) { endless.streak++; endless.best = Math.max(endless.best, endless.streak); store(K + "best", endless.best); }
      $("tv-label").textContent = "Keep playing · Streak " + endless.streak + " · Best " + endless.best;
      $("tv-next").textContent = ok ? "Next question" : "Start a new streak";
      if (!ok) endless.over = true;
    }
  }
  function squares() { return state.picks.map(function (p) { return p ? "🟧" : "⬛"; }).join(""); }
  function finishDaily(fresh) {
    var score = state.picks.reduce(function (a, c) { return a + c; }, 0);
    var st = store(K + "stats");
    $("tv-question").hidden = true;
    dots();
    $("tv-label").textContent = "Daily #" + (state.n + 1) + " · Done";
    var d = $("tv-done");
    d.hidden = false;
    var words = ["Tough set.", "One to build on.", "Not bad.", "Nicely done.", "So close to perfect.", "Perfect score!"][score];
    d.innerHTML = '<p class="tv-score">' + score + ' / 5</p><p class="tv-verdict"></p><p class="tv-grid" aria-hidden="true"></p>' +
      '<div class="tv-actions"><button type="button" class="tv-btn" id="tv-share">Share your score</button>' +
      '<button type="button" class="tv-btn ghost" id="tv-go-endless">Keep playing</button></div>' +
      '<p class="tv-note" id="tv-shared" role="status"></p><ol class="tv-recap" id="tv-recap"></ol><p class="tv-note" id="tv-next-set"></p>';
    d.querySelector(".tv-verdict").textContent = words;
    d.querySelector(".tv-grid").textContent = squares();
    var rec = $("tv-recap");
    state.ids.forEach(function (qi, i) {
      var r = Trivia.render(b, qi, BASE);
      var li = document.createElement("li");
      li.innerHTML = '<span class="r"></span><span><span class="q"></span><br><span class="a"></span> <a></a></span>';
      li.querySelector(".r").textContent = state.picks[i] ? "✓" : "✗";
      li.querySelector(".r").setAttribute("aria-label", state.picks[i] ? "Right" : "Wrong");
      li.querySelector(".q").textContent = r.ask;
      li.querySelector(".a").textContent = "Answer: " + r.answerLabel + ".";
      var a = li.querySelector("a"); a.href = r.more.href; a.textContent = r.more.label + " →"; a.className = "tv-more";
      rec.appendChild(li);
    });
    if (st && st.played > 1) $("tv-next-set").textContent = "Days played: " + st.played + " · Average score: " + (st.total / st.played).toFixed(1) + " · Days in a row: " + st.run;
    tick();
    $("tv-share").addEventListener("click", shareScore);
    $("tv-go-endless").addEventListener("click", startEndless);
    if (fresh) d.querySelector(".tv-score").focus && d.querySelector(".tv-score").setAttribute("tabindex", "-1");
  }
  var timer;
  function tick() {
    clearTimeout(timer);
    var el = $("tv-next-set");
    if (!el || mode !== "daily") return;
    var now = new Date(), mid = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    var m = Math.max(1, Math.round((mid - now) / 6e4));
    var base = el.textContent.split(" · Next set")[0];
    el.textContent = (base && base.indexOf("Days played") === 0 ? base + " · " : "") + "Next set in " + Math.floor(m / 60) + " h " + (m % 60) + " min";
    if (m <= 1) { setTimeout(function () { location.reload(); }, 61e3); return; }
    timer = setTimeout(tick, 30e3);
  }
  function shareScore() {
    var score = state.picks.reduce(function (a, c) { return a + c; }, 0);
    var text = TITLE + " #" + (state.n + 1) + ": " + score + "/5\n" + squares();
    var url = URL0;
    var done = function (how) { $("tv-shared").textContent = how; send("share/trivia-" + GAME); };
    if (navigator.share) {
      navigator.share({ text: text, url: url }).then(function () { done("Shared."); }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text + "\n" + url).then(function () { done("Copied: paste it anywhere."); }, function () { $("tv-shared").textContent = text + " " + url; });
    } else $("tv-shared").textContent = text + " " + url;
  }

  // ------------------------------------------------------------ Keep playing
  function startEndless() {
    mode = "endless";
    tabs();
    endless = { streak: 0, best: store(K + "best") || 0, seen: (endless && endless.seen) || [], over: false };
    $("tv-dots").innerHTML = "";
    nextEndless();
    send("trivia/" + GAME + "/endless");
  }
  function nextEndless() {
    if (endless.over) { endless.streak = 0; endless.over = false; }
    var n = b.q.length, qi, guard = 0;
    var recent = endless.seen.slice(-300);
    do { qi = Math.floor(Math.random() * n); } while (recent.indexOf(qi) >= 0 && guard++ < 50);
    show(qi, "Keep playing · Streak " + endless.streak + " · Best " + endless.best);
    $("tv-next").textContent = "Next question";
  }

  function tabs() {
    $("tab-daily").setAttribute("aria-selected", mode === "daily");
    $("tab-endless").setAttribute("aria-selected", mode === "endless");
  }

  $("tv-next").addEventListener("click", function () {
    if (mode === "daily") { if (state.picks.length >= 5) finishDaily(true); else nextDaily(); }
    else nextEndless();
    var top = root.getBoundingClientRect().top;
    if (top < 0) root.scrollIntoView({ block: "start", behavior: "smooth" });
  });
  $("tab-daily").addEventListener("click", startDaily);
  $("tab-endless").addEventListener("click", startEndless);

  fetch(BANK_URL).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (data) {
    b = data;
    root.hidden = false;
    if (/[?&]mode=endless\b/.test(location.search)) startEndless(); else startDaily();
  }).catch(function () {
    root.hidden = false;
    root.innerHTML = '<p class="note">The questions didn\'t load. Try reloading the page; the sample questions below work either way.</p>';
  });
})();
