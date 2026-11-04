# Notes

## What the plugin does and how to install it

`code-quality` bundles:

- **`test-runner`** agent: runs the project's tests and reports the results.
- **`test-auditor`** agent: reads the tests and reports what they cover. Strictly read-only (`Read, Grep, Glob`).
- **`pr-reviewer`** agent: reviews a PR or branch diff and reports findings.
- **`pr-fixer`** agent: fixes the blocker and major findings from a review. The only agent that can change code (`Edit, Write`).
- **`/pull-request`** command: runs the tests, then reviews the PR if they pass.
- **`git-commit`** skill: writes Conventional Commits messages.
- A **hook** that formats files with Prettier after Write/Edit.

Install:

```
/plugin marketplace add https://github.com/rbraga3d/claude-multi-agent-workflow.git
/plugin install code-quality@kodree-tutorial-plugins
/reload-plugins
```

## Scoping decision: tools and model per subagent

`test-runner` and `test-auditor` use `haiku`. They only run one command or read a few files and summarize, so a small, fast, cheap model is enough. `pr-reviewer` uses `opus`. Finding bugs and security issues in a diff needs deeper reasoning, and a missed bug costs more than the extra tokens. `pr-fixer` uses `sonnet`: editing code needs more than `haiku`, but it follows a precise report, so it doesn't need `opus`.

Tools follow the job, with least privilege:

- `test-auditor` has only `Read, Grep, Glob`, so it can't run commands or change anything.
- `test-runner` and `pr-reviewer` add `Bash` (to run tests and `git`/`gh` read commands), but no `Write` or `Edit`. Their prompts limit which commands `Bash` may run.
- `pr-fixer` is the only one with `Edit` and `Write`.

The reviewer and the fixer are separate agents on purpose. The one that finds a problem is not the one that fixes it, so the review stays independent and the fixer only touches what the report asks for. It never edits tests and never commits or pushes.

## Parallel vs. sequential in `/pull-request`

The two steps run in **sequence**. The review only makes sense if the tests pass, since reviewing code that doesn't work wastes an expensive `opus` run. If a test fails, the command stops and shows the failures.

The test run is launched in the **background**, but that only keeps the session free. The command still waits for the result before it moves on. Truly parallel steps would have to be independent of each other, and these two are not.
