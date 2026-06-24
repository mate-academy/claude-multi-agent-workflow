---
name: lint-check
description: Run ESLint across the course API and return a formatted summary of all errors and warnings, grouped by file — use this before committing or after making edits to catch style and correctness issues early.
---

Run ESLint on the course API and return a clean, readable report.

Steps:
1. Run `npm run lint` from the `course-api/` directory using Bash.
2. If the exit code is 0, report: "No lint issues found."
3. If there are issues, parse the ESLint output and group findings by file.
4. For each file with findings, list each one as: `line:col  rule-name  message`.
5. End with a one-line count: "X errors, Y warnings across Z files."

Keep the output tight — no preamble, just the grouped findings and the count.
