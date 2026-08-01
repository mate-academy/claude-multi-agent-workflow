---
name: review-rubric
description: Use when reviewing code for quality issues (bugs, missing error handling, unclear names, weak validation, test gaps) so findings are graded consistently as high/medium/low. Triggers on requests like "review this file", "check this for issues", "is this code okay", "grade the severity of this bug" — any ad hoc review done outside the plugin's /audit workflow.
---

Grade every finding using these definitions, so an ad hoc review lines up with what the `read-reviewer` and `write-reporter` subagents produce through the `/audit` command.

## High
Bugs that cause incorrect behavior, data corruption, or a security issue in normal use; missing validation on a documented required input; an untested path for behavior the project's own docs promise.

## Medium
Inconsistent validation between similar endpoints or functions; missing error handling for a realistic failure mode; a test gap that would let a real regression slip through unnoticed; an implied invariant (e.g. uniqueness) that's unenforced.

## Low
Naming clarity; redundant code; a weak assertion; behavior that happens to work but isn't documented or explicitly guarded.

## Reporting format
- Group findings by severity, high to low.
- Cite the file (and line, if known) for every item.
- One sentence: what's wrong and what to do about it.
- If the same underlying issue shows up from more than one angle, merge it into a single item instead of listing duplicates.
