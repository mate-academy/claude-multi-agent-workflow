# qa-kit notes

## Install

Local: run `claude --plugin-dir .` from the repo root, then `/reload-plugins` after edits.

As a marketplace: `/plugin marketplace add lehmoja/claude-multi-agent-workflow`, then `/plugin install qa-kit@qa-kit`.

## Scoping decision

`image-reviewer` is limited to `Read, Glob` and runs on `haiku` — it only has to look at images and report what it sees, so it never needs write access or a larger model. `droneimage-handler` and `licenseplate-reviewer` both get `Write`/`Edit` because their job is to move files and write EXIF metadata; `licenseplate-reviewer` runs on `sonnet` instead of `haiku` because reading a license plate correctly and writing the right registration number to metadata needs more care than a cheap read-only scan.

## Orchestration decision

The `/review` command runs the Explore agent first to gather the files changed on the current branch, then hands that file list to the code-reviewer subagent. This is a dependent (sequential) step by necessity — code-reviewer can't review files it doesn't know about yet, so it has to wait on Explore's output before it can start.
