# qa-kit — Notes

## What the plugin does

qa-kit is a code quality plugin for Claude Code. It bundles a two-agent QA workflow, a test-suggestion skill, and a lint hook into a single installable unit.

## Install

```bash
# From the repo root
claude --plugin-dir .

# Or install via the bundled marketplace
/plugin marketplace add <your-repo-url>
/plugin install qa-kit@<marketplace-name>
```

Run the workflow with:

```
/qa-kit:qa-review
```

## Scoping decision — why code-reviewer is read-only

`code-reviewer` is scoped to `Read, Grep, Glob` only. A reviewer never needs to change files — it only needs to read them. Giving it write access would risk accidental edits and make the agent harder to trust. Keeping it read-only also means it can run safely in parallel with other agents without file conflicts.

## Orchestration decision — why code-fixer runs after code-reviewer

The two steps in `qa-review` are sequential by design: the fixer depends on the reviewer's findings. There is no useful work the fixer can do without a list of issues to act on. Running them in parallel would mean the fixer starts with no input. The parallel step described in the command is conceptually where multiple reviewers could run at once (e.g. one per file); the dependent step is the fixer consuming the merged results.
