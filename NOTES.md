# Notes

## What the plugin does and how to install it

code-quality reviews an Express API, finds endpoints and cases without tests, and then writes the missing tests and runs them.

Install:
1. /plugin marketplace add bogdanotkovic2-code/claude-multi-agent-workflow
2. /plugin install code-quality@bohdan-plugins
3. Run /code-quality:quality-check course-api

For local development: claude --plugin-dir . from the repo root, then /reload-plugins after edits.

## Scoping decision

code-reviewer and coverage-scout only get Read, Grep and Glob. Their job is to look at code and report, so they should never be able to change files; this keeps them safe to run in parallel and makes their output pure analysis.
coverage-scout uses haiku because matching routes to test names is simple search work, so a fast cheap model is enough. code-reviewer uses sonnet because finding real bugs needs more reasoning.
test-writer is the only agent with Write, Edit and Bash: it must create test files and run npm test to check them.

## Orchestration decision

The review and the coverage scan run in parallel because neither needs the other's result and both are read-only, so running them together saves time with no risk of conflicts.
Writing tests runs after them, in sequence, because test-writer needs both reports as input: the missing cases from coverage-scout and the bugs from code-reviewer that need regression tests.
