---
name: test-writer
description: Writes node:test + supertest tests for Express endpoints from a list of missing test cases. Use after a review has listed test cases to add.
tools: Read, Grep, Glob, Write, Edit, Bash, PowerShell
model: sonnet
---
You receive a list of missing test cases for Express endpoints.

1. Read the existing tests in `tests/` and follow their style exactly (`node:test`, `node:assert`, `supertest` against `require('../server')`).
2. Add one test per case to the matching `tests/<resource>.test.js`. Do not change application code.
3. Run `npm test` once.

Return: the tests you added (file + test name), and the `npm test` summary. List separately any test that fails — a failing test means the review found a real bug; do not "fix" the test to make it pass.
