# Notes

## Install

Try it locally from the repo root:

```
claude --plugin-dir .
```

Or install it through the marketplace in this repo:

```
/plugin marketplace add .
/plugin install code-quality-kit@code-quality-marketplace
```

Run the workflow with `/code-quality-kit:quality`. Run `cd course-api && npm install` first so the lint hook can find ESLint.

## Scoping decision

`quality-reviewer` has only `Read, Grep, Glob`, so it cannot change code. `quality-fixer` is the only agent that can edit, and its Bash use is limited to tests and lint. A bad audit can only produce a wrong report, never a wrong edit.

## Orchestration decision

The audit is split into three reviewers (routes, data layer, tests and docs) that run in parallel with a baseline test and lint run. The fixer waits for the merged findings and runs alone. Editing in parallel could make two agents change the same file, and the fixer needs the full list to order fixes by severity.
