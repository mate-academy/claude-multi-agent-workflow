---
description: Run a multi-agent code quality workflow. Two reviewers inspect the target in parallel, their findings are merged, then a fixer applies them.
argument-hint: [file, directory, or description of what to check]
allowed-tools: Task
---

Run a code quality workflow on this target: $ARGUMENTS

If no target was given, use the whole project, but skip dependency folders such as `node_modules`.

You are only the coordinator. Do not read or edit code yourself. All the work is done by the plugin's subagents, which you start with the Task tool: `code-reviewer` (read-only, finds problems) and `code-fixer` (edits files, applies fixes). If the agents are namespaced in this session, use `code-quality-workflow:code-reviewer` and `code-quality-workflow:code-fixer`.

## Step 1: Parallel review (two reviewers at the same time)

Launch both reviewer tasks concurrently in the same orchestration step. Do not wait for one reviewer to finish before starting the other.
The two reviews do not depend on each other, so start both together. Make both Task calls in one single message so they run side by side. Do not start one, wait for it, and then start the other.

Both tasks use the `code-reviewer` agent and review the same target. Give each one its own focus and tell it to stay within that focus so the two don't overlap:

- **Reviewer A, correctness:** look for bugs and risks, missing input validation, weak or missing error handling, unhandled promise rejections, edge cases (empty, null, or malformed input, boundary values), and security basics.
- **Reviewer B, maintainability:** look for duplicated code, unclear naming, poor readability, overly long or complex functions, deep nesting, dead code, and places that break the project's own conventions.

Tell each reviewer to return its findings in the standard numbered format: severity, file and location, issue, why it matters, and recommended fix.

## Step 2: Wait and consolidate

Do not go any further until both reviewers have finished and returned their results. Then merge the two lists into one:

1. Combine all findings from both reviewers.
2. Remove duplicates. If both reviewers flagged the same problem, or the same location with the same fix, keep one entry and use the clearer wording.
3. Sort by severity, high first, and renumber the findings from 1.
4. Keep every finding in the same format: severity, file and location, issue, why it matters, and recommended fix.

If the merged list is empty, stop here. Do not start the fixer. Report that no issues were found.

## Step 3: Fix (sequential, depends on Step 2)

Only after Step 2 is complete, start one `code-fixer` task. It cannot start earlier because it needs the consolidated list.

Pass it the full consolidated findings list as its input. Tell it to fix only those findings, keep changes small and focused, and return the files changed, the changes made, and which findings were fixed, skipped, or partially fixed.

## Step 4: Summarize

When the fixer finishes, give the user a short summary:

- the target that was reviewed;
- how many findings each reviewer reported, and how many remained after deduplication;
- the consolidated findings, grouped by severity;
- the files the fixer changed and what it changed;
- which findings were fixed, skipped, or partially fixed, and why;
- anything that still needs a human decision.
