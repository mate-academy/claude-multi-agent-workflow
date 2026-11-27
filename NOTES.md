# code-review plugin notes

## What it does

The plugin reviews changed files for bugs, code smells, and complexity, then fixes the issues it finds.

| Component | File | Purpose |
|---|---|---|
| `review-code` subagent | `agents/review-code.md` | Reviews changed files in any language and returns recommendations ordered by severity |
| `resolve-issues` subagent | `agents/resolve-issues.md` | Fixes the review findings, runs checks, and reports the status of each finding |
| `review` command | `commands/review.md` | Runs the two subagents as one workflow |
| `pre-commit-check` skill | `skills/pre-commit-check/SKILL.md` | Runs tests and linting, looks for leftovers and secrets, and says whether changes are ready to commit |
| Syntax check hook | `hooks/hooks.json`, `scripts/check-syntax.js` | Checks the syntax of each file after Claude edits or writes it |

## Install and use

Install from the marketplace by running these in Claude Code:

```
/plugin marketplace add fadyboy/claude-multi-agent-workflow
/plugin install code-review@multi-agent-workflow
```

This reads the repository's default branch, so it works once the plugin is on `main`. To install from the `ship-plugin` branch after pushing it, add `@ship-plugin` to the end of the first command.

For development, load the plugin locally from the repository root:

```
claude --plugin-dir .
```

Then run the workflow, optionally limited to certain files or folders:

```
/code-review:review course-api
```

The command covers files changed since the branch left the default branch (the remote copy when there is one), including uncommitted, new, and deleted files. Without a path, that includes any changed plugin files too. It does not commit or push, so review the fixes before committing. Use `/reload-plugins` to pick up edits to the plugin.

To check whether changes are ready to commit, ask Claude or run the skill directly:

```
/code-review:pre-commit-check
```

The hook runs automatically and needs `node` on your `PATH`. Run `npm install` in `course-api/` first so that tests and linting can run.

## Scoping decisions

**`review-code` is read-only** (`Read, Grep, Glob`). A reviewer should report problems without changing the code it is judging. Because it has no `Bash`, it cannot run `git diff`, so the caller passes it the changed files and the diff.

**`resolve-issues` can edit and run checks** (`Read, Grep, Glob, Edit, Bash`). It needs `Edit` to apply fixes and `Bash` to run tests, linting, and syntax checks. It has no `Write` tool because its job is to change existing code. The limits on `Bash` (no installing, committing, pushing, or discarding changes) are instructions to the agent and are not enforced by its tool list.

Both subagents use the `sonnet` model.

## Orchestration decisions

| Step | Action | Order |
|---|---|---|
| 1 | Find the changed files | First |
| 2 | One reviewer looks for bugs, another for code smells and complexity | Parallel |
| 3 | Merge, deduplicate, and number the findings | After both reviews |
| 4 | One resolver fixes the findings | After step 3 |
| 5 | Report fixes, open decisions, and check results | Last |

**The reviews run in parallel** because they only read code and neither depends on the other. Splitting them by focus gives a parallel step even when only one file has changed.

**Resolving runs in sequence** because the resolver needs the combined findings. Only one resolver runs, so two agents never edit the same file at once.

Fixes start as soon as the findings are listed, without waiting for approval. Pre-existing findings, and fixes that need edits outside the changed files, are left for you to decide.

## Skill and hook decisions

**The `pre-commit-check` skill** covers the step after review and fixing. It reports whether the work is ready to commit but does not change or commit anything.

**The hook** runs after every `Edit` or `Write`, so a fix that breaks a file's syntax is reported to Claude straight away. It checks JavaScript, JSON, and bash files without running them. It does not check TypeScript, which needs the project's own compiler setup, and it does not see files changed through `Bash`. The script is referenced through `${CLAUDE_PLUGIN_ROOT}` so that it resolves wherever the plugin is installed.

To avoid blocking valid code, the hook does not report an error in a `.js` file that may come from JSX (an unexpected `<`) or in a file with an `@flow` comment. On bash older than 4, such as the 3.2 on macOS, it also ignores errors on lines that use `;&`, `;;&`, `|&`, `&>>`, or `coproc`. Real errors reported in those ways are missed.

## Changes so far

- Added the `review-code` subagent.
- Stated in `review-code` that it covers any language, including TypeScript, shell scripts, and CI configuration, and made the file path in its output example language-neutral.
- Added the `resolve-issues` subagent.
- Added the `review` command.
- Added these notes.
- Added the `pre-commit-check` skill.
- Added the syntax check hook, and tested its script with valid and broken sample files.
- Added `.claude-plugin/marketplace.json`, and tested installing the plugin from a local copy of the repository.
- Tested the plugin locally with `claude --plugin-dir .` against `course-api/`.
