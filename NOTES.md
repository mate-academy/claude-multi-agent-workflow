# Notes: api-quality-kit

## What the plugin does and how to install it
`api-quality-kit` checks the quality of an Express API with three subagents. One command, `/api-quality-kit:quality-check`, runs them as a workflow. A skill (`api-test-conventions`) explains how tests are written in the API, and a hook lints every JavaScript file that Claude writes or edits. This repo is the plugin and also its marketplace.

To install it:
1. In Claude Code, run `/plugin marketplace add mandziakl-cell/claude-multi-agent-workflow`.
2. Run `/plugin install api-quality-kit@api-quality-kit-marketplace`.
3. Run `cd course-api && npm install` once, so the tests and the lint hook can run.
4. Run `/api-quality-kit:quality-check`.

To try it without installing, run `claude --plugin-dir .` from the repo root and use `/reload-plugins` after each edit. Note that from the repo root Claude Code blocks writes inside the plugin folder (see "A limit I found" below), so `test-writer` may not be able to write there.

## One scoping decision: what each subagent can do
I gave the three subagents different tools and models on purpose.
- `api-reviewer` and `docs-checker` get only `Read`, `Grep` and `Glob`. Their job is to look and report, so they cannot change anything. This is safe to run in parallel, and it means a review can never damage the code.
- `test-writer` is the only one that can write: `Read`, `Grep`, `Glob`, `Write` and `Edit`. I did not give it `Bash`. In an earlier project I saw that a pattern such as `Bash(git diff:*)` in an agent's `tools` line does not limit the shell: the agent could still run `git commit`. So the safe choice is no shell at all. The test writer cannot run its own tests, and the main session runs them afterwards, where I can see the output and approve the commands.
- The models match the difficulty. `docs-checker` only compares a document with code, so it uses the cheap, fast `haiku`. The reviewer and the test writer need to reason about edge cases and write correct tests, so they use `sonnet`.
- A tool list cannot limit a subagent to one folder. So "only write inside `tests/`" is an instruction in the command and in the agent, not a hard lock. The README tells users to review what `test-writer` changes.

## One orchestration decision: what runs in parallel and what runs in sequence
- **Parallel: `api-reviewer` and `docs-checker`.** Neither needs the other's result. One reads the code, the other compares the docs with the code, and both only read. Running them together saves time and has no risk of conflict.
- **Sequential: `test-writer` after both.** It needs their findings: the reviewer's list of behaviors that need tests and the docs mismatches. If it started earlier, it would be guessing.
- **Sequential: tests and lint at the end, one after the other.** They check what `test-writer` wrote, so they must wait for it. They also run one at a time so that their output is easy to read.
- I named each subagent in the command and said to start the two reviewers in a single message. In earlier tests Claude did not reliably choose a subagent by itself, so the command does not leave the choice to chance.

## What I tested
I ran headless tests (`claude -p`) in throwaway copies, with `npm install` only in the copies. The plugin was loaded from its own folder, and `course-api/` was in a separate project folder.
- **Loading:** the plugin loaded with no errors and registered the command, three subagents, the skill and the hook.
- **Workflow order:** the two reviewers were started in the same message, `test-writer` started only after both had finished, and `npm test` and `npm run lint` ran last.
- **Result on `course-api`:** `test-writer` added 32 tests (18 normal, 14 `todo` for bugs) and changed no application code. I ran the suite myself: 37 tests, 23 pass, 0 fail, 14 todo, and lint exits 0.
- **Skill:** it fired, without being named, for "Add tests for the GET /health route in course-api."
- **Hook:** it exits 2 with the ESLint report for a file with a lint error, and exits 0 for a clean file. It ignores other file types, `node_modules`, and folders without ESLint.
- **Marketplace install:** I added the marketplace from GitHub at my branch and installed `api-quality-kit@api-quality-kit-marketplace` with `--scope local`, in a throwaway project and an isolated Claude config folder. The plugin was enabled at version 0.1.0 and had every component. In a fresh session with the installed copy loaded, the workflow ran in the right order: 38 tests, 21 pass, 0 fail, 17 todo, and lint exits 0. My real `settings.json` and plugin registry did not change.

## A limit I found
If I load the plugin with `claude --plugin-dir .` from the repo root, and the API is inside that same folder, Claude Code blocks every write in the folder as a "sensitive file". In my headless runs `Write` and `Edit` were denied, so `test-writer` wrote nothing and the hook never ran. This also happened with `acceptEdits` and with a foreground subagent, and even for a plain write by the main session, so it is not caused by my agents. The reviewers only read, so they were not affected. Loading the plugin from its own folder, with the API in another project folder, worked.

I have not tested two things: whether an interactive session lets me approve those writes, and installing the plugin into my normal user-level Claude config. For the install I used an isolated config folder, because it cannot log in, and then loaded the installed copy with `--plugin-dir`. So I cannot claim either of those two works.

Until this branch is merged, the plain `/plugin marketplace add mandziakl-cell/claude-multi-agent-workflow` reads `main`, which has no plugin yet. Add `#api-quality-plugin` to install from the branch.
