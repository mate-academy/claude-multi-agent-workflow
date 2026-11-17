---
description: Run the API quality workflow — parallel review + test-gap scan, then write the missing tests and report.
argument-hint: "[path to the API project, default: current directory]"
allowed-tools: Agent, Read, Bash(npm test:*), Bash(npm run lint:*)
---

Run the **api-quality** workflow on the Express API at: `$ARGUMENTS` (if empty, use the current working directory; if that has no `package.json` with an Express dependency but `course-api/` does, use `course-api/`).

Call the project path **TARGET** below and pass it to every subagent. Run the steps strictly in this order.

## Step 1 — Review and scan, in parallel

These two jobs are independent (both only read the code), so launch them **at the same time, in a single message with two Agent calls**:

- **`api-quality:api-reviewer`** — "Review the Express API in TARGET for correctness bugs and convention breaks. Return your standard API review report."
- **`api-quality:test-gap-scout`** — "Build the test coverage map for the Express API in TARGET. Return your standard coverage table."

Wait until **both** have returned. Do not start Step 2 with only one result.

## Step 2 — Write the missing tests (depends on Step 1)

Launch **`api-quality:test-writer`** once, and paste into its prompt, verbatim:

1. the full coverage table from `test-gap-scout`, and
2. the "Behaviours a test should pin down" list and the findings table from `api-reviewer`.

Instruct it: "Work in TARGET. Write tests for every **missing** row and every listed behaviour, run `npm test` and `npm run lint`, and return your standard report."

If Step 1 found no gaps and no findings, skip this step and say so.

## Step 3 — Verify and report (depends on Step 2)

1. Run `npm test` and `npm run lint` in TARGET yourself, so the final numbers come from your own run rather than the subagent's claim.
2. Reply to the user with one short report:

```
# API quality report — <TARGET>

## Review findings      (from api-reviewer; highest severity first)
## Coverage             before: x/y → after: x/y response paths
## Tests added          (from test-writer)
## Confirmed bugs       (tests marked todo — app code was NOT changed)
## Final run            npm test …, npm run lint …
## Suggested next step  one line
```

Do not fix application code in this workflow — the report is the hand-off for a human to decide.
