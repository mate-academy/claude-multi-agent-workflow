# lesson59-plugin — Notes

## What the plugin does

`lesson59-plugin` is a code quality plugin that ships two scoped subagents and a workflow command to review and fix code in one command.

- **reviewer-agent** — a read-only analyst that scans code for bugs, quality issues, and security concerns and returns a structured report.
- **writer-agent** — an editor that reads the reviewer's report and applies the fixes: patching critical issues and folding in suggested improvements.
- **`/quality-check`** — the single command that orchestrates both agents as a multi-step workflow.
- A **`code-quality` skill** and a **`PreToolUse` hook** round out the bundle.

## How to install

**From the marketplace (one command):**

```
/plugin marketplace add https://github.com/<your-username>/lesson_59
/plugin install lesson59-plugin@lesson_59
```

**Locally (for development):**

```
cd /path/to/lesson_59
claude --plugin-dir .
```

Use `/reload-plugins` inside a running session to pick up edits without restarting.

## Scoping decision: why the reviewer agent gets only read tools and Sonnet

The reviewer's entire job is analysis — it reads files, searches for patterns, and produces a report. It never needs to change anything on disk. Giving it only `Read`, `Search`, and `Glob` enforces that guarantee at the tool layer rather than relying on the prompt alone: even if the model drifted from its instructions, it cannot write or delete files.

Sonnet is the right tier for this task because code review is a comprehension and pattern-matching job, not a reasoning-heavy one. Using a heavier model would increase latency and cost without improving the output quality for this kind of structured analysis.

The writer agent, by contrast, needs `Edit` and `Write` in addition to read tools, and a stronger model — it must reason about *how* to apply a fix safely, not just spot that one is needed.

## Why the workflow runs steps in parallel then in sequence

The `/quality-check` command has two stages:

1. **Parallel** — the reviewer agent runs simultaneously on API routes and utility functions. These two scan targets are fully independent: neither result depends on the other, and there is no shared state between them. Running them at the same time cuts wall-clock time roughly in half compared to scanning sequentially.

2. **Sequential (dependent)** — the writer agent runs only *after* both reviewer passes complete. It needs the combined findings from both scans to decide what to fix and in what order — applying a fix to a route before knowing a utility it calls also has an issue could produce inconsistent patches. The dependency is real, so the step must wait.

The rule applied here: parallel when results are independent, sequential when a later step's input is the union of earlier outputs.
