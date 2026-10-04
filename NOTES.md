# Notes: code-quality-workflow

## What the plugin does

`code-quality-workflow` is a multi-agent code quality plugin for Claude Code. It:

- runs two independent code reviews in parallel, one on correctness and one on maintainability;
- consolidates and deduplicates their findings;
- hands the confirmed findings to a scoped fixer agent that applies them;
- ships reusable code-quality guidance as a skill;
- reminds you to validate after edits through a hook.

## Load it locally

From the plugin root:

```
claude --plugin-dir .
```

## Install through the marketplace

```
/plugin marketplace add <owner>/<repository>
/plugin install code-quality-workflow@code-quality-marketplace
```

## Main workflow command

```
/code-quality-workflow:quality <target>
```

`<target>` is the file, folder, or module to review and fix.

## Scoping decision: least-privilege tools

| Agent           | Tools                            | Role                                  |
| --------------- | -------------------------------- | ------------------------------------- |
| `code-reviewer` | Read, Grep, Glob                 | Analysis only (read-only)             |
| `code-fixer`    | Read, Edit, Write, Grep, Glob    | Implements confirmed findings         |

- `code-reviewer` is read-only. It has only Read, Grep, and Glob. It cannot Edit or Write because its job is analysis only.
- `code-fixer` has Read, Edit, Write, Grep, and Glob because it implements confirmed findings.
- `code-fixer` intentionally has no Bash access. Tests and lint are run separately after fixing.

**Why this is least privilege:** each agent gets only the tools its job needs, and nothing more.

- A reviewer that cannot write can never change code by accident, so reviewing is always safe to run.
- The fixer can change files but cannot execute commands. A mistaken or over-eager fix cannot run arbitrary shell commands, install packages, or touch anything outside file edits.
- Separating fixing from verification keeps a human-visible step between "changes applied" and "changes trusted". You run tests and lint on your own terms.

## Orchestration decision: parallel review, then fix

Two `code-reviewer` tasks run in parallel because their work is independent. Neither needs the other's output.

- **Reviewer A** focuses on correctness, validation, error handling, edge cases, and security basics.
- **Reviewer B** focuses on maintainability, duplication, readability, complexity, and project conventions.

Both results are consolidated and deduplicated into one list of findings. `code-fixer` starts only after consolidation because it depends on both reviewer outputs. Starting earlier would mean fixing from incomplete findings or applying overlapping fixes twice.

```
Reviewer A ──┐
             ├── Consolidate findings ──> Code Fixer
Reviewer B ──┘
```
