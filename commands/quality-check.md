Run a full quality check on the Express API in course-api/ and apply any fixes found.

## Workflow

### Step 1 — Review and lint in parallel

Run both of these at the same time (they are independent reads with no shared state):

- Invoke the `code-reviewer` agent on the route files (`course-api/routes/`). It will return a list of findings grouped by severity.
- Run `cd course-api && npm run lint -- --format compact 2>&1` to get the ESLint output.

### Step 2 — Fix (depends on Step 1)

Once both results from Step 1 are available, invoke the `fixer` agent. Pass it the combined findings from the code review and the lint output. It will apply targeted edits and run `npm test` to confirm nothing broke.

### Step 3 — Summarize (depends on Step 2)

After the fixer finishes, summarize the changes on the current branch. List each file that was touched, and give a one-line description of what changed in it. Keep the whole thing short enough to paste into a pull-request description.
