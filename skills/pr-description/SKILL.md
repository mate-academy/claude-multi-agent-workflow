---
name: pr-description
description: Writes a clear pull-request description from the current branch. Use when the user asks to "write the PR description", "draft a PR", "what should I put in the PR", or is about to open a pull request.
---
# Writing a PR description

## Gather facts first
1. Run `git log <base>..HEAD --oneline` and `git diff <base>...HEAD --stat` (base is `main` unless told otherwise).
2. Read the diff for any file whose purpose isn't obvious from its name. Describe what the code does now, not what the commit messages say.

## Format
Use exactly these sections, in this order:

- **Title:** under 70 characters, imperative mood ("Add retry to upload client"), no trailing period.
- **What changed:** 2-5 bullets, each naming the file or area and the change in one line.
- **Why:** one or two sentences on the problem this solves. If the reason isn't in the diff, commits or the conversation, ask instead of inventing one.
- **How to test:** the exact commands or steps a reviewer can run, and what they should see.
- **Risks / notes:** migrations, config changes, breaking behaviour, follow-ups. Write "None" if there are none.

## Rules
- Keep it short enough to read in under a minute.
- Never claim tests pass unless you ran them in this session.
- Don't pad with generic phrases like "various improvements" or "minor fixes".
- If `/qa-kit:ship` or `/qa-kit:summarize` already ran earlier in this conversation, build from its output instead of re-reviewing: take **What changed** from its per-file list, put its High/Medium risks and any failing or missing tests under **Risks / notes**, and copy the commands it ran into **How to test**. If its verdict was not "Ready to open the PR", say so to the user before drafting.
