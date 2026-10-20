# code-quality — notes

## What it does

The **code-quality** plugin runs a multi-agent workflow over an Express API (default target: `course-api/`). A read-only **code-reviewer** finds validation, status-code, and convention issues; a **test-writer** then adds or fixes tests from those findings. An **api-conventions** skill keeps route/error rules handy, and a PostToolUse hook reminds you to lint after Write/Edit.

## How to install

**As a marketplace (recommended for others):**

1. `/plugin marketplace add romanblyashuk94/claude-multi-agent-workflow`
2. `/plugin install code-quality@code-quality-marketplace`

**Locally while developing this repo:**

```bash
claude --plugin-dir .
```

Use `/reload-plugins` after changing agents, commands, skills, or hooks. Prepare the sample API once with `cd course-api && npm install`.

## Scoping decision

**code-reviewer** is limited to `Read`, `Grep`, and `Glob` on the `sonnet` model. Review should never mutate the tree — a write-capable reviewer can “fix” issues mid-pass and muddy the report. Read-only tools force a clean findings list that **test-writer** (which has `Write`/`Edit`/`Bash`) can act on afterward. Sonnet is enough for structured API review without burning a heavier model on a search-and-summarize job.

## Orchestration decision

`/quality-check` runs **review + test-file inventory in parallel** because neither needs the other’s output — they only share the same codebase. **test-writer runs after both finish** because it depends on the reviewer’s findings and the inventory of missing suites; starting it earlier would either duplicate work or miss gaps. That pattern (one parallel fan-out, one dependent step) keeps the workflow fast without sacrificing correctness.
