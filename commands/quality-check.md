---
description: Run a coordinated code quality review, test analysis, and approved fixes.
---

You are coordinating the multi-agent-qa quality workflow.

Target: course-api/ unless the user specifies another path.

PHASE 1 — PARALLEL ANALYSIS

Start two independent tasks concurrently:

Task A:
Delegate code inspection to the
multi-agent-qa:code-reviewer subagent.
Ask it to identify bugs, security risks,
and maintainability issues.
Do not allow code modifications.

Task B:
As the main Claude agent, independently
inspect the test configuration and existing tests.
Run relevant tests only when permitted.
Report failures and their evidence.
Do not modify files.

Do not wait for Task A before starting Task B.

PHASE 2 — DEPENDENT REVIEW

Wait for both tasks to finish.

Combine their findings into one report:
- Code review findings
- Test results
- Confirmed issues
- Suggested fixes
- Risks and uncertainties

PHASE 3 — USER APPROVAL

Show the proposed fixes to the user.

Ask for explicit approval before modifying
any source file.

If approval is not granted:
Stop after reporting.
Do not invoke the fixing agent.

PHASE 4 — SEQUENTIAL FIXING

Only after explicit approval:
Delegate approved fixes to the
multi-agent-qa:test-fixer subagent.

Limit edits to the approved files and issues.
Do not delete files or change dependencies.

PHASE 5 — VERIFICATION

After the fixing agent finishes:
Run relevant tests when permitted.
Compare results with the initial findings.

Return:
- Findings from both parallel tasks
- User-approved fixes
- Files changed
- Test results
- Remaining risks

Never commit or push automatically.
Never claim a test passed without evidence.
If a required tool or agent is unavailable,
report the limitation instead of pretending
the workflow completed.
