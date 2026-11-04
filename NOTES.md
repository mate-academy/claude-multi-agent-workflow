# Notes

## What the plugin does and how to install it

`code-quality` bundles:

- **`test-runner`** agent: runs the project's tests and reports the results.
- **`pr-reviewer`** agent: reviews a PR or branch diff and reports findings.
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

`test-runner` uses `haiku`. It only runs one command and summarizes the output, so a small, fast, cheap model is enough. `pr-reviewer` uses `opus`. Finding bugs and security issues in a diff needs deeper reasoning, and a missed bug costs more than the extra tokens.

Both get only `Bash, Read, Grep, Glob`, with no `Write` or `Edit`. They are meant to report, not fix, so they can't change files. Their prompts also limit which commands `Bash` may run.

## Parallel vs. sequential in `/pull-request`

The two steps run in **sequence**. The review only makes sense if the tests pass, since reviewing code that doesn't work wastes an expensive `opus` run. If a test fails, the command stops and shows the failures.

The test run is launched in the **background**, but that only keeps the session free. The command still waits for the result before it moves on. Truly parallel steps would have to be independent of each other, and these two are not.
