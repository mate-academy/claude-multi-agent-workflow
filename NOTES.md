# Implementation Notes

## Install

Clone the repo, then open the `course-api/` directory in Claude Code. The `/dev-pipeline` skill is registered automatically via `course-api/.claude/workflows/dev-pipeline.js`. No additional setup is needed — the workflow reads the project conventions from `CLAUDE.md` at runtime.

To run a task:

```
/dev-pipeline "Add GET /users?email= filter endpoint"
```

## Scoping decision: sequential pipeline, not a DAG

The pipeline runs as a strict linear sequence — Plan → Code → Review+Test → Fix → Commit — rather than a fully parallel DAG where multiple coders could work on different files simultaneously.

**Why:** The course-api is a small, single-developer codebase where inter-file dependencies (e.g. a new store function used in both a route and a test) are the rule rather than the exception. Parallel coders writing to overlapping files would produce merge conflicts that cost more to resolve than the parallelism saves. The Review and Test stages are the only safe candidates for parallelism (they are both read-only), and the workflow exploits this with a `parallel()` call.

## Orchestration decision: fix loop with a round cap

When the Reviewer rejects the code or the Tester reports failures, rather than failing immediately the pipeline passes the findings to a Fixer agent and re-runs Review+Test. This loop continues until both pass or `max_fix_rounds` is exhausted.

**Why:** A single-pass pipeline that halts on the first review failure puts the user back in the loop for issues that are often mechanical (a missing status code, a wrong error message shape). The Fixer agent can resolve these without human intervention in the majority of cases. The round cap (default 3) prevents runaway token spend on genuinely broken tasks and forces a clean human hand-off rather than infinite looping.

## Agent model choices

- Planner, Coder, Reviewer use `claude-sonnet-4-6` — reasoning-heavy tasks that benefit from a capable model.
- Tester and Committer use `claude-haiku-4-5-20251001` — mechanical tasks (run a command, capture output, stage files) where a smaller model is faster and cheaper.
