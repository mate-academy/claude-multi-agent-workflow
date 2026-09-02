# Course Quality plugin notes

## Purpose and installation

`course-quality` packages a repeatable pre-PR workflow for the included Express API. It reviews changed code, searches for missing tests, delegates focused test creation when necessary, and verifies the suite. Load it locally with `claude --plugin-dir .`, or add this repository as a marketplace and install `course-quality@course-tools`.

## Scoping decision

The `code-reviewer` and `test-gap-finder` agents receive only `Read`, `Grep`, and `Glob`, because their jobs are analysis and they must not change the code they assess. The gap finder uses `haiku` for a fast, bounded comparison, while the broader reviewer uses `sonnet`. Only `test-writer` receives `Edit`, `Write`, and `Bash`, because it must add tests and verify them; its instructions restrict edits to focused test files.

## Orchestration decision

`/course-quality:quality-check` launches the reviewer and gap finder in parallel because neither depends on the other's output. The test writer waits until both reports are complete so it can work from a single deduplicated and prioritized list. Verification runs after edits, since it depends on the final file state. This keeps independent inspection fast while preserving the required order for changes and testing.

## Skill and hook

The `error-response` skill captures the API's repeated status-code and JSON error-shape conventions. The `PostToolUse` hook watches `Write|Edit` and runs the course API lint command after a change, giving immediate feedback without blocking the edit before it happens.

## Validation

The manifest and marketplace names match, component folders are at the plugin root, and no secrets or machine-specific absolute paths are included. The repository validator checks the full package structure on every push.
