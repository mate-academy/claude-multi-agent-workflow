`ship-kit` is a Claude Code plugin (marketplace: `MarQaSpace`, from this repo) that bundles:
**`code-reviewer` agent**: reads the changed code (excluding tests) and reports bugs/unclear names, grouped by severity.
**`test-scanner` agent**: scans changed test files and flags any test missing a documentation block above it.
**`/summarize-changes` command**: runs both agents, then produces a short, PR-description-ready summary of every file touched on the branch.
**`pr-description` skill**: writes PR descriptions in the house format (What changed / Why / How to test).
**the hook runs `npm run lint` in `course-api` whenever a file is edited or written.

Install it with commands `/plugin marketplace add https://github.com/laszlozsidek/claude-multi-agent-workflow` and after that `/plugin install ship-kit@MarQaSpace`

I ordered the haiku model to the test-scanner, while it is a low-risk repeatable and easy work: check and add is missing. The code-reviewer can use the sonnet model, as it requires more skills.   

`code-reviewer` and `test-scanner` run in parallel because they're independent: one inspects non-test source for bugs, the other inspects test files for missing docs. Neither needs the other's output, so running them concurrently cuts wall-clock time roughly in half compared to running one after the other.
The final summarize step runs sequentially, after both finish, because it depends on both agents' results — it has to wait for both reports (and note failures/timeouts explicitly) before it can assemble the combined, PR-ready summary.