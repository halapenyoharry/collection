# Jules Guide — Adding a New Web Experience

This guide tells Jules (or any contributor) exactly how to add a new self-contained web experience to **Collection**.

---

## What is an "experience"?

An experience is a **single-page, zero-dependency web app** that lives in its own folder under `experiences/`.  
It can be anything: a physics sim, generative art, a tiny game, a data visualisation, an interactive essay — whatever.

Key rules:
1. **Self-contained.** The `index.html` file must work when opened directly in a browser with no internet required (no CDN imports unless the experience explicitly documents them as a requirement).
2. **Standalone.** A user can navigate directly to `experiences/my-thing/index.html` and it works perfectly without the gallery being loaded first.
3. **Registered.** The experience must be added to `manifest.json` so the gallery finds it.

---

## Step-by-step: adding a new experience

### 1. Create the folder

```
experiences/<your-id>/
```

Use a short, lowercase, hyphen-separated identifier, e.g. `pendulum-chaos` or `reaction-diffusion`.

### 2. Copy the template

Copy `experiences/template/index.html` into your new folder:

```
experiences/<your-id>/index.html
```

### 3. Build the experience

Replace the placeholder content inside `experiences/<your-id>/index.html` with your implementation.

Required things to keep:
- The `<meta>` block at the top (charset, viewport, description).
- The `data-experience` attributes in `<body>` — they power future input/output wiring.
- The `<header>` with the title and back-link.
- The `<main id="stage">` where your interactive content lives.

Optional but encouraged:
- A brief `<p class="description">` under the title.
- Input controls in `<section id="inputs">` (sliders, buttons, colour pickers …).
- An output readout in `<section id="outputs">` (live stats, exported SVG, etc.).

### 4. Register in manifest.json

Add an object to the `experiences` array in `manifest.json`:

```json
{
  "id": "your-id",
  "title": "Human Readable Title",
  "description": "One or two sentences describing what this experience does.",
  "path": "experiences/your-id/index.html",
  "tags": ["tag1", "tag2"],
  "added": "YYYY-MM-DD"
}
```

Fields:

| Field | Required | Notes |
|-------|----------|-------|
| `id` | ✅ | Matches folder name. Unique across all experiences. |
| `title` | ✅ | Short display title shown on the gallery card. |
| `description` | ✅ | 1-2 sentences. Shown on the card. |
| `path` | ✅ | Relative path from repo root to `index.html`. |
| `tags` | ✅ | Array of lowercase strings. Helps with filtering later. |
| `added` | ✅ | ISO date string (`YYYY-MM-DD`). |

### 5. Verify

Open a local server from the repo root and check:

```bash
npx serve .
```

- `http://localhost:3000` → gallery card should appear.
- `http://localhost:3000/experiences/your-id/` → experience works standalone.

---

## Template anatomy

```
experiences/template/index.html
```

```html
<!-- Required meta -------------------------------------------------->
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="description" content="<your description>">

<!-- Body attributes (do not remove) -------------------------------->
<body data-experience-id="template" data-experience-version="1">

  <!-- Back navigation (keep this) ---------------------------------->
  <nav><a href="../../index.html">← Collection</a></nav>

  <!-- Title block (required) --------------------------------------->
  <header>
    <h1>Experience Title</h1>
    <p class="description">One line description.</p>
  </header>

  <!-- INPUT SECTION (optional but encouraged) ---------------------->
  <section id="inputs">
    <!-- sliders, buttons, colour pickers go here -->
  </section>

  <!-- MAIN STAGE (required) ---------------------------------------->
  <main id="stage">
    <!-- canvas, svg, or whatever your experience renders into -->
  </main>

  <!-- OUTPUT SECTION (optional but encouraged) --------------------->
  <section id="outputs">
    <!-- live stats, export buttons, etc. go here -->
  </section>
```

---

## Checklist for Jules

When asked to build a new experience, follow this checklist:

- [ ] Create `experiences/<id>/` folder
- [ ] Write `experiences/<id>/index.html` based on the template
- [ ] The experience works fully standalone (no imports from outside the file)
- [ ] Add entry to `manifest.json`
- [ ] Test by opening both the gallery (`index.html`) and the experience directly
- [ ] Ensure no secrets, API keys, or personal data are included

---

## Style conventions

- Dark background (`#0a0a0f` or similar) keeps visual consistency with the gallery.
- White / light text.
- Accent colour `#7c6af5` (purple) for interactive elements — feel free to vary it per experience.
- Prefer `<canvas>` for animations, `<svg>` for static/procedural vector art.
- Keep JS inline in the HTML file to preserve the zero-dependency rule.

---

## Inputs & Outputs (future)

The `<section id="inputs">` and `<section id="outputs">` sections are placeholders for a future wiring system that will let experiences communicate with each other and with external tools. For now, just add UI controls in `#inputs` and live readouts in `#outputs` as feels natural for your experience. The spec will be published here when it stabilises.

---

*This guide is maintained alongside the repository. If you add a structural change (new convention, new field in the manifest, etc.) please update this file.*
