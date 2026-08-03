---
name: lint-fix
description: Use when the user asks to fix ESLint errors or clean up lint warnings in course-api. Explains how to resolve lint issues consistently with this codebase's config.
---

# Fixing lint issues in course-api

course-api uses ESLint's flat config (`eslint.config.js`) with `@eslint/js` recommended rules plus one custom rule:

- `no-unused-vars` is a warning, with `argsIgnorePattern: '^(req|res|next)$'` — Express handler params named `req`, `res`, or `next` are exempt even if unused. Don't rename or remove them just to satisfy lint; only act on genuinely unused variables.

When fixing lint issues:

1. Run `npm run lint` in `course-api/` to see current violations.
2. Fix each violation with the smallest change that satisfies the rule — don't refactor unrelated code.
3. Re-run `npm run lint` to confirm the file is clean.
4. Run `npm test` afterward to make sure fixes didn't break behavior.
