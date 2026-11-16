---
description: Analyze the changes on a task branch and build a QA checklist (all testing types, negative cases, risks, covered autotests)
argument-hint: "[task-id or branch] [base branch, default: main]"
allowed-tools: Bash(git status:*), Bash(git branch:*), Bash(git rev-parse:*), Bash(git log:*), Bash(git diff:*), Bash(git merge-base:*), Glob, Grep, Read, Agent
---

# QA checklist workflow

You orchestrate two subagents from this plugin:

- **Code-analyze** (`qa-checklist:Code-analyze`) - read-only analysis of the change and its risks.
- **Checklist-writer** (`qa-checklist:Checklist-writer`) - test inventory, then the checklist and the saved report.

The flow:

```
Step 1  collect the change context (you)
Step 2  in parallel:
          ├─ Code-analyze       -> analysis of the change
          └─ Checklist-writer A -> inventory of existing autotests
Step 3  depends on both results of Step 2:
          └─ Checklist-writer B -> checklist + report in qa-checklists/
Step 4  summary for the user (you)
```

Arguments: `$ARGUMENTS`
- First argument: task id or branch name. If empty, use the current branch.
- Second argument: base branch. If empty, use `main`.

Respond to the user in the language they use.

## Step 1 - Collect the change context (you do this, not the subagents)

The subagents have no Bash, so they cannot run git. Gather what they need:

1. Resolve the task branch:
   - If the argument matches a branch name, use it.
   - Otherwise look for a branch that contains the task id: `git branch --all --list "*<task-id>*"`.
   - If nothing matches, use the current branch (`git rev-parse --abbrev-ref HEAD`) and say so.
   - If the task branch is the same as the base branch, use the uncommitted changes (`git diff HEAD`, `git status --short`) instead of a branch diff.
2. Find the merge base: `git merge-base <base> <branch>`.
3. Collect:
   - `git log --oneline <merge-base>..<branch>` - commits of the task
   - `git diff --stat <merge-base>..<branch>` - changed files
   - `git diff <merge-base>..<branch>` - full diff (if it is very large, keep the full diff for source files and only the stat for lock files and generated files)

If there are no changes at all, stop and tell the user there is nothing to check.

## Step 2 - Analysis and test inventory, in parallel

These two jobs do not depend on each other. Launch both Agent calls **in the same message** so they run at the same time.

**2a. Code-analyze** - `subagent_type: "qa-checklist:Code-analyze"`. In the prompt include:
- task id, task branch, base branch;
- the commit list, the diff stat and the full diff from Step 1.

**2b. Checklist-writer, Mode A (test inventory)** - `subagent_type: "qa-checklist:Checklist-writer"`. In the prompt include:
- "Mode A - test inventory. Do not write any files.";
- the diff stat (the changed files to focus on), marking the test files that were changed in this task.

Wait for both results: the **analysis** and the **test inventory**.

## Step 3 - Checklist and report (depends on Step 2)

Start only after both Step 2 agents have returned, because the checklist is built from both results.

Launch `subagent_type: "qa-checklist:Checklist-writer"`. In the prompt include:
- "Mode B - checklist and report.";
- task id, task branch, base branch, today's date, the commit list;
- the full **analysis** from 2a;
- the full **test inventory** from 2b;
- the report path: `qa-checklists/<task-id or branch>.md` (replace `/` in a branch name with `-`).

## Step 4 - Summary

Show the user:
- the number of changed files;
- the top 3 risks;
- the number of checks and how many are covered by autotests;
- the path to the saved report.
