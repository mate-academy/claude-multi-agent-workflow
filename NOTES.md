# Notes

## What it does and how to install

`api-quality` reviews an Express API against its conventions and then writes tests for whatever the review found untested. One command, `/api-quality:quality-check`, runs the whole flow. The plugin also ships an `api-conventions` skill and a hook that lints every JS file Claude writes or edits.

Install:

```
/plugin marketplace add JoNo782/claude-multi-agent-workflow
/plugin install api-quality@api-quality-marketplace
```

To test locally instead: `cd course-api && npm install`, then `claude --plugin-dir .` from the repo root.

## Scoping decision: why the agents get different tools and models

`api-reviewer` only gets `Read, Grep, Glob`. Its job is to judge code, and it should be structurally unable to "helpfully" fix things mid-review, which also makes it safe to run several copies at once. It uses `sonnet` because spotting convention violations and subtle validation gaps takes real judgement.

`test-writer` is the only agent that can change files, and gets `Write, Edit, Bash` because it must create tests and run `npm test` to prove they pass. It uses `haiku` because the work is mechanical: copy the style of `tests/users.test.js` and fill in cases. Its prompt forbids editing application code, so an app bug gets reported rather than silently patched.

## Orchestration decision: parallel vs. sequential

Step 1 runs in parallel: two reviewers on disjoint files (`routes/` versus `db/store.js` and `server.js`), plus lint and the existing tests. None needs another's output, and read-only work cannot conflict, so running them together is just faster.

Step 2 is sequential: the test-writer must wait for the merged review, because its input *is* the list of untested behaviour. Starting it earlier would mean writing tests blind and duplicating or contradicting the reviewers. Running writers last also means only one agent ever modifies files, avoiding edit conflicts.
