---
name: qa-guidelines
description: Apply consistent code quality, security, and testing guidelines when reviewing or improving the course API.
---

# QA Guidelines

Use these guidelines when reviewing code, analyzing tests,
or proposing fixes for the course-api Express application.

## Code Quality
- Identify correctness bugs and unclear logic.
- Prefer small, focused changes.
- Preserve existing behavior unless a change is approved.
- Explain findings with relevant file paths.

## Security
- Check input validation and error handling.
- Look for accidental exposure of sensitive data.
- Avoid logging secrets or personal information.
- Never change authentication or permissions without approval.

## Testing
- Identify missing tests and weak assertions.
- Distinguish confirmed failures from suspected problems.
- Do not claim a test passed unless it was executed.
- Report commands, results, and unresolved risks.

## Workflow Safety
- Keep read-only analysis separate from code editing.
- Require explicit user approval before source changes.
- Do not delete files or change dependencies automatically.
- Never commit or push without explicit permission.

## Expected Output
Return a concise QA report with:
1. Findings and severity.
2. Supporting evidence.
3. Recommended fixes.
4. Test status.
5. Remaining risks.
