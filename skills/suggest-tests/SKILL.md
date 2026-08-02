---
name: suggest-tests
description: Suggests unit tests for recently changed code. Use when the user asks to add tests, improve coverage, or test a new function.
---
When the user asks to add tests for a function or file:
1. Read the target file to understand what the code does.
2. Identify untested edge cases: empty input, out-of-range values, error paths.
3. Write test cases following the existing pattern in `tests/` — use Node's built-in test runner and supertest.
4. Each test should use `test.beforeEach(() => store.reset())` to start from a clean state.

Return the test code ready to paste, with a one-line comment above each test explaining what it covers.
