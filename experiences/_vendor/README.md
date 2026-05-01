# _vendor

Shared third-party libraries used by experiences in Collection.

Keeps the gallery fully offline / zero-CDN while avoiding duplication across
experience folders. Experiences reference these with relative paths, e.g.
`<script src="../_vendor/d3.v7.min.js"></script>`.

| File                               | Source                                              | Version |
| ---------------------------------- | --------------------------------------------------- | ------- |
| `d3.v7.min.js`                     | https://d3js.org/                                   | 7       |
| `three.r128.min.js`                | https://cdnjs.cloudflare.com/ajax/libs/three.js/    | r128    |
| `three-OrbitControls.r128.js`      | jsdelivr three@0.128.0 examples/js/controls         | r128    |
| `three-TrackballControls.r128.js`  | jsdelivr three@0.128.0 examples/js/controls         | r128    |
| `tesseract.v5.min.js`              | jsdelivr tesseract.js@5                             | 5       |

When adding a new experience that needs a library not listed here, drop it
into this folder and add a row to the table above.
