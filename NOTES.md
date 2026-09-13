# NOTES

## What the plugin does

`course-api-tools` bundles a review-and-fix workflow for the `course-api` Express
project. It encodes the conventions from `course-api/CLAUDE.md` (one route file per
resource, all data access through `db/store.js`, `400` on bad input, `404` on missing
records, `{ "error": "message" }` error shape) into a subagent pair, a workflow
command, a skill, and a hook, so those conventions get checked and enforced
automatically instead of relying on someone remembering to look for violations.

## Install

```
/plugin marketplace add flazizi/claude-multi-agent-workflow
/plugin install course-api-tools@flazizi-marketplace
```

Then, from a session opened in `course-api/` (after `npm install` there once), run
`/review-and-fix` (optionally with a path argument) to audit and fix the project.

## Scoping decision: why `api-reviewer` is read-only and `api-fixer` isn't

`api-reviewer` is restricted to `Read, Grep, Glob` — it only ever needs to inspect
files and report what it finds, and giving it `Edit`/`Write`/`Bash` would let a
misfiring audit silently start changing code instead of just reporting on it. Keeping
it read-only makes its output trustworthy: the findings list it returns is guaranteed
to describe the code as it actually is, not as the agent already changed it to.

`api-fixer` needs `Edit`, `Write`, and `Bash` because its job is the opposite one —
apply the fixes the findings call for, then run `npm test` and `npm run lint` to
confirm they hold. It's only ever invoked with an explicit findings list from
`api-reviewer`, so its write access is scoped by what it's handed, not by open-ended
exploration.

The `model` choice follows the same logic: `api-reviewer` runs on `haiku` because
matching a fixed checklist against file contents doesn't need a stronger model.
`api-fixer` runs on `sonnet` because writing a correct, minimal edit — and knowing
when *not* to touch something — takes more judgment than auditing does.

## Orchestration decision: why the workflow runs one step in parallel and one in sequence

`/review-and-fix` audits two independent targets — `routes/` and `db/store.js` — with
two separate `api-reviewer` calls. Neither audit depends on the other's output, and
both are read-only, so there's no reason to make the second wait for the first: they
run in parallel in a single step.

The fix step is different: `api-fixer` needs the *complete* merged findings list
before it starts, because it's told not to invent findings of its own — applying
fixes report by report as they trickle in from partially-finished audits could leave
it acting on an incomplete picture, or fixing something the still-running second audit
would have flagged differently. So the fix step is a dependent step that only starts
once both parallel audits have returned.
