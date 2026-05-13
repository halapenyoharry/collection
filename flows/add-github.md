# Flow: add-github

**Purpose:** register an external GitHub repository as a Collection gallery
card. The repo deploys itself via GitHub Pages; Collection just links to it.

**Use this flow when:** the project lives in its own GitHub repo (or should).
Bigger projects, multi-file projects, anything that wants its own deploy.

**Use `add-quick` instead when:** the experience is a single HTML file or
small folder you want to drop into Collection's `experiences/` directly,
without spinning up a separate repo.

**Invocation:** an AI agent executes this flow when the user says
"Run the add-github flow on `~/Projects/foo`" or
"add `https://github.com/halapenyoharry/foo` to collection."

**Inputs:** one of —
- A local filesystem path to a git repo (e.g. `~/Projects/foo`)
- A GitHub repo URL (e.g. `https://github.com/halapenyoharry/foo`)

**Outputs:**
- A new entry in `/Users/harold/Projects/collection/manifest.json`
  with the `url` field pointing at the project's live deploy
- A commit + push on `main` (after user confirms)
- A live card on `https://halapenyoharry.github.io/collection/` after Pages
  rebuilds (~30s)

**Operating principle:** the source project is touched only to enable Pages
or add a `.gitignore` for sensitive files. Never modify the project's HTML,
never rename files, never inject anything into the project's content.

---

## Steps

### 1. Determine target

- If the input is a path: confirm the directory exists and is a git repo
  (`.git` directory present, or `git status` succeeds).
- If the input is a URL: confirm it resolves via `gh api repos/{owner}/{name}`.

If the local path has no remote yet, surface that to the user — pushing the
project to GitHub is a non-reversible action and requires explicit
confirmation.

### 2. Audit for sensitive content (local path only)

Before pushing a local repo to public GitHub, scan for:
- `.env`, `credentials.json`, anything matching `*_secret*`, `*_key*`
- Common secret patterns in tracked files
  (`api[_-]?key`, `token`, `bearer`, `sk-...`, `ghp_...`, `hf_...`)
- Symlinks (could leak private paths if resolved)
- Local-only convention files: `.DS_Store`, `.sync-conflict-*`,
  `.claude/settings.local.json`, `.vscode/` (user preference)

Surface findings to the user. Build the project's `.gitignore` based on
their decisions before pushing.

### 3. Find the entry HTML

- Prefer `index.html` at the project root — it makes the bare GH Pages URL
  work (e.g. `https://owner.github.io/foo/`).
- If absent at root but present in a subfolder, the manifest can deep-link
  (e.g. `https://owner.github.io/foo/web-version/`). Bare URL will fall back
  to README rendering or 404.
- If no entry HTML at all, stop and ask the user to add one before continuing.

### 4. Gather metadata opportunistically

In priority order, look for sources of pre-fillable answers:

**a. `.project-bible.json` at project root** (schema-tolerant, best-effort).
   Pull whatever fields are recognized:
   - `original_name` or `slug` → suggest as `id`
   - `vision` → suggest as `description`
   - `tags` → suggest as `tags`

**b. `README.md` at project root.**
   - First `# H1` heading → suggest as `title`
   - First non-heading paragraph → suggest as `description`

**c. GitHub repo metadata.**
   - Repo description → suggest as `description` if not already set
   - Repo topics → suggest as `tags` if not already set

### 5. Push to GitHub (if not already pushed)

If the local repo has no remote, ask user to confirm public-or-private,
then:
```
gh repo create halapenyoharry/<name> --public \
  --description "<from bible/readme>" --source=. --push
```

### 6. Enable GitHub Pages

```
gh api -X POST repos/halapenyoharry/<name>/pages \
  -f 'source[branch]=main' -f 'source[path]=/'
```

If Pages is already enabled but on a different source, switch with
`-X PUT`. If enabled on the right source, skip.

### 7. Wait for the first build

```
gh api repos/halapenyoharry/<name>/pages/builds/latest --jq .status
```
Poll until `built` or `errored`.

### 8. Verify the live URL

- Bare URL responds 200.
- If deep-linking, confirm the deep URL responds 200.

### 9. Prompt user to confirm or edit the entry

Show:
```
Proposed manifest entry:
  id:          foo
  title:       Foo
  description: ...
  url:         https://halapenyoharry.github.io/foo/
  tags:        [...]
  added:       YYYY-MM-DD

OK to add? (y / edit / cancel)
```

### 10. Validate

- `id` must not collide with existing manifest entry.
- `id` matches `^[a-z0-9][a-z0-9-]*[a-z0-9]$`.
- `url` returns 200 from HEAD request.

### 11. Write entry to `manifest.json`

Append to `experiences` array. Entry shape:
```json
{
  "id": "foo",
  "title": "Foo",
  "description": "A short sentence.",
  "url": "https://halapenyoharry.github.io/foo/",
  "tags": ["..."],
  "added": "YYYY-MM-DD"
}
```

### 12. Commit and push collection

Always commit as `halapenyoharry` (verify `git config user.name`).
Never use `--no-verify` or signing bypasses.

### 13. Verify end-to-end

- Wait ~30 seconds for collection's Pages to rebuild.
- Poll `gh api repos/halapenyoharry/collection/pages/builds/latest` until
  the new commit's SHA appears with `status: built`.
- Hit `https://halapenyoharry.github.io/collection/manifest.json` and
  confirm the new entry appears.
- Hit the gallery URL and confirm the card.

---

## Things this flow MUST refuse

- Editing files inside the source project (no nav bars, no
  `data-experience-id`, no renames).
- Inventing descriptions or tags the user didn't provide and the bible
  doesn't contain. Ask instead.
- Pushing a local repo to a NEW public GitHub remote without explicit
  user authorization (this is a blast-radius action).
- Force-pushing or amending commits.

## Things this flow MAY do as a courtesy

- Suggest writing a missing `index.html` for the source repo — but only
  if the user explicitly asks. Don't add it unprompted.
- Suggest standard `.gitignore` entries before the initial push.

## Failure modes

- **Source repo doesn't exist:** stop; ask user to confirm path/URL.
- **No entry HTML:** stop; ask user to add one.
- **Pages build errors:** report; offer to revert the manifest entry.
- **URL 404s:** warn; allow override.

## Related files

- `/Users/harold/Projects/collection/manifest.json` — the file this flow
  writes to.
- `/Users/harold/Projects/collection/ARCHITECTURE.md` — the design this
  flow implements.
- `/Users/harold/Projects/collection/flows/add-quick.md` — for in-repo
  experiences that don't justify a separate GitHub repo.
