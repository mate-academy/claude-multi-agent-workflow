# Notes

## What the plugin does

`api-quality` runs one command over an Express API and comes back with a single
report. Two read-only reviewers read different halves of the codebase at the
same time; their findings are merged and deduplicated; a third agent turns the
testable ones into real tests and runs the suite. Separately, a `PostToolUse`
hook lints every JavaScript file that gets written or edited during the session
and feeds the lint output straight back into the conversation.

It ships against `course-api/` in this repository, so there is real code to try
it on rather than a toy example.

## Install

As a user, from a fresh session:

```
/plugin marketplace add makar111111/claude-multi-agent-workflow
/plugin install api-quality@api-quality-marketplace
```

As a developer, from a clone of this repository:

```
claude --plugin-dir .
```

Then run `/api-quality:quality-sweep` (it defaults to `course-api`, or pass a
path). `/reload-plugins` picks up edits without restarting the session.

The hook needs ESLint installed in whatever project it lints — run
`cd course-api && npm install` once before trying it here. Without ESLint the
hook exits quietly rather than complaining.

## A scoping decision — why `api-reviewer` has no `Bash`

`api-reviewer` is limited to `Read, Grep, Glob`. The obvious argument for adding
`Bash` is that the reviewer could then run the linter and the test suite itself,
and report on real output instead of on reading alone. I left it out anyway.

The reason is role integrity, not safety theatre. An agent that *can* edit will
eventually edit — asked to review a broken handler, a capable model tends to
open the file and fix it, because fixing feels more helpful than reporting. Then
the finding never reaches the merge step, the test that should have pinned the
bug never gets written, and the report says everything is fine. Removing the
tools removes the temptation entirely: the reviewer's only possible output is
its verdict.

The model choice follows from the same scoping. Reviewing against a written
checklist is an attention task, so `api-reviewer` runs on `sonnet`. Writing a
test that actually fails when the bug is present takes reasoning about the
contract, so `test-author` runs on `opus`. Because the reviewer is launched
twice per sweep and the author only once, the cheaper model is also the one that
runs more often.

`test-author` is scoped differently but just as deliberately: it holds `Write`
and `Edit`, but its instructions confine it to the test folder and forbid
touching production code. If it could edit a route, the cheapest way to make its
own test pass would be to change the code under test — which would erase exactly
the defect the reviewer found. Its brief says so explicitly: a test that fails
because the production code is genuinely broken is a correct result to report,
not something to paper over.

## An orchestration decision — what runs together and what waits

Step 1 launches both reviewers **in a single message**, so they run
concurrently. This is safe precisely because neither one reads the other's
output: reviewer A takes `routes/` and `server.js`, reviewer B takes
`db/store.js`, `docs/`, and `tests/`. Nothing about B's conclusions changes A's,
so ordering them would only add wall-clock time. Splitting by path also keeps
each reviewer's context small, which is its own quality win — a reviewer holding
four files gives sharper line numbers than one holding twelve.

Steps 2 and 3 are strictly sequential, and for a concrete reason rather than
caution. Step 2's input *is* the pair of reports, so it cannot start before both
have returned. Step 3 hands `test-author` the merged, deduplicated, severity-
ranked list, so it cannot start before step 2 finishes. Running the test author
alongside the reviewers would mean writing tests for findings that do not exist
yet, and duplicate findings — the same problem seen by both reviewers — would
turn into two near-identical tests.

The merge step also has an explicit rule for disagreement: when the two reports
contradict each other about the same code, both are kept and the conflict is
flagged rather than silently resolved. Parallel agents disagree eventually, and
a workflow that quietly picks a winner hides that from the person reading the
report.

## What was verified, and what was not

Verified directly: the plugin loads under `claude --plugin-dir .` with every
component namespaced as `api-quality:`; the frontmatter survives a real YAML
parser (no `": "` inside unquoted values, no CRLF, no indented lines); every
tool and model name is real; the hook script behaves correctly on three
payloads — a clean file, a non-JavaScript file, and a file with a deliberate
lint error, where it returns exit code 2 with the ESLint findings.

Not verified automatically: that the harness itself invokes the hook after a
write. Driving a nested non-interactive session into writing a deliberately
broken file ran into permission refusals, and working around them was not worth
it. That one link is confirmed by hand in an interactive session.

## Two things that bit during the build

`require.resolve('eslint/bin/eslint.js')` throws `ERR_PACKAGE_PATH_NOT_EXPORTED`
— ESLint's `exports` map does not expose its own CLI. The fix is to resolve
`eslint/package.json`, which is exported, and read the path out of its `bin`
field.

That failure was swallowed by a `catch { quiet(); }`, so the hook exited 0 and
looked healthy while doing nothing at all. It was only caught because the test
checked that the hook *complains about a broken file*, not merely that it stays
silent on a clean one. Testing the positive case alone would have shipped a dead
hook.
