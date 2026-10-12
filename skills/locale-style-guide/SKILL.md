---
name: locale-style-guide
description: Locale conventions for localizing copy - formality, date/number/currency formats, punctuation, and text-length rules for es-MX, fr-FR, de-DE, and ja-JP. Use when translating, reviewing, or SEO-checking content for a target locale.
---

# Locale style guide

Apply the entry for the target locale. If a locale isn't listed, state the assumptions you made and flag them for human review.

| Locale | Address / register | Dates | Numbers & currency | Notes |
|---|---|---|---|---|
| `es-MX` | Informal `tú` for consumer copy, `usted` for finance/legal | `31/12/2026` | `1,234.56`, `$` MXN | Use Latin American vocabulary (`computadora`, not `ordenador`). Inverted `¿ ¡` marks. |
| `fr-FR` | `vous` by default | `31/12/2026` | `1 234,56` (narrow no-break space), `1 234,56 €` | Space before `: ; ? !`. Prefer French terms over anglicisms where the lexicon has one. |
| `de-DE` | `Sie` by default, `du` only for youth/casual brands | `31.12.2026` | `1.234,56`, `1.234,56 €` | Compound nouns can run long; watch UI overflow (allow ~30% expansion). |
| `ja-JP` | Polite `です/ます` form; keigo for formal | `2026年12月31日` | `1,234.56`, `¥1,234` | No spaces between words. Full-width punctuation `、。`. Prefer katakana for established loanwords. |

## Rules for every locale

1. Never translate: brand names, product names, or `doNotTranslate` entries in `data/lexicon.json`.
2. Keep placeholders (`{name}`, `{{count}}`, `%s`, `%d`) byte-for-byte identical to the source.
3. Prefer an approved translation from `data/translation-memory.json` over a fresh one.
4. Adapt idioms and culture-bound references; do not translate them literally.

## Length guidance (for metadata and UI)

- Title tags: 30-60 characters for Latin scripts, roughly 15-30 for CJK.
- Meta descriptions: 70-160 characters for Latin scripts, roughly 35-80 for CJK.
- Count characters, not bytes. German and French usually run 20-30% longer than English.
