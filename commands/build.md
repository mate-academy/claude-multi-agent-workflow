---
description: Scout the code and research the docs in parallel, then implement the change from both results.
argument-hint: <what to build or change>
---

Run the build workflow for this task:

$ARGUMENTS

If no task was given above, ask me what to build and stop.

## Step 1 — Investigate (parallel)

Start these two subagents at the same time, in a single message, and wait for both to finish. Give each one the full task text above.

- **codebase-scout**: map the files, call paths, conventions and similar existing code that matter for this task.
- **docs-researcher**: find the versions of the external libraries, APIs or services this task relies on, and check how to use them for those versions.

These two don't depend on each other, so don't run them one after the other.

## Step 2 — Check before building (sequential, waits for step 1)

Read both reports. Stop here if either of these is true:

- the scout found nothing relevant;
- the researcher flagged a breaking change, a deprecation or a conflicting requirement that changes what should be built.

If you stop, show me a short version of both reports and ask how to proceed. Otherwise continue.

## Step 3 — Implement (sequential, waits for step 2)

Start the **implementer** subagent. Pass it:

1. the original task text,
2. the full codebase-scout report,
3. the full docs-researcher report.

Tell it to follow the conventions and the recommendation in those reports, and to report back in its standard format.

## Step 4 — Report to me

When the implementer is done, give me a short summary with:

- what was built (2–3 sentences),
- the files that changed,
- the checks it ran and their results,
- any decisions, assumptions or follow-ups from the three reports that I need to act on.

Don't repeat the full reports unless I ask for them. Don't commit or push anything.