---
description: Run code review and subsequent automated fixes as a multi-agent workflow.
---
Run a complete workflow on the course-api codebase:
1. [Parallel Step] Run the code-reviewer agent and tests concurrently to analyze code health and test status.
2. [Dependent Step] Once the review and tests complete, feed the findings into the code-writer agent to apply necessary fixes or adjustments.
