/* Tall Order Digital: topic filter for the home page story list.
   - Each story card carries data-topic ("nba", "weather", ...); each filter button names a topic or "all".
   - Counts come from the cards on the page, so a new story only needs its data-topic.
   - The choice is kept in the address (?topic=nba), so a filtered list can be shared or bookmarked.
   - Without this script the buttons stay hidden and every story shows. */
(function () {
  var group = document.querySelector(".topic-filter");
  if (!group) return;
  var cards = [].slice.call(document.querySelectorAll(".story[data-topic]"));
  var buttons = [].slice.call(group.querySelectorAll("button[data-topic]"));
  var status = document.querySelector(".topic-status");
  var names = {};

  buttons.forEach(function (btn) {
    var t = btn.dataset.topic;
    var n = t === "all" ? cards.length : cards.filter(function (c) { return c.dataset.topic === t; }).length;
    names[t] = (btn.querySelector(".l") || btn).textContent.trim();
    if (!n) { btn.remove(); return; }
    var count = document.createElement("span");
    count.className = "n";
    count.textContent = n;
    btn.appendChild(count);
  });
  buttons = [].slice.call(group.querySelectorAll("button[data-topic]"));
  // One topic (or none) on the page: nothing to filter.
  if (buttons.length < 3) return;
  group.hidden = false;

  function valid(t) { return buttons.some(function (b) { return b.dataset.topic === t; }); }

  function show(t, announce) {
    if (!valid(t)) t = "all";
    var shown = 0;
    cards.forEach(function (c) {
      var on = t === "all" || c.dataset.topic === t;
      c.hidden = !on;
      if (on) shown++;
    });
    buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.topic === t)); });
    if (status && announce) {
      status.textContent = t === "all" ? "Showing all " + shown + " stories" : "Showing " + shown + " " + names[t] + (shown === 1 ? " story" : " stories");
    }
    return t;
  }

  function fromAddress() {
    var m = /[?&]topic=([a-z0-9-]+)/i.exec(location.search);
    return m ? m[1].toLowerCase() : "all";
  }

  group.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest("button[data-topic]");
    if (!btn) return;
    var t = show(btn.dataset.topic, true);
    try {
      var url = new URL(location.href);
      if (t === "all") url.searchParams.delete("topic"); else url.searchParams.set("topic", t);
      history.replaceState(null, "", url.pathname + url.search + url.hash);
    } catch (err) { /* the filter still works without updating the address */ }
  });

  show(fromAddress(), false);
})();
