---
name: audit
description: Runs a full code quality workflow including reviews and test generation.
---
Let's run a full code quality workflow for the recent changes. Follow these steps carefully:

1. **Parallel Step (Independent Work)**:
   Perform the following two tasks at the same time:
   - Call the `code-reviewer` subagent to analyze the recent changes for bugs, errors, and naming clarity.
   - Analyze the complexity of the modified functions and check if any cleanups are needed.

2. **Dependent Step (Sequential Work)**:
   Wait for the results from the previous step. Once the code review and analysis are complete, pass those findings to the `test-generator` subagent. Use its tools to write or update unit tests that cover the modified areas and address any bugs found during the review.

Return a compiled summary of the review findings and the list of generated or updated test files.
