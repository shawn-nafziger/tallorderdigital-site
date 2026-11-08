/* Tall Order Digital: filter buttons and "Show all" for a list of story cards.
   - Used on More stories (stories/, by topic: politics, travel, ...) and on the NBA and Weather pages (by series:
     Check the Take, Focus stories, ...). The group says which: <div class="topic-filter" data-filter="series">.
     Without data-filter it filters by topic.
   - Each story card carries data-topic / data-series; each button's data-topic names a value or "all".
   - Counts come from the cards on the page, so a new story only needs its data-topic / data-series.
   - The choice is kept in the address (?topic=politics or ?series=check-the-take), so a filtered list can be shared.
   - data-limit="5" on the group (Nov 8, 2026): under "All", only the newest 5 show, with a "Show all N stories"
     button (.show-all) below the list. Choosing a series or topic shows every story in it.
   - Without this script every story shows and the buttons stay hidden. */
(function () {
  var group = document.querySelector(".topic-filter");
  if (!group) return;
  var key = group.dataset.filter || "topic";
  var limit = parseInt(group.dataset.limit, 10) || 0;
  var more = document.querySelector(".show-all");
  var expanded = false;
  var current = "all";
  var cards = [].slice.call(document.querySelectorAll(".story[data-" + key + "]"));
  var buttons = [].slice.call(group.querySelectorAll("button[data-topic]"));
  var status = document.querySelector(".topic-status");
  var names = {};

  buttons.forEach(function (btn) {
    var t = btn.dataset.topic;
    var n = t === "all" ? cards.length : cards.filter(function (c) { return c.dataset[key] === t; }).length;
    names[t] = (btn.querySelector(".l") || btn).textContent.trim();
    if (!n) { btn.remove(); return; }
    var count = document.createElement("span");
    count.className = "n";
    count.textContent = n;
    btn.appendChild(count);
  });
  buttons = [].slice.call(group.querySelectorAll("button[data-topic]"));
  // Two or more values on the page (plus "All"): show the filter.
  var filtering = buttons.length >= 3;
  if (filtering) group.hidden = false;

  function valid(t) { return buttons.some(function (b) { return b.dataset.topic === t; }); }

  function show(t, announce) {
    if (!filtering || !valid(t)) t = "all";
    current = t;
    var matching = 0, shown = 0;
    cards.forEach(function (c) {
      var match = t === "all" || c.dataset[key] === t;
      if (match) matching++;
      var on = match && (t !== "all" || !limit || expanded || matching <= limit);
      c.hidden = !on;
      if (on) shown++;
    });
    if (more) {
      more.hidden = shown >= matching;
      more.textContent = "Show all " + matching + " stories";
    }
    buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.topic === t)); });
    if (status && announce) {
      status.textContent = t === "all" ? "Showing " + shown + " of " + matching + " stories" : "Showing " + shown + " " + names[t] + (shown === 1 ? " story" : " stories");
    }
    return t;
  }

  if (more) more.addEventListener("click", function () {
    var firstHidden = cards.filter(function (c) { return c.hidden; })[0];
    expanded = true;
    show(current, true);
    if (firstHidden) { firstHidden.focus(); }
  });

  function fromAddress() {
    var m = new RegExp("[?&]" + key + "=([a-z0-9-]+)", "i").exec(location.search);
    return m ? m[1].toLowerCase() : "all";
  }

  if (filtering) group.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest("button[data-topic]");
    if (!btn) return;
    var t = show(btn.dataset.topic, true);
    try {
      var url = new URL(location.href);
      if (t === "all") url.searchParams.delete(key); else url.searchParams.set(key, t);
      history.replaceState(null, "", url.pathname + url.search + url.hash);
    } catch (err) { /* the filter still works without updating the address */ }
  });

  show(fromAddress(), false);
})();
