# Carnet — kéfir & levain

Carnet de recettes statique, publié sur Netlify.

- Site : https://carnet-de-recettes-celine.netlify.app

## Structure

```
.
├── index.html              Page du carnet
├── build.py                Construction du site vers dist/
├── netlify.toml            Configuration de déploiement
├── assets/
│   ├── css/style.css       Feuille de style
│   └── js/
│       ├── app.js          Logique du carnet
│       ├── firebase-init.js Initialisation Firebase
│       └── pdf.js          Export PDF
├── content/                Recettes, en Markdown
└── docs/                   Notes de projet et règles de rédaction
```

## Construire en local

```bash
python3 build.py            # produit dist/
python3 -m http.server -d dist 8000
```

## Déploiement

Netlify construit avec `python3 build.py` et publie `dist/`.
Voir `netlify.toml`.

## Configuration Firebase

Les identifiants ne sont pas versionnés. Voir l'en-tête de
`assets/js/firebase-init.js`.
