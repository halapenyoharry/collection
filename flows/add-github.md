# Flow: collection-add

**Purpose:** register a project in Collection's `manifest.json` so it appears as
a card in the gallery.

**Invocation:** an AI agent (Claude, gemini, codex, etc.) executes this flow
when the user says something like "run the collection-add flow on
`~/Projects/foo`" or "add `https://github.com/halapenyoharry/foo` to
collection."

**Inputs:** one of —
- A local filesystem path (e.g. `~/Projects/foo`)
- A GitHub repo URL (e.g. `https://github.com/halapenyoharry/foo`)

**Outputs:**
- A new entry in `/Users/harold/Projects/collection/manifest.json`
- A commit + push on `main` (after user confirms)
- A live card on `https://halapenyoharry.github.io/collection/` after Pages
  rebuilds (~30s)

**Operating principle (DO NOT VIOLATE):** the source project is never
modified. No files added, deleted, renamed, or edited inside the project
folder. All metadata about how the project appears in Collection lives in
Collection's `manifest.json`. See `ARCHITECTURE.md` for the full reasoning.

---

## Steps

### 1. Determine target

- If the input is a path: confirm the directory exists. Read its contents.
- If the input is a URL: confirm it resolves. Use `gh` CLI for GitHub repos.
  Avoid cloning unless you actually need to inspect file contents — `gh api
  repos/{owner}/{name}` for metadata, `gh api repos/{owner}/{name}/contents`
  for file listings.

### 2. Find the entry HTML

- Look for `index.html` at the project root. That's the entry point.
- If absent, look for any `*.html` file at root.
- If multiple, ask the user which one is the entry.
- If none found, stop and tell the user: "No entry HTML found in <project>.
  Add an `index.html` to its root, then re-run."

### 3. Gather metadata opportunistically (best-effort, schema-tolerant)

In priority order, look for sources of pre-fillable answers:

**a. `.project-bible.json` at project root.**
   If present, read it. Pull whatever fields you recognize:
   - `original_name` or `slug` → suggest as `id`
   - `vision` → suggest as `description`
   - `tags` → suggest as `tags`
   - `urls.web` → suggest as `url`

   The bible schema is under review. **Do not require any specific field.**
   Read what's there; ignore what isn't recognized.

**b. `README.md` at project root.**
   - First `# H1` heading → suggest as `title`
   - First non-heading paragraph → suggest as `description`

**c. GitHub repo metadata (if input was a URL).**
   - Repo description → suggest as `description` if not already set
   - Repo topics → suggest as `tags` if not already set
   - GH Pages URL (from `gh api repos/{owner}/{name}/pages`) → suggest as `url`

### 4. Determine the live URL

The live URL is what the gallery card will link to. In priority order:

1. `urls.web` from the bible.
2. GH Pages URL if Pages is enabled on the repo (`gh api
   repos/{owner}/{name}/pages` returns 200 with an `html_url`).
3. Ask the user. Sample prompt: "What's the live URL for this project?
   (Leave blank if none yet — we'll fall back to a local copy in
   `experiences/<slug>/`.)"

If the user can't provide a URL and there's no Pages deploy, **stop and ask**
whether they want to:
- (a) Hold off until they enable Pages on the source repo.
- (b) Fall back to legacy "copy mode" — clone the project's HTML files into
  `collection/experiences/<slug>/` and point the manifest at the relative
  path. This is the transitional mode for the 5 already-borrowed projects;
  prefer (a) for new additions.

### 5. Prompt the user to confirm or edit

Show the user a draft entry. Sample:

```
Proposed manifest entry:
  id:          foo
  title:       Foo
  description: A small generative sketch.
  url:         https://halapenyoharry.github.io/foo/
  tags:        ["generative", "art"]
  added:       2026-04-22

OK to add? (y / edit / cancel)
```

If `edit`, prompt field-by-field with the current value as default.

### 6. Validate

- `id` must not collide with an existing manifest entry. If it does, append
  a disambiguating suffix or ask the user.
- `id` must match `^[a-z0-9][a-z0-9-]*[a-z0-9]$` (matches the bible schema's
  slug pattern).
- `url` (if present) should respond 200 to a HEAD request. If it 404s, warn
  but allow override — the project might be mid-deploy.

### 7. Write the entry

Append the new entry to `experiences` array in
`/Users/harold/Projects/collection/manifest.json`. Preserve existing
formatting (2-space indent, trailing newline).

Entry shape:

```json
{
  "id": "foo",
  "title": "Foo",
  "description": "A small generative sketch.",
  "url": "https://halapenyoharry.github.io/foo/",
  "tags": ["generative", "art"],
  "added": "YYYY-MM-DD"
}
```

**Note:** the `path` field used by today's manifest entries (`experiences/<slug>/index.html`)
is for the legacy copy-in-collection mode. For new link-out entries, use
`url` instead. Both can coexist; the gallery shell should treat
`url || path` as the click target. (If the gallery shell only handles
`path` today, this flow is the trigger to update it.)

### 8. Commit and push

Use git from the collection repo. Commit message format:

```
Add <id> to collection

<one-line description of the project>

URL: <url-or-path>
Tags: <tags>
```

Always commit as `halapenyoharry` (per Harold's CLAUDE.md). Confirm
`git config user.name` returns `halapenyoharry` before committing.

Push to `origin/main`.

### 9. Verify

- Wait ~30 seconds for GH Pages to rebuild.
- Poll `gh api repos/halapenyoharry/collection/pages/builds/latest` until
  status is `built`.
- Hit `https://halapenyoharry.github.io/collection/manifest.json` and
  confirm the new entry appears.
- (Optional) Hit the live URL from the entry to confirm it loads.
- Report success to the user with the gallery URL.

---

## Things this flow MUST refuse

- Editing files inside the source project. (The source is sacred. No nav
  bars, no `data-experience-id`, no renames.)
- Inventing descriptions or tags the user didn't provide and the bible
  doesn't contain. Ask instead.
- Modifying the bible schema or the bible file in the source project.
- Force-pushing or amending commits.

## Things this flow MAY do as a courtesy

- Suggest enabling GH Pages on the source repo if it isn't enabled and the
  user wants a link-out card. Show the `gh api -X POST` command; let the
  user run it.
- Suggest writing a missing `index.html` for the source repo, but only if
  the user explicitly asks. Don't just do it.

## Failure modes

- **Source project doesn't exist:** stop; ask user to confirm path/URL.
- **No entry HTML found:** stop; tell user what's missing.
- **Live URL 404s:** warn; allow override.
- **Manifest write fails:** report error; do not commit a partial state.
- **Pages build errors after push:** report; offer to revert the manifest
  entry.

## Related files

- `/Users/harold/Projects/collection/manifest.json` — the file this flow
  writes to.
- `/Users/harold/Projects/collection/ARCHITECTURE.md` — the design this
  flow implements.
- `/Users/harold/Projects/collection/index.html` — the gallery shell that
  reads the manifest at runtime.
