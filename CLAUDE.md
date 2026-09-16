# Consignes de travail sur ce dépôt

## Le projet

Carnet de recettes personnel de Céline, généré par `build.py` à partir d'un
markdown maître. Publié sur Netlify, notes synchronisées par Firestore.

## À lire avant de toucher aux recettes

`REGLES-RECETTES.md` fait référence : gabarit de fiche, macros obligatoires,
checklist de vérification, workflow « intègre au carnet » → « valide » →
« republie ». Le lire avant toute création ou modification de fiche.

`PASSATION.md` porte l'historique et l'état publié.

## La source de vérité

Le maître est `carnet-kefir-levain.md`, dans ce dépôt. Toute session commence
par un `git pull` : jamais une copie locale, un fichier joint, ni la page
Notion « Carnet de recettes — MAÎTRE », figée au v10 et abandonnée depuis le
2026-09-15.

Après un « valide » : build, QA, puis commit du md et de PASSATION.md.
Ne rien commiter tant que la QA n'est pas verte. L'historique git remplace
les MD5 recopiés à la main.

## Règles fermes

- Éditer le maître, jamais le HTML produit.
- Les HTML sont des produits du build : ne pas les versionner, `build.py` les
  régénère. Ils sont dans `.gitignore`.
- Les numéros de fiche (R1, G14, T3…) sont des identifiants : ancres, notes et
  journal Firestore en dépendent. Ne jamais renuméroter une fiche existante.
  Un numéro retiré n'est pas réattribué.
- Dans le maître, toujours écrire le numéro ; l'affichage montre le nom court,
  résolu par le dictionnaire `COURT` de `build.py`.
- Macros recalculées (Ciqual), jamais recopiées d'une fiche voisine.
- Le recalcul des quantités dans la page repose sur le gabarit : une quantité
  en gras en tête d'item (`**250 g**`, `**2** œufs`) est balisée par
  `quantites.py` et devient ajustable. Écrire une quantité autrement la laisse
  figée — sans danger, mais elle ne suivra pas le facteur.
- Un rappel de poids dans la méthode ne suit le facteur que s'il correspond à
  un ingrédient de la fiche. « garder 50 g de levain au froid » relève de
  l'entretien : ce 50 g doit rester étranger à la liste, sinon il sera ajusté.
- Ne pas republier automatiquement. Enregistrer les corrections dans les
  fichiers ; ne relancer le pipeline complet que sur demande explicite
  (« mets à jour », « republie »).

## Hors ligne

Le carnet s'ouvre sans réseau grâce à `sw.js`. Deux règles à ne pas casser :

- Le service worker ne doit **jamais** intercepter les appels Firestore. Sa
  persistance IndexedDB gère déjà la file d'attente hors ligne ; s'interposer
  la casserait.
- `sw.js` est servi en `no-cache` (voir `netlify.toml`). Un service worker figé
  par le cache HTTP bloque le site sur une version.

`build.py` assemble `dist/` : page, service worker, manifeste, icônes. Le
service worker doit rester à la racine du site, sinon sa portée ne couvre pas
le carnet.

## Vérifier avant de livrer

```bash
python3 build.py
```

Le contrôle `verifie.py` tourne en tête de build et l'arrête sur erreur :
structure par famille, numéros, renvois, rappels de poids, sous-catégories.
`python3 verifie.py` seul donne le rapport sans construire, et affiche les
prochains numéros libres.

`python3 macros.py` recoupe les macros déclarées (kcal pour 100 g contre kcal
par part). Diagnostic, pas verdict : perte à la cuisson, parties non
comestibles, rendement composé et ingrédients non pesés expliquent des écarts
légitimes. L'écart médian du carnet est de −10 %, la perte au four documentée.

`node test-hors-ligne.cjs`, avec un serveur local sur `dist/`, vérifie que le
carnet s'ouvre réseau coupé.

Restent à contrôler à la main : véracité des températures et des gestes,
calcul des macros (la table Ciqual n'est pas dans le dépôt), absence de
doublon, rendu visuel d'une fiche nouvelle.
