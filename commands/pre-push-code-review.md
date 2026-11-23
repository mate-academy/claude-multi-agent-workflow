Run a code review workflow on: $ARGUMENTS. If no arguments passed, run on the whole codebase

If no target was given, review the uncommitted changes in the working tree.

## Step 1: Parallel analysis

Launch BOTH subagents in a single message so they run at the same time:

1. **code-quality-reviewer**: Review the target for bugs, correctness issues, convention violations (per CLAUDE.md), simplification opportunities, and test coverage gaps. Ask it to return its findings as a JSON array.
2. **code-editor-agent**: Read-only context pass. Tell it explicitly NOT to modify any files in this step. It should read the target and the code around it (callers, related modules, existing tests, conventions) and return a short summary of the structure and patterns relevant to making fixes.

Wait for both to finish before continuing.

## Step 2: Dependent fixes

Look at the reviewer's findings.

- **If the array is empty:** skip editing and go straight to Step 3.
- **If there are findings:** launch **code-editor-agent** again with:
  - the findings to fix (see filtering below)
  - the context summary from Step 1
  - the instruction to make minimal, targeted edits that follow existing conventions, and to report anything it chose not to fix and why

Filtering rules:
- Fix findings with severity `important`. Treat `CONFIRMED` as safe to fix.
- For `PLAUSIBLE` findings, pass them along but tell the editor to verify the issue in the code first and skip it if it doesn't hold up.
- Do not fix `pre_existing` findings or `nit` findings. List them in the report instead.

## Step 3: Report

Give me a summary in this format:

**Verdict:** one line, either "No issues found, code looks good" or "N issues found, M fixed".

**Findings:** a table with file:line, category, severity, verdict, and one-line summary for each.

**Edits made:** the files the editor changed and what each change does. Omit this section if nothing was edited.

**Not fixed:** the `pre_existing` and `nit` findings, plus anything the editor skipped, with reasons.

**Verify:** anything I should check manually, such as tests to run, since the agents can't execute code.