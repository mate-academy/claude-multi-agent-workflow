Run a code-quality workflow for the Express API.

First, run the api-reviewer and inspect the existing tests independently. These two checks can happen in parallel because neither depends on the other.

After both checks finish, pass their findings to test-fixer. The fixer is dependent on the review results, so it runs only after the independent checks are complete.

Return a final summary containing the review findings, changes made by test-fixer, and the test results.
