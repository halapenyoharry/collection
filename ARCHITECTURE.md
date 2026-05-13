# Collection — Architecture

The shape for how Collection participates in your wider project graph.
The link-out target state is now reached: the six borrowed projects each
have their own GitHub repo + Pages deploy, and Collection just links.
Collection also supports a "quick" in-repo mode for small experiences
that don't justify their own repo.

## The contract

For a project to appear in Collection:

1. It needs to be reachable (git repo on GitHub with its own Pages, OR a
   folder on disk that gets cloned into Collection's repo).
2. It needs an entry HTML — eventually `index.html` at root, but during
   transition the manifest can point at any specific file.

That's it. **The project itself doesn't need any Collection-specific files.**
All metadata about how a project appears in the gallery lives in
**Collection's** `manifest.json`, not in the project.

If a project happens to have a `.project-bible.json`, the add-github flow
reads it opportunistically as input — but Collection never depends on the
bible schema. (Schema is under review; binding to it would be a tight
coupling.)

## Two ways to add a card

| Flow | When to use | Manifest field |
|---|---|---|
| [`flows/add-github.md`](flows/add-github.md) | Project lives in its own GitHub repo with its own Pages deploy. Bigger projects, multi-file, independent iteration. | `url` |
| [`flows/add-quick.md`](flows/add-quick.md) | Single HTML file or small folder you want to publish now. Lives inside Collection's repo. No separate deploy. | `path` |

Both flows write a manifest entry. The gallery shell renders either kind
identically — cards just open `entry.url || entry.path`.

## Diagram

```mermaid
flowchart TB
    %% Source projects, each independent, oblivious to Collection
    subgraph PROJECTS ["Source projects (independent, Collection-unaware)"]
        direction TB
        P1["<b>foo/</b><br/>index.html<br/>(maybe .project-bible.json)"]
        P2["<b>bar/</b><br/>index.html"]
        P3["<b>baz/</b><br/>index.html<br/>(maybe .project-bible.json)"]
    end

    %% Each project deploys itself (or doesn't — Collection can also clone)
    subgraph DEPLOYS ["Project deploys (when they exist)"]
        D1["foo's live URL"]
        D2["bar's live URL"]
        D3["baz's live URL"]
    end

    %% Collection
    subgraph COLLECTION ["Collection (meta-gallery repo)"]
        direction TB
        ADD["add-github / add-quick flows<br/>(prompts user, optionally<br/>reads bible if present)"]
        MAN["manifest.json<br/><b>← single source of truth</b><br/>for what's in the gallery"]
        SHELL["index.html (gallery shell)"]
    end

    %% Wiring
    P1 -->|own deploy| D1
    P2 -->|own deploy| D2
    P3 -->|own deploy| D3

    P1 -.->|opportunistic read| ADD
    P3 -.->|opportunistic read| ADD

    ADD --> MAN
    MAN -->|loaded at runtime| SHELL

    USER([Browser])
    USER --> SHELL
    SHELL -.->|card click → external link| D1
    SHELL -.->|card click → external link| D2
    SHELL -.->|card click → external link| D3
```

## ASCII version (for terminals or when mermaid won't render)

```
   ┌──────────────────────────┐  ┌──────────────────────────┐
   │  ~/Projects/foo/         │  │  ~/Projects/bar/         │
   │   ├─ index.html          │  │   └─ index.html          │
   │   └─ (maybe bible.json)  │  │                          │
   └────────────┬─────────────┘  └────────────┬─────────────┘
                │                              │
       (deploys itself)                (deploys itself)
                │                              │
                ▼                              ▼
       ┌─────────────────┐           ┌─────────────────┐
       │ foo's GH Pages  │           │ bar's GH Pages  │
       └────────┬────────┘           └────────┬────────┘

                       ┌────────────────────────┐
                       │   collection-add CLI   │
       (opportunistic) │  prompts user; optional│
       bible read ─────┤  best-effort bible read│
                       └───────────┬────────────┘
                                   │ writes entry
                                   ▼
                           ┌────────────────┐
                           │ manifest.json  │ ← per-import data lives HERE,
                           └───────┬────────┘   not in the project
                                   │ loaded at runtime
                                   ▼
                      ┌──────────────────────────┐
                      │  Collection gallery shell│
                      │  halapenyoharry.github   │
                      │  .io/collection          │
                      └────────────┬─────────────┘
                                   │ card links out
                  ┌────────────────┼────────────────┐
                  ▼                ▼                ▼
            foo's Pages       bar's Pages       baz's Pages
```

## Roles & boundaries

| Thing | Owns | Does NOT own |
|---|---|---|
| Source project | Entry HTML, presentation, dependencies, its own deploy | Anything Collection-related |
| Collection / `manifest.json` | Title, description, tags, URL — all per-import data | Project content |
| `add-github` / `add-quick` flows | Prompting user, writing manifest entries, *optionally* reading bibles | Editing source projects |

## Data flow when adding a project

**Via `add-github` (link-out):**
1. Agent runs the flow on a GitHub repo URL or local git repo path.
2. Audits source for sensitive files (`.env`, secrets, symlinks). Builds
   `.gitignore` if pushing for the first time.
3. Reads `.project-bible.json` opportunistically; falls back to README and
   GitHub repo metadata. Asks user for missing fields.
4. Ensures Pages is enabled on the source repo. Waits for build.
5. Appends a `url`-based entry to `manifest.json`. Commits + pushes
   collection. Source project HTML is never touched.

**Via `add-quick` (in-repo):**
1. Agent runs the flow with a single HTML file path, a small folder, or
   nothing (to scaffold from `experiences/template/`).
2. Asks for a slug. Copies the source into `experiences/<slug>/`.
3. Health-checks for external dependencies; asks the user how to handle
   any found.
4. Asks for title/description/tags (prefilled from `<title>`/meta when
   possible).
5. Appends a `path`-based entry to `manifest.json`. Commits + pushes
   collection.

## What Collection NEVER does

- Edit the project's HTML.
- Rename project files.
- Inject nav bars, back links, or attributes into project HTML.
- Require any specific file inside the project (besides an entry HTML).
- Bind to a specific bible schema.

## Migration path (where we are now)

**Current state (transitional):** Collection's `experiences/` folder holds
copies of 5 borrowed projects, with CDN URLs rewritten to a shared
`_vendor/`. The originals live untouched in `~/Projects/`. The manifest
points at relative paths inside `experiences/`.

**Target state:** Each of those 5 source projects has its own deploy.
Collection's manifest points at absolute external URLs.
The `experiences/<slug>/` copies and `_vendor/` go away. Collection's
repo shrinks to: `index.html`, `manifest.json`, `ARCHITECTURE.md`,
and a small `collection-add` script.

**In-between:** A manifest entry's `path` field accepts both shapes —
relative path (legacy copy) or absolute URL (link-out). Projects
migrate one at a time.

## Why this shape

- **Zero project pollution.** Source projects don't know Collection
  exists. Add or remove a project by editing only Collection's repo.
- **No schema lock-in.** Bibles are an input, not a contract. If the
  bible schema changes, we update the reader; nothing in projects
  needs to change.
- **One source of truth per project.** Edit foo in foo's repo. No
  copies drifting.
- **Projects iterate independently.** A change to foo redeploys foo's
  Pages immediately; Collection auto-reflects.
- **Failure modes are local.** A broken project breaks its own deploy,
  not the gallery.
- **Reversible.** Removing a project = deleting one manifest entry.
