# Implementation Notes

## Plugin Overview and Installation

The API Quality Workflow plugin provides two specialized agents:
- `api-reviewer` reviews Express API code without modifying files.
- `api-tester` improves automated test coverage and runs the test suite.

The `quality-check` command runs both agents in parallel and combines their results into one report.

To install the plugin:

1. Add the marketplace: `/plugin marketplace add muron1011-code/claude-multi-agent-workflow`
2. Install the plugin: `/plugin install api-quality-workflow@api-quality-marketplace`

## Agent Scoping Decisions

The `api-reviewer` agent has only `Read`, `Grep`, and `Glob` tools because its responsibility is read-only code analysis. The `api-tester` agent has additional `Write`, `Edit`, and `Bash` tools because it needs to create tests and execute them.

Both agents use the `sonnet` model because API review and test development require code analysis and reasoning.

## Workflow Orchestration

The `api-reviewer` and `api-tester` agents run in parallel because reviewing implementation and examining test coverage are independent tasks.

The final report runs after both agents finish because it needs their findings and test results to identify uncovered risks and provide an overall quality assessment.

## Hook

The `PostToolUse` hook runs ESLint after Claude Code uses `Write` or `Edit`, helping detect code quality issues early.
