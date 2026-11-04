# NOTES

## What qa-crew does
qa-crew is a small QA team for course-api. /qa-crew:check <file> runs two subagents on one file: code-reviewer, which reviews it for bugs, missing error handling and unclear names, and test-writer, which adds missing tests in the house style. Then it runs the test suite once and returns one report: findings by severity, the test files added or changed, and pass/fail. The plugin also ships a course-api-tests skill with the house test style and a PreToolUse hook that blocks git push to main. Install it with /plugin marketplace add aleekx1981-cpu/claude-multi-agent-workflow and then /plugin install qa-crew@alex-plugins, or load it locally with claude --plugin-dir .

## A scoping decision
code-reviewer gets only Read, Grep and Glob. It works in the background with nobody watching, and reviewing never needs to change anything, so a tool list without Edit, Write or Bash means it can't break anything even if it misreads its task. test-writer gets Edit, Write and Bash because its job is to write test files and run them. Both use sonnet: everyday review and test writing, not the hardest reasoning. The hook script is referenced through ${CLAUDE_PLUGIN_ROOT} so it resolves wherever the plugin is installed. Its limit is that it matches command text, so a push hidden behind a variable could slip past.

## Parallel versus sequence
Reviewing the file and writing tests for it don't depend on each other, so /qa-crew:check runs code-reviewer and test-writer in parallel. Running the full test suite and writing the combined report need both results, so they run after both agents finish. In my test run on course-api/routes/users.js, the reviewer returned findings by severity, test-writer added five cases to tests/users.test.js, and all 10 tests passed. On the first runs, test-writer's edit was blocked by auto mode's safety check; I switched to manual mode and approved the edit myself.
