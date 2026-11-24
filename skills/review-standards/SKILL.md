---
name: review-standards
description: The shared standard for judging code quality in this plugin — how to rate bug severity, what an Express API must do on every route, and when a finding is worth reporting. Use when reviewing code, deciding whether a bug is high, medium or low, deciding what to fix in an audit, or writing a fix for a route.
---

# Review standards

Use this standard whenever you review code, rate a finding, or decide what to fix. It keeps the reviewer, the audit workflow and any fixes in agreement.

## 1. Project rules come first

Read the project's `CLAUDE.md` before judging anything. Its conventions override the defaults below. A break of a documented convention is always worth reporting, even if the code works.

## 2. Severity

| Severity | Meaning | Examples |
|----------|---------|----------|
| **high** | Wrong result, crash, data loss or security hole on a normal request | unhandled exception on bad input, record from the wrong user returned, stored data corrupted, secrets logged |
| **medium** | Wrong behaviour on a realistic edge case, or a broken API contract | missing `404` for an unknown id, `500` where a `400` belongs, string id compared to a number id, missing `await` |
| **low** | Works today but fragile or misleading | shared array returned and open to mutation by callers, misleading comment, dead branch |

Not a bug: style the linter enforces, personal preference, and "could be faster" without a measured problem. Leave these out.

Rate a finding by its **concrete failure**: if you can't name an input and the wrong output it produces, it is at most low, or it's a readability note.

## 3. Express API checklist

Check every route against this list:

- **Input validation**: required body fields are checked, and bad input returns `400`.
- **Missing records**: a lookup by id returns `404` when nothing is found, not `200` with `null` and not `500`.
- **Id types**: `req.params.id` is a string; it must be converted before comparing it with stored ids.
- **Error shape**: every error response is JSON, `{ "error": "message" }`.
- **Status codes**: `201` on create, `200` on read and update, `204` (or `200` with a body) on delete.
- **Data access**: routes go through the data layer (for example, `db/store.js`) and never keep state of their own.
- **Async**: every promise is awaited, and async errors reach an error handler instead of hanging the request.
- **Tests**: each route has tests for the success path and for its `400` and `404` cases.

## 4. Writing a fix

- Make the smallest change that removes the concrete failure. Don't refactor nearby code in the same fix.
- Match the surrounding code's style and comment density.
- Add or update a test that would have caught the bug when the project has a test suite, then run it.
