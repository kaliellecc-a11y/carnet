# Consignes de travail sur ce dépôt

## Le projet

Carnet de recettes personnel de Céline, généré par `build.py` à partir d'un
markdown maître. Publié sur Netlify, notes synchronisées par Firestore.

## À lire avant de toucher aux recettes

`REGLES-RECETTES.md` fait référence : gabarit de fiche, macros obligatoires,
checklist de vérification, workflow « intègre au carnet » → « valide » →
« republie ». Le lire avant toute création ou modification de fiche.

`PASSATION.md` porte l'historique et l'état publié.

## Règles fermes

- Le maître est `carnet-kefir-levain.md`. Éditer là, jamais le HTML produit.
- Les HTML sont des produits du build : ne pas les versionner, `build.py` les
  régénère. Ils sont dans `.gitignore`.
- Les numéros de fiche (R1, G14, T3…) sont des identifiants : ancres, notes et
  journal Firestore en dépendent. Ne jamais renuméroter une fiche existante.
  Un numéro retiré n'est pas réattribué.
- Dans le maître, toujours écrire le numéro ; l'affichage montre le nom court,
  résolu par le dictionnaire `COURT` de `build.py`.
- Macros recalculées (Ciqual), jamais recopiées d'une fiche voisine.
- Ne pas republier automatiquement. Enregistrer les corrections dans les
  fichiers ; ne relancer le pipeline complet que sur demande explicite
  (« mets à jour », « republie »).

## Vérifier avant de livrer

```bash
python3 build.py
```

Puis contrôler : nombre de fiches, ancres non cassées, sommaire et index
complets, encarts kéfir présents.
