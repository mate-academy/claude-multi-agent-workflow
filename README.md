# qa-checklist

A Claude Code plugin for QA. It analyzes the changes on a task branch, finds the testing risks and builds a test checklist: functional, non-functional, regression and negative cases, plus which checks are already covered by autotests.

The plugin only reads code. Claude can write QA reports, but a hook stops it from changing code or committing to `main`.

## What's inside

| Component | Name | What it does |
|---|---|---|
| Command | `/qa-checklist:qa-checklist` | Runs the whole workflow and saves the report to `qa-checklists/<task>.md` |
| Agent | `qa-checklist:Code-analyze` | Read-only: what changed, what it can affect, risks |
| Agent | `qa-checklist:Checklist-writer` | Takes an inventory of autotests, builds the checklist and writes the report |
| Skill | `/qa-checklist:code-analysis` | Quick read-only analysis of the changes, without a checklist |
| Hook | `PreToolUse` guard (`hooks/qa-guard.js`) | Blocks code edits (except `qa-checklists/`) and commit/push/merge/rebase/reset on `main` |

## Workflow

```
/qa-checklist:qa-checklist TASK-42
   │
   ├─ 1. collect commits and diff against main
   ├─ 2. in parallel:  Code-analyze  +  Checklist-writer (autotest inventory)
   ├─ 3. then:         Checklist-writer (checklist + report)
   └─ 4. summary
```

## Install and use

See [NOTES.md](NOTES.md).

## Repository layout

```
.claude-plugin/plugin.json      plugin manifest
agents/                         subagents
commands/qa-checklist.md        workflow command
skills/code-analysis/SKILL.md   read-only analysis skill
hooks/hooks.json, qa-guard.js   guard hook
course-api/                     sample Express API to test the plugin against
ASSIGNMENT.md                   the course assignment
```
