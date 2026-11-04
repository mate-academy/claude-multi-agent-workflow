# code-quality plugin

A Claude Code plugin (and its own marketplace) that runs a multi-agent code-quality workflow.

## Components
- **Agents:** `code-reviewer` (read-only, sonnet) and `test-writer` (writes tests, sonnet)
- **Command:** `/code-quality:quality [path]` — review + coverage in parallel, then regression tests, then test/lint verification
- **Skill:** `api-conventions` — routing, validation, error and test conventions
- **Hook:** `PostToolUse` on Edit/Write runs ESLint via `scripts/lint-on-edit.sh`

## Install
```
/plugin marketplace add prokhorenko1/multi-agent-workflow
/plugin install code-quality@code-quality-marketplace
```
Or locally: `claude --plugin-dir .` (run `cd course-api && npm install` first).

## Usage
`/code-quality:quality course-api/routes`

See `NOTES.md` for design decisions. The sample Express API lives in `course-api/`.

## Course project
Built for the "Ship your workflow as a plugin" project; validated by `.github/scripts/validate-plugin.js`.
