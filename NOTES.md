# Notes

## What the plugin does

Code Quality Workflow reviews the Express API in `course-api/`, identifies potential quality and correctness issues, and uses a second agent to apply focused fixes and verify them with tests.

## Installation

From a clean checkout, load the plugin from the repository root with:

    claude --plugin-dir .

For marketplace installation, add this repository as a marketplace and install the plugin by its name.

## Scoping decision

The `api-reviewer` agent is intentionally limited to `Read`, `Grep`, and `Glob`. It is a read-only reviewer, so it does not need editing or shell tools. This prevents the review phase from changing the code it is inspecting.

The `test-fixer` agent has `Edit`, `Write`, and `Bash` because its job is to make focused fixes and run tests after those changes.

## Orchestration decision

The API review and test inspection are independent, so they can run in parallel and reduce unnecessary waiting.

The fixing step runs after both independent checks because it needs their findings before deciding what to change. This makes the fixing step dependent and keeps the workflow deterministic.
