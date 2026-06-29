# /dev-pipeline

Run the full five-stage development pipeline against the current project.

## Usage

```
/dev-pipeline "<task description>"
```

## What it does

Spawns five specialized subagents in sequence, with a parallel Review + Test stage and an automatic self-healing fix loop:

```
Planner → Coder → (Reviewer ∥ Tester) → [Fixer → (Reviewer ∥ Tester)]* → Committer
```

1. **Planner** reads the codebase and produces a structured JSON plan (files, steps, acceptance criteria, test cases).
2. **Coder** implements every step and writes all specified tests.
3. **Reviewer** inspects the git diff for correctness, convention compliance, and edge cases.
   **Tester** runs `npm test` and `npm run lint` in parallel with the reviewer.
4. **Fixer** (if review or tests failed) addresses all blocking issues, then the pipeline loops back to step 3.
   Repeats up to `max_fix_rounds` times (default: 3).
5. **Committer** stages the relevant files and creates a descriptive git commit only when both the reviewer approved and all tests passed.

## Arguments

| Argument | Type | Default | Description |
|---|---|---|---|
| task | string | required | What to build or change, in plain English |
| max_fix_rounds | number | 3 | Maximum self-healing iterations before the pipeline halts |

## Examples

```
/dev-pipeline "Add DELETE /users/:id endpoint returning 204 No Content"
/dev-pipeline "Add GET /users?email= filter that returns matching users"
/dev-pipeline "Create bank-accounts nested resource under users with one-to-many relationship"
```

## Exit conditions

- **success** — reviewer approved + all tests passed → commit created.
- **failed** — could not resolve all issues within `max_fix_rounds` → no commit, manual intervention needed.
