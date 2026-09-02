# code-quality

A Claude Code plugin that bundles a small multi-agent **code-quality** workflow. Point it at a
branch or a working-tree diff and it reviews the change, fills the test gaps it finds, and keeps
the tree linted as you edit.

> The original course brief for this repo lives in [`COURSE.md`](./COURSE.md).

## What's in the box

| Component | Name | Purpose |
| --- | --- | --- |
| Subagent | `code-reviewer` | Read-only. Reviews a diff for correctness, convention, and risk; returns a findings list. |
| Subagent | `test-author` | Writes/edits. Adds or extends tests to cover untested behaviour it's pointed at. |
| Command | `/quality-check` | Orchestrates both: review + test-gap scan in parallel, then test authoring depends on the results. |
| Skill | `test-conventions` | The project's testing conventions, loaded when writing or reviewing tests. |
| Hook | `PostToolUse` | Runs the linter on files touched by `Edit`/`Write` and reports problems back. |

## Install

```
/plugin marketplace add <this-repo>
/plugin install code-quality@code-quality
```

Or load it straight from a checkout:

```
claude --plugin-dir .
```

## Layout

```
.claude-plugin/
  plugin.json          # manifest — name + version
  marketplace.json     # marketplace catalog
agents/                # scoped subagents
commands/              # the /quality-check workflow
skills/                # test-conventions
hooks/                 # hooks.json + bundled scripts
```

Only manifest files sit inside `.claude-plugin/`; every component folder is at the repo root.
