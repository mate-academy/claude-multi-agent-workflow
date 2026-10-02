---
description: Audit qualité d'un dossier avec revue et diagnostic en parallèle, puis correction optionnelle.
argument-hint: "[dossier] [--fix]"
allowed-tools: Agent, Read, Glob, Bash(npm --prefix *)
---

Audit qualité. Arguments reçus : $ARGUMENTS

Le premier argument est le dossier du projet (défaut : course-api).
Le drapeau --fix autorise les corrections (étape 3).

## Étape 1 — en parallèle
Dans un SEUL message, lance ces deux agents en même temps.
Ils sont indépendants : n'attends pas l'un pour lancer l'autre.

1. Agent code-quality:quality-reviewer
   Relis tout le dossier. Rends la liste des problèmes.
2. Agent code-quality:quality-fixer
   Mode DIAGNOSTIC UNIQUEMENT sur le même dossier.
   Il lance tests et lint, analyse les échecs et ne modifie rien.

## Étape 2 — dépend de l'étape 1
Attends les DEUX résultats. Ne commence pas avant.
Fusionne la revue et les échecs de tests ou de lint.
Supprime les doublons, classe par gravité, numérote.

Affiche cette liste fusionnée.
Si elle est vide, ou si --fix est absent : termine ici.

## Étape 3 — dépend de l'étape 2 (seulement avec --fix)
Rappelle code-quality:quality-fixer en mode CORRECTION.
Copie dans son prompt la liste fusionnée complète et le dossier.
Un seul fixer à la fois, pour éviter les éditions concurrentes.

## Étape 4 — dépend de l'étape 3
1. Relance les tests :
   npm --prefix <dossier> test
2. Relance le lint :
   npm --prefix <dossier> run lint
3. Lance code-quality:quality-reviewer
   sur les fichiers modifiés.

## Rapport final
Indique pour chaque point : corrigé, restant ou régression.
Ne propose ni commit ni push.
