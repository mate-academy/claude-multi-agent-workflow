---
description: Run the multi-agent code-reviewer/code-fixer workflow against the course-api codebase.
---

Run a multi-agent code quality workflow on the course-api codebase using the following orchestration steps:

1. **Parallel Analysis Phase:** 
   Invoke the `code-reviewer` subagent to perform a strict read-only inspection of the repository files, checking for bugs, anti-patterns, and logic errors. Simultaneously, run any independent code linting checks or search the codebase for issues.
2. **Sequential Remediation Phase:** 
   Wait for the findings from the `code-reviewer` agent to complete. Once finished, pass those findings to the `code-fixer` subagent to cleanly implement the required file edits and bug fixes.
3. **Verification Summary:** 
   Summarize all modifications made and confirm the codebase is fully ready.
