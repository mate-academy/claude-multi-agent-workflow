## What it does
The `course-quality` plugin checks the Express API in `course-api/`. Its `/course-quality:quality-check` command has a read-only reviewer subagent audit the routes, runs the existing tests and lint, then has a test-writer subagent add tests for the High and Medium findings.

## Install
```
/plugin marketplace add DiazAryagung/claude-multi-agent-workflow#multi-agent-plugin
/plugin install course-quality@course-quality-marketplace
```

## Scoping decision
The reviewer has only Read, Grep and Glob, so a review can never change code.
It runs on Sonnet because spotting real bugs needs judgment; Haiku is cheaper but weaker at judgment.

## Orchestration decision
The reviewer and the test/lint runner run in parallel because neither needs the other's result. The test-writer runs after both because it needs the reviewer's findings.
