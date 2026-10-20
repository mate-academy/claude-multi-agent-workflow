---
description: Run the full API quality workflow - parallel review and docs check, then tests for the gaps, then a summary
argument-hint: [path to the API project, default: current directory]
---

Run a quality pass on the Express API at `$ARGUMENTS`. If no path was given, use the current directory. Work inside that directory for every step.

**Step 1 - in parallel.** Launch both of these subagents at the same time, in a single message. Neither needs the other's output:
- the `route-reviewer` subagent: review every file in `routes/`.
- the `docs-checker` subagent: compare `docs/api.md` with the implemented routes.

**Step 2 - after step 1 finishes (depends on it).** Wait for both results. Take the "Untested cases" list from `route-reviewer` and pass it to the `test-writer` subagent so it adds exactly those tests. If the list is `- none`, skip this step and say so.

**Step 3 - after step 2 (depends on it).** Write the final report yourself from the three results. Do not review the code again.

```
# Quality pass: <project>
## Review findings (from route-reviewer)
## Docs drift (from docs-checker)
## Tests added (from test-writer) - <pass>/<total> passing
## Next fixes, most important first
1. ...
```

This workflow changes no route, store or docs files. Only `test-writer` may write, and only under `tests/`.
