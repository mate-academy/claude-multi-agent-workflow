# NOTES

## What the plugin does

`localization-toolkit` localizes content for multiple locales and then checks it for regional SEO. It bundles:

- **`content-translator`** (subagent): translates copy and adapts idioms, tone, and cultural references, using a translation memory and lexicon in `data/`.
- **`seo-locale-analyzer`** (subagent): read-only audit of keyword density, title/meta length, and search intent for the target market.
- **`/localization-toolkit:localize-content`** (command): runs both as a workflow, e.g. `/localization-toolkit:localize-content copy.md es-MX ja-JP`.
- **`locale-style-guide`** (skill): per-locale conventions for formality, formats, and length.
- **PostToolUse hook**: `scripts/check-placeholders.js` checks that a written `name.<locale>.ext` file keeps the same placeholders (`{name}`, `{{count}}`, `%s`) as its source.

## How to install

```
/plugin marketplace add javelinnathan/claude-multi-agent-workflow
/plugin install localization-toolkit@localization-marketplace
```

For local development, run `claude --plugin-dir .` from the repo root and use `/reload-plugins` after edits.

## Scoping decision: the SEO analyzer is read-only and runs on Haiku

`seo-locale-analyzer` gets only `Read, Grep, Glob` and the `haiku` model. Its job is measuring and reporting (counting keyword occurrences, extracting title and meta tags with regexes, comparing lengths), which needs search tools and no write access, and is mechanical enough for the cheapest model. Making it read-only also means an audit can never silently rewrite the copy it is judging. The edits are made by `content-translator`, the only agent with `Write`/`Edit`, and it runs on `sonnet` because adapting idioms and tone is the part that needs judgment. The trade-off: the analyzer can't run a density script, so it computes density from Grep counts and shows its numbers so they can be verified.

## Orchestration decision: parallel translation, sequential SEO

- **Step 1, translate: parallel.** Each locale is independent. The Spanish translation needs nothing from the Japanese one, so one `content-translator` per locale launches at once and total time is about one translation, not N.
- **Step 2, SEO analysis: sequential after step 1.** The analyzer audits the translated text, so it cannot start until that locale's file exists. Per-locale analyses can still run in parallel with each other.
- **Step 3, apply fixes: sequential after step 2.** The fixes come from the analyzer's report, so this step depends on it. It goes through `content-translator` because the analyzer is read-only.

Rule of thumb: run work in parallel when it shares no inputs, and in sequence when one step consumes another's output.
