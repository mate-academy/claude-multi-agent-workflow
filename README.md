# code-quality

Plugin Claude Code pour la qualité de code.
Il relit un projet, lance tests et lint, puis corrige à la demande.

Version 0.1.0.

## Composants

- quality-reviewer : relecture en lecture seule.
- quality-fixer : diagnostic et correction.
- /code-quality:audit : orchestre le workflow.
- quality-checklist : checklist de relecture.
- lint-on-edit : lance ESLint après Edit ou Write.

## Workflow

1. Reviewer et diagnostic en parallèle.
2. Fusion des résultats.
3. Correction seulement avec --fix.
4. Tests, lint et revue finale.

## Chargement local

Commande : claude --plugin-dir .

Après modification : /reload-plugins

## Validation

Commande : node .github/scripts/validate-plugin.js
Commande : claude plugin validate .

## Marketplace

Après publication sur GitHub :

/plugin marketplace add Philippe-gt/claude-multi-agent-workflow
/plugin install code-quality@code-quality-marketplace
