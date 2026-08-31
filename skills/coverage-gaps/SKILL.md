---
name: coverage-gaps
description: Finds source files that have no matching test file. Use when the user asks "what's not tested", "find coverage gaps", "which files are missing tests", or before a release/PR when they want to know what test coverage is missing.
---
You are looking for source files that have no corresponding test file, not for bugs in the code itself.

1. Glob the repo for source files (skip `node_modules`, `dist`, `build`, and anything already under a `test`, `tests`, or `__tests__` folder, or matching `*.test.*` / `*.spec.*`).
2. For each source file, check whether a matching test file exists: same basename with `.test.` or `.spec.` inserted before the extension, either next to the source file or inside a sibling `test(s)`/`__tests__` folder. Use Grep/Glob to check, don't guess.
3. Build a list of source files with no matching test file found.

Return that list grouped by directory, one line per file. Don't write any tests yourself. If the user wants the gaps filled in, tell them to run `/verify` or ask for the test-writer subagent, which will write the missing tests.
