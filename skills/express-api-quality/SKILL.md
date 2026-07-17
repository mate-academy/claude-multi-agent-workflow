---
name: express-api-quality
description: Apply the Course API quality checklist when reviewing or changing its Express routes and tests.
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Bash
---

# Express API quality checklist

Use this skill for work in `course-api/`.

1. Read `course-api/CLAUDE.md` before judging or changing behavior.
2. Keep state access in `db/store.js`; route modules must not own state.
3. Validate request input at the route boundary. Return JSON `{ "error": "message" }` with `400` for invalid input and `404` for missing records.
4. Keep route behavior covered by `course-api/tests/` and run `npm test` plus `npm run lint` from `course-api/` after changes.
5. Report the behavior checked, files changed, and the result of each verification command.
