---
name: quality-checklist
description: Use before calling an Express/Node route change done — a checklist of the project's quality and convention rules to verify against (status codes, validation, error shape, state via the store, tests).
---

# Quality checklist

Run through this before declaring a change to the `course-api` complete. Each item is a yes/no you must be able to answer with evidence, not assumption.

## Correctness & conventions
- [ ] Every route **validates its input** and returns `400` on bad input.
- [ ] Missing records return `404`, not `500` or an empty `200`.
- [ ] Error responses use the JSON shape `{ "error": "message" }`.
- [ ] Successful creates return `201`; reads/updates return `200`.
- [ ] All data access goes through `db/store.js` — the route holds no state of its own.
- [ ] No dead code, commented-out blocks, or unused imports left behind.

## Tests
- [ ] Happy path is tested.
- [ ] Each validation failure (`400`) and missing-record case (`404`) is tested.
- [ ] `npm test` passes from inside `course-api/` — confirmed by running it, not assumed.

## Hygiene
- [ ] `npm run lint` is clean for the files you touched.
- [ ] New behaviour is reflected in `docs/api.md` if it changes the public contract.

If any box is unchecked, the change is not done. Fix it or call it out explicitly.
