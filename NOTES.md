# code-quality-kit notes

## What the plugin does

`code-quality-kit` is a Claude Code plugin that bundles a multi-agent code
quality workflow scoped to the Express API in `course-api/`. It packages:

- **Subagents** (`agents/`): `code-reviewer` (read-only review for bugs,
  missing validation, edge cases) and `test-writer` (writes missing tests
  for routes and confirms the suite passes).
- **A workflow command** (`commands/ship-check.md`): `/ship-check`, which
  orchestrates both subagents into one combined report.
- **A skill** (`skills/express-route/SKILL.md`): conventions for adding or
  editing routes under `course-api/routes/` (file layout, validation and
  status codes, error shape, `store.js` data access).
- **A hook** (`hooks/hooks.json`): runs `npm run lint` in `course-api/`
  after every `Edit`/`Write` tool call, so lint feedback is immediate
  instead of surfacing later in review.

## How to install it

The plugin lives at the repo root (`.claude-plugin/plugin.json` plus the
`agents/`, `commands/`, `skills/`, `hooks/` directories), with
`.claude-plugin/marketplace.json` declaring it as a single-plugin
marketplace named `code-quality-kit`.

To try it locally without publishing anywhere:

```
claude --plugin-dir .
```

To install it the normal way (e.g. from another project, or after adding
this repo as a marketplace source):

```
/plugin install code-quality-kit@code-quality-kit
```

After editing any plugin file, run `/reload-plugins` to pick up the
change without restarting the session.

## Scoping decision: model and tools per subagent

`code-reviewer` runs on `opus` with `Read, Grep, Glob` only (no write
tools). `test-writer` runs on `sonnet` with `Read, Write, Edit, Glob, Grep,
Bash`.

**Why:** the two subagents have different jobs and different failure
costs. Review is judgment-heavy — spotting a missing validation branch or
an edge case that *should* fail 400 but silently succeeds requires reading
code carefully and reasoning about what's absent, not just pattern
matching against an existing style. That favors the stronger model.
Review is also read-only by design: giving it write access would let a
"just review" task quietly turn into an unreviewed edit, and it removes
any chance of the reviewer overwriting the exact file it's supposed to be
evaluating.

Test-writing is comparatively mechanical: match an existing test file's
conventions (`node:test`, `supertest`, `beforeEach` reset), find routes
without coverage, write parallel test cases, run the suite. That's a good
fit for a faster/cheaper model, and it genuinely needs write + `Bash`
access since its output is new test files it must also execute to
confirm they pass.

**How to apply:** the general pattern — opus + read-only for
judgment/analysis roles, sonnet + write-capable for pattern-following
production roles — is worth reusing for future subagents in this plugin
rather than defaulting every new agent to the same model/tool set.

## Why `/ship-check` parallelizes the two steps but not the summary

`/ship-check` launches `code-reviewer` and `test-writer` at the same time
because neither one depends on the other's output: the reviewer reads the
current `course-api/` code and reports findings, while the test-writer
independently reads the same code to find coverage gaps and write tests.
They can't corrupt each other's work (the reviewer never writes) and
there's no ordering requirement between "what's broken" and "what's
untested" — running them together halves the wall-clock time of the
check.

The summary step is sequential and dependent on both finishing because
it's not just concatenation — it's meant to correlate the two outputs
(e.g. flag when the review found a critical issue that the new tests
didn't end up covering). That correlation is impossible until both
results exist, so the summary step has a genuine data dependency the
first two steps don't have on each other.
