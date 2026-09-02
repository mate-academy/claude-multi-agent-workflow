# NOTES

## What it does

`code-review` reviews Express route files in `course-api/routes/` against
this project's own conventions (`course-api/CLAUDE.md`, expanded into a
full checklist in `skills/route-conventions/SKILL.md`), then writes the
tests that close whatever gaps the review finds. It's built around two
subagents run as a workflow, not a single do-everything agent.

## Install

```
/plugin marketplace add FelipeDeYcaza/claude-multi-agent-workflow
/plugin install code-review@code-review
```

Then run `/code-review:quality-check [route-file ...]` (with no arguments,
it targets every file in `course-api/routes/`).

**Gotcha found while testing:** in an interactive session, typing
`/quality-check` resolves fine via fuzzy-match. But in non-interactive
`claude -p` mode there's no autocomplete to resolve the ambiguity, so the
command must be invoked by its full namespaced form,
`/code-review:quality-check` — otherwise you get `Unknown command`. Worth
knowing if you're scripting against this plugin rather than typing it by
hand.

## Scoping decision: two agents, deliberately unequal

`api-reviewer` gets `Read, Grep, Glob` (read-only) and the `sonnet` model.
`test-writer` gets `Read, Write, Edit, Grep, Glob, Bash` and the `haiku`
model. This wasn't an arbitrary "reviewer=smart, writer=fast" split — it
followed from what each job actually needs:

- Judging whether something is a real bug versus a style nit (`api-reviewer`'s
  job) needs real reasoning, so it gets the stronger model. Being strictly
  read-only also has a structural payoff, not just a safety one: because it
  can never touch shared state, it's provably safe to run several instances
  of it in parallel across different files with zero risk of them
  conflicting — which is what makes Step 1 of the workflow a genuine
  parallel step instead of a contrived one.
- Once `api-reviewer` hands over concrete findings, turning each one into a
  test case that matches the existing test file's style is comparatively
  mechanical — so `test-writer` runs on the cheaper, faster model. It keeps
  `Bash` (to run `npm test` and confirm the suite actually passes before
  reporting success) but nothing broader.

Proof this mattered, not just theory: a real run against
`course-api/routes/users.js` found three bugs (malformed IDs silently
returning `404` instead of `400`; `PUT` accepting an empty string that
`POST` would reject for the same field; no type-checking on `name`/`email`).
`test-writer` wrote 8 tests asserting the _correct_ behavior, ran them, saw
them fail against the real (buggy) route code, and reported the failures
as bugs needing a human decision — it did not weaken the assertions to
make them pass. Those 8 failing tests are still in
`course-api/tests/users.test.js`, left as-is on purpose, as evidence the
review→test pipeline catches real problems rather than rubber-stamping.

## Orchestration decision: parallel review, dependent write

`commands/quality-check.md` runs Step 1 (review) as a single batch of
parallel `Task` calls — one `api-reviewer` per target file, launched in
one message rather than one after another — because the files are
genuinely independent and the agent reading them can't mutate anything.
There's no reason to make a user wait for file 2's review to start until
file 1's finishes.

Step 2 (`test-writer`) is explicitly sequential and depends on _all_ of
Step 1's results, for a real reason, not just "steps run in order": it
needs the combined findings across every reviewed file to know what test
cases to write, and it edits `course-api/tests/`, which is shared,
mutable state — running multiple writers over the same test directory at
once would risk them clobbering each other's edits. So the dependency here
isn't cosmetic; it reflects an actual data dependency (findings must exist
before tests can target them) and a real resource-conflict risk (shared
files, single writer).
