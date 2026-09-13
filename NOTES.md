# NOTES

## Plugin: finish-it:audit

**What it does:**  
The `finish-it:audit` skill performs a two-phase workspace health check:
1. **Parallel execution:** Launches `@code-reviewer` and `@doc-formatter` subagents simultaneously to review code for security/vulnerabilities, code smells, performance bottlenecks, and to scan documentation for typos, broken links, and formatting issues.
2. **Synthesis & reporting:** After both subagents finish, aggregates their findings into a single summary report titled "Project Audit Summary", grouped into "Critical Code Actions Required" (from code reviewer) and "Documentation Updates Applied" (from doc formatter).

**How to install:**  
The skill is provided by the `finish-it` plugin. To install the plugin, run:
```
/plugin install finish-it
```
Once installed, the `finish-it:audit` skill (and other finish-it skills) become available for use via `/finish-it:audit` or through the Skill tool.

## Scoping Decision: Subagent Tools

In the audit workflow, the `@code-reviewer` subagent is assigned only the `Read`, `Grep`, and `Glob` tools. This scoping decision was made intentionally to ensure the subagent operates in a **read‑only** mode, focusing solely on analysis and reporting without the ability to modify files. By denying it `Edit`, `Write`, or other mutating tools, we guarantee that the code‑review step cannot introduce unintended changes, keeping the audit safe and predictable. The `@doc-formatter` subagent, conversely, receives `Read`, `Edit`, and `Write` tools because its purpose is to update documentation files.

## Parallel vs. Sequential Execution

The workflow runs the code review and documentation formatting steps **in parallel** because they are independent tasks that operate on different concerns (code safety vs. documentation quality) and do not depend on each other's output. Executing them concurrently reduces the total wall‑clock time of the audit, providing faster feedback to the user.

After the parallel phase, the workflow switches to **sequential** execution for the synthesis step. This step depends on the results of both subagents; it must wait for both to finish before it can aggregate and format the final report. Hence, the dependency necessitates a sequential execution after the parallel analysis completes.