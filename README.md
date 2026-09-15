# Carnet de recettes — carnet de fournil

Livre de recettes personnel : pâtes levées, glaces et fermentations, au kéfir
de fruits. 68 fiches, rangées par appareil.

- En ligne : https://carnet-de-recettes-celine.netlify.app
- Version courante : v11 (2026-09-11)

## Fichiers

| Fichier | Rôle |
|---|---|
| `carnet-kefir-levain.md` | Le markdown maître — la source de toutes les recettes |
| `build.py` | Génère les deux HTML à partir du maître, du CSS et du JS |
| `style.css` | Design system : palette crème/brun, Fraunces, Literata, IBM Plex Mono |
| `app.js` | Édition des fiches, notes, journal des fournées, « mes recettes » |
| `firebase-init.js` | Accès Firestore quand la page tourne hors Artifact Claude |
| `REGLES-RECETTES.md` | Gabarit de fiche, macros, checklist — fait référence |
| `PASSATION.md` | Historique des versions et dossier de reprise |

## Construire

```bash
pip install -r requirements.txt
python3 build.py
```

Deux fichiers sont produits à la racine, tous deux ignorés par git :

- `carnet-de-fournil.html` — fragment sans doctype, pour un Artifact Claude
- `carnet-de-fournil.standalone.html` — page complète, pour le web et le PDF

Prévisualiser :

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000/carnet-de-fournil.standalone.html
```

## Données

Notes, journal des fournées et modifications de recettes vivent dans Firestore
(projet `carnet-recettes-3f0e0`), partagées entre le site et tout HTML
téléchargé. `app.js` essaie dans l'ordre : base Claude (Artifact), Firebase,
puis `localStorage`.

La clé dans `firebase-init.js` identifie le projet et n'est pas un secret : la
protection vient des règles Firestore, ouvertes sur le seul dossier `carnet`.

## Déploiement

Aujourd'hui manuel, via le connecteur Netlify (voir `PASSATION.md`).
`netlify.toml` décrit la construction automatique si le dépôt est un jour
relié à Netlify.
