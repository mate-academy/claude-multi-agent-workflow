                                                                                                 ---
description: Run the full code quality workflow with parallel review and sequential writing.
---

Run the workflow using subagents:

1. Executed in parallel:
   - Call the `reviewer` agent to analyze the code for security issues and quality bugs.
   - Search for existing unit test files using `Glob`.

2. Executed sequentially after parallel steps complete:
   - Call the `writer` agent to apply fixes or generate new test coverage based on the reviewer's output.