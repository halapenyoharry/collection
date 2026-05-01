# Harold's Project Candidates for Collection

Self-contained, zero-dep single-page web experiences scouted from ~/Projects.
(Filtered per Harold's decisions.)

## Trivial ports (drop-in or near-drop-in)

-  **procedural_visuals** — one card. Combined entry point to the 8 canvas visualizations (circle-packing, crystalline, growth, life, quantum_life, topological_layer, studio) under a single gallery tile.
-  **math-thing** — Wave-equation membrane physics sims, 4 HTML variants.
- **throatsinging-simulator** — `/web-version/index.html`, Web Audio synth with resonance sliders.
- **med-curves** — `med-curves-v3.html`, AUC-preserving gastric delay curve with interactive controls.
- **bookz-main** — SVG/canvas node graph of a library, grabbable nodes, dark theme.

## Small ports (strip server/CDN deps)

- **image-browse-physics** — 4 D3 physics-field image browser variants (galaxy, pro, square, standard).
- **tts-reader** — Interactive TTS UI with multi-voice demo.
- **topothink-file-graph** — Zoomable circle-pack file/folder explorer.

## Medium ports (extract or build out)

- **json-visual-viewer** — JSON-as-graph viz; extract from Tauri to pure HTML.
- **ascii-landscape** — Port the Python generator to JS, render as `<pre>` or SVG.
- **daily-dj-tab-mixer** — Pull audio-mixing UI out of the Chrome extension shell.

## Suggested first batch

`procedural_visuals` (1 card) + `math-thing` (×4) + `image-browse-physics` (×4) + `throatsinging-simulator` + `med-curves` + `bookz-main` ≈ 12 new cards.
