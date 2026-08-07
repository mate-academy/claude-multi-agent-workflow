# code-quality-guard

A Claude plugin that bundles a multi-agent workflow for automated code-quality review and test generation.

## What it provides

| Component | Path | Description |
|---|---|---|
| **Subagents** | `agents/` | `code-reviewer` (read-only scan, haiku) and `test-author` (writes tests, sonnet) |
| **Workflow command** | `commands/quality-check.md` | Orchestrates the subagents: parallel reviews, then dependent test generation |
| **Skill** | `skills/explain-code/SKILL.md` | Explains a code file in plain language |
| **Hook** | `hooks/hooks.json` | Runs a lint check after every file edit via `${CLAUDE_PLUGIN_ROOT}/scripts/lint-check.js` |

## Component layout

```
.claude-plugin/
  plugin.json          # manifest — name + version only
  marketplace.json     # marketplace catalog
agents/                # scoped subagent definitions (.md)
commands/              # workflow command definitions (.md)
skills/                # skill bundles (skills/<name>/SKILL.md)
hooks/                 # hook definitions (hooks/hooks.json)
scripts/               # bundled scripts invoked by hooks
```

> Only manifest files live inside `.claude-plugin/`. Everything else sits at the repo root.

## Installing

**Locally** from the repo root:

```bash
claude --plugin-dir .
```

**From the marketplace catalog:**

```bash
/plugin marketplace add <repo-url>
/plugin install code-quality-guard@<marketplace>
```

## Usage

After installing, run the workflow command:

```
/quality-check
```

Or invoke a single subagent directly:

```
/task code-reviewer
/task test-author
```
