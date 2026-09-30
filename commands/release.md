---
name: release
description: Orchestrate a complete release workflow analyzing changes and bumping the version
---

Run the release workflow to prepare a new version: analyze changes, determine version bump, and update files.

## Workflow orchestration

This command runs three agents across two phases: analyze work in parallel, then bump version based on combined results.

### Phase 1 — Analyze (Parallel)
Run two independent read-only analysis tasks concurrently:

- **changelog-analyzer** — Scans recent commits and categorizes changes into Features, Fixes, and Breaking Changes
- **dependency-checker** — Analyzes dependencies for outdated packages, vulnerabilities, and breaking changes

Both agents examine the codebase without modifications. They work independently and their results feed into Phase 2.

### Phase 2 — Bump (Sequential, depends on Phase 1)
Once both Phase 1 analyses complete, run the version-bumper agent. It receives both the changelog summary and dependency analysis, then determines the appropriate semantic version bump (patch/minor/major) based on combined information.

*Agent: version-bumper* — requires output from both Phase 1 agents

## Result

After the workflow completes:
1. You have a detailed changelog of what changed
2. Version files are updated with the new semantic version
3. Review the changes in your working tree before committing
