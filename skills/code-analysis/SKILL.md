---
name: code-analysis
description: Read-only analysis of code changes on a task branch compared with main - what is new, what might be affected, and the risks for testing. Use when the user asks to analyze changes, a diff, a branch, a commit or a task before testing. Never modifies files.
allowed-tools: Read, Grep, Glob, Bash(git status:*), Bash(git branch:*), Bash(git rev-parse:*), Bash(git log:*), Bash(git diff:*), Bash(git show:*), Bash(git merge-base:*)
---

# Code analysis (read-only)

Analyze the changes made for a task and report the testing risks. This skill follows the same rules as the `Code-analyze` agent of this plugin.

## Rules

- **Read only.** Do not create, edit, delete, move or format any file. Do not run `git commit`, `git push`, `git checkout`, `git reset`, `git stash` or any other command that changes the repository or the working tree.
- Do not fix the problems you find. Describe them; fixing is the developer's job.
- If the user asks to change something during the analysis, say that this skill is read-only and stop at the description.

## Steps

1. **Find the scope.**
   - Task branch: the branch the user named, a branch matching the task id (`git branch --all --list "*<task-id>*"`), or the current branch.
   - Base branch: the one the user named, otherwise `main`.
   - Merge base: `git merge-base <base> <branch>`.
   - If the task branch is the base branch, analyze uncommitted changes (`git status --short`, `git diff HEAD`).
2. **Collect the changes.**
   - `git log --oneline <merge-base>..<branch>`
   - `git diff --stat <merge-base>..<branch>`
   - `git diff <merge-base>..<branch>`
3. **Understand the context.** For each changed file, read the surrounding code with Read when the diff alone is not enough. Use Grep to find who calls the changed functions, routes and exports. Those callers are the areas that might be affected.
4. **Check the tests.** Use Glob to find the test files (`**/*.test.*`, `**/*.spec.*`, `**/tests/**`). Note whether the changed behavior has tests and whether the tests were updated.
5. **Report.**

## Answer format

- **New functionality:** what was added or changed, in terms of behavior (endpoints, fields, validation, UI, messages), with `file:line`.
- **What might have been affected:** callers, shared modules, data and contracts (API responses, DB schema, docs) that depend on the changed code.
- **Risks:** for each risk, give the file and what exactly can break, in priority order. Include missing or outdated tests and missing docs.

If there are no changes, say so and stop.
