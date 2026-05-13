# flows/

AI-executable workflows. Each `.md` file is a set of instructions an AI
agent (Claude, gemini, codex, etc.) reads and follows. To "run" a flow,
ask an agent: "Run the `<flow-name>` flow on `<input>`."

## Available flows

| Flow | Use it for |
|---|---|
| [`add-github.md`](add-github.md) | Register an external GitHub repo as a Collection card. Project deploys itself; Collection links out. |
| [`add-quick.md`](add-quick.md) | Drop a small self-contained experience into Collection's `experiences/` folder. No separate repo. |

## Why flows instead of scripts

- Updatable by editing one markdown file.
- No binaries to maintain or install.
- Any AI agent can execute them — Claude, gemini, codex, future agents.
- The "logic" lives in prose, which is the cheapest thing to refactor.
- Aligns with Harold's preference for AI-executable patterns over
  scattered scripts (`~/.config/agents/AGENTS.md`).

If you ever want a non-AI invocation path (Makefile target, zsh function,
etc.), those can wrap the same flow — they'd just call out to an AI agent
under the hood.
