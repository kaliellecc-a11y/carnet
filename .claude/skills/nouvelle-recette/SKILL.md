---
name: nouvelle-recette
description: Proposer des idées de recettes pour le carnet de Céline, puis rédiger la fiche au gabarit. Utilise cette skill dès qu'il s'agit de trouver quoi cuisiner, d'écouler un ingrédient, de combler un manque du carnet, ou d'ajouter une recette — même sans le dire ainsi : « qu'est-ce que je fais avec ce reste de poulet », « il me faut un plat du soir rapide », « une idée d'apéro », « j'ai du skyr à finir », « propose-moi quelque chose au Woodfire ». Elle porte le profil de goût de Céline et évite les propositions qu'elle refuserait.
---

# Trouver et intégrer une recette au carnet

Cette skill fait deux choses, dans cet ordre : **proposer trois pistes**, puis **rédiger la fiche** de celle que Céline choisit. Ne jamais sauter la première étape : elle tranche vite, mais elle veut trancher.

`REGLES-RECETTES.md` reste la loi pour le gabarit, les macros, la numérotation et le workflow. Cette skill ne le répète pas — elle porte ce que le référentiel ne dit pas : **ce que Céline aime, refuse, et dans quelles conditions elle cuisine**.

## Avant de proposer

1. `git pull`, puis lire `carnet-kefir-levain.md`. C'est la source de vérité, jamais une copie.
2. `python3 verifie.py` donne les prochains numéros libres.
3. Chercher le doublon **avant** d'imaginer : une piste qui recoupe une fiche existante est écartée ou assumée comme variante explicite de cette fiche.

## Le profil de Céline

### Conditions de cuisine

| | |
|---|---|
| Foyer | Deux personnes, au quotidien |
| Soir de semaine | **15 min de travail actif maximum.** Au-delà, elle ne la refera pas. |
| Week-end, en fournée | **2 h de travail actif maximum**, si ça produit plusieurs jours de repas. |
| Fermentation, cuisson, repos | Hors compte — c'est du temps total, pas du temps de mains. |

Une piste qui dépasse ces bornes n'est pas proposée, même excellente. Le temps actif est le premier filtre, avant le goût.

### Ce qui déclenche une recette

Deux entrées seulement, et c'est par là qu'il faut raisonner :

- **Un ingrédient à écouler** — un reste, un fond de placard, un légume qui tourne. La recette naît de ce qu'il y a.
- **Une contrainte pratique** — repas du soir, batch du week-end, apéro improvisé, plat qui se garde.

Une recette « parce qu'elle est belle » ou « parce que c'est la mode » n'intéresse pas. Et **l'emploi d'une base du carnet (kéfir, levain, skyr T1, eau d'avoine, petit-lait) n'est pas un critère** : une recette sans aucune base entre au carnet si elle est bonne et pratique.

### Les deux façons de rater

Céline abandonne une recette pour deux raisons, jamais d'autres :

1. **Le résultat est fade.** Le goût ne paie pas l'effort.
2. **Il faut acheter un ingrédient introuvable ou cher**, qui ne resservira pas.

D'où les deux règles qui suivent.

### Anti-fade : ce qui sauve un plat chez elle

- **Épices chaudes et puissantes** : paprika fumé, cumin, ail, échalote, moutarde, citron. Dosées franchement, pas en soupçon.
- **Maillard et fumé** : bien coloré, grillé, rôti. Lardons, chorizo, parmesan. Le goût vient de la cuisson, pas d'une sauce ajoutée après.

Toute piste proposée doit pouvoir répondre en une ligne : *qu'est-ce qui fait le goût ici ?* Si la réponse est « les légumes sont bons », la piste est fade — la retravailler ou l'écarter.

### Le placard permanent

Toujours disponible, donc gratuit à proposer :

- skyr / fromage blanc, œufs
- flocons d'avoine, légumineuses, riz, pâtes, semoule
- pommes de terre, patate douce
- ail, échalote, moutarde, citron
- poulet, dinde

Présents **une fois par semaine**, à placer plutôt qu'à empiler :

- un fromage (acheté au besoin, pas en stock)
- sardines — le plus souvent en tartinade apéro
- lardons, chorizo ou jambon — une fois maximum
- pâtes — une fois
- fish and chips surgelé, cuit à l'air fryer

Rares, donc jamais structurants dans une recette : **herbes fraîches**.

Une piste qui demande plus de **deux achats hors placard** est une mauvaise piste. Et un ingrédient acheté exprès doit resservir : le dire dans la piste.

### Interdits fermes

Jamais proposés, dans aucune quantité :

> champignons · olives · pruneaux · raisins secs · **gingembre** · **coriandre** · **anis** · **câpres** · **curry** · matcha · tofu

Également : pas de lait de coco en salé · épinards seulement crus · pas de sucré-salé · sucrant = miel sauf exception argumentée · zéro levure du commerce, zéro poudre chimique.

**Gluten** : évité quand il se remplace facilement et sans perte (avoine, riz, légumineuses, sarrasin plutôt que farine de blé par défaut). Mais pain et pâtes sont mangés normalement — ce n'est pas une éviction, c'est un arbitrage. Ne jamais dégrader une recette pour la rendre sans gluten.

## Étape 1 — les trois pistes

Trois, pas plus. Format strict, sans préambule :

```
**1. Nom de la piste**
Principe en une ligne : ce que c'est, comment ça se fait.
Appareil · travail X min · total X h · N parts
Le goût : ce qui empêche la fadeur (l'épice, la cuisson colorée, le contraste).
Macros estimées : ≈ XX kcal et X g de protéines par part.
```

Les trois pistes doivent **différer entre elles** — pas trois variantes du même plat. Varier l'appareil, le moment du repas, ou la technique.

Si une piste demande un achat, l'écrire en une ligne de plus : ce qu'il faut acheter, et ce que le reste servira à faire.

Puis s'arrêter. Ne pas rédiger de fiche tant que Céline n'a pas choisi.

## Étape 2 — la fiche

Une fois la piste choisie, appliquer `REGLES-RECETTES.md` sans raccourci : gabarit exact, ligne meta complète, macros recalculées (Ciqual, jamais recopiées d'une fiche voisine), numéro libre, chapitre et sous-catégorie, checklist §5, niveau **B** par défaut.

Montrer la fiche. **N'écrire dans `carnet-kefir-levain.md` qu'après « valide »**, et ne republier que sur « republie ».

## Ce que cette skill ne fait pas

Elle ne décide pas à la place de Céline, ne rédige pas trois fiches complètes d'un coup, et n'intègre rien sans validation. Un désaccord sur une piste se dit en une phrase, puis on exécute.
