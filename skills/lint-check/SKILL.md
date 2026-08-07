---
name: lint-check
description: Run ESLint on the course-api directory and report any linting errors or warnings.
---

Run `npm run lint` (or `npx eslint .`) inside `course-api/` and capture the output.

Report each linting error with its file, line, rule name, and message. If the project has no lint script configured, say so and stop — do not install packages.

Return a plain list of findings, or "No lint errors found." if the output is clean.
