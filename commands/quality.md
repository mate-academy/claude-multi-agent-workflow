---
description: Run the full code quality workflow on your changes — lint fixes and review in parallel, then tests for the gaps the review found, then a final gate.
argument-hint: "[files or paths — defaults to uncommitted changes]"
allowed-tools: Agent, Skill, Read, Grep, Glob, Bash(git diff:*), Bash(git status:*), Bash(npm test:*), Bash(npm run lint:*)
---

You are coordinating a code quality pass using this plugin's three subagents: `code-reviewer`, `lint-fixer` and `test-writer` (they may be listed as `code-quality:code-reviewer` and so on). Your job is to hand out the work, pass results from one step to the next, and write the final report. Don't review, fix or write tests yourself.

## Step 0 — Decide the scope

If the user gave paths, the scope is: $ARGUMENTS

Otherwise, run `git status` and `git diff HEAD --name-only` and use the changed and untracked source files. Leave out `node_modules/`, lockfiles and generated files. If nothing has changed and no paths were given, tell the user there's nothing to check and stop.

State the scope in one line before continuing.

## Step 1 — Lint and review, in parallel

These two jobs don't depend on each other, so start both **in the same message** so they run at the same time:

- **`lint-fixer`**: give it the files in scope. It runs the linter and makes only mechanical, behaviour-preserving fixes.
- **`code-reviewer`**: give it the same files. Tell it that style and formatting are being handled separately, so it should focus on correctness, validation, conventions and test gaps. Line numbers may shift slightly because of the lint fixes.

Wait until **both** have returned before moving on.

## Step 2 — Write tests for the gaps (waits for Step 1)

This step depends on the reviewer's report, so it can't start until Step 1 is finished.

- If the reviewer listed **Test gaps** or findings about behaviour that has no test, start **`test-writer`**. Give it the scope from Step 0, the reviewer's test gaps word for word, and any blocker or major findings, so it can write tests that prove whether each one is a real bug. Tell it to stay within the scope and to list gaps in other files under "Not covered" instead of writing tests for them.
- If the reviewer listed no gaps and no blocker or major findings, skip this step and say so.

## Step 3 — Final check (waits for Steps 1 and 2)

Once every agent has finished, run `npm run lint` and `npm test` yourself. Their output decides the result, not what the agents said. Run each as its own plain command. Don't add pipes, redirects, `; echo $?` or anything else, because only the bare commands are pre-approved. Don't edit anything in this step.

## Step 4 — Check open questions against the conventions (waits for Step 3)

Before writing the report, collect everything you would put under "Needs a human": questions, trade-offs, and behaviour the agents locked in without being sure it was right. Load this plugin's `express-api-conventions` skill (it may be listed as `code-quality:express-api-conventions`), along with the project's `CLAUDE.md`, and check each item against them:

- **The conventions answer it and the code follows them**: it's settled. Take it out of "Needs a human" and list it under "Settled by conventions", citing the rule.
- **The conventions answer it and the code breaks them**: it's a finding. Move it to "Must fix" as major (or blocker, if it's a correctness bug), citing the rule. This counts toward the result.
- **The conventions don't cover it**: leave it under "Needs a human".

Only settle an item when a rule clearly answers it. Don't stretch a rule to cover something it doesn't mention.

This step only reclassifies "Needs a human" items. **Don't change the severity of the reviewer's findings.** The reviewer's ratings decide the result. If you think a reviewer finding breaks a convention and deserves a higher rating, keep the reviewer's rating and add a note to that finding: "may be higher: breaks <rule>". The user decides.

## Step 5 — Report

Put everything into one report:

```
## Quality: PASS | NEEDS WORK

Scope: <files>

### Must fix
- [blocker|major] file:line — issue — fix   (from the reviewer; mark any that a test-writer
  todo test confirmed as a real bug: "confirmed by test")

### Done automatically
- Lint: <before → after>, <n> fixes
- Tests: <n> added in <files>

### Needs a human
- lint items the fixer left alone, suspected bugs from test-writer, and open questions
  the conventions don't answer

### Settled by conventions
- question — answer — the rule that decides it (leave this section out if it's empty)

### Final gate
- npm run lint: pass | fail
- npm test: N passed, N failed, N todo
```

The result is **PASS** only if lint and tests pass in Step 3 **and** the reviewer found no blocker or major findings. Otherwise it's **NEEDS WORK**. Minor findings never change the result. "Confirmed by test" is supporting evidence in the report; it doesn't decide the result. Don't fix the "Must fix" items. List them and let the user decide.
