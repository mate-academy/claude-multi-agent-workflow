# code-quality plugin

A Claude Code plugin (and marketplace) that bundles a multi-agent code-quality workflow.

- Agents: `code-reviewer` (read-only), `test-writer` (writes tests)
- Command: `/code-quality:quality-check [path]`
- Skill: `api-conventions`
- Hook: lints `course-api` after each Write/Edit

## Install
```
/plugin marketplace add jpzetina14-cyber/claude-multi-agent-workflow
/plugin install code-quality@code-quality-marketplace
```

Try locally: `cd course-api && npm install`, then `claude --plugin-dir .` and run `/code-quality:quality-check course-api`.

See NOTES.md for design decisions.
