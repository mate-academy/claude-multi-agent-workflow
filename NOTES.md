# Notes — course-quality-guard

## What it does and how to install

`course-quality-guard` is a code-quality workflow for `course-api/`: a
`/course-quality-guard:audit` command reviews the API against its own
`CLAUDE.md` conventions, runs its test suite, and then fixes what it found —
all in one pass, built from two subagents plus a skill and a hook.

Install locally from this repo's root with `claude --plugin-dir .`, or as a
marketplace plugin from any session with `/plugin marketplace add
AlinaYamchuk/claude-multi-agent-workflow` followed by `/plugin install
course-quality-guard@course-quality-guard-marketplace`. Either way, run `cd
course-api && npm install` once first.

## Scoping decision

`reviewer` is read-only (`tools: Read, Grep, Glob`) on `model: sonnet`: finding
real convention drift and coverage gaps needs judgment — recognizing that a
non-numeric `:id` silently falls through to a 404 instead of the 400 the
conventions call for isn't a pattern match, it's reasoning about behavior.
`fixer` gets `tools: Read, Edit, Write, Bash` on `model: haiku`: once the
reviewer has named a specific, bounded problem, applying it is mechanical —
haiku is fast and cheap for that, and its Bash access is there only for
self-verification (`npm test`/`npm run lint` after every change), not for
open-ended exploration. Giving the reviewer write access would blur "found
it" and "fixed it" into one step with no checkpoint in between; giving the
fixer a heavier model would pay for reasoning it doesn't need.

## Orchestration decision

`/course-quality-guard:audit` runs `reviewer` and `course-api`'s own `npm
test`/`npm run lint` in parallel, because neither depends on the other —
the reviewer reads conventions and code, the test run just exercises the
existing suite, and running them together is strictly faster than
sequencing them. The fix step is dependent by necessity: `fixer` needs the
reviewer's findings and the test/lint results as its actual task list, so it
cannot start until both are in hand — there's nothing to fix yet without
them.

## Verified locally

Ran `/course-quality-guard:audit` end to end (`claude --plugin-dir .`, with
`--allowedTools` scoped to what the workflow needs, since headless mode has
no TTY to approve prompts interactively). Traced the tool calls and confirmed
the real order: `reviewer` (Agent) and `npm test`/`npm run lint` (Bash) both
ran before `fixer` (Agent) started — the dependent step never began on
partial results.

The run found real issues and fixed them: `GET /users/:id` and `PUT
/users/:id` returned a bare 404 for a non-numeric id instead of the 400 the
conventions call for (`Number("abc")` is `NaN`, and `NaN === NaN` is `false`,
so the lookup just silently missed). `fixer` added the missing `id`
validation, wrote `tests/health.test.js` (didn't exist before), and filled in
the untested 400/200 paths in `tests/users.test.js`. `course-api`'s test
count went from 5 to 13, all passing, lint clean — committed separately as
"Apply course-quality-guard audit fixes to course-api" so the plugin's own
commits stay distinct from what it produced.

Also verified the `lint-fix` hook directly: introduced a real auto-fixable
violation (`no-extra-boolean-cast`) in a `course-api/routes/*.js` file,
piped a simulated `PostToolUse` payload into `hooks/scripts/lint-fix.sh`,
and confirmed it ran `eslint --fix` and corrected it — then reverted the
test file, since that check was just verification, not a real change.
