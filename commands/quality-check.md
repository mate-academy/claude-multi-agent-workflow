Run the `code-reviewer` and `test-gap-finder` subagents in parallel against the current changes under `course-api/`. Keep their work read-only and wait for both reports.

After both agents finish, combine and deduplicate their findings. If either report identifies a concrete missing test, pass the combined prioritized list to the `test-writer` subagent. The writer must add only focused tests and run `npm test --prefix course-api` after its edits. If no test gaps remain, skip editing and run the test command once from the main session.

Return one final report with: review findings by severity, test gaps considered, files changed by the writer, and the final test result. The two inspections must run concurrently; the writer and verification step must wait for both inspection results.
