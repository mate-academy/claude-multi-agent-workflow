---
name: review-and-test
description: Run the code quality workflow — analyze code for issues and generate comprehensive tests
---

# Code Quality & Testing Workflow

Run a complete code analysis and test generation workflow on a specified file.

## Usage

```
/review-and-test path/to/file.js
```

## Workflow

**Step 1: Parallel Analysis** (both agents run independently)
- Use the **code-reviewer** agent to analyze the file for bugs, anti-patterns, and quality issues
- Use the **test-generator** agent to generate comprehensive test cases

**Step 2: Synthesis** (dependent on Step 1)
- Once both agents complete, synthesize their findings into a unified report
- Highlight which tests should prioritize the identified issues
- Suggest which recommendations are critical for test coverage

## Output

The workflow produces:
1. A code review with identified issues and recommendations
2. A test file (e.g., `file.test.js`) with comprehensive test cases
3. A synthesis report connecting review findings to test strategy

This ensures your code improvements are validated by appropriate test coverage.
