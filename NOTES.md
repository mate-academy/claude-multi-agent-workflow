# Notes

## Installation
Run /plugin marketplace add . and /plugin install api-assistant@local (or load via claude --plugin-dir .).

## Scoping Decision
- code-reviewer uses claude-3-5-haiku and read-only tools (Read,Grep,Glob) because it only needs to analyze files and doesn't require write access or heavy reasoning.
- code-writer uses claude-3-5-sonnet and full tools (Read,Edit,Write,Bash) because modifying code and running tests requires strong reasoning and execution permissions.

## Orchestration Decision
The workflow runs the reviewer and tests in parallel to quickly aggregate diagnostic data, and then executes the writer dependently to apply fixes based precisely on those collected findings.
