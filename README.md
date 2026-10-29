# code-quality-kit

A Claude Code plugin (and its own marketplace) that runs a multi-agent code quality workflow against an Express API.

- **Agents:** `code-reviewer` (read-only), `test-writer` (writes tests)
- **Command:** `/code-quality-kit:quality-check [path]` — parallel review + gap analysis, then test writing
- **Skill:** `api-conventions`
- **Hook:** lints `.js` files in `course-api/` after each edit

## Install

```
/plugin marketplace add Hot00Tea/claude-multi-agent-workflow
/plugin install code-quality-kit@code-quality-marketplace
```

Local testing: `cd course-api && npm install`, then `claude --plugin-dir .` from the repo root.

See `NOTES.md` for design decisions.
