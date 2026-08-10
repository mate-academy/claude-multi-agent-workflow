# Notes — code-quality-guard

## What it does and how to install

`code-quality-guard` is a Claude plugin that automates code-quality review and test generation. It bundles two scoped subagents — a read-only `code-reviewer` and a `test-author` that can write code — a workflow command (`quality-check`) that orchestrates them, a skill (`explain-code`) for quick code explanations, and a `file-edited` hook that runs lightweight lint checks after every edit.

**Install locally:**
```bash
claude --plugin-dir .
```

**Install from the marketplace catalog:**
```bash
/plugin marketplace add <repo-url>
/plugin install code-quality-guard@<marketplace>
```

Then invoke `/quality-check` (the workflow command) or `/task code-reviewer` and `/task test-author` (individual subagents).

## Scoping decision: code-reviewer uses `haiku` with read-only tools

The reviewer's job is static scanning — pattern matching for complexity, dead code, style issues, and potential bugs. That is a well-defined, mechanical task that doesn't require the deep reasoning of a larger model, so `haiku` keeps it fast and inexpensive. Its `tools` line is deliberately limited to `Read, Grep, Glob`: it never modifies files, and restricting the tool set prevents it from accidentally editing code during a review pass.

The `test-author` uses `sonnet` with `Read, Grep, Glob, Write, Edit, Bash` because writing meaningful tests requires deeper contextual reasoning — understanding code paths, following existing test conventions, and anticipating edge cases. It genuinely needs `Write` and `Edit` to create and update test files, and `Bash` to run the suite. The tool set is the smallest that still lets it do its job.

## Orchestration: parallel reviews, dependent test-generation

The `quality-check` command runs three `code-reviewer` invocations in parallel (on `src/`, `routes/`, and `tests/`) because each scans an independent directory tree — there is no shared state and no dependency, so parallel execution is strictly faster than sequential.

The fourth step, `test-author`, runs only **after** all reviews complete. It needs the reviewer findings to know which gaps to target: if it ran before or alongside the reviews, it would lack the context to write effective tests. The final synthesis step waits on every prior step so the summary reports a complete picture of issues and changes.
