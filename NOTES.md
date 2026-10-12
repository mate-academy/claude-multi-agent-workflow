# Notes

## What the plugin does and how to install it

`code-quality` checks the quality of an Express API. Its command `/code-quality:quality-check` has two reviewers read the route code and the tests, then has a test writer fill in the missing tests. A skill (`error-responses`) records the project's error format, and a hook runs ESLint after every Edit or Write so style problems show up right away.

Install:

1. `/plugin marketplace add <this repo>` (a local path or the GitHub repo)
2. `/plugin install code-quality@stas-marketplace`
3. Run `cd course-api && npm install` once so the ESLint hook has something to run.

To try it without installing, start Claude from the repo root with `claude --plugin-dir .`.

## Scoping decision: why the two subagents have different tools and models

`api-reviewer` only gets `Read, Grep, Glob` and the cheap `haiku` model. Its job is to look at code and report, so it never needs to change anything. Taking away Write, Edit and Bash means a reviewer cannot break the code by accident, and we can safely run two of them at once. Reading and spotting patterns is easy work, so a cheaper model is enough, and it keeps the cost of the parallel step low.

`test-writer` gets Write, Edit and Bash and the stronger `sonnet` model. It has to understand the routes, match the style of the existing tests, write correct assertions and run `npm test` to check them. That needs write access and better reasoning, and a wrong test is worse than no test.

## Orchestration decision: why some steps are parallel and some are sequential

Step 1 runs two `api-reviewer` agents in parallel (one on `course-api/routes`, one on `course-api/tests`). They read different folders and do not need each other's results, so running them together saves time.

Step 2 runs `test-writer` after step 1. It needs both reports: the routes report says what the code does, and the tests report says what is already covered. Without both it would guess and could write duplicate tests. So it has to wait.
