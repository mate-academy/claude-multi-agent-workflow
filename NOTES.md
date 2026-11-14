# NOTES — qa-kit

## What the plugin does

`qa-kit` is a code-quality plugin for Claude Code. It bundles:

- **`/qa-kit:audit [path]`** — a workflow command. Two `code-reviewer` subagents review different halves of the code in parallel; their findings are merged; then a `code-fixer` subagent turns them into concrete fix proposals in `REVIEW-FIXES.md`.
- **`code-reviewer`** (agent) — read-only reviewer that reports bugs, missing error handling, and unclear names, grouped by severity.
- **`code-fixer`** (agent) — confirms each finding against the code and writes a diff-style proposal for it.
- **`review-checklist`** (skill) — the shared severity rubric and Express checklist, so both reviewers grade findings the same way.
- **Lint-on-edit hook** — a `PostToolUse` hook that runs the project's own ESLint on any `.js` file Claude edits and feeds errors back so Claude fixes them straight away.

## How to install

From a Claude Code session:

```
/plugin marketplace add tonboybeng/claude-multi-agent-workflow
/plugin install qa-kit@qa-tools
```

Then, from a project (for example `course-api/` in this repo, after `npm install`):

```
/qa-kit:audit course-api
```

To try it locally without installing, run `claude --plugin-dir .` from the repo root, and `/reload-plugins` after edits.

## Scoping decision — what each agent can touch

**`code-reviewer` gets only `Read, Grep, Glob`.** Its job is to find problems, not fix them, and two copies run at the same time. Giving it no write tools means the parallel step can never produce two agents editing the same file, and a reviewer cannot "fix" something on its own judgement before a person has seen the finding. It runs on `sonnet` rather than `haiku` because spotting real logic bugs and wrong status codes needs reasoning about how the code behaves, not just pattern matching, and a missed or invented finding costs more than the extra model spend.

**`code-fixer` gets `Read, Write` — but not `Edit` or `Bash`.** It must read the code to confirm each finding, and it needs to write exactly one file (`REVIEW-FIXES.md`). It does not need `Edit` because it never modifies source files — fixes are proposals a human applies — and it does not need `Bash` because it never runs anything. Leaving those out makes "proposals only" a guarantee of the tool list, not just an instruction in the prompt.

## Orchestration decision — parallel vs. sequential

- **Parallel: the two reviews.** Reviewing the route files and reviewing the server/data-layer files are independent — neither needs the other's output, and neither writes anything. Running them together roughly halves the wait and gives each reviewer a smaller, focused scope, which produces sharper findings than one agent skimming everything.
- **Sequential: merge, then fix.** The merge step needs *both* reports before it can remove duplicates, so it waits for the parallel step to finish. The fixer must run after the merge because its input *is* the merged findings — running it earlier would mean fixing an incomplete or duplicated list, and two fixers could write conflicting proposals for the same line.
- **Sequential: prepare first.** Loading the rubric and splitting the file list happen before the reviews because both reviewers need them as input.
