---
description: Runs a multi-agent code-quality workflow — parallel review scans on multiple directories, then test generation based on the findings.
---

# quality-check

Orchestrates the `code-quality-guard:code-reviewer` and `code-quality-guard:test-author` subagents to assess and improve code quality in a single flow.

## Steps

1. **Parallel review — src/** — Invoke `code-quality-guard:code-reviewer` on the `src/` directory. Returns a quality report.
2. **Parallel review — routes/** — Invoke `code-quality-guard:code-reviewer` on the `routes/` directory. Returns a quality report.
3. **Parallel review — tests/** — Invoke `code-quality-guard:code-reviewer` on the `tests/` directory to assess existing test quality.
4. **Dependent: test generation** — After all three reviews complete, invoke `code-quality-guard:test-author` with the combined reviewer findings as context. It writes or updates test files to cover the gaps the reviewers identified.
5. **Synthesize** — Report a combined summary: all quality issues found, all tests created, and any remaining action items.

Steps 1–3 run in **parallel** because each scans an independent directory tree — no shared state, no dependency, so parallel is strictly faster. Step 4 runs in **sequence** after the reviews because the `code-quality-guard:test-author` needs the findings to target the right gaps; if it ran before the reviews finished it would lack the context to write effective tests. Step 5 waits on every prior step so the summary is complete.
