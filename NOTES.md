# Notes

## Ce que fait le plugin
`code-quality` relit un projet, lance les tests et le lint,
puis corrige les problèmes avec deux sous-agents.
La commande `/code-quality:audit` orchestre le tout.

## Installation

Disponible maintenant, sans publication :

```text
claude --plugin-dir .
```

Après publication du plugin sur le dépôt GitHub :

```text
/plugin marketplace add Philippe-gt/claude-multi-agent-workflow
/plugin install code-quality@code-quality-marketplace
```

Le marketplace s'appelle `code-quality-marketplace`.
Le plugin s'appelle `code-quality`.

## Décision de scoping
Le reviewer n'a que Read, Grep et Glob.
Il ne peut ni modifier un fichier ni lancer une commande.
Une revue fiable ne doit pas pouvoir changer ce qu'elle relit.
Seul le fixer a Edit, Write et Bash.
Les deux utilisent sonnet : repérer un bug et corriger
du code demandent du jugement, donc pas de modèle plus léger.
Limite : le mode « diagnostic seul » du fixer repose sur sa consigne,
car il garde Edit et Write pour pouvoir corriger ensuite.
Je le vérifie avec `git status` après l'étape 1.

## Décision d'orchestration
La revue et le diagnostic sont indépendants : l'un lit le code,
l'autre lance tests et lint. Ils tournent en parallèle,
dans le même tour, pour gagner du temps.
La fusion attend les deux résultats, car elle les compare.
La correction vient après la fusion : elle a besoin de la liste complète.
Un seul fixer écrit à la fois, pour éviter des modifications
simultanées sur les mêmes fichiers.
La vérification finale vient après la correction, pour contrôler
son résultat. Sans `--fix`, le workflow s'arrête après la fusion.
