/* Tall Order Digital: light/dark toggle.
   - First visit follows the reader's system setting.
   - Clicking a .theme-toggle button switches theme and remembers it (localStorage "tod-theme").
   - Each page also carries a one-line script in <head> that applies the saved choice
     before anything draws, so there's no flash of the wrong theme:
       <script>try{var t=localStorage.getItem("tod-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}</script>
   - The CSS reads :root[data-theme="light" | "dark"]; story charts already redraw when data-theme changes. */
(function () {
  var root = document.documentElement;
  var media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function current() {
    var t = root.dataset.theme;
    if (t === "light" || t === "dark") return t;
    return media && media.matches ? "dark" : "light";
  }

  function sync() {
    var theme = current();
    var next = theme === "dark" ? "light" : "dark";
    document.querySelectorAll(".theme-toggle").forEach(function (btn) {
      btn.setAttribute("aria-label", "Switch to " + next + " mode");
      btn.setAttribute("title", "Switch to " + next + " mode");
      btn.dataset.showing = theme;
    });
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest(".theme-toggle");
    if (!btn) return;
    var next = current() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("tod-theme", next); } catch (err) {}
    sync();
    if (window.goatcounter && window.goatcounter.count) {
      try { window.goatcounter.count({ path: "theme/" + next, event: true }); } catch (err) {}
    }
  });

  if (media) {
    var onChange = function () { if (!root.dataset.theme) sync(); };
    if (media.addEventListener) media.addEventListener("change", onChange);
    else if (media.addListener) media.addListener(onChange);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", sync);
  else sync();
})();
