# Code Quality Workflow Plugin

A Claude Code plugin for reviewing and improving the Express API in `course-api/`.

## What it does

The plugin bundles two focused subagents, a workflow command, a reusable skill, and a post-edit test hook.

- **code-reviewer** — read-only inspection of correctness, security, maintainability, regressions, and test coverage.
- **test-fixer** — runs tests and makes small, evidence-backed fixes, then reruns validation.
- **code-quality** — orchestrates the reviewer and fixer in parallel, followed by a dependent validation step.
- **code-quality skill** — gives consistent guidance for safe API quality work.
- **post-edit hook** — runs `npm test` after plugin-driven writes/edits to the API.

## Local use

From the repository root:

```bash
claude --plugin-dir .
```

Inside Claude Code, reload plugins after edits if needed:

```text
/reload-plugins
```

Run the namespaced `/code-quality` workflow against `course-api/`.

## Marketplace installation

Add `fredrik-claude-marketplace` as a Claude Code marketplace and install
`code-quality-workflow`.

The plugin can also be tested directly from a checkout with:

```bash
claude --plugin-dir .

## Plugin purpose

This plugin is intentionally scoped to the supplied Express API so the workflow demonstrates a real multi-agent quality loop: independent analysis plus test execution first, then dependent validation.

## Marketplace

The repository also contains `.claude-plugin/marketplace.json` so the plugin can be installed from this GitHub repository as a marketplace.
