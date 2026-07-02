Run this workflow when you need a review pass and a safe follow-up fix for the course API in course-api/.

1. Parallel step: call @code-quality-flow/quality-reviewer to inspect routes, tests, and docs while the same workflow also asks @code-quality-flow/quality-fixer to prepare a repair plan from the current state.
2. Dependent step: wait for the review results, then ask @code-quality-flow/quality-fixer to implement the highest-priority fix and add or update tests if needed.
3. Final step: summarize the changed files, the validation outcome, and any follow-up work that should be addressed next.
