Run a full code-quality pass on the current project using the code-quality plugin.

## Workflow

### Parallel step — gather information simultaneously

Run both of the following at the same time:

1. Invoke the `reviewer` subagent on the `course-api/routes/` directory to find code quality issues.
2. Invoke the `reviewer` subagent on the `course-api/tests/` directory to find test quality issues.

### Dependent step — apply fixes (waits for both reviews above)

Once both reviews are complete, collect all findings into a single list and pass them to the `fixer` subagent. The fixer applies every suggested change to the relevant files.

### Final step — report

Print a summary: how many issues were found, how many were fixed, and which files were modified.
