---
name: code-quality
description: Review and improve the quality of the Express API by inspecting code, running tests, applying safe fixes, and validating the result.
---

# Code Quality Skill

Use this skill when working on the Express API in `course-api/` and the goal is safer, cleaner, better-tested code.

## Workflow

1. Inspect the relevant routes, database code, tests, and package scripts before changing anything.
2. Prefer evidence from tests, lint/format output, and existing project conventions over speculative refactors.
3. Keep changes focused and reversible.
4. After any edit, rerun the narrowest relevant check first, then the broader test suite when practical.
5. Report changed files, commands run, results, and unresolved risks.

## Safety

Do not modify files outside `course-api/` unless the user explicitly asks. Do not weaken tests to make them pass. Do not claim validation that was not actually run.
