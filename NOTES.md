```markdown
# Implementation Notes

## Installation & Description
The `quality-workflow` plugin automates code analysis and test execution. Install via `/plugin marketplace add .` and `/plugin install quality-workflow`.

## Scoping Decision
The `reviewer` agent is strictly scoped to read-only tools (`ReadFile`, `SearchFiles`, `ListFiles`) to prevent accidental modifications during the evaluation phase, whereas the `tester` agent gets write/edit/execute permissions (`WriteFile`, `EditFile`, `ExecuteCommand`) to create tests and execute `npm test`.

## Orchestration Decision
The workflow runs initial codebase analysis in parallel steps to save time, followed by a dependent step where findings from the `reviewer` agent are passed to the `tester` agent to generate targeted test coverage.
