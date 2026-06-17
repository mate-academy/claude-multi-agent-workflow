---
description: "Full build-and-ship workflow: audits the API contract and explores the codebase in parallel, then hands both results to the feature implementer to build the requested change correctly."
argument-hint: "<feature or fix to implement>"
---

# Ship

You are orchestrating a two-phase workflow. The goal is to implement the following correctly and completely:

**$ARGUMENTS**

---

## Phase 1 — Parallel discovery

Launch these two tasks at the same time. They are independent — neither needs the other to finish first.

**Task A: api-contract-reviewer agent**
Ask the `api-contract-reviewer` agent to audit the full API in this project: all route definitions, request validators, response shapes, and any API documentation file it can find. Tell it to return its full structured report — inconsistencies, missing validation, and confirmed-correct sections.

**Task B: Codebase orientation (you, using Read / Glob / Grep)**
While Task A is running, explore the codebase yourself:
- Find the entry point and locate the main route or handler files.
- Identify the framework, validation library, and test runner in use.
- Note naming conventions and the error-handling style already established.
- List the files most likely to be touched by the requested change.

Do not begin Phase 2 until both Task A has returned its report and your own exploration is complete.

---

## Phase 2 — Sequential implementation

Now that you have the contract report and your own codebase notes, launch the `feature-implementer` agent. Pass it:

1. The feature or fix to build: **$ARGUMENTS**
2. A brief summary of what the contract reviewer found — name any inconsistencies that the new code must not worsen, or confirm the contract is currently clean.
3. The list of key files you identified in Phase 1 so the implementer can orient without re-exploring.

Wait for the implementer to return its completion report before responding to the user.

---

## Final response

Once the feature-implementer finishes, tell the user:

- **What was built** — one short paragraph describing the change.
- **Pre-existing contract issues** — any problems the reviewer flagged that were not caused by this change and should be addressed in a follow-up.
- **Test result** — pass, fail, or not runnable (with reason).
- **Manual steps remaining** — only if something genuinely could not be done in this pass (missing environment variable, database migration requiring a deploy, etc.).

Keep the final response tight. The diff is the record; the summary exists only for what the user needs to act on.
