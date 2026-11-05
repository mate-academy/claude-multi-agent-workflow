---
description: Review code, find test gaps, then write and run the missing tests
argument-hint: "[path]"
---
Run a code quality check on: $ARGUMENTS

If no path was given, use `course-api/`.

Follow these steps in order:

1. **Parallel step.** Start the `code-reviewer` and `test-gap-finder` subagents at the same time, in one turn. Give both the path. Neither needs the other's result.
2. **Wait.** Do not continue until both subagents have returned their reports.
3. **Dependent step.** Run the `test-writer` subagent. Give it the path and the full text of both reports, because it depends on them to decide what to test.
4. **Summary.** Report these sections: Review findings, Test gaps, Tests added, Test results, and Application bugs still to fix.

Do not fix application code yourself.