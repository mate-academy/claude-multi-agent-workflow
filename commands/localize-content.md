---
description: Localize source copy into multiple languages in parallel, then run regional SEO optimization on the results
argument-hint: <source-file> <locale> [<locale> ...]   e.g. copy.md es-MX ja-JP
---

Localize the content described by: $ARGUMENTS

The first argument is the source file; the rest are target locales (BCP 47 tags like `es-MX`, `ja-JP`). If the source file or locales are missing, ask the user before doing anything.

Run this as a workflow with the steps below, in order.

## Step 1 - Translate (parallel)

Launch one `content-translator` subagent per target locale **at the same time, in a single message with multiple Agent calls**. The locales are independent of each other, so none should wait on another. Give each subagent the source file path, its one target locale, and the instruction to write `<name>.<locale>.<ext>` next to the source.

Wait for every translator to finish before continuing.

## Step 2 - SEO analysis (dependent on Step 1)

This step needs the translated files, so it must not start until Step 1 is complete. Launch one `seo-locale-analyzer` subagent per locale (these may run in parallel with each other), passing each the translated file for that locale, plus any target keywords the user provided. It returns a report with keyword density, metadata length, search intent, and prioritized fixes. The analyzer is read-only and does not edit files.

## Step 3 - Apply SEO fixes (dependent on Step 2)

For each locale, send the analyzer's fixes back to a `content-translator` subagent to apply to that locale's file: inject region-specific keywords and correct title/meta description lengths and format. Only apply fixes that keep the copy natural; skip any that would stuff keywords. Locales can run in parallel here as well.

## Final report

Summarize in a table per locale: output file, adaptations made, SEO verdict before and after, and anything flagged for human review. Do not modify the source file.
