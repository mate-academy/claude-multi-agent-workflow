---
description: Summarize my commits from the last day I made any, across all repos, for standup
allowed-tools: Bash(git log:*), Bash(git config:*), Bash(find:*), Bash(sort:*), Bash(uniq:*), Bash(date:*)
argument-hint: '[include-today|last-day-only] [root-folder]'
---

Generate a standup summary from commits made across all repos.

## Steps

1. **Parse arguments:**
   - `$1` (optional, default: `include-today`): Controls whether to include today's commits.
     - `yes` or `include-today`: Include commits from both today AND the most recent day with commits (other than today, if different).
     - `no` or `last-day-only`: Include only commits from the most recent day with commits, excluding today.
   - `$2` (optional): Root folder to scan. Defaults to `~/Kodok`.

2. **Determine the root folder to scan.** Use `$2` if provided; otherwise default to `~/Kodok`.

3. **Find all git repositories** under the root folder (skip `node_modules`):
   ```bash
   find <root> -type d -name .git -not -path "*/node_modules/*" | xargs dirname
   ```

4. **Get the user's global git email** (fallback):
   ```bash
   git config --global user.email
   ```

5. **Determine which dates to include:**
   - Get today's date: `date +%Y-%m-%d`.
   - For each repo, find all commit dates by the user and collect them.
   - If `$1` is `yes`/`include-today`: Include **today** and the most recent day with commits other than today.
   - If `$1` is `no`/`last-day-only`: Include only the most recent day with commits, excluding today.

6. **For each selected date, re-scan all repos** for commits by the user:
   - Use `git -C <repo> log --author="<email>" --since="<date> 00:00:00" --until="<date> 23:59:59" --pretty=format:"%h | %s"` to extract commits from that date.
   - Group results by repo name.

7. **Write a standup summary** in readable prose/bullets:
   - List what was accomplished, grouped by project and date if multiple dates are included.
   - Do not just dump raw `git log` output — interpret and summarize the commits.

8. **If no repos have any commits** on the selected date(s), report that plainly.
