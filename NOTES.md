# Toolbelt notes

Toolbelt is an Express API quality-gate plugin for the bundled `course-api/` project. Its `/toolbelt:quality-gate` command gathers review and test evidence, makes only confirmed repairs, and verifies the result with the API test suite and linter. To use it locally, run `claude --plugin-dir .` at this repository root. After the repository is pushed, install it with `/plugin marketplace add tacio/claude-multi-agent-workflow` followed by `/plugin install toolbelt@toolbelt-marketplace`.

The `api-reviewer` is deliberately limited to `Read`, `Grep`, and `Glob`. A review should never change the code it is judging, and the restricted tool list makes that guarantee explicit. It uses Sonnet because applying route conventions, finding edge cases, and identifying coverage gaps requires more judgement than a simple file lookup. The `api-repairer` is the only worker with edit tools, and its instructions restrict its changes to `course-api/`.

The workflow starts `api-reviewer` and `api-test-investigator` in parallel because source inspection and running checks do not depend on one another. The repair step is sequential because it needs both reports to avoid speculative changes and to preserve a clear evidence trail. The post-edit hook then runs the API linter automatically, providing immediate feedback after Claude changes files.
