# NOTES — code-quality plugin

## What it does

`code-quality` is a Claude Code plugin that bundles a small multi-agent workflow for
reviewing a change before it ships. Point it at a diff and it:

1. reviews the change for correctness and convention violations (`code-reviewer` subagent),
2. writes the tests the review says are missing (`test-author` subagent),
3. lints every file it touches along the way (`PostToolUse` hook).

It's built and tested against the Express API in `course-api/`.

Components, all namespaced under `code-quality:` once installed:

| Kind | Name | Role |
| --- | --- | --- |
| Command | `/quality-check` | Orchestrates the whole flow. |
| Subagent | `code-reviewer` | Read-only. Judges a diff, returns findings + a test-gap list. |
| Subagent | `test-author` | Writes/extends tests for the gaps and runs the suite. |
| Skill | `test-conventions` | The course-api test house style. |
| Hook | `hooks.json` → `lint-changed.js` | Runs ESLint on touched `course-api` JS files after `Edit`/`Write`. |

## How to install

From a checkout, for local development:

```
claude --plugin-dir .
```

As a marketplace (what an end user does):

```
/plugin marketplace add DimaDamage91/claude-multi-agent-workflow
/plugin install code-quality@code-quality
```

Then, from `course-api/` (so the linter and test runner have their deps):

```
cd course-api && npm install
```

Run it with `/code-quality:quality-check` — no argument reviews the working-tree diff, or
pass a branch, a path, or a commit range.

## One scoping decision

**`code-reviewer` gets `tools: Read, Grep, Glob` and `model: opus`. `test-author` gets
`Edit`/`Write`/`Bash` and `model: sonnet`.**

The reviewer's whole job is judgement — does this diff break a caller, does it violate the
`404`/`400` conventions in `CLAUDE.md`, is a new branch now untested. That's the hardest
reasoning in the plugin, so it gets the strongest model. It also never needs to change a
file, so it gets no write tools at all: a review that can't edit can't "helpfully" fix
something mid-review and hide the very problem it was asked to find. The read-only tool set
isn't a limitation here, it's the guarantee.

`test-author` is the opposite. Its task is well-defined — it's handed an explicit list of
behaviours to cover and a house-style skill that pins the exact test shape — so `sonnet` is
enough and `opus` would just be slower and dearer for no gain. But it genuinely has to
create files and run `npm test`, so it gets `Edit`, `Write`, and `Bash`. Its body then
fences that power: it may touch test files only, never route code, and if a test can only
pass by changing a route it must report that instead of doing it.

## One orchestration decision

`/quality-check` runs the **review** and the **coverage baseline** (`npm test` + listing the
existing test files) as a single parallel step, then runs **test authoring** as a dependent
step, then the **report** as another dependent step.

The review and the baseline are parallel because neither needs the other: the reviewer reads
the diff, the baseline records the "before" test count. Running them together halves the
wall-clock wait before anything useful comes back, and the baseline is cheap.

Test authoring is sequential — it *cannot* start until the review finishes, because its only
input is the reviewer's **Test gaps** list. There's nothing for it to do until that list
exists. Forcing it to wait isn't a cost; it's the data dependency. The final report is
likewise dependent: it needs the after-count from the test step to compare against the
baseline, so it runs last.
