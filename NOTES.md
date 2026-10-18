# NOTES - code-quality-pipeline

## What it does
Plugin that runs a code quality workflow on course-api/: review + test analysis in parallel, then fixes.

## Install
1. /plugin marketplace add https://github.com/aneudy0318-cyber/claude-multi-agent-workflow
2. /plugin install code-quality-pipeline@code-quality-marketplace
3. Or locally: claude --plugin-dir . then /quality-check

## Scoping decision
code-reviewer is read-only (Read, Grep, Glob only) because a reviewer should never change code while reviewing - it prevents accidental edits and makes its findings trustworthy. test-fixer gets Edit/Write/Bash because it must actually fix code and run tests. Both use sonnet - fast enough for review/fix, no need for the heaviest model.

## Orchestration decision
Step 1 runs in parallel because review and test analysis are independent - neither needs the other output. Step 2 runs sequentially because fixes depend on BOTH results - you cannot fix correctly until you know all findings and all failing tests.
