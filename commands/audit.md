---
description: Run a two-phase code quality audit — parallel reviews, then one synthesized report.
argument-hint: [path]
---

Run a code quality audit workflow over $ARGUMENTS (default to the whole `course-api/` directory if no path is given), using the `read-reviewer` and `write-reporter` subagents in two phases.

**Phase 1 — Parallel review (independent, run together).**
Split the target into a few natural areas (for example: routes, models, tests). Launch the `read-reviewer` subagent once per area, all at the same time, not one after another. Each instance reads only its own area and returns its own findings grouped by severity (high, medium, low), independently of the others.

**Phase 2 — Sequential synthesis (depends on Phase 1).**
Wait until every `read-reviewer` instance from Phase 1 has returned its findings — this step cannot start before that. Then launch the `write-reporter` subagent a single time, passing it the combined findings from all of Phase 1. Ask it to write one consolidated report: deduplicate overlapping issues, keep the severity grouping, and cite the file for each item. Have it produce the report as text only — do not have it write to a file itself.

**After Phase 2 — ask before saving.**
Show the consolidated report, then ask the user whether to save it to a file (e.g. `AUDIT_REPORT.md` at the root of the target). Only write the file after the user says yes, and only to the path they confirm.
