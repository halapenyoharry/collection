# Flow: add-quick

**Purpose:** drop a small, self-contained experience directly into
Collection's `experiences/` folder. For one-shot HTML files or quick
sketches that don't justify their own GitHub repo and deploy.

**Use this flow when:**
- It's a single HTML file (or small folder) you want to publish now.
- You don't want to spin up a separate repo for it.
- The experience is "complete" — no plans for ongoing iteration in its
  own space.

**Use `add-github` instead when:** the project has (or should have) its
own GitHub repo with its own Pages deploy.

**Invocation:** an AI agent executes this flow when the user says
"Run the add-quick flow with `~/Downloads/my-sketch.html`" or
"Run add-quick to scaffold a new experience called `orbiting-shapes`."

**Inputs:** one of —
- A path to an existing HTML file
- A path to a folder containing `index.html`
- Nothing — scaffold a new experience from
  `experiences/template/`

**Outputs:**
- A new folder at `/Users/harold/Projects/collection/experiences/<slug>/`
- A manifest entry with the `path` field (not `url`)
- A commit + push on `main`
- A live card on `https://halapenyoharry.github.io/collection/` after Pages
  rebuilds

---

## Steps

### 1. Determine source

- If a path to a file was given: that file is the source.
- If a path to a folder was given: confirm it contains `index.html`.
- If no path: scaffold from
  `/Users/harold/Projects/collection/experiences/template/`.

### 2. Decide the slug

Ask the user for a slug (kebab-case). Validate against the regex
`^[a-z0-9][a-z0-9-]*[a-z0-9]$`. Confirm it doesn't collide with:
- An existing folder under `experiences/`
- An existing `id` in `manifest.json`

### 3. Place the files

Create `experiences/<slug>/` and copy the source in:
- **Single HTML file source:** copy it in. The user authorizes the
  destination filename — default is to preserve the original name and
  manifest-point at it. Only rename to `index.html` if the user explicitly
  asks (and remember Harold's "never rename files I named" rule applies
  to source files he created — a fresh copy he authorizes you to place
  is different).
- **Folder source:** copy as-is. Expect `index.html` at the folder's root.
- **Scaffold:** copy `experiences/template/index.html` and ancillary files
  to `experiences/<slug>/`.

### 4. Quick health check on the HTML

Look for external dependencies (CDN URLs, Google Fonts `@import`, fetches).
If any are found, surface them to the user:
- (a) Strip them, accepting any visual fallback (system fonts, etc.)
- (b) Leave them — but warn that the gallery's offline-friendly claim is
  compromised for this card
- (c) Abort and ask the user to make the file self-contained first

Default recommendation: (a) or (c) for true self-containment.

### 5. Gather metadata

Ask the user (or pre-fill from the HTML's `<title>` and `<meta description>`):
- Title (default: derived from `<title>` tag or filename)
- Description (one sentence — for the gallery card)
- Tags (comma-separated, 1–5 items)

### 6. Write manifest entry

Append to `experiences` array in `manifest.json`:

```json
{
  "id": "<slug>",
  "title": "<title>",
  "description": "<description>",
  "path": "experiences/<slug>/<entry-filename>",
  "tags": ["..."],
  "added": "YYYY-MM-DD"
}
```

Use `path`, not `url` — this is the in-repo mode.

### 7. Commit and push collection

Commit message template:
```
Add <slug>: quick experience

<one-sentence description from the manifest entry>
```

Always commit as `halapenyoharry` (verify `git config user.name`).
Never use `--no-verify` or signing bypasses.

### 8. Verify

- Wait for GH Pages rebuild (~30s).
- Poll `gh api repos/halapenyoharry/collection/pages/builds/latest` until
  the new commit appears with `status: built`.
- Hit `https://halapenyoharry.github.io/collection/experiences/<slug>/`
  and confirm the experience loads.
- Hit the gallery URL and confirm the new card.

---

## Things this flow MUST refuse

- Renaming user-given source files without explicit permission.
- Adding hub pages or wrapper `index.html`s on top of an existing one.
- Vendoring external dependencies without confirmation.
- Loading external resources at runtime without the user's awareness.

## When to outgrow this flow

A quick experience can outgrow this mode. Signs:
- It's accruing multiple files and a build step.
- You're iterating on it frequently and want its own commit history.
- It needs its own dependencies (vendored libraries, build artifacts).

Migration to `add-github` mode:
1. Create a new GitHub repo for it.
2. Move (or copy) the files from `experiences/<slug>/` into the new repo.
3. Push, enable Pages.
4. Swap its manifest entry from `path` to `url`.
5. Trash the `experiences/<slug>/` folder from Collection.

## Related files

- `/Users/harold/Projects/collection/experiences/template/` — starter
  scaffold for new experiences. A minimal HTML page styled consistent
  with the gallery.
- `/Users/harold/Projects/collection/manifest.json` — the file this flow
  writes to.
- `/Users/harold/Projects/collection/flows/add-github.md` — counterpart
  flow for projects with their own repo.
