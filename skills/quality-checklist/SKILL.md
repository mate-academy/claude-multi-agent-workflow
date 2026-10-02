---
name: quality-checklist
description: Checklist de qualité pour relire ou valider du code d'une API Express avant un commit.
---

# Checklist qualité

Utilise cette liste pour relire du code ou valider une modification.
Coche chaque point avec une preuve (fichier:ligne), pas de l'intuition.

## Routes
- Une route valide ses entrées.
- Entrée invalide : réponse 400.
- Ressource absente : réponse 404.
- Une erreur renvoie du JSON : { "error": "message" }
- Un identifiant d'URL non numérique est géré.

## Données
- Tout accès aux données passe par la couche prévue (db/store.js).
- Une route ne garde aucun état.
- Une fonction ne renvoie pas un tableau interne modifiable.

## Tests
- Chaque route a un test du cas normal.
- Chaque cas d'erreur (400, 404) a un test.
- Un test ne dépend pas de l'ordre des autres.

## Lint et lisibilité
- Le lint ne renvoie aucune erreur.
- Pas de variable ni de code inutilisé.
- Les noms disent ce que fait le code.
- Pas de bloc dupliqué.

## Résultat attendu
Pour chaque point non respecté :
fichier:ligne — problème — correctif.
Si tout est respecté : AUCUN PROBLÈME
