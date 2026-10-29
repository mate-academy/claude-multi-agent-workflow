# Notes

## What it does and how to install

`code-quality-kit` bundles two subagents (`code-reviewer`, `test-writer`), a workflow command (`/code-quality-kit:quality-check`), an `api-conventions` skill and a PostToolUse hook that lints JavaScript files in `course-api/` after every edit.

Install:

```
/plugin marketplace add Hot00Tea/claude-multi-agent-workflow
/plugin install code-quality-kit@code-quality-marketplace
```

Then run `/code-quality-kit:quality-check course-api`.

## Scoping decision

`code-reviewer` only gets `Read, Grep, Glob` and runs on `sonnet`: a reviewer must never change the code it judges, so removing write tools makes that guarantee structural, while judging code needs a stronger model. `test-writer` is the opposite: it needs `Write, Edit, Bash` to create tests and run `npm test`, but the job is pattern-following against existing tests, so the cheaper `haiku` is enough.

## Orchestration decision

Step 1 runs the review and the gap analysis in parallel because they only read the code and do not depend on each other, so running them together saves time. Writing tests runs afterwards, in sequence, because it needs the output of both: it must know which behaviours are untested and which review findings can be covered. Running it earlier would mean guessing, or two agents editing the tests directory at once.
