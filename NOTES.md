# Notes

## What it does and how to install it

`api-quality` runs a quality pass on an Express API with one command, `/api-quality:quality-pass`. Two read-only subagents (`api-reviewer`, `coverage-scout`) look at the code at the same time; a third (`test-writer`) then writes the missing tests. A skill (`api-conventions`) carries the API's rules, and a `PostToolUse` hook lints every JavaScript file Claude writes. It is tested against the Express API in `course-api/`.

Install from this repo, which is also its marketplace:

```
/plugin marketplace add Brokkoliii/claude-multi-agent-workflow
/plugin install api-quality@brokkoliii-plugins
```

## One scoping decision: why `test-writer` is the only agent that can write, and only to `tests/`

The three agents split along the line of what each one is allowed to change. `api-reviewer` and `coverage-scout` get `Read, Grep, Glob` only: their whole job is to look and report, so they have no way to alter the code they are judging. `test-writer` is the one worker that needs `Write`, `Edit` and `Bash`, because it has to create test files and run `npm test` / `npm run lint`. I still scoped it down by instruction: it may only touch the `tests/` folder and may only run those two npm commands. When the reviewer reports a real bug, `test-writer` does not fix the route - it writes the test for the correct behaviour and marks it `todo`, so the suite stays green and the bug stays visible. Fixing the code is a decision for the person, not a side effect of a test run.

The models follow the difficulty: `coverage-scout` is a mechanical mapping of routes to tests, so it runs on `haiku`; the reviewer has to judge conventions and spot subtle inconsistencies, and the test-writer has to write correct tests and recover from failures, so both run on `sonnet`.

## One orchestration decision: why step 1 is parallel and step 2 is sequential

`api-reviewer` and `coverage-scout` are independent: the reviewer reads routes against conventions, the scout reads routes against test files, and neither needs the other's output. Running them together in one message halves the waiting time for no loss in quality. `test-writer` is different: it needs the scout's gap list to know what to test and the reviewer's behaviour findings to know which tests to mark `todo`. Starting it earlier would mean guessing, so the command makes it wait for both results. The final step is not an agent at all - the main conversation re-runs `npm test` and `npm run lint` itself, so the report shows real results instead of repeating what a subagent claimed.
