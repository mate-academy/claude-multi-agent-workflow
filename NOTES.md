# Notes

## What the plugin does
Code Quality Kit provides a read-only reviewer, a test-writing worker, an API-quality skill, a workflow command, and a post-edit hook for Express projects.

## Scoping decision
The `code-reviewer` is deliberately limited to `Read`, `Grep`, and `Glob` because it only needs to inspect code and should not modify the repository. The `test-writer` gets `Read`, `Write`, `Edit`, and `Bash` because it needs to create tests and run them.

## Orchestration decision
Review and test planning are independent, so the workflow runs those workers in parallel. Final verification happens afterward because it should use the combined results.

## Installation
Load locally with `claude --plugin-dir .`. The marketplace catalog lists this plugin with the same name as `plugin.json`.

## Submission
Plugin structure and marketplace configuration were committed and tested for the course submission.
