# code-quality

A Claude Code plugin that bundles a multi-agent code quality workflow: subagents that review and fix code, a command that orchestrates them, a skill, and a hook — all tested against the Express API in `course-api/`.

## Structure

```
.claude-plugin/
  plugin.json        # manifest — name + version
  marketplace.json    # marketplace catalog listing this plugin
agents/                # scoped subagents (a read-only reviewer, a writer/fixer)
commands/              # the workflow command that orchestrates the subagents
skills/                # a skill supporting the workflow
hooks/                 # hooks.json — automation hooked into Claude Code events
course-api/            # sample Express API used to build and test the plugin against
NOTES.md               # install steps, scoping decisions, orchestration decisions
```

Only `plugin.json` (and later `marketplace.json`) live inside `.claude-plugin/`; every component folder sits at the repo root, per the [plugin reference](https://docs.claude.com/en/docs/claude-code/plugins-reference).

## Install

Local development, from the repo root:

```
claude --plugin-dir .
```

Once published as a marketplace:

```
/plugin marketplace add <this-repo>
/plugin install code-quality@<marketplace-name>
```

## Status

Subagents, the workflow command, the skill, and the hook are all in place, tested against `course-api/`.
