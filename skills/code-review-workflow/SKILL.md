---
name: code-review-workflow
description: Runs a full code review and fix workflow by orchestrating the code-quality-reviewer and code-editor-agent subagents. Use when the user asks to review code quality, find bugs or convention violations (per CLAUDE.md), check test coverage gaps, or review code and automatically fix the issues found.
allowed-tools: Task, Read, Grep, Glob
---

# Code Review Workflow

Review a target (files, a directory, or the current uncommitted changes), then fix the confirmed issues, in a single operation.

## When to use

- The user wants code reviewed for bugs, correctness issues, CLAUDE.md convention violations, or test coverage gaps.
- The user wants issues found and fixed in one pass.

If the user only wants a review with no edits, run Step 1 with the reviewer alone and skip Step 2.

## Requirements

These subagents must exist in `.claude/agents/` (or `~/.claude/agents/`):

- `code-quality-reviewer`: read-only, returns findings as a JSON array
- `code-editor-agent`: reads, edits, and writes files

If either is missing, tell the user and stop.

## Workflow

### Step 1: Parallel analysis

Determine the target from the user's request. If none was given, use the uncommitted changes in the working tree.

Launch BOTH subagents in a single message so they run concurrently:

1. **code-quality-reviewer**: Review the target for bugs, correctness issues, CLAUDE.md convention violations, simplification opportunities, and test coverage gaps. Ask for findings as a JSON array (empty array if none).
2. **code-editor-agent**: Context pass only. Tell it explicitly NOT to modify any files in this step. It should read the target and surrounding code (callers, related modules, existing tests, conventions) and return a short summary of the patterns relevant to making fixes.

Wait for both to finish before continuing.

### Step 2: Dependent fixes

Inspect the reviewer's findings.

- **Empty array:** skip editing and go to Step 3.
- **Findings present:** launch **code-editor-agent** again with the findings to fix, the context summary from Step 1, and these instructions: make minimal, targeted edits that follow existing conventions, and report anything it chose not to fix and why.

Which findings to fix:

| Severity / verdict | Action |
|---|---|
| `important` + `CONFIRMED` | Fix |
| `important` + `PLAUSIBLE` | Pass to the editor with an instruction to verify the issue first and skip it if it doesn't hold up |
| `pre_existing` | Don't fix; list in the report |
| `nit` | Don't fix; list in the report |

### Step 3: Report

Present a summary with these sections:

- **Verdict:** one line, either "No issues found, code looks good" or "N issues found, M fixed".
- **Findings:** a table with file:line, category, severity, verdict, and a one-line summary for each.
- **Edits made:** files the editor changed and what each change does. Omit if nothing was edited.
- **Not fixed:** `pre_existing` and `nit` findings, plus anything the editor skipped, with reasons.
- **Verify:** anything the user should check manually, such as tests to run, since the subagents cannot execute code.

## Rules

- Never edit files directly from this skill. All edits go through `code-editor-agent`.
- Never let `code-editor-agent` modify files during Step 1.
- Don't fix more than the findings listed above. Keep changes in scope.
- Don't claim success on edits the editor didn't report.