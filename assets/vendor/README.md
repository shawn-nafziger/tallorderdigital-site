# Third-party libraries hosted on the site

Self-hosted so story pages don't depend on another site (cdnjs) to draw their charts. Pages link these with a relative
path, e.g. `../../assets/vendor/d3-7.9.0.min.js` from a story at `<topic>/<slug>/`.

| File | What | Source | License |
|---|---|---|---|
| `d3-7.9.0.min.js` | D3 7.9.0, the charting library | npm package `d3@7.9.0`, file `dist/d3.min.js`, unchanged (SHA-256 `f2094bbf6141b359722c4fe454eb6c4b0f0e42cc10cc7af921fc158fceb86539`) | ISC, `d3-LICENSE.txt` |

The version is in the file name, so a future upgrade is a new file and pages move to it one at a time; never overwrite
a file here in place. Added Nov 16, 2026, for the "Shortest Day of the Year" story. Pages that still load D3 from cdnjs
(the Blockbusters story and the chart guide) can switch when they're next rebuilt in their data repos.
