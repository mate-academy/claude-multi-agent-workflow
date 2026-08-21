# qa-kit notes

## Install

Local: run `claude --plugin-dir .` from the repo root, then `/reload-plugins` after edits.

As a marketplace: `/plugin marketplace add lehmoja/claude-multi-agent-workflow`, then `/plugin install qa-kit@qa-kit`.

## Scoping decision

`image-reviewer` is limited to `Read, Glob` and runs on `haiku` — it only has to look at images and report what it sees, so it never needs write access or a larger model. `droneimage-handler` gets `Bash` instead of `Write`, because moving a binary JPG into `cars/` is a real filesystem move, not a text write — an earlier version used `Write` and it silently produced a 0-byte placeholder instead of the actual image, which local testing with `--plugin-dir .` caught. `licenseplate-reviewer` keeps `Edit`/`Write` and runs on `sonnet` instead of `haiku` — reading a plate correctly needs more care than a cheap scan, and it writes the registration number to a `<image>.json` sidecar file (there's no EXIF-writing tool available in this environment, and writing raw bytes into the JPEG itself with `Write`/`Edit` would corrupt it, which testing also caught).

## Orchestration decision

The `/review` command first lists `course-api/images/` and runs `image-reviewer` once per image, all in parallel — each image is independent to inspect, so there's no reason to scan them one after another. Once every scan finishes, `droneimage-handler` moves every car photo they found into `course-api/images/cars/`; this step is dependent because it needs the scan results before it knows what to move. Finally `licenseplate-reviewer` reads plates out of `cars/` and writes each one to a sidecar JSON file — also dependent, since it can't read plates from images that haven't been moved there yet.
