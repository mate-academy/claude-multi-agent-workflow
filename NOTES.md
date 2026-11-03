# Multi-Agent QA Plugin — Project Notes

## Installation

The plugin is named `multi-agent-qa` and is listed
in the `ybushnag-agent-tools` marketplace.

For local testing, open the repository root and
start Claude Code with:

`claude --plugin-dir .`

After the plugin is loaded, use the
`/multi-agent-qa:quality-check` command.

## Agent Scoping

The `code-reviewer` agent uses Read, Grep, and Glob.
It reviews source code without editing files.

The `test-fixer` agent uses Read, Grep, Glob, and Edit.
It may change only approved files and issues.

This separation reduces the risk of accidental
modifications during code review.

## Workflow Orchestration

The workflow begins with parallel analysis:
the code-reviewer inspects source code while
the main Claude agent analyzes tests.

After both tasks finish, their findings are
combined into one report.

The workflow then pauses for explicit user approval.
Only approved fixes are delegated to test-fixer.

Finally, the main agent verifies the results
and reports any remaining risks.

## Skill and Hook

The qa-guidelines skill provides consistent
code quality and testing instructions.

The PostToolUse hook runs qa-check.js after
Edit or Write operations.

The script checks supported text files for
UTF-8 BOM and CRLF line endings without
modifying files.

## Safety

No automatic commits, pushes, or file deletions
are allowed.

Test success must be supported by actual results.

## Validation

Run the repository validator:

`node .github/scripts/validate-plugin.js`

Local plugin behavior and GitHub Actions
must also be verified before submission.
