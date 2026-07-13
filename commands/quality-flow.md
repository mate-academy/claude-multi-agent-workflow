Run a complete code-quality workflow for the current repository changes.

Workflow:

## Phase 1 — Parallel inspection

Start these independent tasks in parallel:

1. Ask the `code-reviewer` agent to review the current Git changes for bugs, regressions, missing validation, risky behavior, and missing tests.
2. Independently inspect the project test and lint commands, run the available checks, and collect any failures or warnings.

Do not modify files during this phase.

## Phase 2 — Consolidate

Wait for both Phase 1 tasks to finish.

Combine:

- the reviewer findings;
- test failures;
- lint failures;
- relevant project conventions.

Remove duplicates and classify the issues as:

- critical;
- important;
- minor;
- informational.

## Phase 3 — Dependent fix

Only after Phase 2 is complete, invoke the `test-fixer` agent with the consolidated findings.

Ask it to fix only confirmed implementation issues and rerun the relevant tests and lint checks.

## Phase 4 — Final verification

After the fixer completes:

1. run the full test suite;
2. run lint;
3. inspect `git diff`;
4. confirm there are no conflict markers or accidental files.

Return a final report containing:

- initial findings;
- fixes applied;
- final test and lint results;
- changed files;
- remaining risks;
- whether the branch is ready for a pull request.
