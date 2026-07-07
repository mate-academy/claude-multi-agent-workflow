# code-quality plugin — notes

## What the plugin does and how to install it

The `code-quality` plugin bundles a two-agent review-and-fix workflow for Express API projects. It gives Claude a read-only reviewer, a write-capable fixer, a workflow command that runs them in the right order, a skill encoding the project's route conventions, and a post-edit lint hook.

**Install from the marketplace:**
```
/plugin marketplace add sophierousee3566/claude-multi-agent-workflow
/plugin install code-quality@sophie-code-quality-catalog
```

**Run the workflow:**
```
/code-quality:review-and-fix
```

This reviews `routes/` and `db/` in parallel, then (if issues are found) passes the combined list to the fixer in a dependent step.

## Scoping decision — why `code-reviewer` uses haiku with read-only tools

The reviewer's job is purely analytical: read files, apply a checklist, return a list. It never writes. Giving it `Read, Grep, Glob` only means there is no way for the review step to accidentally modify a file — safe to run in CI or without watching.

Model choice: `haiku` is fast and cheap for pattern-matching tasks. Reviewing route files against a fixed checklist does not need the reasoning depth of `sonnet` or `opus`. Reserving the heavier model for the fixer (which makes edits that must be correct) is the right trade-off.

## Orchestration decision — parallel review, sequential fix

The two review calls (routes/ and db/) are completely independent — neither depends on the other's output. Running them in parallel halves the wall-clock time with no correctness risk.

The fix step is sequential and dependent because it needs the combined issue list from both reviews before it can run. Starting the fixer before the reviews finish would give it an incomplete picture and produce partial or wrong edits. The sequential dependency here is not a design choice but a correctness requirement: the fixer's input is the reviews' output.
