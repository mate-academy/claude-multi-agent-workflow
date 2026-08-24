# NOTES — building `api-quality`

## What it does

`api-quality` is a quality gate for an Express API, packaged as one plugin. One
command, `/api-quality:harden`, runs three subagents:

1. **`api-reviewer`** reads the route handlers and the store module and reports
   correctness defects — validation gaps, wrong status codes, error responses
   that don't match the documented shape.
2. **`contract-auditor`** reads `docs/api.md` and `CLAUDE.md` and reports where
   the documented contract and the stated conventions have drifted from the
   code.
3. **`test-author`** takes the merged findings, writes regression tests into the
   existing suite, runs it, and reports which failures are real defects.

The output is a verdict plus a list of bugs that are *proven by a failing test*,
not a list of suspicions. The plugin also ships the `express-api-conventions`
skill (the house rules for touching a route) and a `PostToolUse` hook that lints
any JavaScript file Claude writes or edits, using the project's own ESLint.

## Install

```
/plugin marketplace add EvheniiChuhai/claude-multi-agent-workflow
/plugin install api-quality@evhenii-tools
```

Then, from a repo with an Express API in it:

```
/api-quality:harden course-api/
```

To develop against a local clone instead of installing:

```bash
cd course-api && npm install     # once, so the test suite and ESLint are there
cd .. && claude --plugin-dir .
```

`/reload-plugins` picks up edits without restarting the session.

## A scoping decision: `api-reviewer` gets `Read, Grep, Glob` and nothing else

`api-reviewer` runs on `opus` — the strongest model in the bundle — and is
handed the narrowest toolset in the bundle: `Read`, `Grep`, `Glob`. No `Edit`,
no `Write`, no `Bash`.

That pairing is deliberate, and the two halves are the same decision.

The reason for `opus` is that the review is the one genuinely hard judgment in
the workflow. Spotting that `PUT /users/:id` accepts `{ "name": "" }` while
`POST /users` rejects it means holding two handlers and the store's update
semantics in mind at once and noticing they disagree. A weaker model reliably
finds the missing `404` and reliably misses that.

The reason for read-only is that a capable model asked to review code will fix
what it finds if it can. That is the wrong outcome here for three reasons:

- **The report is the product.** A reviewer that edits returns a diff, and the
  merged findings that `test-author` depends on never exist.
- **An unproven fix is worse than a reported bug.** The whole point of the
  workflow is that `test-author` writes a test that fails first. A reviewer that
  silently patches the handler means the test is written against already-fixed
  code and passes for the wrong reason — the regression is never actually
  pinned down.
- **Two agents writing to the same files concurrently is a merge conflict**, and
  step 2 runs two agents at once.

Taking `Edit` away removes the temptation structurally instead of asking the
prompt to resist it. The prompt says "you do not fix anything"; the `tools` line
means it *cannot*.

`contract-auditor` is read-only for the same reason, but runs on `haiku`: its
job is mechanical cross-referencing — does this documented endpoint exist, does
this handler return the status code the docs claim. That's lookup work, not
judgment, and paying `opus` rates for it would be waste. `test-author` is the
only agent with `Write`, `Edit`, and `Bash`, because writing files and running
`npm test` is literally its job, and it runs alone.

## An orchestration decision: two in parallel, one waiting

**Steps 2a and 2b run in parallel** — `api-reviewer` and `contract-auditor` are
spawned in a single message. They read overlapping files but answer questions
that have nothing to do with each other: *is this handler correct?* versus *does
this handler match its documentation?* Neither one's output is an input to the
other. A route can be perfectly correct and completely undocumented; it can also
match its docs exactly and still be wrong. Running them in sequence would only
make the command take twice as long for an identical result.

They're also both read-only, which is what makes concurrency safe here. Two
agents that could write would be racing on the same files.

**Step 3 waits for both.** `test-author`'s brief *is* the union of the two
reports — `api-reviewer`'s test gaps plus every high-severity row in
`contract-auditor`'s drift table, de-duplicated and ordered by severity. That
merged list does not exist until both agents have returned, so the dependency is
real rather than stylistic.

Starting `test-author` early on partial input would actively cost something:
both agents routinely land on the same missing `404` from different directions,
and the orchestrator's de-duplication pass is what stops that becoming two
near-identical tests in the suite. It would also mean re-running the agent when
the second report lands.

There's a cheaper version of this workflow that skips the merge and pipes each
report straight to its own test-writing agent. It produces a duplicated,
unordered test suite. The sequential step is what buys coherence.

## What the local test run showed

Loaded with `claude --plugin-dir .`, `claude plugin details api-quality` reports
3 agents, 1 hook, and the skill and command — everything resolves by its
namespaced name.

Running `/api-quality:harden course-api/` end to end (against a scratch copy of
this repo, so the committed suite stays green) produced the shape the workflow is
supposed to produce: both read-only agents returned, the orchestrator merged
their findings, and `test-author` wrote 27 tests across three files. 17 of them
fail, and the failures are real:

- `POST /users` rejects `{ "name": "" }` with a `400`, but `PUT /users/:id`
  accepts it, returns `200`, and blanks the stored name. Verified by hand before
  the run, so this is a genuine defect and not an agent's guess.
- `PUT /users/0x1` and `GET /users/1e0` both alias user `1`, because
  `Number()` accepts hex and exponent notation in a path segment.
- `listUsers()` hands back the live internal array.

Two of those 17 failures were the workflow finding a bug in *this plugin* rather
than in the API: the skill's error-shape rule dictated lowercase messages, which
the codebase's own `'User not found'` breaks, and its status-code table said a
malformed id was a `400` while its validation section blessed the `NaN` → `404`
fallthrough. The agents dutifully wrote tests for both, and the orchestrator
flagged the contradiction rather than picking a side. The skill now states one
rule for ids and explicitly tells agents that message casing is not a defect.

Worth knowing: `contract-auditor` on `haiku` returned a clean bill on a pass
where the reviewer found a genuine convention break. Cheap and mechanical is the
right trade for docs cross-referencing, but treat a clean audit as "nothing
obvious", not "nothing there".

## Things worth knowing

- **The hook fails open.** `scripts/lint-changed.js` exits `0` and stays silent
  whenever it can't help — a non-JS file, no `eslint.config.js` above the file,
  ESLint not installed. It only speaks up (exit `2`, which feeds stderr back to
  Claude) when ESLint reports actual errors in a file Claude just touched. A
  quality hook that blocks unrelated work is worse than no hook, so it never
  blocks on its own failure.
- **`${CLAUDE_PLUGIN_ROOT}`, not a path.** `hooks/hooks.json` invokes the script
  as `node "${CLAUDE_PLUGIN_ROOT}/scripts/lint-changed.js"`, so it resolves the
  same whether the plugin is loaded via `--plugin-dir` from a clone or installed
  from the marketplace into `~/.claude/plugins/`.
- **One repo, two roles.** `.claude-plugin/plugin.json` makes this repo a
  plugin; `.claude-plugin/marketplace.json` makes it a marketplace that offers
  that plugin at `source: "./"`. Only those two manifests live in
  `.claude-plugin/` — `agents/`, `commands/`, `skills/`, `hooks/`, and
  `scripts/` all sit at the root, which is the placement rule that breaks most
  plugins that "don't load".
- **Versioning.** `plugin.json` starts at `0.1.0`. Bump it there and in the
  marketplace entry together; installs resolve the marketplace copy.
