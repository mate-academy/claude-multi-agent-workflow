---
name: release-notes
description: Format and validate release notes for publication
---

Polish changelog entries into publication-ready release notes.

## What this skill does

Takes the raw changelog summary from the analyzer and formats it into professional release notes:
- Adds markdown formatting (headers, lists, links)
- Validates that all entries are clear and user-friendly
- Suggests highlights or notable changes for the release
- Checks for common issues (typos, vague descriptions, missing context)

## How to use

Run this skill after the changelog-analyzer has completed. Provide it with the raw changelog summary, and it will return formatted, validated release notes ready to commit or publish.

```
/release-notes <changelog-summary>
```

## Output

Returns a markdown-formatted CHANGELOG.md snippet:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Features
- Clear description of new feature

### Fixes
- Clear description of bug fix

### Breaking Changes
- Clear description of incompatible change
```
