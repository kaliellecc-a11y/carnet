# Consignes de travail sur ce dépôt

Souche : remplacer par le CLAUDE.md du projet.

## Le projet

Carnet de recettes (kéfir, levain) : site statique publié sur Netlify,
données dans Firebase, export PDF côté navigateur.

## Conventions

- Langue du contenu et des commentaires : français.
- Les recettes vivent dans `content/`, en Markdown.
- Les règles de rédaction des recettes font foi : voir `docs/REGLES-RECETTES.md`.
- Aucun identifiant Firebase en dur dans un fichier versionné.

## Vérifier avant de livrer

```bash
python3 build.py
```
