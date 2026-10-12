# Plugin test checklist (`claude --plugin-dir .`)

Run from the repo root. Test file: `samples/landing.md`. Suggested locales: `es-MX ja-JP`.

## 1. Load
- [ ] `claude --plugin-dir .` starts with no plugin load errors
- [ ] `/plugin` (or `/help`) lists `localization-toolkit`
- [ ] `/agents` shows `content-translator` and `seo-locale-analyzer`
- [ ] `/localization-toolkit:localize-content` appears in slash-command completion
- [ ] Skill `locale-style-guide` is listed

## 2. Workflow
Run: `/localization-toolkit:localize-content samples/landing.md es-MX ja-JP`
- [ ] Step 1: both translators launched in one parallel batch
- [ ] Step 2 starts only after both translations finish
- [ ] Step 3 applies SEO fixes per locale
- [ ] `samples/landing.es-MX.md` and `samples/landing.ja-JP.md` created
- [ ] `samples/landing.md` unchanged (`git diff samples/landing.md`)
- [ ] Final report table lists output, adaptations, SEO before/after, flags

## 3. Content quality
- [ ] `Acme`, `AcmeCloud`, `API` untranslated (lexicon)
- [ ] dashboard/workspace use lexicon terms (es-MX: panel de control / espacio de trabajo; ja-JP: ダッシュボード / ワークスペース)
- [ ] "Get started for free" and "Sign in to your account" match translation memory
- [ ] Idioms adapted, not literal ("knock it out of the park", "piece of cake", "hit the ground running", "one-stop shop")
- [ ] es-MX uses `tú` and `¿ ¡`; ja-JP uses です/ます and `、。`
- [ ] Title/meta lengths within locale limits (CJK about half)

## 4. Hook
- [ ] Placeholders `{name}`, `{{count}}`, `%d` identical in each output file
- [ ] Negative test: edit `samples/landing.es-MX.md` to drop `{name}` -> hook reports "Placeholder mismatch" and Claude fixes it
- [ ] Hook is silent for non-locale files (e.g. editing `samples/TESTING.md`)

## 5. Scoping
- [ ] seo-locale-analyzer never writes/edits (read-only tools)
- [ ] Source file never modified

## 6. Iterate
- [ ] After an edit, `/reload-plugins` picks it up
- [ ] Cleanup: `rm samples/landing.es-MX.md samples/landing.ja-JP.md`

## Known gaps vs. README tasks
- No `.claude-plugin/marketplace.json` or `NOTES.md` yet
- README says to test against `course-api/`; this plugin's theme is localization, so confirm that's acceptable (or point it at `course-api/docs/*.md`)
