# code-quality plugin

## What it does

A code-quality workflow for `course-api/`: a read-only reviewer subagent finds
convention drift, missing error handling, and untested behavior; a
test-writer subagent closes the coverage gaps it's handed and confirms the
suite still passes. A `/quality-check` command runs both as a workflow, a
`code-quality-checklist` skill keeps reviews grounded in this project's
actual conventions instead of generic style opinions, and a `PostToolUse`
hook auto-runs `eslint --fix` on any `.js` file Claude edits or writes.

## Install

From a fresh Claude Code session, in this repo:

```
claude --plugin-dir .
```

Or, as a marketplace install (what Task 6 exercises):

```
/plugin marketplace add <this-repo>
/plugin install code-quality@code-quality-marketplace
```

Then run the workflow with `/quality-check`. Use `/reload-plugins` after any
local edit to the plugin's files to pick up changes without restarting the
session.

## One scoping decision: why `code-reviewer` gets no write tools

`code-reviewer` is limited to `Read, Grep, Glob` — deliberately no `Edit` or
`Write`, and no `Bash`. A reviewer that can also edit tends to blur "here's
what's wrong" into "I already changed it," which removes the human's chance
to weigh in before code moves. Keeping it read-only also means it's safe to
run against files mid-edit without any risk of the review itself introducing
a change — the two parallel review passes in Stage 1 of `/quality-check` can
run concurrently over the same working tree with zero chance of one
clobbering the other's target files. `test-writer`, by contrast, needs
`Write`/`Edit` (to add test files) and `Bash` (to actually run `npm test` and
confirm its own work), because its job is specifically to make a change and
verify it — a fundamentally different kind of task than reviewing.

## One orchestration decision: why Stage 1 is parallel and Stage 2 isn't

The two `code-reviewer` calls in Stage 1 look at disjoint parts of the tree
(`routes/` + `db/` vs. `tests/`) and neither one's findings change what the
other should look for — there's no dependency, so running them at the same
time costs nothing and halves the wall-clock time of the review pass.
Stage 2 is different: `test-writer` needs the *combined* findings from both
reviewers to know which gaps to close, so it cannot start until Stage 1 is
completely finished. Forcing it to wait is what makes the fix-up targeted
instead of a generic "write more tests" pass.
