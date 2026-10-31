# NOTES: quality-gate

## What it does and how to install it

`quality-gate` is a code-quality plugin for Node.js/Express APIs. One command, `/quality-gate:check [dir]`,
reviews the code and maps test coverage in parallel, then hands the gaps to a test writer and gives one
report with a PASS / NEEDS WORK verdict. It also has:

- a skill (`api-test-conventions`) that applies whenever Claude writes Express endpoint tests;
- a `PostToolUse` hook that runs the project's own ESLint (`--fix`) on every JS file Claude edits, and sends
  any problems it can't fix back to Claude.

This repo is both the plugin and its marketplace:

```
/plugin marketplace add GoVolodya/claude-multi-agent-workflow
/plugin install quality-gate@govolodya-plugins
```

For local development, run `claude --plugin-dir .` from the repo root.

## Scoping decision: three agents, and why each got its tools and model

| Agent | Tools | Model | Why |
|---|---|---|---|
| `code-reviewer` | `Read, Grep, Glob` | Sonnet | Reviewing needs judgment (spotting the `Number(id)` coercion trap, a status-code contract drift), so it gets a capable model. It only reports, so it gets **no** write or shell tools. A reviewer that can edit tends to "just fix" things, and then the review is no longer a review. |
| `coverage-mapper` | `Read, Grep, Glob` | **Haiku** | Mapping `router.get(...)` calls to `request(app).get(...)` calls is mechanical pattern matching over a few files. Haiku does it reliably, faster and cheaper, and it runs at the same time as the reviewer, so it should be quick. |
| `test-writer` | `Read, Grep, Glob, Write, Edit, Bash` | Sonnet | This is the only agent that changes files. It needs `Write`/`Edit` to add tests and `Bash` to run `npm test` / `npm run lint` and iterate until they're green. Its prompt limits it to `tests/*.test.js` and says never to change app code, so if a test only passes after a code change, it reports the bug instead of hiding it. |

The decision I'd defend most is keeping **`Bash` away from the reviewer**. It would be handy (`git diff`,
running tests), but the workflow command already gives it the target. Keeping it at Read/Grep/Glob means it
can be run anywhere, even on a dirty working tree, with no permission prompts and no risk.

## Orchestration decision: what runs in parallel and what runs in sequence

```
Step 1  code-reviewer ─┐   parallel: both read-only, and neither needs the other's output
        coverage-mapper ┘
Step 2  test-writer        sequential: its input is coverage-mapper's "Missing cases" list
Step 3  report             sequential: needs all three results
```

- **Parallel in step 1:** the reviewer and the mapper read the same code but answer different questions. They
  share no output, and neither writes anything, so they can't conflict. Running them together means the step
  takes as long as the slower one, not the two added together.
- **Sequential in step 2:** the test writer's whole task *is* the mapper's gap list. Starting it earlier would
  mean guessing what to test. It also gets the reviewer's findings so it can **avoid** writing tests that pin
  current bugs (they'd fail until fixed), which is a second reason to wait for both.
- **Writes happen last and alone.** The only agent that edits runs after both readers have finished, so
  nothing reads files while they're being changed.

## Testing it

- **Local load:** `claude --plugin-dir .` registered `quality-gate:check`, `quality-gate:api-test-conventions`
  and the agents `quality-gate:code-reviewer`, `quality-gate:coverage-mapper` and `quality-gate:test-writer`.
  `claude plugin validate .` and `.github/scripts/validate-plugin.js` both pass.
- **Workflow order:** in the run's event stream, `code-reviewer` and `coverage-mapper` were launched from
  the **same assistant message**, with their tool calls interleaved. `test-writer` was launched one turn later,
  after both had returned.
- **Result on course-api:** the reviewer found real issues (no handling of a missing body, weak PUT validation,
  loose id parsing). The mapper found 5 missing cases. The test writer added them (`tests/health.test.js` plus
  4 tests in `users.test.js`) and the suite went from **5 to 10 passing**, with lint clean.
- **Hook:** `PostToolUse:Write` and `PostToolUse:Edit` fired on each of the test writer's edits. Tested on its
  own, it exits 2 with the ESLint report for an unfixable `no-undef`.
- **One gotcha I hit:** when run with `--plugin-dir .` directly on `./course-api`, the test writer's writes
  were refused as "a sensitive file". A plugin's own agents may not edit files inside the plugin's own
  directory, and `course-api/` lives inside it. Ordinary subagents could write there. Running the workflow on
  a copy of `course-api` outside the repo (or using the installed plugin on your own project) works, and
  that's how the numbers above were produced. The review and coverage steps work either way.
- **Marketplace:** `claude plugin marketplace add <repo>` followed by
  `claude plugin install quality-gate@govolodya-plugins`, in a clean, isolated config, installed 0.1.0
  enabled.
- **Packaging bug found while testing:** the hook script was first a `.js` file. Under a parent folder whose
  `package.json` has `"type": "module"`, Node treated it as ESM and it crashed. Renaming it to `.cjs` makes it
  load as CommonJS wherever the plugin is installed.
