/* Weekly-email signup: the form posts to Buttondown in a new tab (Buttondown shows its own
   "check your inbox" page and may ask for a captcha). This script tags each signup with the page
   it came from, counts it in GoatCounter as subscribe/<page>, and tells the reader what happens next. */
(function () {
  var parts = location.pathname.split("/").filter(Boolean);
  var page = parts.length ? parts[parts.length - 1].replace(/\.html$/, "") : "home";
  document.querySelectorAll("form.sub-form").forEach(function (form) {
    var src = form.querySelector('input[name="metadata__signup-page"]');
    if (src) src.value = page;
    form.addEventListener("submit", function () {
      var gc = window.goatcounter;
      if (gc && gc.count) gc.count({ path: "subscribe/" + page, title: "subscribe/" + page, event: true });
      var box = form.closest(".subscribe"), done = box && box.querySelector(".sub-done");
      if (done) setTimeout(function () { done.hidden = false; form.reset(); }, 300);
    });
  });
})();
