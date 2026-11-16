# NOTES

## What the plugin does

`qa-checklist` prepares a task for testing. You give it a task id or a branch, and it:

1. compares the branch with `main`;
2. describes what changed, what else it can affect and where the risks are;
3. builds a test checklist: functional, non-functional, regression, negative cases, what to pay attention to, and which checks are already covered by autotests;
4. saves the report to `qa-checklists/<task>.md`.

It never changes code: a hook blocks code edits and any commit/push/merge/rebase/reset on `main`.

## Install

In Claude Code:

```
/plugin marketplace add IrenGorak/claude-multi-agent-workflow
/plugin install qa-checklist@qa-tools
```

To try it from a local clone without installing:

```
claude --plugin-dir /path/to/claude-multi-agent-workflow
```

## How to use

Run these inside the repository you want to test.

**Full QA checklist for a task**

```
/qa-checklist:qa-checklist TASK-42           # branch containing "TASK-42", compared with main
/qa-checklist:qa-checklist feature/login dev # a branch compared with another base branch
/qa-checklist:qa-checklist                   # the current branch (or uncommitted changes on main)
```

The report appears in `qa-checklists/TASK-42.md`. Every check is a `- [ ]` checkbox, so you can tick them off while testing.

**Quick analysis only (no checklist, no files written)**

```
/qa-checklist:code-analysis TASK-42
```

You can also just ask, for example "analyze the changes in TASK-42", and Claude will pick up the skill.

**Good to know**

- The task branch must exist locally (`git fetch` first if it is only on the remote).
- While the plugin is enabled, Claude cannot edit code in your repository, only write to `qa-checklists/`. To let Claude write code again, disable the plugin: `claude plugin disable qa-checklist` (or through the `/plugin` menu).
- On `main`/`master`, Claude is not allowed to run `git commit`, `push`, `merge`, `rebase`, `reset`, `cherry-pick` or `revert`. Pushing to `main` is blocked from any branch.
- The hook catches the obvious ways of changing files (Edit/Write, `sed -i`, `> file`, `git apply`, `git restore`). It is a safety net, not a sandbox.

## Scoping decision: what each subagent may use

- **Code-analyze: `Read, Grep, Glob`, model `sonnet`.** Its job is to understand a change and judge risk, so it must not be able to change the code it is judging. With read-only tools, "analysis only" is enforced by the tools rather than only by the prompt. It gets no Bash: the command collects the git diff and passes it in, so the agent cannot run anything that changes the repository. It uses `sonnet` because judging what a change can break needs real reasoning across files.
- **Checklist-writer: `Read, Grep, Glob, Write`, model `sonnet`.** It needs Glob/Grep/Read to find and read the existing tests, and Write for one thing only: saving the report. It has no Edit, so it cannot modify existing files, and the hook additionally restricts writes to `qa-checklists/`.

## Orchestration decision: what runs in parallel and what in sequence

- **Step 1 (sequential, the command itself):** collect the commits and the diff. Everything else needs this input, and the agents have no Bash to collect it themselves.
- **Step 2 (parallel):** `Code-analyze` analyzes the diff while `Checklist-writer` (Mode A) takes an inventory of the existing autotests. Neither job needs the other's result: the inventory depends only on the test files and the list of changed files. Running them together saves a full agent round-trip.
- **Step 3 (dependent):** `Checklist-writer` (Mode B) builds the checklist. It has to wait for both results of Step 2: the risks and affected areas from the analysis decide what to test, and the inventory decides which checks are already automated.
