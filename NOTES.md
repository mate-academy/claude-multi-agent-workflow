# qa-kit notes

## Install

Local: run `claude --plugin-dir .` from the repo root, then `/reload-plugins` after edits.

As a marketplace: `/plugin marketplace add lehmoja/claude-multi-agent-workflow`, then `/plugin install qa-kit@qa-kit`.

## Scoping decision

`image-reviewer` is limited to `Read, Glob` and runs on `haiku` — it only has to look at images and report what it sees, so it never needs write access or a larger model. `droneimage-handler` and `licenseplate-reviewer` both get `Write`/`Edit` because their job is to move files and write EXIF metadata; `licenseplate-reviewer` runs on `sonnet` instead of `haiku` because reading a license plate correctly and writing the right registration number to metadata needs more care than a cheap read-only scan.

## Orchestration decision

The `/review` command first runs `image-reviewer` over `images/` and `course-api/images/` in parallel — the two scans don't depend on each other, so there's no reason to make one wait on the other. Once both finish, `droneimage-handler` moves every car photo they found into `cars/`; this step is dependent because it needs the scan results before it knows what to move. Finally `licenseplate-reviewer` reads plates out of `cars/` and writes them to metadata — also dependent, since it can't read plates from images that haven't been moved there yet.
