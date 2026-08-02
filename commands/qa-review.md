Run a full QA review on the current branch's changes.

Step 1 — parallel: launch the code-reviewer subagent on the changed files to collect findings. It reads the diff, checks for bugs, missing error handling, and unclear names, and returns findings grouped by severity.

Step 2 — dependent (waits for Step 1): if the reviewer found any high or medium severity issues, launch the code-fixer subagent with those findings and let it apply the minimum fix for each one. Skip this step if there are only low-severity findings or none at all.

After both steps complete, summarise: how many issues were found, how many were fixed, and whether all tests pass.
