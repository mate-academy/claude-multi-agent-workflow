---
name: changelog-entry
description: Drafts or reviews a changelog entry in house style — for manual use when writing one outside the automated release workflow (e.g. reviewing an entry someone else wrote, or drafting one before a diff is ready). Trigger on "draft a changelog entry", "write a changelog entry for X", "check this changelog entry", or similar. Not used by the automated workflow command — that's handled by the write-changelog subagent directly.
---

# Changelog Entry Style

When drafting or reviewing a changelog entry, follow this format:

**Title:** Short, past tense, states what shipped — not what changed internally. ("Added dark mode" not "Refactored theme provider")

**Body:**
- User-facing language first — what does this mean for someone using the thing
- Breaking changes and new dependencies called out explicitly, at the top of the body if present
- Internal-only refactors, formatting, or test-only changes are omitted unless they affect behavior
- Keep it to 2-4 bullet points; if it needs more than that, it's probably multiple entries

Avoid: raw diff language ("modified X function"), implementation detail with no user impact, present tense ("Adds" instead of "Added").