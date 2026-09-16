# Carnet de recettes — carnet de fournil

Livre de recettes personnel : pâtes levées, glaces et fermentations, au kéfir
de fruits. 68 fiches, rangées par appareil.

- En ligne : https://carnet-de-recettes-celine.netlify.app
- Version courante : v11 (2026-09-11)

## Fichiers

| Fichier | Rôle |
|---|---|
| `carnet-kefir-levain.md` | Le markdown maître — source de vérité du carnet, éditer ici |
| `build.py` | Génère les deux HTML à partir du maître, du CSS et du JS |
| `verifie.py` | Contrôle les fiches avant construction ; arrête le build sur erreur |
| `quantites.py` | Balise les quantités pour que la page sache les recalculer |
| `echelle.js` | Recalcul d'une recette dans la page : compteur de parts, pivot |
| `test-echelle.cjs` | QA du recalcul dans un vrai navigateur (optionnel) |
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
- `carnet-de-fournil.standalone.html` — page complète, c'est elle qui est mise en ligne

Prévisualiser :

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000/carnet-de-fournil.standalone.html
```

## Recalculer une recette

Chaque fiche porte un bandeau de réglage. Deux entrées : le compteur de parts,
ou une quantité de la liste — tu tapes ce que tu as vraiment (« je n'ai que
200 g de farine ») et la fiche s'aligne. Le réglage est éphémère : rien n'est
enregistré, la fiche rouvre toujours à ses quantités d'origine.

Suivent le facteur : les quantités de la liste, les rappels de poids dans la
méthode, le rendement. Ne bougent jamais : durées, températures, dimensions de
moule, cuillerées (épices, non linéaires), et les macros — les kcal par part
sont invariantes, puisque le nombre de parts suit le facteur et que la part
garde sa taille.

Vérifier ce comportement dans un navigateur :

```bash
npm install playwright
node test-echelle.cjs
```

## Source de vérité

Ce dépôt fait foi depuis le 2026-09-15. Le maître vivait auparavant en pièce
jointe sur une page Notion ; cette page est figée au v10 et n'est plus
utilisée.

## Données

Notes, journal des fournées et modifications de recettes vivent dans Firestore
(projet `carnet-recettes-3f0e0`), partagées entre le site et tout HTML
téléchargé. `app.js` essaie dans l'ordre : base Claude (Artifact), Firebase,
puis `localStorage`.

La clé dans `firebase-init.js` identifie le projet et n'est pas un secret : la
protection vient des règles Firestore, ouvertes sur le seul dossier `carnet`.

## Déploiement

Continu : un push sur `main` déclenche la construction Netlify et la mise en
ligne. Tout est dans `netlify.toml` — rien à lancer à la main.

Un build qui échoue ne déploie rien ; la version en ligne reste celle du
dernier build vert.
