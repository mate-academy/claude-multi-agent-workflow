---
description: Carry out checks before a PR is made - linter check and unit tests, then write the PR description
allowed-tools: Read, Grep, Edit(README.md), Bash, Skill
---

 Run the unit-tests subagent first and wait for it to finish, since it may edit files to repair failing tests. Once the tree is settled, run the diff-reviewer and lint subagents in parallel against that same state — diff-reviewer looks over the files changed on the current branch, while lint checks the codebase overall. When both finish, use the pr-summarizer agent to draft the PR description.
