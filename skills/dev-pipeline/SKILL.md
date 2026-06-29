---
name: dev-pipeline
description: Classic Planner → Coder → Code Review → Tester → Git Commit pipeline. Pass a task description as the argument and the pipeline plans, implements, reviews, tests, and commits the change automatically.
---

Run the "dev-pipeline" workflow.

Classic Planner → Coder → Code Review → Tester → Git Commit pipeline for course-api

Phases:
- Plan: Planner reads the codebase and produces a structured implementation plan
- Code: Coder implements the plan and writes tests
- Review: Code Reviewer checks correctness, conventions, and edge cases
- Test: Tester runs npm test + npm run lint
- Fix: Fixer addresses review findings and test failures (up to max_fix_rounds)
- Commit: Git Commit agent stages and commits the passing changes

Invoke: Workflow({ scriptPath: "course-api/.claude/workflows/dev-pipeline.js", args: { task: "$ARGS", max_fix_rounds: 3 } })
