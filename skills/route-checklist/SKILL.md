---
name: route-checklist
description: Use when adding or changing a route in course-api/. Walks through the checks every route must pass before it is done.
---

# Route checklist

Before calling a route in `course-api/` done, confirm each item:

- [ ] Validate input (params, query, body: presence, type, format).
- [ ] Bad input returns `400` with a JSON error body, e.g. `{ "error": "..." }`.
- [ ] A missing item returns `404` (also with a JSON error body).
- [ ] Add a `node:test` test in `course-api/tests` covering the success, `400` and `404` cases.
- [ ] Update `course-api/docs/api.md` to match the route's behavior.
