# NOTES

Build notes for `api-quality` — what it does, how to install it, and the two decisions
that shaped it.

---

## What the plugin does

`api-quality` packages a multi-agent code-quality workflow for the Express API in
`course-api/`. One command runs the whole thing.

| Component | Name | What it is |
| --- | --- | --- |
| Command | `/api-quality:audit` | The workflow trigger — reviews, tests, then reports |
| Agent | `api-quality:api-reviewer` | Read-only reviewer; reports, never edits |
| Agent | `api-quality:api-test-writer` | Writes tests and runs the suite |
| Skill | `api-quality:api-conventions` | The API's house rules — layering, validation, status codes, error shape |
| Hook | `PostToolUse` on `Write\|Edit` | Lints the file just changed, via `${CLAUDE_PLUGIN_ROOT}` |

`/api-quality:audit` reviews both layers of the API at once, writes tests for the gaps
those reviews turn up, and finishes by cross-referencing the two: which predicted
problems did a test actually reproduce, and what did testing find that nobody predicted.

### Install

From the marketplace:

```
/plugin marketplace add christian-salafia/claude-multi-agent-workflow
/plugin install api-quality@claude-multi-agent-workflow
```

Locally, for development — run from the repo root:

```bash
claude --plugin-dir .
```

`/reload-plugins` picks up edits without restarting. To try it against the bundled API:

```bash
cd course-api && npm install
```

Then run `/api-quality:audit course-api/`.

---

## Scoping decision: the reviewer cannot edit files

`api-reviewer` gets `tools: Read, Grep, Glob` — read and search, nothing else. It is the
one decision that most changes how the plugin behaves.

The temptation is to let the reviewer fix what it finds; it has already located the bug,
and one agent doing both looks more efficient. I scoped it out deliberately, for two
reasons.

**A reviewer that can edit stops reporting and starts fixing.** The moment an agent can
change the file, a finding becomes a diff, and the reasoning behind it disappears. What
comes back is "I fixed it," which you then have to reverse-engineer to evaluate. Read-only
forces the finding to survive as a *claim* — with a file, a line, and a stated failure
mode — which is the thing a human can actually check.

**An unverified claim shouldn't be able to rewrite your code.** Reviewers are confidently
wrong sometimes. A read-only reviewer that hallucinates a bug costs you one paragraph in a
report. A reviewer with `Edit` that hallucinates a bug costs you a wrong change to
`db/store.js`, and it lands looking exactly like a correct one.

That separation paid off on the first real run. The data-layer reviewer examined
`reset()`, checked that `seed()` rebuilds fresh object literals on each call, and
**declined to raise a finding** — it had nothing to substantiate. An agent holding `Edit`
and a bias toward visible action is much likelier to "harden" that function anyway.

The models follow from the same split:

- **`api-reviewer` → `sonnet`.** It checks code against rules already written down in
  `course-api/CLAUDE.md` and the `api-conventions` skill. Bounded judgment, no code to
  produce.
- **`api-test-writer` → `opus`.** Harder job: infer untested edge cases, write code that
  must actually pass, and diagnose failures. It also gets `Bash`, because a test author
  who never runs the suite is guessing — that's what lets it report *"37 tests, 28 pass,
  9 fail"* as something observed rather than predicted.

The writer's tools are scoped too, just along a different axis: it may edit
`course-api/tests/`, but not routes, `db/store.js`, or `server.js`. That boundary is what
makes the rule in its brief enforceable — **when a test fails because the production code
is wrong, leave the test correct and report the bug**. Without it, the cheapest way to a
green suite is to quietly edit the route, and the defect disappears into a passing run.

---

## Orchestration: what runs together, and what has to wait

```
        ┌─ 1a  api-reviewer → route layer ─┐
start ──┤                                  ├──→ 2  api-test-writer ──→ 3  cross-reference
        └─ 1b  api-reviewer → data layer ──┘
             (parallel)                          (waits on 1)          (waits on 2)
```

### Step 1 runs in parallel

Two `api-reviewer` instances start together: one on `routes/` and `server.js`, one on
`db/store.js` and the existing tests.

They're parallel because there is nothing to serialize. Both are read-only, so neither can
create state the other needs to see, and their file scopes don't overlap. Making 1b wait
for 1a would spend wall-clock time to buy nothing.

Splitting one review into two also gets something a single reviewer wouldn't: **agreement
carries information**. When both reviewers land on the same underlying problem from
different sides, that's a stronger signal than either report alone, and the command is
told to collapse those into one finding and say two reviewers reached it independently.

### Step 2 waits — for two separate reasons

The test writer cannot start early, and it's worth keeping the two reasons apart:

1. **Data dependency.** Its entire input is the merged test-gap list the reviewers
   produce. There is nothing for it to do until they're both back.
2. **Write safety.** It's the only component in this workflow that edits files. Even if
   the input existed, two agents writing into `course-api/tests/` concurrently would
   clobber each other. So exactly one writer runs, alone.

The first reason is about correctness of input; the second would apply even if the input
were free. Parallelism is cheap among readers and expensive among writers.

### Step 3 waits, and is where the two agents pay off

The final step needs both the predictions and the real test results, so it can only run
last. It sorts every finding into three buckets:

- **Confirmed** — predicted in review *and* reproduced by a failing test.
- **Unconfirmed** — predicted, never reproduced. Stays a suspicion; it is not promoted
  to a bug.
- **Found only by testing** — a failure no reviewer saw coming.

That third bucket is the argument for the whole design, and the first run produced a good
one. Both reviewers flagged the store's leaked-reference problem, and both framed the
array leak and the record leak as separate findings on separate helpers. Testing showed
`listUsers()` carries **both** — so the obvious fix, `return users.slice()`, would look
correct and still leave every record mutable through the copy. A reader alone predicts
that badly; a writer alone never states the hypothesis. You need the disagreement.

---

## Known state

The first audit run left **9 failing tests** in `course-api/tests/` (37 total, 28 pass).
Those failures are real defects in the API, not broken tests — the writer never touched a
production file, which `git status` on `routes/`, `db/`, and `server.js` confirms. Fixing
them is out of scope for the plugin; they stand as evidence the workflow works.

The `Validate plugin` check needs Actions enabled once in the **Actions** tab — GitHub
suppresses workflows on forked repositories until the owner allows them.
