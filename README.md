# Collection — Negentropic Explorations

A living gallery of self-contained web experiences — physics simulations, generative art, interactive demos, and whatever else emerges.

## Quick start

```bash
npx serve .
```

Then open `http://localhost:3000` to browse the gallery.  
Each experience also works when opened directly as a standalone HTML file.

## Structure

```
collection/
├── index.html              ← Gallery homepage (reads manifest.json)
├── manifest.json           ← Registry of all experiences
├── JULES_GUIDE.md          ← Guide for Jules (or anyone) adding new experiences
└── experiences/
    ├── template/           ← Copy this when making a new experience
    ├── bouncing-balls/     ← 2-D physics simulation
    └── procedural-art/     ← Recursive generative vector art
```

## Adding a new experience

See **[JULES_GUIDE.md](./JULES_GUIDE.md)** for the full step-by-step guide.

The short version:
1. Create `experiences/<id>/index.html` based on `experiences/template/index.html`
2. Add an entry to `manifest.json`
3. Verify it works both in the gallery and as a standalone page
