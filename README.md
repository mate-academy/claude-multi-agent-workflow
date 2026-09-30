# code-quality plugin

A Claude Code plugin that runs a multi-agent code-quality workflow.

| Piece | Name |
|---|---|
| Agent (read-only) | `code-reviewer` |
| Agent (writes tests) | `test-writer` |
| Command | `/code-quality:quality-check` |
| Skill | `api-conventions` |
| Hook | PostToolUse lint on `.js` edits |

## Install
```
/plugin marketplace add Sango-dev/claude-multi-agent-workflow
/plugin install code-quality@code-quality-marketplace
```

## Local testing
```
cd course-api && npm install && cd ..
claude --plugin-dir .
/code-quality:quality-check course-api/
```

See [NOTES.md](NOTES.md) for design decisions.
