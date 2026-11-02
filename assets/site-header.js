/* site-header:start */
/* Site header (sitewide, Nov 2, 2026): keeps --header-h current (for anchor links) and, on phones,
   slides the pinned header away while the reader scrolls down and brings it back on any scroll up.
   Master copy: tallorderdigital-site/assets/site-header.js; self-contained pages carry an inline copy
   written by tools/apply-header.py. */
(function () {
  var bar = document.querySelector(".site-bar");
  if (!bar) return;
  var root = document.documentElement;
  var phone = window.matchMedia ? window.matchMedia("(max-width: 680px)") : { matches: false };
  var last = window.scrollY, away = false;
  function measure() { root.style.setProperty("--header-h", bar.offsetHeight + "px"); }
  function set(v) { if (v !== away) { away = v; bar.classList.toggle("is-away", v); } }
  window.addEventListener("scroll", function () {
    var y = window.scrollY, d = y - last;
    if (!phone.matches || y < bar.offsetHeight) { set(false); last = y; return; }
    if (Math.abs(d) < 8) return;
    set(d > 0);
    last = y;
  }, { passive: true });
  // Keyboard users tabbing into the header always see it.
  bar.addEventListener("focusin", function () { set(false); });
  window.addEventListener("resize", measure);
  if (phone.addEventListener) phone.addEventListener("change", function () { set(false); measure(); });
  measure();
})();
/* site-header:end */
