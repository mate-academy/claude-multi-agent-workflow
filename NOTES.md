# Release Plugin — Notes

## What the plugin does

The release plugin automates the release management workflow. It orchestrates three specialized agents across two phases:

**Phase 1 (Parallel):**
1. **Analyze changes** — Scan git history and code to extract what's new, fixed, or breaking since the last release
2. **Check dependencies** — Scan dependencies for outdated packages, vulnerabilities, or breaking changes

**Phase 2 (Sequential):**
3. **Bump version** — Determine the appropriate semantic version bump (patch/minor/major) based on both code changes and dependency updates

The plugin also includes pre-release validation checks and a skill for formatting release notes into publication-ready markdown.

### Installation

Add the plugin marketplace and install:
```bash
/plugin marketplace add <your-repo-url>
/plugin install release@<marketplace-name>
```

Then trigger releases with:
```bash
/release
```

---

## Scoping Decision: Changelog Analyzer Uses Haiku

**Why Haiku for changelog-analyzer:**

The changelog analyzer is a straightforward data-extraction task: read git logs, examine diffs, categorize commits. It doesn't require complex reasoning or multi-step decision-making — it's pattern matching and summarization.

Haiku is fast, cheap, and sufficient for this read-only, exploratory work. Larger models would waste capacity on a task that doesn't benefit from reasoning depth. The agent's tools are intentionally limited (Read, Bash only — no edit/write), so it can only gather information, not modify files.

If the changelog contained ambiguous or conflicting changes requiring judgment calls, a larger model would make sense. But that's exactly why the version-bumper (which *does* make judgment calls about versioning) uses Sonnet.

---

## Orchestration Decision: Parallel Analysis → Sequential Bump

**Why Phase 1 runs changelog-analyzer and dependency-checker in parallel:**

These two agents perform independent read-only analysis tasks:
- changelog-analyzer examines git commit history
- dependency-checker examines package.json and dependency metadata

Neither task depends on the other's output. Running them in parallel saves time — both analyses happen concurrently rather than sequentially.

**Why Phase 2 (version-bumper) runs sequentially after Phase 1:**

The version-bumper depends on both Phase 1 results. It needs:
- The changelog summary (what changed in code)
- The dependency analysis (what's outdated or has breaking changes)

It uses both inputs to make an informed versioning decision (patch/minor/major). Running version-bumper before Phase 1 completes would be pointless — it would have no input to work with.

The parallelism is explicit: **analyze independently in parallel, then synthesize both results into a version decision.**

---

## Testing & Validation

- Pre-release hook validates that the working tree is clean and you're on main before running the workflow
- Release notes skill can be called separately to format and validate changelog output before publishing
- Both agents are tested against the course API in `course-api/` to ensure they work on real code
