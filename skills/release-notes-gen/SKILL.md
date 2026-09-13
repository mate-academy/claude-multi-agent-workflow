---
name: release-notes-gen
description: Teaches Claude how to analyze recent git diffs/commits and format a structured release notes draft adhering to Keep a Changelog standards.
---

When generating release notes or summarizing project milestones, follow this process:

1. Inspect modified files and commits since the last tag or within the current branch context.
2. Categorize all changes strictly into the following sections:
   - **Added**: New features or capabilities.
   - **Changed**: Changes in existing functionality.
   - **Deprecated**: Soon-to-be removed features.
   - **Removed**: Removed features.
   - **Fixed**: Any bug fixes.
   - **Security**: Vulnerability resolutions.
3. Exclude internal refactoring or lockfile updates unless they directly impact public interfaces.
4. Output a clean markdown snippet ready for insertion into `CHANGELOG.md`.