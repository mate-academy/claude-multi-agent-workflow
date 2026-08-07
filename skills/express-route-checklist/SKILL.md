---
name: express-route-checklist
description: Use when adding or reviewing an Express route handler, controller, or middleware in course-api/ (or a similar Express API) — checks input validation, error handling, status codes, and response shape against the plugin's house rules. Trigger on requests like "add a route", "review this endpoint", "is this handler correct".
---

# Express route checklist

Apply this checklist to any Express route handler, whether you're writing a new one or reviewing an existing one.

## Validation
- Every input the handler reads from `req.params`, `req.query`, or `req.body` is checked before use (type, presence, and any obvious range/format constraint).
- Missing or malformed input returns `400` with a body describing what's wrong — it does not fall through to a `500` or an unhandled exception.

## Error handling
- Async handlers wrap their work so a rejected promise reaches Express's error handling (either `try/catch` + `next(err)`, or an async-error wrapper already used elsewhere in the codebase) — a thrown error inside an unwrapped `async` handler crashes silently instead of returning a response.
- Not-found records return `404`, not a `200` with `null`/`undefined` or a `500`.
- Errors follow the same response shape as the rest of the API (check a sibling route for the convention already in use).

## Status codes
- Success codes match the operation: `200` for reads/updates, `201` for creates, `204` for deletes with no body.
- The handler doesn't reuse `200` for every outcome regardless of what happened.

## Consistency
- The route uses the same middleware (auth, validation, logging) that comparable routes in the same file/router use — an endpoint that silently skips a check its siblings apply is a bug waiting to happen.

## Output

When applying this checklist, report each item as pass/fail with the file and line for any failure, plus the concrete scenario that would break (e.g. "a `DELETE` with a non-existent id returns 500 instead of 404"). Don't flag style issues that aren't on this list.
