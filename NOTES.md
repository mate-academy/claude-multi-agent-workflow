# NOTES — course-quality

## What the plugin does

`course-quality` is a code-quality plugin for the `course-api` Express project. Its
`/quality` command runs a two-phase workflow: a read-only **reviewer** and an ESLint
pass look for problems in parallel, then a **fixer** subagent turns the combined
findings into minimal code changes and re-runs the test and lint suites until they
pass. A bundled skill teaches the API's conventions, and a PostToolUse hook lints any
edited file for immediate feedback.

## Install

As a marketplace (this repo doubles as the marketplace):

```
/plugin marketplace add <this-repo>
/plugin install course-quality@course-quality-marketplace
```

Or load it locally from the repo root, without installing:

```
claude --plugin-dir .
```

Then, once, so tests and lint can run: `cd course-api && npm install`.
Run the workflow with `/quality` (optionally `/quality routes/users.js` to focus it).

## One scoping decision

**The `reviewer` gets only `Read, Grep, Glob`; the `fixer` gets `Read, Edit, Write,
Bash` plus `model: opus`.**

The reviewer's whole job is to *observe and report* — giving it edit or shell access
would let a "review" silently change code, which is exactly what I don't want during
the fact-finding phase. Restricting it to read-and-search tools makes it structurally
incapable of mutating the repo, and `model: sonnet` is plenty for spotting validation
and status-code issues in a handful of small files.

The fixer is the opposite: applying a *correct* fix and proving it with `npm test` /
`npm run lint` is the hard, higher-stakes part, so it gets write access, `Bash` to run
the suites, and the strongest model (`opus`). The tools follow the job, and the risky
capability lives in exactly one agent.

## One orchestration decision

**Step 1 (review + lint) runs in parallel; Step 2 (fix) is dependent on it.**

The review and the lint pass read the same code but never touch each other's output —
they're independent signals — so running them together halves the wait before we have
a full picture. The fix step is different: the fixer can't start until it knows *what*
to fix, so it must wait for both Step-1 results and consume their combined, de-duplicated
list. Parallel where work is independent, sequential where a step consumes an earlier
step's output.
