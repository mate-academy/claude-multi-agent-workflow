# api-quality

A Claude Code plugin that packages a **multi-agent code-quality workflow**: two scoped
subagents, one command that orchestrates them, a review skill, and a lint hook.

Built and tested against the Express API bundled in [`course-api/`](./course-api).

> **Status:** scaffolded (v0.1.0). The component folders exist; the agents, command,
> skill, and hook land in the tasks that follow.

---

## What's in the box

| Piece | Path | Purpose |
| --- | --- | --- |
| Manifest | `.claude-plugin/plugin.json` | Name, version, metadata |
| Marketplace catalog | `.claude-plugin/marketplace.json` | Lets the repo be installed by name *(coming in Task 6)* |
| Subagents | `agents/` | A read-only reviewer and a test-writer *(Task 2)* |
| Workflow command | `commands/` | One trigger that runs the subagents in parallel + sequence *(Task 3)* |
| Skill | `skills/<name>/SKILL.md` | Project conventions the reviewer applies *(Task 4)* |
| Hook | `hooks/hooks.json` | Fires lint/format on edits *(Task 4)* |

## Layout

```
claude-multi-agent-workflow/
├── .claude-plugin/
│   └── plugin.json          ← the ONLY thing inside .claude-plugin/
├── agents/                  ← component folders live at the ROOT
├── commands/
├── hooks/
├── skills/
├── course-api/              ← the app the plugin is tested against
├── README.md
└── PROJECT-BRIEF.md         ← the original course brief
```

The rule that trips people up: `.claude-plugin/` holds **manifest files only**
(`plugin.json`, and later `marketplace.json`). Every component folder — `agents/`,
`commands/`, `skills/`, `hooks/` — sits at the repo root, as a sibling of
`.claude-plugin/`, not inside it.

## Install

**Local, for development:**

```bash
claude --plugin-dir .
```

Run from the repo root. Use `/reload-plugins` to pick up edits without restarting.

**From the marketplace** *(available once Task 6 adds `marketplace.json`)*:

```
/plugin marketplace add christian-salafia/claude-multi-agent-workflow
/plugin install api-quality@claude-multi-agent-workflow
```

## Trying it against the API

```bash
cd course-api && npm install
```

Then invoke the plugin's pieces by their namespaced names (`api-quality:<name>`).

## Development notes

- Bundled script paths must use `${CLAUDE_PLUGIN_ROOT}` — never a hardcoded absolute
  path — so they resolve wherever the plugin is installed.
- Bump `version` in `.claude-plugin/plugin.json` on every meaningful change.
- `.gitkeep` files hold the empty component folders in git; delete each one as its
  folder gains real content.
