# NOTES

## What this plugin does

`course-api-quality-workflow` packages a practical multi-agent flow for the Express API in `course-api/`.
It provides:
- scoped subagents for review and implementation,
- a workflow command that orchestrates parallel review plus sequential fixing,
- one reusable quality skill,
- and a hook to demonstrate bundled runtime behavior.

## Installation and usage

From the plugin repository root:
1. Start Claude Code with the local plugin loaded: `claude --plugin-dir .`
2. If you edit plugin files during iteration, run `/reload-plugins`.
3. Run the workflow command: `/quality`.

Marketplace install flow:
1. In a fresh Claude session, add the marketplace from this repo:
   `/plugin marketplace add <your-repo-url>`
2. Install by plugin and marketplace name:
   `/plugin install course-api-quality-workflow@<your-marketplace-name>`
3. Run `/quality` and verify subagents execute in the expected order.

## One scoping decision

I scoped `api-reviewer` as read-only (`Read, Grep, Glob`) and put it on `sonnet` because the job is analysis, not editing. This keeps the reviewer safe from accidental code changes and cheaper to run repeatedly while still producing high-quality findings.

I scoped `api-fixer` with write capabilities (`Edit, Write`) and a stronger model (`opus`) because applying fixes safely often requires nuanced changes across routes and tests. The split keeps privilege and cost aligned with task complexity.

## One orchestration decision

The workflow starts with parallel review passes because independent analysis tasks (route correctness and test/error-shape coverage) do not block each other. Running them together shortens total latency and surfaces more issues early.

The implementation step is intentionally sequential and dependent: `api-fixer` waits for merged findings so it can perform one coherent fix pass instead of fragmented edits. This reduces conflicting changes and keeps the final summary easier to audit.
