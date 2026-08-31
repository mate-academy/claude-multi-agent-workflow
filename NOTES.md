# Code Quality Plugin - Implementation Notes

## What the Plugin Does

The **code-quality** plugin is a multi-agent workflow that analyzes code for issues and generates comprehensive test coverage. It bundles two specialized subagents that work together through the `/quality` command to provide fast, thorough code quality analysis.

### Installation

```bash
# From a Claude Code session, add the marketplace
/plugin marketplace add https://github.com/yourusername/claude-multi-agent-workflow

# Install the plugin
/plugin install code-quality@<your-marketplace>
```

Then use it immediately:
```bash
/quality path/to/analyze
```

The plugin also provides:
- `/format-check` skill to report formatting issues
- Pre-commit hook that checks for trailing whitespace and missing final newlines

---

## Scoping Decision: Why Test Writer Gets Opus 5 and Opus (Write Tools)

**Decision:** The test-writer agent uses `claude-opus-5` model and has write-enabled tools (Read, Edit, Write, Bash), while code-reviewer uses Haiku and read-only tools.

**Why:** Test generation is the harder job:
- Generating good tests requires understanding not just *what* the code does, but *why*, and what could break
- Tests must be comprehensive (covering edge cases, error paths, integration points) but also maintainable
- The agent needs to create new files and potentially edit existing test suites, which requires fine-grained control
- Opus's stronger reasoning helps generate tests that catch real bugs, not just happy-path scenarios

Code review is comparatively read-only: analyze existing code, spot issues, report findings. Haiku is perfectly capable here because the task is pattern-matching and analysis (detecting known issue types) rather than creative generation.

This scoping means:
- **Review phase is fast and cheap**: Haiku is quicker and lower-cost
- **Test writing gets enough reasoning**: Opus ensures tests are actually good, not just syntactically valid
- **Clear separation of concerns**: Tools each agent gets match what it actually needs to do

---

## Orchestration Decision: Parallel Review + Tests, Then Sequential Summary

**Decision:** The workflow runs code-reviewer and test-writer *in parallel*, then combines their findings in a *sequential* summary phase.

**Why:**

1. **Parallel Phase (code-reviewer + test-writer simultaneously):**
   - These two tasks are **independent** — the reviewer doesn't need test results to analyze code, and the test writer doesn't need the review's findings to generate tests
   - Running them together saves ~50% time compared to serial execution
   - Both analyses are useful on their own; parallelism is a speed win with no correctness cost

2. **Sequential Phase (summary after both complete):**
   - The summary is **dependent** — it needs both the review findings ("these 3 bugs exist") and the test coverage report ("these scenarios have no tests yet")
   - Only after both analyses are done can we say something like "Fix the SQL injection in users.js, then write tests for the error path in auth.middleware.js"
   - Combining findings into an actionable report requires the full picture

This mirrors a real team workflow: a code reviewer and test engineer work in parallel, then sync up to prioritize what to fix first.

---

## Technical Notes

- **Plugin root paths:** The hook script uses `${CLAUDE_PLUGIN_ROOT}` to stay portable — it resolves to the plugin's installation directory regardless of where Claude Code runs
- **Agent tools:** Both agents have access to file-system tools (Read, Grep, Glob) because they analyze existing code; test-writer adds write tools because it creates test files
- **Workflow trigger:** The `/quality` command is the user-facing entry point; internally it dispatches to the subagents defined in `agents/`
- **Skill vs hook:** The `format-check` skill is on-demand (user runs it), while the pre-commit hook runs automatically before saves — different needs, both fit the plugin's theme

---

## Testing the Plugin Locally

Before publishing, test against the course-api:

```bash
# 1. Set up the test API
cd course-api
npm install

# 2. In another terminal, load the plugin
claude --plugin-dir .

# 3. Test the workflow on course-api/routes
/quality course-api/routes

# 4. Verify subagents fire with correct namespacing
# Expected: code-quality:code-reviewer and code-quality:test-writer appear in the workflow
```

The validation check (.github/workflows/validate.yml) confirms:
- plugin.json is valid with name and version
- At least 2 agents in agents/ with description, body, tools, and model
- workflow command in commands/
- skill and hook present with no hardcoded paths
- marketplace.json matches plugin.json name
- README.md and NOTES.md exist

---

## Files Included

```
.claude-plugin/
  ├── plugin.json          # Manifest: name, version
  └── marketplace.json     # Marketplace listing

agents/
  ├── code-reviewer.md     # Read-only review agent
  └── test-writer.md       # Write-enabled test generation agent

commands/
  └── quality.md           # Workflow command orchestrating both agents

skills/format-check/
  └── SKILL.md             # Format checker skill

hooks/
  ├── hooks.json           # Hook configuration
  └── check-format.sh      # Pre-commit format check script

README_PLUGIN.md            # Plugin user guide
```
