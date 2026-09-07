# NOTES

## What this plugin does

`code-quality` bundles a review-and-build workflow for shipping a feature test-first:

- **`code-diff-reviewer`** (agent) — read-only reviewer that checks a diff for security and correctness issues.
- **`tdd-feature-builder`** (agent) — scans the codebase's existing conventions, writes failing tests for a new feature, then implements it until the tests pass.
- **`/ship <feature description>`** (command) — orchestrates both agents into one workflow.
- **`quality-gate`** (skill) — runs the project's lint and test scripts on demand and gives a ready/not-ready verdict before commit.
- **lint-on-edit hook** — after every `Edit`/`Write`, lints the changed file and feeds any errors straight back so they get fixed immediately, without waiting for a manual check.

## Install

There are two different ways to run this plugin, for two different purposes: `/plugin marketplace add` + `/plugin install` is the real marketplace install flow a user runs from a fresh Claude session, while `claude --plugin-dir .` is a local-development shortcut for iterating on the plugin itself — use the one that matches what you're doing.

From a fresh session, in the repo you want to use it in:

```
/plugin marketplace add <path-or-url-to-this-repo>
/plugin install code-quality@code-quality-marketplace
```

Locally, from this repo's root, that's the same as:

```
claude plugin marketplace add .
claude plugin install code-quality@code-quality-marketplace
```

To pick up edits while developing the plugin itself (Task 5's local test loop), run `claude --plugin-dir .` from the repo root instead of installing, and use `/reload-plugins` after changes.

## Scoping decision: why the two agents have different tools and models

`code-diff-reviewer` gets `Read, Grep, Glob` and the **Sonnet** model. It's deliberately read-only — a reviewer that can edit the thing it's reviewing isn't a trustworthy check, so it has no `Edit`/`Write` access at all. Finding a security or correctness issue in a diff also doesn't need the heaviest available reasoning, so Sonnet is enough and keeps repeated review calls cheap enough to run inside a workflow.

`tdd-feature-builder` gets `Read, Grep, Glob, Edit, Write, Bash` and the **Opus** model. It has to do the opposite job — actually write test files and implementation code — so it needs edit access. Implementing a feature correctly from a natural-language description (and inferring the right conventions from the existing codebase rather than guessing) is a harder reasoning task than spotting a bug in an existing diff, which is why it gets the stronger model.

## Orchestration decision: why `/ship` runs Step 1 in parallel and Steps 2–3 in sequence

Step 1 dispatches `code-diff-reviewer` (checking for pre-existing issues) and `tdd-feature-builder` (scanning for conventions) at the same time, because neither one depends on the other's output — they're reading two different things (the current diff vs. the codebase's conventions) and can't interfere with each other, so running them concurrently is pure speed with no correctness cost.

Steps 2 and 3 have to be sequential because each one's input doesn't exist until the previous step produces it: `tdd-feature-builder` in Step 2 needs the convention scan from Step 1 before it can write tests in the right style, and `code-diff-reviewer` in Step 3 needs the diff Step 2 produces — there's nothing to review until the feature has actually been built. Parallelizing either of those would mean reviewing an empty diff or building against conventions that haven't been discovered yet.
