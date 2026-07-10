---
name: code-analyzer
description: Analyze code for quality metrics, complexity, and maintainability
triggers:
  - "analyze code"
  - "code metrics"
  - "complexity analysis"
  - "code health"
---

# Code Analyzer Skill

Provides detailed analysis of code files including complexity metrics, dependency analysis, and quality scores.

## What It Does

This skill analyzes code files to extract:

- **Cyclomatic Complexity** — Measure of decision points in the code
- **Function Metrics** — Number, size, and complexity per function
- **Dependency Analysis** — Internal and external dependencies
- **Code Coverage Readiness** — Identifying critical paths for testing
- **Quality Score** — Overall maintainability rating (0-100)
- **Anti-pattern Detection** — Common code smells and issues

## Usage

Invoke this skill when you need metrics-driven insights:

```
/code-analyzer path/to/file.js
```

## Output

Returns a structured report with:
- Complexity metrics and ratings
- Top 5 functions by complexity
- Risk assessment (high/medium/low priority items)
- Suggestions for refactoring
- Test coverage recommendations

## Integration

This skill pairs with the code-reviewer and test-generator agents to inform test strategy and improvement priorities. Use it before running `/review-and-test` for baseline metrics.
