---
name: audit
description: Run a full project audit by executing code safety and documentation formatting checks in parallel, followed by a consolidated summary.
---

Perform a full workspace health check following this two-phase workflow:

### Phase 1: Parallel Execution (Independent Step)
Launch the following subagents **simultaneously in parallel** to evaluate the codebase:
1. Run `@code-reviewer` to inspect the codebase for security vulnerabilities, code smells, and performance bottlenecks.
2. Run `@doc-formatter` to scan markdown files and code comments for typos, broken links, and formatting inconsistencies.

Wait until **both** subagents complete their analysis before proceeding.

### Phase 2: Synthesis & Reporting (Dependent Sequential Step)
Once both agents finish and return their respective results:
1. Aggregate the findings from `@code-reviewer` and `@doc-formatter`.
2. Generate a single summary report titled **"Project Audit Summary"**.
3. Group the output into two sections:
   - **Critical Code Actions Required** (from `@code-reviewer`)
   - **Documentation Updates Applied** (from `@doc-formatter`)
4. Output the final consolidated report to the user.