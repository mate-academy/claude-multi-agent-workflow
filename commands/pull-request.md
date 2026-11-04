---
description: Runs the tests in the background and, if they all pass, reviews the pull request
argument-hint: [PR number or branch (optional)]
---

Run the pull request workflow in two sequential stages. Target: $ARGUMENTS (if empty, use the current branch against `main`).

## Stage 1: tests (background)

Invoke the `test-runner` subagent with the Agent tool and `run_in_background: true`. Ask it to run the project's tests and report the results. Do not run the tests yourself. Wait for its completion notification before moving on; do not poll or guess the result.

## Stage 2: review (only if all tests pass)

- If `test-runner` reports PASSED with 0 failures, invoke the `pr-reviewer` subagent with the target above and show its report to the user.
- If any test fails, or the tests could not be run, do NOT invoke `pr-reviewer`. Show the failures from `test-runner` and stop.

Do not edit files, commit, push or create the pull request yourself.
