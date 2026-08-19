---
name: api-review-checklist
description: Conventions and a checklist for reviewing or fixing Express route handlers and tests in course-api/ — response shapes, error handling, status codes, and validation. Load this before judging whether a route or test in course-api/ is correct, or before writing a fix for one.
---

# course-api review checklist

This project is a small Express API (`course-api/`). Use this checklist whenever reviewing, writing, or fixing a route handler or its tests, so judgments are consistent with what's already in the codebase rather than a generic Express style.

## Before anything else

Read `course-api/CLAUDE.md` — it documents this project's own conventions and takes priority over anything below if the two disagree.

## Route handlers (`course-api/routes/`)

- **Status codes**: 200/201 for success, 400 for a malformed or missing request body/params, 404 when the resource doesn't exist, 500 only for genuinely unexpected failures. A missing resource returning 500, or a bad request returning 200, is a bug.
- **Error responses**: check the shape existing routes already return on error (e.g. `{ error: "message" }`) and match it — don't invent a new error shape for a new route.
- **Validation**: required fields and types should be checked before the handler touches the data layer. A route that trusts `req.body` blindly is a finding, not a nitpick.
- **Async errors**: any `async` handler must catch and translate errors into a proper response — an unhandled rejection that crashes the process or hangs the request is a correctness bug, not a style issue.
- **Consistency**: naming, route structure, and response field names should match sibling routes in the same file/folder.

## Tests (`course-api/tests/`)

- Every route should have at least one test for its success path and at least one for its main failure path (bad input, not-found).
- Assertions should check status code **and** response body shape, not just that the call didn't throw.
- A test that would still pass if the handler's logic were deleted is not testing anything — flag it.

## Verifying a fix

After changing anything under `course-api/`, run from `course-api/`:

```
npm run lint
npm test
```

Both must be clean before a fix counts as done.
