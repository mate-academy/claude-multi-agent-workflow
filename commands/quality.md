Run a coordinated quality workflow for the `course-api` project.

Workflow orchestration:
1. In parallel, run `api-reviewer` on routes/data validation and run a second `api-reviewer` pass focused on tests and error responses.
2. Wait for both review outputs and merge them into one deduplicated findings list with clear priorities.
3. Run `api-fixer` with that merged findings list to implement focused code/test updates.
4. Finish by producing a final report: changes made, tests touched, command suggestions (`npm test`, `npm run lint`), and any unresolved risks.

Output format:
- `Review Findings` (merged)
- `Implemented Fixes`
- `Verification Steps`
- `Residual Risks`
