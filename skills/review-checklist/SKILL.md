---
name: review-checklist
description: Severity rubric and checklist for reviewing Node/Express code. Use when reviewing code, grading the severity of a bug, or preparing instructions for the code-reviewer subagent.
---

# Review checklist and severity rubric

Use this rubric so every reviewer grades findings the same way.

## Severity

| Severity | Meaning | Examples |
|---|---|---|
| **High** | Wrong behaviour, data loss, crash, or security issue that a user can hit | Unhandled exception on bad input; route returns 200 when the record is missing; shared state mutated across requests; user input reaching a query or the filesystem unvalidated |
| **Medium** | Works today but fragile, or breaks a project convention | Missing `400` validation; error body not shaped `{ "error": "message" }`; route holding state instead of using the data layer; missing `404` path |
| **Low** | Readability and maintainability | Unclear or misleading names; dead code; duplicated logic; magic numbers |

When unsure between two levels, pick the lower one and say why.

## Checklist (Express APIs)

**Input and errors**
- Every route that reads `req.params`, `req.query`, or `req.body` validates it and returns `400` on bad input.
- Lookups by id return `404` when nothing is found.
- Error responses are JSON: `{ "error": "message" }`.
- Async handlers catch errors (or the app has an error middleware).

**Data and state**
- Data access goes through the project's data layer (e.g. `db/store.js`), not module-level variables in routes.
- Returned objects are not live references that callers can mutate.

**Naming**
- Function names are verbs that say what they do; booleans read as questions (`isActive`, `hasEmail`).
- No single-letter names outside short loops.

**Conventions**
- Read the project's `CLAUDE.md` and check new code follows it.

## Finding format

```
- `<file>:<line>` — <problem>. Fix: <what to change>.
```
