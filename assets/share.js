/* Share button at the end of each story. Phones (and browsers with a share menu) open the device's share sheet;
   others copy the link. The shared link is the page address plus ?ref=share, so visits from shares show up in
   GoatCounter as their own referrer. A row marked data-keep-hash also keeps the address's #part (the weird stat of the
   day uses it, so a share links to the night the reader is looking at). A finished share counts in GoatCounter as share/<page> (cancelling the share
   sheet doesn't count). Uses the page's own address, not its canonical link, so a page whose canonical points to
   another site still shares this one. */
(function () {
  var parts = location.pathname.split("/").filter(Boolean);
  var page = parts.length ? parts[parts.length - 1].replace(/\.html$/, "") : "home";
  var base = location.origin + location.pathname + "?ref=share";
  var og = document.querySelector('meta[property="og:title"]');
  var title = og ? og.getAttribute("content") : document.title;
  function count(how) {
    var gc = window.goatcounter;
    if (gc && gc.count) gc.count({ path: "share/" + page, title: "share/" + page + " (" + how + ")", event: true });
  }
  document.querySelectorAll(".share-row").forEach(function (row) {
    var btn = row.querySelector(".share-btn"), msg = row.querySelector(".share-msg"), url = base;
    function say(text) { if (msg) { msg.textContent = text; msg.hidden = false; } }
    function copy() {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () { say("Link copied. Paste it anywhere to share."); count("copy"); },
          function () { say("Copy this link: " + url); });
      } else {
        say("Copy this link: " + url);
      }
    }
    btn.addEventListener("click", function () {
      url = base + (row.hasAttribute("data-keep-hash") ? location.hash : "");
      if (navigator.share) {
        navigator.share({ title: title, url: url }).then(function () { count("menu"); }, function (err) {
          if (!err || err.name !== "AbortError") copy();
        });
      } else {
        copy();
      }
    });
  });
})();
