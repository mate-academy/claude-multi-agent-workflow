# NOTES

## What it does and how to install

`api-quality` is a code-quality plugin for Express APIs. Its `/api-quality:quality-check` command reviews the code and finds test gaps in parallel, then writes tests for what was found. A hook lints every `.js` file Claude edits.

Install:

```
/plugin marketplace add douglax/claude-multi-agent-workflow
/plugin install api-quality@api-quality-marketplace
```

Then run `/api-quality:quality-check course-api`. For local development use `claude --plugin-dir .` and `/reload-plugins` after edits.

## Scoping decision

`api-reviewer` and `coverage-analyst` get only `Read, Grep, Glob`. Their jobs are to report, so they have no reason to be able to change anything, and a reviewer that can edit tends to "fix" code silently instead of reporting it. Only `test-writer` gets `Write`, `Edit` and `Bash`, because it must create test files and run `npm test`; its prompt further restricts it to the tests directory. Models are matched to difficulty: `coverage-analyst` does mechanical route-vs-test comparison, so it runs on `haiku`; the reviewer needs judgment about conventions and bugs, and the test writer must produce correct code, so both use `sonnet`.

## Orchestration decision

The reviewer and the coverage analyst run in parallel because neither needs the other's output: both only read the same code, so running them together halves the wait and cannot cause conflicts. The test writer runs afterwards, in sequence, because it depends on their results: it needs the merged list of findings and gaps to know what to test. Starting it earlier would mean writing tests blind, and it is the only step that writes files, so keeping it last also avoids anything being edited while the readers are still reading.
