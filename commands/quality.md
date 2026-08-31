---
name: quality
description: Run complete code quality workflow - review code for issues and generate comprehensive tests
---

# Code Quality Workflow

Run a comprehensive code quality check on your project:

1. **Parallel Phase** (independent analysis):
   - Launch the code-reviewer agent to analyze the codebase for bugs, security issues, and performance problems
   - Launch the test-writer agent to generate comprehensive test coverage
   - Both run simultaneously to save time

2. **Sequential Phase** (after both complete):
   - Combine the reviewer's findings with the test writer's coverage report
   - Provide an actionable summary: what issues to fix first, what test gaps remain
   - Recommend next steps for improving code quality

**Usage:**
```
/quality <path-to-analyze>
```

This workflow is designed for teams that want fast, parallel analysis: get the review findings while tests are being written, then act on both together. The reviewer focuses on correctness and security; the test writer ensures coverage.
