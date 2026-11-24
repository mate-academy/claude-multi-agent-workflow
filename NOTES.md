# Notes: code-quality plugin

## What it does

`code-quality` bundles a code quality workflow for JavaScript projects:

| Component | Name | What it does |
|-----------|------|--------------|
| Subagent | `code-reviewer` | Read-only review for bugs, convention breaks and readability. Returns a report with `file:line` and a severity for every finding. |
| Subagent | `checksum-calculator` | Records and verifies SHA-256 checksums of source files, so the workflow can prove which files changed. |
| Command | `/code-quality:audit [path]` | The workflow: snapshot and review, fix the bugs found, verify the changes, re-review, then report. |
| Skill | `review-standards` | The shared rules for severity, an Express route checklist, and how to write a fix. |
| Hook | `PostToolUse` on `Write\|Edit` | Runs the project's own ESLint on each edited JS file and sends errors back to Claude. |

## Install

From inside Claude Code:

```
/plugin marketplace add biganashvili/claude-multi-agent-workflow
/plugin install code-quality@biganashvili-plugins
```

Then, in a project, run `/code-quality:audit` (or `/code-quality:audit routes/` to narrow the scope).

For local development, from the repo root:

```
claude --plugin-dir .
```

Use `/reload-plugins` after edits. To try it on the sample API: `cd course-api && npm install`, then run the audit from there.

## Scoping decision: the reviewer is read-only on Sonnet

`code-reviewer` gets only `Read, Grep, Glob`. Its job is to find problems, not fix them, and keeping it unable to edit has two benefits:

- **Safe to run in parallel.** In step 1 of the audit it runs at the same time as the checksum snapshot. If it could edit files, it could change code before the "before" snapshot was taken, and the checksum verification would be meaningless.
- **One place for changes.** All fixes happen in the main session, where the user can see each one. The review is a report that someone else acts on, which is why its output format insists on a `file:line` and a severity for every finding.

It runs on **Sonnet** because finding real bugs (a string id compared to a number, a missing `404`) takes reasoning across files, which Haiku does less reliably, while Opus would cost more for a routine review.

By contrast, `checksum-calculator` runs on **Haiku**: hashing files and putting the result in a table is mechanical, so the cheapest, fastest model is enough. It gets `Bash` (to run `shasum`), `Glob` and `Write`, but not `Read` or `Edit`, so it can write its manifest without being able to open or change source code.

## Orchestration decision: what runs in parallel and what waits

```
Step 1  ┌─ checksum-calculator: record snapshot ─┐
        └─ code-reviewer: review scope ──────────┘   (parallel)
Step 2  main session fixes high/medium bugs, runs tests   (waits on the review)
Step 3  checksum-calculator: verify against snapshot      (waits on the fixes)
Step 4  code-reviewer: re-review changed files only       (waits on the verify)
Step 5  report
```

- **Step 1 runs in parallel** because the snapshot and the review are independent: neither reads the other's output, and neither changes source code. Running them together saves a full subagent round-trip. The snapshot also has to be taken before any edits, and the start is the only point where that is guaranteed.
- **Steps 2 to 4 run in sequence** because each needs the previous result. Fixes need the review's findings. Verification only means something after the fixes are done. The re-review is scoped to the files the verification reported as changed, so it can't start until that list exists. Narrowing the re-review this way keeps it cheap and focused on what the workflow actually touched.
- The re-review allows **at most one** more round of fixes, so the workflow can't loop.
