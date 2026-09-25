---
name: review-guide
description: Load before reviewing code to calibrate what counts as a finding worth raising — sets the bar so reviews stay signal, not noise.
---

When reviewing code, apply this standard:

**Raise as high:**
- A bug that produces wrong output or crashes at runtime
- Missing validation on user-supplied input at a route boundary (no check before using `req.body`, `req.params`, or `req.query`)
- An unhandled promise rejection or missing error callback

**Raise as medium:**
- A name (variable, function, route handler) that requires the reader to already know what it does
- Logic that works but will silently misbehave under a realistic edge case (empty array, zero, null)
- An error response that leaks internal detail (stack trace, raw DB error)

**Raise as low:**
- A comment that restates the code rather than explaining the why
- An unnecessary intermediate variable that adds no clarity
- A style inconsistency that doesn't affect readability

**Do not raise:**
- Stylistic preferences with no correctness or clarity impact
- Speculative future improvements ("you could also…")
- Anything already covered by the linter

One sentence per finding. Skip a bucket entirely if there is nothing to report.

---
