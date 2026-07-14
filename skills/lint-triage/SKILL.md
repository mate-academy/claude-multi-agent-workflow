---
name: lint-triage
description: Use this skill when `npm run lint` in course-api reports warnings or errors that the formatting hook's auto-fix didn't resolve, or before adding new Express routes/handlers there. Explains this project's ESLint rules and how to fix violations at the root instead of suppressing them.
---

# Lint triage for course-api

`course-api/eslint.config.js` extends `@eslint/js`'s recommended rules, plus one project-specific rule:

- `no-unused-vars` is a **warning**, not an error, and ignores the argument names `req`, `res`, and `next` (the standard Express handler signature) even when unused.

## How to fix common violations

- **Unused variable or import (anything other than `req`/`res`/`next`)** — delete it. Don't prefix it with `_` or add a disable comment; the config doesn't special-case underscore-prefixed names, so a suppressed warning just hides an unused-code smell instead of removing it.
- **`recommended`-set errors (unreachable code, no-fallthrough, etc.)** — these flag real control-flow bugs. Fix the logic rather than restructuring the code to dodge the rule.
- **A rule that's clearly wrong for one specific line** — narrow the fix to that line (a targeted disable comment with a reason) rather than editing `eslint.config.js`. Only touch the shared config if the rule is wrong for the whole project, and call that out explicitly, since it changes what every contributor sees.

Run `npm run lint` from `course-api/` to confirm the fix, then `npm test` — removing a variable or tightening a condition can occasionally surface a real bug that the tests catch.
