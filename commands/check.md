Run a full code-quality check on the current changes.

## Workflow

**Step 1 — parallel**
Dispatch both agents at the same time, since their work is independent:
- Run the `reviewer` agent: read the changed files and return a grouped list of bugs, missing error handling, and unclear names.
- Run the `test-writer` agent: read the changed files and the existing test suite, then return the updated test file content that covers the new behaviour.

**Step 2 — dependent (runs after both Step 1 agents finish)**
Collect the outputs from both agents and produce a single prioritised action list:
1. List every **high** finding from the reviewer first — these block merge.
2. List every **medium** finding next.
3. List test changes the test-writer produced, summarised as one line per new or updated test case.
4. List **low** findings last.

If the reviewer returned nothing in a bucket, skip it. If the test-writer found no gaps, say "Tests already cover these changes."

Keep the final summary short enough to read in one minute.

---
