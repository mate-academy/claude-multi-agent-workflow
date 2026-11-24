---
description: Run the code quality workflow — snapshot and review in parallel, fix the bugs found, then verify exactly what changed.
argument-hint: "[path to audit, defaults to the project source]"
---

Run a code quality audit on: $ARGUMENTS

If no path was given, audit the project's source (for an Express app: `server.js`, `routes/`, `db/`). Call this scope **SCOPE** below and pass it to every subagent.

Follow these steps in order. Don't skip a step, and don't start a step before the steps it waits on have finished.

## Step 1 — Snapshot and review (in parallel)

These two jobs don't depend on each other, so start both subagents **at the same time, in a single message**:

- **checksum-calculator**: record checksums for SCOPE to `CHECKSUMS.sha256` (Record mode). This is the "before" snapshot.
- **code-reviewer**: review SCOPE for bugs, convention issues and readability, and return its report.

Wait for both to finish before going on.

## Step 2 — Fix the bugs (waits on Step 1)

Using the code-reviewer's report, fix every **high** and **medium** bug yourself, in the main session. For each one:

- make the smallest change that fixes it, following the project's `CLAUDE.md` conventions;
- don't fix low-severity bugs, convention issues or readability notes. List them in the final summary instead.

If the report found no high or medium bugs, say so and go straight to Step 5.

After fixing, run the project's tests (`npm test` in the project folder) and fix any failure your changes caused.

## Step 3 — Verify what changed (waits on Step 2)

Start **checksum-calculator** in Verify mode on SCOPE, against the `CHECKSUMS.sha256` from Step 1. It returns which files changed.

Compare its list with the files you meant to change in Step 2. Flag any file that changed but wasn't part of a fix, and any planned fix whose file did not change.

## Step 4 — Re-review the changed files (waits on Step 3)

Start **code-reviewer** again, scoped only to the files Step 3 reported as CHANGED, to confirm the fixes are correct and didn't add new bugs. If it finds a new high or medium bug, fix it and run the tests again. Do this at most once, so the workflow can't loop.

## Step 5 — Report

Finish with this summary:

```
## Audit: <SCOPE>

### Fixed
- `file:line` — <bug> → <what you changed>

### Not fixed (for you to decide)
- <low-severity bugs, convention issues, readability notes, with file:line>

### Changed files (verified by checksum)
- <path> — <expected | UNEXPECTED>

### Tests
<pass/fail, with the failing test names if any>
```

Delete `CHECKSUMS.sha256` at the end unless the user asked to keep it.
