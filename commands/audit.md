---
description: Run the full quality workflow over the API — two reviewers in parallel, then a test writer that acts on what they found, then a combined verdict.
argument-hint: "[path or area to audit — defaults to the whole of course-api/]"
---

# Audit

Run a complete quality pass over the API and finish with one verdict the user can act
on. Scope for this run: **$ARGUMENTS** — if that's empty, audit all of `course-api/`.

There are three steps. Steps 1a and 1b run **at the same time**. Step 2 cannot start
until both of them have come back, and step 3 cannot start until step 2 is done. Follow
that shape exactly; it's the point of the command.

---

## Step 1 — Review both layers, in parallel

Launch **two `api-reviewer` subagents in a single message** so they work concurrently.
They are read-only and their file scopes don't overlap, so there is nothing to gain by
making one wait for the other.

- **1a — the route layer.** Point it at `course-api/routes/` and `course-api/server.js`.
  Ask it to focus on request validation, status codes, the `{ error: "message" }`
  response shape, and whether handlers go through `db/store.js` instead of holding state
  themselves.
- **1b — the data layer.** Point it at `course-api/db/store.js` and the existing tests in
  `course-api/tests/`. Ask it to focus on the store's helpers: whether any of them hand
  back a live reference to internal state, whether `reset()` really returns things to
  seed, and which store behaviour has no test behind it.

Give each one the audit scope from `$ARGUMENTS` if the user narrowed it. Wait for both
to return before doing anything else.

When they're both back, merge their reports yourself:

- Combine the two **Findings** lists into one, ordered blockers first.
- If both reviewers flagged the same underlying problem from different sides, collapse it
  into a single finding and say that two reviewers reached it independently — that's
  worth more than either report alone.
- Combine their **Test gaps** into one list. This merged list is the input to step 2, so
  it needs to be concrete: each gap should name a behaviour and the file the test belongs
  in.

## Step 2 — Write the missing tests (waits for step 1)

This step **depends on step 1's output** — it cannot be started early, because its whole
input is the merged test-gap list the reviewers produced.

Launch **one `api-test-writer` subagent**. Hand it:

- the merged test-gap list from step 1, verbatim;
- any finding the reviewers marked a blocker, so it can write a test that reproduces the
  bug rather than a test that documents the bug as if it were intended behaviour.

Exactly one writer runs here, on its own. It is the only subagent in this workflow that
edits files, so nothing else may be in flight while it works — two agents writing into
`course-api/tests/` at once would clobber each other.

Remind it of the rule from its brief: if a test fails because the production code is
wrong, it leaves the test correct and reports the bug. It must not edit routes or
`db/store.js` to force the suite green.

## Step 3 — Cross-reference and report (waits for step 2)

Now you have review findings and real test results. Do this yourself; don't spawn another
subagent for it.

The valuable part is the cross-reference — match each blocker and should-fix finding from
step 1 against what actually happened in step 2:

- **Confirmed** — a reviewer predicted it and a new test reproduces it. This is now a
  demonstrated bug, not an opinion.
- **Unconfirmed** — a reviewer predicted it but no test could reproduce it. Say so, and
  keep it as a suspicion rather than promoting it to a bug.
- **Missed** — the test writer hit a failure no reviewer predicted. Call this out
  explicitly; it's the most interesting result in the run.

Then print the final report:

```
# Audit: <scope>

**Verdict:** <ship it | fix N blockers first>

## Confirmed bugs (reviewed and reproduced by a test)
1. <finding> — `<file>:<line>` — reproduced by `<test name>`

## Unconfirmed findings (raised in review, no failing test)
- <finding> — `<file>:<line>`

## Found only by testing
- <failure no reviewer predicted>

## Tests added
<n> tests in <files> — suite: <the actual pass/fail line from npm test>

## Next
<the single thing to do first>
```

Report the suite result exactly as the test writer observed it. If the run is red, say it
is red and show the failures — a red suite reported honestly is the useful outcome here.
Never present a finding as confirmed unless a test actually reproduced it.
