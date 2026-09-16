# RÈGLES-RECETTES — référentiel du Carnet de recettes

Ce fichier fait loi dans toutes les conversations de ce projet. Toute recette discutée puis intégrée au carnet passe par ce gabarit, ces vérifications et ce workflow. En cas de doute, ce fichier prime sur les habitudes de la conversation en cours.

---

## 1. Gabarit de fiche (obligatoire, à l'identique)

```markdown
<article class="fiche" markdown="1">
#### R22 · Nom de la recette <span class="niveau b">B</span>

<p class="meta">Levant ou machine · travail X min · total X h · rendement (parts/pièces/pot) · ≈ XX kcal et X g de protéines pour 100 g · ≈ XX kcal par part</p>

Une à deux phrases : ce que c'est, pourquoi elle est dans le carnet, ce qui la distingue.

**Ingrédients.**

- **200 g** · farine T80
- **3** œufs
- **60 g** · miel — précision éventuelle après tiret
- zeste d'un citron (item sans poids : pas de gras)

**Méthode.** Prose continue. Chaque poids est rappelé entre parenthèses au moment du geste : « ajouter le miel (60 g) ». Jamais un ingrédient pesé mentionné sans son poids.

**Variantes.** Facultatif.

**Pièges.** Ce qui rate et pourquoi. Facultatif mais recommandé.
</article>
```

Recette en deux temps ou deux préparations : groupes imbriqués dans la liste —

```markdown
- **Levain-mère, 6 h**
    - **100 g** · kéfir
    - **100 g** · farine T65
- **Pâte**
    - **250 g** · farine T65
```

Groupes canoniques : `Le soir / Le matin`, `Levain-mère, X h / Pâte`, `Pâte / Appareil`, `Base à congeler, jusqu'à Freeze Fill / Ajout au service, jusqu'à Pour-In`, `Base / Finition X` (une base, plusieurs fins de plat).

Fiche Turbo Cuisine : la meta commence par le programme et la position de valve (« Rissolé puis Mijoté, valve fermée · 30 min ») ; la méthode suit l'ordre de cuve de Céline — viande seule en Rissolé, aromates dans les sucs, déglacer, légumes et liquides sans remuer, programme. Légumineuses sèches : méthode et durée de trempage dans la fiche. Oignons toujours pesés. Unités : grammes uniquement, jamais de ml.

## 2. La ligne meta

Dans l'ordre : levant ou machine (ou programme Creami) · temps de travail réel · temps total · rendement · macros. Séparateur : ` · `.

**Macros obligatoires pour toute nouvelle fiche** : ≈ kcal pour 100 g, protéines pour 100 g quand c'est un argument de la recette, et kcal par part (ou par pièce, ou par pot pour la Creami). Calcul : valeurs Ciqual ou étiquettes standard, sur le poids cru total moins ~10 % de perte à la cuisson pour les fournées au four ; arrondir à l'unité (kcal) et au demi-gramme (protéines). La somme des poids d'ingrédients doit égaler le poids annoncé du rendement — c'est vérifié.

## 3. Numérotation et placement

- **Les numéros sont des identifiants internes, jamais affichés** (depuis v11). Le lecteur voit le nom de la fiche ; le sommaire, les index et les renvois affichent le nom. Dans le maître, on écrit toujours le numéro (« comme R8 », « (R22) ») : build.py le remplace par le nom court (partie du titre avant la première virgule). Écrire les renvois entre parenthèses ou après « voir » pour que la phrase reste lisible.
- Familles : `R` (recettes hors machine dédiée), `W` (Ninja Woodfire), `T` (Turbo Cuisine), `G` (glaces Creami, 3 notes), `B` (boissons Creami), `K` (kéfir d'eau). Les fiches existantes gardent leur lettre même après un changement de chapitre (R20-R21 au Woodfire, R28-R29 au Woodfire, R15-R16 à la Creami). Prochain numéro libre = plus grand existant + 1 (au 2026-09-11 : R32, W5, T10, G17, B6, K5).
- **Un numéro attribué ne change jamais et n'est jamais réutilisé** : les notes et le journal de Céline y sont accrochés. Numéros retirés : G9 (matcha, retiré en v11).
- **Placement par appareil**, puis sous-catégorie `Salé · type`, `Sucré · type` ou `Bases · sujet` (titre h3 obligatoire sous cette forme : l'index par type de plat en dépend). Chapitres : 1. Cuisson traditionnelle (four, poêle, casserole, sans cuisson) · 2. Ninja Woodfire · 3. Turbo Cuisine · 4. Ninja Creami. Recette sur deux appareils : chapitre de la cuisson principale. Types en usage : Petit-déjeuner, Gâteaux, Viennoiserie et beignets, Flans, Boissons chaudes, Crèmes, Pains et pizzas, Apéritif, Tartinables, Riz et sauces, Rôtis, Légumes farcis, Soupes, Légumineuses, Mijotés et potées, Riz et plats complets, Sorbets et frozen yogurt, Glaces, Boissons glacées. Nouveau type : le créer tel quel ; nouvel appareil : discuter le chapitre avant d'intégrer.
- **Les bases ouvrent le chapitre qui les emploie le plus** (levants et kéfir d'eau en traditionnel, eau d'avoine en traditionnel, skyr maison au Turbo) ; les autres chapitres y renvoient par numéro.
- Niveau de preuve : **A** = pratique établie, convergente sur plusieurs sources · **B** = adaptation raisonnée, à ajuster à la première fournée. Une adaptation personnelle démarre toujours en B ; elle passe en A sur décision de Céline après fournées validées au journal.

## 4. Ce que build.py fait tout seul — ne jamais l'écrire à la main

Sommaire 3 niveaux (noms seuls) · index par type de plat (depuis les titres `Salé · X` / `Sucré · X`) · index des ingrédients et des techniques · liens croisés sur toute référence R/G/B/K/T/W citée dans la prose, affichés par le nom de la fiche · encart « Le kéfir de cette recette » (F1 + lien K1) dans toute fiche R dont les ingrédients contiennent du kéfir · grille ingrédients/méthode · bouton retour sommaire. Il suffit de respecter le gabarit. Si un nouvel ingrédient ou une nouvelle technique mérite l'index, ajouter son entrée dans les listes `INGREDIENTS` / `TECHNIQUES` de build.py. Si un nom court tombe mal (« F1 » pour K1), l'ajouter au dictionnaire `COURT` de build.py.

## 5. Vérifications avant toute intégration (checklist bloquante)

1. **Arithmétique** : somme des poids = rendement annoncé ; hydratation plausible pour une pâte ; macros recalculées, pas recopiées.
2. **Cohérence interne** : temps de la meta = somme des temps de la méthode ; chaque ingrédient de la liste apparaît dans la méthode avec son poids ; aucun ingrédient orphelin dans un sens ou dans l'autre.
3. **Véracité** : température, durée, geste technique → recherche web croisée (plusieurs sources concordantes) avant d'affirmer ; sinon niveau B et piège signalé.
4. **Contraintes du carnet** : zéro levure du commerce, zéro poudre chimique, sucrant = miel sauf exception argumentée, préférences alimentaires de Céline respectées (fichiers mémoire du projet : ni champignons, olives, pruneaux, raisins secs, gingembre, coriandre, anis, matcha, tofu ; pas de lait de coco en salé ; épinards crus seulement ; pas de sucré-salé en salé ; légumineuses sèches, pas de conserve).
5. **Intégration** : pas de doublon (vérifier l'index et les fiches proches — le différencier ou fusionner) ; renvois vers les fiches liées cités en clair (« comme R8 ») pour que les liens se créent ; bon chapitre, bonne sous-catégorie.
6. **Build et QA** : `python3 build.py` puis contrôles — nombre de fiches attendu, zéro ancre cassée, fiche présente dans le sommaire et l'index par type, aucun numéro visible dans le texte rendu, JS valide, contrôle visuel d'au moins une fiche nouvelle.

Le gabarit sert aussi au recalcul des quantités dans la page : `quantites.py` balise toute quantité écrite en gras en tête d'item (`**250 g**`, `**2** œufs`, `**50-60 g**`), et la méthode voit ses rappels de poids suivre le facteur quand ils citent un ingrédient de la fiche. Écrire une quantité hors gabarit la laisse figée — sans danger, mais elle ne s'ajustera pas. Les cuillerées restent figées volontairement : ce sont des assaisonnements, qui ne se multiplient pas linéairement.

`verifie.py` automatise les points mécaniques des alinéas 2 et 5, et tourne d'office au début de chaque build. Il contrôle : structure de fiche selon la famille (R/T/W au gabarit Ingrédients + Méthode, G au tableau des trois notes, K en blocs libres), ligne meta présente, macros présentes sauf mention « macros non comptées », chaque poids de la liste rappelé dans la méthode (le total du groupe vaut rappel pour ses composants), numéros ni dupliqués ni réattribués, renvois pointant vers une fiche réelle, sous-catégories `Salé · X` / `Sucré · X` / `Bases · X`. Il affiche aussi les prochains numéros libres.

Une **erreur** arrête le build : rien n'est produit, donc rien n'est déployé. Un **avertissement** laisse construire. `python3 verifie.py` seul donne le rapport sans construire ; `--strict` fait échouer aussi sur les avertissements.

`macros.py` recoupe les macros déclarées, sans donnée extérieure : une fiche annonce ses calories deux fois (pour 100 g et par part), les deux doivent retomber sur le même total. `python3 macros.py` sort le tableau des écarts, `python3 macros.py R7 R20` se limite à des fiches.

**C'est un diagnostic, pas un verdict.** Quatre causes de divergence sont légitimes et illisibles depuis la fiche : la perte à la cuisson (les macros portent sur le cuit, le total sur le cru), les parties non comestibles (os, peau), le rendement composé (« 4 pâtons, 16 crackers chacun » fait 64 crackers), les ingrédients non pesés. L'écart médian du carnet est de −10 %, exactement la perte de cuisson documentée au §2 : une fiche proche de cette médiane se comporte normalement.

**Tout ingrédient qui pèse doit être pesé.** « 2 pommes » n'entre dans aucun total et ne suit pas le recalcul de la page. Écrire le poids, le dénombrement entre parenthèses : `**300 g** · pommes tranchées finement (2 pommes)`. Conventions retenues le 2026-09-16, à ajuster si le calibre diffère : **une pomme ≈ 150 g**, **une banane ≈ 100 g de chair** (une banane entière pèse ≈ 150 g, dont 35 à 40 % de peau). Ces deux valeurs sont celles que les macros déjà déclarées du carnet impliquaient.

Un seul de ces quatre points est contrôlé automatiquement parce qu'il est objectif : un ingrédient **dénombré sans poids** (« 2 pommes ») dans une fiche qui déclare des macros. Il n'entre dans aucun total, fausse les macros et empêche tout recoupement. Les assaisonnements dénombrés — une gousse, un cube, une pincée — sont ignorés.

Ce que rien ne contrôle, et qui reste à ta charge : la véracité d'une température ou d'un geste, le **calcul** des macros lui-même (il faudrait la table Ciqual, absente du dépôt), et l'absence de doublon de recette.

## 6. Workflow : de la discussion à l'intégration

1. **Discussion libre** — on met au point la recette dans n'importe quelle conversation du projet, sans format imposé.
2. **« Intègre au carnet »** — Claude produit : la fiche complète au gabarit, le numéro attribué, le chapitre proposé, le résultat de la checklist §5 (écarts signalés, rien de masqué). Aucune écriture tant que ce n'est pas montré.
3. **« Valide »** (ou corrections, appliquées directement) — Claude insère la fiche dans `carnet-kefir-levain.md`, met à jour build.py si l'index doit apprendre un terme, rebuild, QA, incrémente la version, trace dans PASSATION.md, livre les fichiers.
4. **Claude met à jour le maître dans git** — le maître est `carnet-kefir-levain.md`, versionné dans le dépôt `kaliellecc-a11y/carnet`. Zéro manipulation pour Céline. Procédure Claude, dans cet ordre :
    1. En début de tâche : `git pull` sur la branche de travail. Le dépôt fait foi — jamais une copie locale, un fichier joint ou une pièce jointe Notion.
    2. Après « valide » : build + QA en local, puis commit du md, de build.py si l'index a appris un terme, et de PASSATION.md. Ne jamais commiter avant que la QA locale soit verte. Le message de commit porte la version et le résumé du changement.
    3. Un commit = une intégration cohérente. L'historique git remplace la ligne « Historique » et les MD5 recopiés à la main : `git log` et `git diff` donnent la même information sans risque de désynchronisation.
    4. Le dépôt contient tout le projet : le md maître, build.py, style.css, app.js, firebase-init.js, RÈGLES-RECETTES.md, PASSATION.md. Les HTML produits restent hors du dépôt (`.gitignore`).
5. **« Republie »** — pipeline complet : build, QA, puis mise en ligne sur Netlify. Jamais déclenché sans ce mot. Pas d'étape PDF : le carnet se consulte en ligne.

Mots-clés du projet : `intègre au carnet` · `valide` · `republie` · `complète les macros` (chantier de rattrapage des macros sur les fiches antérieures à v10).

## 7. Modifier une fiche existante

Même workflow, mêmes vérifications ; le numéro ne bouge pas ; un changement de quantités impose de recalculer meta, macros et rappels de poids dans la méthode. Une correction de fond (erreur avérée) se fait sans demander ; un changement de goût se propose d'abord.
