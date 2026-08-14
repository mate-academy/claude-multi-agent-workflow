---
name: review
description: Multi-agent code review and quality workflow
---

Run a comprehensive code quality workflow:

**Parallel step:** Launch both the `code-reviewer` and `code-fixer` subagents simultaneously to analyze the codebase. The Reviewer will identify issues and generate a quality report, while the Fixer prepares potential improvements.

**Dependent step:** Once both agents complete their analysis, synthesize the results:
- Review the Reviewer's findings for critical and warning-level issues
- For each critical issue identified, use the Fixer's improvements as reference points
- Output a consolidated report with recommended fixes ranked by impact

This parallel-then-sequential approach means analysis happens fast, and fixes are prioritized based on both agents' perspectives.

Return the final quality assessment and list of recommended changes, with explanations for why certain fixes take priority.
