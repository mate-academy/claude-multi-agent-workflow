# NOTES

## What the plugin does

`code-quality` runs a code quality workflow on a Node/Express project. It's one command, `/code-quality:quality [paths]`, that coordinates three scoped subagents:

- **`lint-fixer`** (haiku) makes mechanical, behaviour-preserving ESLint fixes.
- **`code-reviewer`** (opus, read-only) reviews for bugs, input validation, convention breaks and missing tests.
- **`test-writer`** (sonnet) writes tests for the gaps the reviewer found, runs them, and marks confirmed bugs as `todo` instead of fixing app code.

After the agents finish, the command runs `npm run lint` and `npm test` itself. It checks any open questions against the `express-api-conventions` skill, then reports **PASS** or **NEEDS WORK**. PASS requires lint and tests to pass and no blocker or major findings from the reviewer.

Two hooks complete the plugin. A **PostToolUse lint gate** sends ESLint errors back to Claude right after it edits a JS file. A **PreToolUse guard** holds `test-writer` to plain `npm test` / `git diff` / `git status` and to editing test files only.

## Install

```
/plugin marketplace add aruizacevedo/claude-multi-agent-workflow
/plugin install code-quality@claude-multi-agent-workflow
```

Then run `/reload-plugins`, or start a new session, and run `/code-quality:quality <path>` in a Node/Express project. The hooks need Node on the `PATH`, and the lint gate needs ESLint installed in the project. For local development, run `claude --plugin-dir .` from the repo root.

## Scoping decision: a different model and toolset for each agent

I gave each agent the cheapest model and the smallest toolset that could do its job.

- **`code-reviewer`: opus, tools `Read, Grep, Glob`.** Its job needs the most judgment: finding real bugs, tracing a route through the store, and rating severity. Its ratings decide the verdict, so a missed or wrong finding costs the most. In testing it found things a quick read wouldn't. For example, `/users/0x1` loads user 1 because `Number('0x1') === 1`, so `PUT /users/0x1` overwrites someone else's record. It's read-only because a reviewer that can edit stops being a reviewer. With no write tools, it can't quietly "fix" what it was asked to judge.
- **`lint-fixer`: haiku, tools `Read, Edit, Bash`.** The rules are explicit and the fixes are mechanical, so a small fast model is enough. In a typical run it cost about $0.02, compared with about $0.55 for the reviewer. It gets `Edit` but not `Write`, because it only changes existing files.
- **`test-writer`: sonnet, tools `Read, Grep, Glob, Write, Edit, Bash`.** Writing tests that compile and run is medium-difficulty work, so haiku isn't enough and opus is more than it needs. It needs `Bash` to run `npm test`.

**Lesson: prompts don't enforce limits, hooks do.** The `tools` line can allow or block Bash entirely, but it can't limit Bash to specific commands. In testing, `test-writer` tried to write and run a probe script in `/tmp` and piped `npm test` into `tail`, even though its prompt said not to. So I added a PreToolUse hook that identifies the agent from `agent_type` in the hook input and blocks anything outside its limits. A live test confirmed it blocks `node -e`, pipes and edits to `routes/users.js`, even when the session's permissions would have allowed them.

## Orchestration decision: what runs in parallel and what waits

```
Step 1  ┌─ lint-fixer ────┐   parallel
        └─ code-reviewer ─┘
Step 2  test-writer              waits for Step 1
Step 3  npm run lint + npm test  waits for everything
Step 4  conventions check        waits for Step 3
Step 5  report
```

**Lint and review run in parallel because neither needs the other's output.** The linter works from ESLint's rules and the reviewer works from the code and the conventions. I told the reviewer that style is handled separately, so their work doesn't overlap. Running them together saves the reviewer's full runtime, which is the slowest step. The trade-off is that `lint-fixer` may edit files while the reviewer reads them. Lint fixes don't change behaviour, so the worst case is slightly off line numbers, and the reviewer is warned about that. If that ever caused trouble, running lint first would fix it, but then nothing would run in parallel.

**`test-writer` waits because its input is the reviewer's output.** It gets the reviewer's test gaps and blocker/major findings word for word, and writes tests that prove whether each finding is a real bug. Running it in parallel would mean it guesses what to test, and it couldn't mark a finding as "confirmed by test". Starting it later is what makes the evidence possible.

**The final check waits for everything, and the orchestrator runs it itself.** It has to measure the code after every agent has changed it. It also runs the commands directly rather than trusting the agents' summaries, so the verdict comes from real `npm` output.

**The conventions check comes last** because it works on the collected open questions. The skill can settle a question (e.g. "PUT with an empty body to a missing id → 400, because validation happens before the lookup") or turn it into a finding when the code breaks a rule. It can't change the reviewer's severity ratings, so the verdict still comes from the reviewer.

## What testing changed

I ran the full workflow five times against `course-api/routes/users.js`. Each run exposed something to fix:

1. **Denied Bash calls.** Compound commands like `npm run lint; echo $?` were denied by the command's pre-approved tools. The command now tells the orchestrator to run each check as a plain command.
2. **Verdict rule.** "PASS unless there's a blocker" would have passed four bugs a test had confirmed. The rule is now "any blocker **or major** means NEEDS WORK".
3. **Unused skill.** The workflow never used the skill, so it asked me things the skill already answered. Step 4 now checks open questions against it.
4. **Contradicting components.** The skill said a malformed id should return 404; the reviewer called it a bug. I settled on **400 for malformed ids** to match `course-api/CLAUDE.md` ("400 on bad input, 404 when a record is missing") and aligned all three components.
5. **Overreach.** `test-writer` wrote tests outside the scope, and the orchestrator raised a reviewer severity. Both are now ruled out in the prompts: `test-writer` stays within the scope it's given, and the orchestrator only adds a "may be higher" note. The guard hook keeps `test-writer` to test files, but it can't tell which test files are in scope, so that part still relies on the prompt.
