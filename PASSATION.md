# Passation — Carnet de fournil

Dossier de reprise pour continuer ce projet dans une autre conversation, sans avoir à réexpliquer le contexte.

## Source de vérité — le dépôt git (2026-09-15)

**Le maître est `carnet-kefir-levain.md` dans le dépôt https://github.com/kaliellecc-a11y/carnet**, branche `main`. Toute conversation commence par un `git pull` — jamais par une copie locale, un fichier joint ou la pièce jointe Notion.

Le dépôt porte tout le projet : le md maître, `build.py`, `style.css`, `app.js`, `firebase-init.js`, `REGLES-RECETTES.md`, `PASSATION.md`. Les HTML produits par le build restent hors du dépôt (`.gitignore`) — `build.py` les régénère.

Bascule vérifiée : le md versionné porte le MD5 `a91ec147f8249c5980d925d754312bd9` (68 fiches), celui du maître v11, et `python3 build.py` reproduit `carnet-de-fournil.html` et `.standalone.html` à l'octet près.

Ce que git remplace : la page Notion « MAÎTRE », le cycle `create_file_upload` + curl, les MD5 recopiés à la main et la ligne « Historique » de la page. `git log` et `git diff` donnent la même information, sans risque de désynchronisation entre deux copies. Les entrées Notion plus bas dans ce document sont conservées comme historique daté — elles ne décrivent plus le fonctionnement courant.

**PDF abandonné (2026-09-15)** : le carnet se consulte en ligne. `pdf.js` n'est pas repris dans le dépôt et l'étape PDF sort du pipeline. Le `.standalone.html` reste produit — il sert la mise en ligne et la consultation d'un fichier hors réseau.

## Le poids qui cuit n'est pas celui de la liste (2026-09-19) — v11.5

**R34 recalée sur une pesée réelle.** Céline a pesé l'appareil : **1 600 g** une fois
les pommes de terre essorées et le reste incorporé. Les 1 450 g râpés perdent donc
**345 g d'eau**, soit 24 % — le « un quart » du chapeau était juste, et l'estimation
initiale (1 655 g) tombait à 3 % près. La densité passe de 130 à **134 kcal pour
100 g** ; les 330 kcal par part ne bougent pas. Les galettes se forment en tas de
**65 à 70 g** et non de 70 g pile, pour que les 24 pièces tombent juste.

**Nouveau bloc dans deux fiches : l'écart entre le poids annoncé et le poids qui
cuit, avec son effet sur la cuisson.** C'est ce que le recoupement des macros a mis
en évidence une fois `macros.py` réparé (v11.4), et ce que ni le gabarit ni les
pièges ne disaient nulle part.

- **R34** : le nombre de galettes et de fournées se calcule sur les 1 600 g
  d'appareil, jamais sur le poids du sac. Une galette formée sur le poids d'avant
  essorage est trop épaisse, et les 3 min par face ne suffisent plus.
- **W5** : sur 3 000 g bruts il reste environ la moitié dans l'assiette, entre les
  graines, la chair prélevée pour les midis et la peau. Surtout, **la cuisson suit
  l'épaisseur de paroi, pas le poids** — une demi-courge plus large cuit dans le
  même temps, une paroi de 3 cm au lieu de 2 demande 15 min de plus. Doubler une
  quantité ne double jamais un temps de cuisson : le carnet ne le disait nulle part.

Reste ouvert, non fait faute d'accord : étendre le même bloc à W2, T6 et W3, qui
portent le même écart (os de volaille, peau et graines de potimarron), et en faire
une règle du §5 de REGLES-RECETTES.md pour que le réflexe soit systématique.

R34 ressort à −26 % au recoupement : c'est l'eau essorée qui quitte le plat, la
cause 1 que `macros.py` documente. `verifie.py` vert sur 75 fiches, les cinq suites
JS passent, le carnet s'ouvre réseau coupé.

## macros.py réparé : de 1 à 34 fiches recoupables (2026-09-19) — v11.4

Le recoupement des macros ne portait que sur une poignée de fiches, pour deux
raisons distinctes, toutes deux corrigées.

**Les poids à quatre chiffres n'étaient pas lus.** La racine était dans
`verifie.py` : `POIDS_G` n'acceptait pas l'espace des milliers, si bien que
`1 450 g` ne comptait pour rien dans le total cru, et que `POIDS_DANS_TEXTE`
n'y voyait que `450 g`. Un motif `MILLIERS` accepte désormais l'espace normale,
l'insécable et la fine insécable, mais **seulement en groupement strict** (1 à
3 chiffres, puis des tranches de 3) : sans cette rigueur, « 8 boules de 100 g »
serait devenu 8 100 g. Une fonction `nombre()` normalise les deux lectures, celle
de la liste et celle des rappels, pour qu'elles ne puissent plus diverger.

**Une meta annonçant les protéines par part n'était pas recoupable.** `KPART`
exigeait `kcal par <mot>` sans rien entre les deux, ce qui excluait la forme
« ≈ 330 kcal et 10 g de protéines par part » que le gabarit autorise pourtant.
Le motif accepte maintenant les deux écritures.

**Résultat : 34 fiches recoupables au lieu d'une, et l'écart médian reste à
−10,3 %.** C'est le meilleur signe que la correction est bonne — la référence du
carnet n'a pas bougé, l'échantillon a simplement cessé d'être minuscule.

Deux défauts que le bug masquait, corrigés dans la foulée :

- **W3** ne rappelait jamais ses 1 400 g de potimarrons dans la méthode. Les deux
  côtés lisant « 400 g » par accident, le contrôle passait. Erreur avérée, donc
  corrigée sans demander (§7).
- **W5** comptait deux fois : les 600 g de chair prélevée sortent des 3 000 g de
  courge, ce n'est pas un ingrédient supplémentaire. La ligne quitte la liste, le
  poids reste dans la méthode.

Ce que le recoupement montre maintenant, et qui est **légitime** : W5 (−40 %),
W2 (−30 %) et T6 (−26 %) portent de grosses parties non comestibles — peau et
graines de courge, os de volaille ; R28 et R29 (−80 %) ont un rendement composé.
Ce sont les causes 2 et 3 que le fichier documente lui-même. Diagnostic, pas
verdict.

`verifie.py` vert sur 75 fiches, les cinq suites JS passent, le carnet s'ouvre
réseau coupé.

## Deux pâtes sans levant (2026-09-19) — v11.3

Le carnet passe à **75 fiches**. Les deux entrées comblent le même trou : que faire
quand il n'y a ni kéfir, ni levain, ni envie d'attendre.

- **R33**, naans au yaourt, sans levain. C'est la première pâte du carnet qui ne
  suppose aucun levant. Le raisonnement tient au tableau « Quel levant pour quoi » :
  une pita ou un naan gonfle **à la vapeur**, le levant ne sert qu'à la souplesse —
  et le yaourt la donne aussi bien. Sans fermentation pour détendre le réseau, ce
  sont le pétrissage (8-10 min, non négociable) et les 6 h de repos qui font tout.
  La levure chimique est écartée pour une raison technique et pas seulement par
  principe : son gaz part avant la cuisson et ne laisse qu'une mie friable, à
  l'opposé de la souplesse que le pétrissage vient de construire.
- **R34**, galettes de pommes de terre et oignon, à l'œuf. Nouvelle sous-catégorie
  **Salé · Galettes** : les pommes de terre n'existaient au carnet qu'en quartiers
  ou en cubes rôtis, jamais râpées. Le geste qui décide de tout est l'essorage, et
  la récupération de l'amidon décanté dans l'eau rendue — c'est lui qui lie, à la
  place de la farine.

`build.py` apprend trois entrées d'index : **yaourt** rejoint « skyr · fromage
blanc », plus **oignon** et la technique **dégorger et essorer**. Les comptes des
tests passent de 73 à 75.

**Deux limites de `macros.py` repérées à cette occasion, non corrigées.** Un poids
à quatre chiffres écrit avec une espace (`1 450 g`, `1 400 g` de W3, `2 000 g` de
T11) n'est pas compté dans le total cru. Et une meta qui annonce les protéines par
part n'est pas recoupable, le motif attendant `kcal par <mot>` sans rien entre les
deux — W4, T3 et W5 sont dans ce cas. R34 cumule les deux et ressort « non
recoupable ». Ce sont des limites de l'outil de diagnostic, pas des erreurs de
fiche, mais elles rendent les macros des grosses fournées invérifiables : à traiter
séparément.

`verifie.py` vert sur 75 fiches, R33 recoupée à −8,4 % (la perte à la cuisson en
explique −10 %), les cinq suites JS passent, le carnet s'ouvre réseau coupé.

## Cinq fiches et la rubrique Fournées (2026-09-18) — v11.2

Le carnet passe de 68 à **73 fiches**. Cinq entrées, une variante et une rubrique
neuve, toutes nées d'une semaine réelle : une grosse courge muscade à écouler,
un apéro tous les soirs et deux profils de macros à tenir.

- **W5**, courge muscade farcie au fumoir. La chair nue prend la fumée pendant que
  les granulés brûlent ; la farce crème-feta-lardons n'arrive qu'aux trois quarts
  de la cuisson, quand la fumée s'épuise. Vérifié en ligne : les granulés brûlent
  *pendant* la cuisson, 30-45 min au-dessus de 190 °C et 60-90 min en dessous —
  une purge de 10-15 min avant d'enfourner, pratique courante pour les grosses
  pièces de viande, mangerait ici un quart de la fenêtre de fumée.
- **T10**, tartinade de pois cassés au chorizo. Le chorizo est poêlé à part et son
  huile versée dessus ; mélangé dans la masse, le gras se dilue. Pas de variante
  conserve, et la fiche dit pourquoi (§2 bis) : le pois cassé ne trempe pas et la
  conserve n'existe quasiment pas.
- **T11**, oignons confits, 2 kg au robot, 18 portions congelées. Miel et vinaigre
  en fin de course seulement — mis tôt, le sucre brûle avant que l'oignon fonde.
- **R32**, pains plats farcis à l'emmental, sur la pâte de R12 × 1,5. Fromage frais
  à tartiner plutôt que skyr : le skyr du commerce fait éclater le naan à la poêle.
- **G17**, vanille HiPro, avec une **note 5** propre à cette fiche — socle de la
  note 4, ses trois jaunes, plus la crème légère. Macros calculées sur une étiquette
  supposée à 55 kcal et 10,5 g de protéines pour 100 g : c'est dit dans les pièges,
  tout le tableau en dépend.
- **R21** gagne une variante noisette : 40 g de poudre torréfiée, maïzena descendue
  de 25 à 15 g parce que la poudre absorbe, et 30 min fermes au lieu de 25-30.

**Rubrique « Fournées »**, en fin de chapitre 1, à côté de « Semaine type kéfir +
levain ». Elle décrit un week-end de production qui couvre cinq jours : trois
appareils, trois files d'attente, le travail des mains glissé dans les temps de
machine. Deux règles de placement en sortent — ce qui pousse part la veille, et
tout ce qui fume passe le week-end. Première entrée : la fournée muscade et fumoir.
Rubrique à l'essai : à garder si le format tient sur une deuxième fournée.

Ordre du dimanche trouvé en cherchant le chemin critique : le flan cuit **en
premier**, sur une cuve propre, parce qu'un flan passé après le fumoir prend le
résidu de fumée.

`build.py` apprend quatre entrées d'index : pois cassés, chorizo, emmental,
oignons confits. Les comptes codés en dur des tests (`test-courses`,
`test-recherche`, `test-hors-ligne`) passent de 68 à 73 — ils échouaient sur le
nombre, pas sur le comportement. `verifie.py` vert, écart médian inchangé à
−10,3 %, les cinq suites JS passent, le carnet s'ouvre réseau coupé.

## Légumineuses : la conserve entre au carnet (2026-09-17)

La règle disait « légumineuses sèches, pas de conserve ». Elle tombe : la conserve est la version de semaine, le sec reste la référence du goût, et **toute fiche à légumineuses porte désormais les deux voies**. Le choix se fait le soir devant le placard, pas au moment d'écrire la fiche.

Nouveau **§2 bis** de REGLES-RECETTES.md. Une variante conserve doit préciser quatre choses, aucune facultative : l'équivalence en grammes (sec × 2,4 = cuit ; une boîte de 400 g brut ≈ 240 g égouttés), le liquide à retirer (≈ 250 g d'eau pour 250 g de sec remplacés — la conserve n'absorbe plus), le temps gagné en distinguant trempage et cuisson, et **ce qu'on perd**.

Ce dernier point est celui qui manque partout ailleurs : une légumineuse sèche cuit *dans* le bouillon et s'en imprègne ; la conserve arrive neutre et molle, et se délite si on remue. La variante dit comment compenser — épices montées d'un cran, rinçage de la saumure qui sale et masque.

Trois fiches touchées :

- **T3**, pois chiches : variante 600 g en conserve, eau de 600 à 150 g, Mijoté 10 min au lieu de 30. Le plat passe de 1 h 15 hors trempage à 35 min le soir même.
- **T5**, chili : variante 480 g de haricots en conserve, eau de 400 à 100 g, Mijoté 10 min. 40 min le soir. C'est aussi la version sûre — la conserve est stérilisée, la toxicité du haricot rouge cru ne se pose plus.
- **T4**, lentilles vertes : pas de variante, et la fiche dit pourquoi. Les lentilles ne trempent pas et cuisent en 12 min sous pression ; la boîte ferait gagner dix minutes contre une texture molle.

Les macros par part ne changent pas d'une voie à l'autre — même quantité de légumineuse dans l'assiette. Seule la densité pour 100 g monte d'environ 5 % en conserve, le plat étant moins mouillé : c'est dit dans les fiches plutôt que recalculé en double.

Détail d'écriture repéré au rendu : les poids cités dans une variante ne doivent jamais être entre parenthèses. `quantites.py` balise tout poids entre parenthèses qui correspond à un ingrédient de la fiche, et « 2 boîtes de 400 g » serait devenu « 2 boîtes de 800 g » en doublant la recette. Les substitutions s'écrivent après un tiret cadratin, hors parenthèses, pour rester figées.

`verifie.py` vert sur 68 fiches, écart médian inchangé à −10,3 %, build reproduit.

## Câpres, gingembre et coriandre retirés des fiches (2026-09-17)

La liste d'aversions du §5.4 de REGLES-RECETTES.md interdisait déjà gingembre, coriandre et anis ; câpres et curry l'ont rejointe le 2026-09-16. Quatre fiches la contredisaient encore.

- **R31**, rillettes de thon : les 15 g de câpres retirés. Le total passe de 475 à 460 g, les parts de 80 à 77 g. Macros recalculées sur le nouveau total — 89 kcal et 17,5 g de protéines pour 100 g, 69 kcal et 13,5 g par part : les câpres pesaient 3 % du poids pour ~4 kcal, d'où la densité qui monte légèrement. La méthode disait « les câpres salent déjà » ; c'est la moutarde qui tient ce rôle maintenant.
- **R3**, cake protéiné : la variante « carotte râpée + gingembre » devient « carotte râpée + cumin ».
- **R12**, naans : la coriandre disparaît de la finition, le beurre à l'ail reste.
- **R15**, sorbet kéfir : la variante au kéfir F2 gingembre supprimée.

R31 perd son point acidulé sans compensation : moutarde et citron restent seuls à porter le pointu. Si la prochaine fournée la trouve plate, monter la moutarde à 15 g est le geste à tenter — un changement de goût, donc à décider en cuisine, pas ici.

`verifie.py` vert sur 68 fiches, écart médian de `macros.py` inchangé à −10,3 %, build reproduit.

## Renvoi vers le skyr maison (T1) dans toutes les fiches au skyr (2026-09-16)

T1 existait déjà et était renvoyé depuis trois endroits seulement : R25, R27 et la prose de R28. Les quinze autres fiches qui emploient du skyr le laissaient croire réservé au commerce.

Chaque ligne d'ingrédient au skyr porte maintenant le renvoi : R1, R12, R23, R24, R25, R29, R30, R31, R16, B5, T2, T3, T6, W3, W4. La forme est `, ou T1` en fin de ligne — R29, qui écrivait déjà « skyr maison », prend `(T1)`. R27 et R28 gardent leur renvoi existant.

Deux raisons de placer le renvoi après une virgule : `courses.js` coupe le libellé à la première virgule, donc « skyr nature » reste une seule ligne de courses ; et le renvoi s'affiche en clair (« Skyr maison ») sans alourdir la lecture de l'ingrédient.

Aucune quantité, aucune macro touchée. `verifie.py` vert sur 68 fiches, `macros.py` inchangé (écart médian −10,3 %), build reproduit. `test-hors-ligne.cjs` non lancé : son module Node manque dans l'environnement de session — le changement ne touche ni `sw.js` ni les JS.

## Fruits pesés dans R3, R4, R20, R21 (2026-09-16)

Les pommes et bananes de ces quatre fiches étaient dénombrées, pas pesées : hors des totaux, hors des macros, et figées au recalcul de la page. Elles portent maintenant un poids, le dénombrement passant entre parenthèses.

Conventions : **une pomme ≈ 150 g**, **une banane ≈ 100 g de chair**. Deux justifications indépendantes qui convergent — une banane entière pèse ≈ 150 g dont 35 à 40 % de peau, soit ≈ 95-100 g de chair ; et le poids de fruit qu'il faudrait pour que chaque fiche retombe sur la médiane du carnet donne 146 et 158 g pour les pommes, 97 g pour la banane de R4.

Les quantités réelles n'ont pas changé, seulement leur écriture : **les macros déclarées sont donc inchangées**, et c'est justement ce qui se vérifie. R3 et R4 passent à −10,3 % d'écart (la médiane du carnet), R20 à −8,7 %, R21 à −1,7 % — un flan en bain-marie perd moins qu'une fournée au four. Les fiches proches de la médiane passent de 10/20 à 13/20.

`verifie.py` ne signale plus rien. Carnet passé en **v11.1** (2026-09-16) : aucune recette n'est modifiée, seule leur rédaction est précisée — d'où la décimale plutôt qu'une version pleine.

## Macros : recoupement, pas calcul (2026-09-16)

`macros.py` recoupe les deux annonces caloriques d'une fiche (pour 100 g, par part) et signale les écarts. Sans donnée extérieure : c'est le seul contrôle de macros possible tant que la table Ciqual n'est pas dans le dépôt.

Résultat sur le carnet : **écart médian −9,9 %**, ce qui correspond très exactement à la perte de cuisson de ~10 % documentée au §2 — le modèle se valide de lui-même.

Quatre causes de divergence légitimes, aucune lisible depuis la fiche : perte à la cuisson (très supérieure à 10 % pour un cracker déshydraté, cf. R28/R29), parties non comestibles (os et peau de W2), rendement composé (R28 : « 4 pâtons, 16 crackers chacun » fait 64 crackers, pas 16), ingrédients non pesés (R3, R4, R20, R21). C'est pourquoi l'outil est un diagnostic à lancer à la main, pas un contrôle bloquant.

Seul le quatrième point est contrôlé automatiquement, parce qu'il est objectif : `verifie.py` avertit lorsqu'une fiche à macros contient un ingrédient dénombré sans poids (« 2 pommes »). Quatre fiches concernées aujourd'hui — les peser rendrait leurs macros justes et leur recoupement possible.

**Ce qui manque pour calculer vraiment les macros :** la table Ciqual. `ciqual.anses.fr` est bloqué par le proxy réseau des sessions Claude Code, et remplir une table de composition nutritionnelle de mémoire n'est pas acceptable. Le jour où l'export officiel (XLSX ou XML) est déposé dans le dépôt, le calcul automatique devient possible.

## Synthèse du journal (2026-09-16)

Le journal des fournées était rempli fiche par fiche et jamais relu d'ensemble : savoir ce qui attendait une correction demandait d'ouvrir les 68 fiches. Une section en fin de page, avec son entrée de sommaire, en fait la synthèse.

**« À reprendre »** est le bloc qui compte : les recettes dont la *dernière* fournée est ratée ou à corriger. Une recette ratée puis réussie en sort — c'est le dernier essai qui dit où en est la recette, pas l'historique. Suivent le décompte par verdict, les dix dernières fournées et les plus refaites.

Les entrées sont lues **dans la page**, pas dans Firestore : la synthèse marche donc aussi quand les notes sont en localStorage, et ne duplique pas la logique d'app.js. Elle se recalcule sur `MutationObserver` posé sur les seules listes `.entries` — observer toute la page l'aurait relancée à chaque recalcul de quantité.

QA (`node test-journal.cjs`) : 20 contrôles — journal vide, décomptes, période, tri par date, notes, liens vers les fiches, plus refaites, et le cas décisif : une fiche ratée puis validée ne figure pas dans « à reprendre », et valider la dernière en attente vide le bloc.

## Liste de courses (2026-09-16)

Une case « courses » par fiche ; les ingrédients des fiches cochées s'additionnent aux quantités réglées, dans un panneau copiable d'un bouton.

Le facteur est figé au moment où l'on coche, comme un panier. La sélection vit dans `localStorage` — éphémère comme le recalcul, elle n'aurait servi à rien entre la cuisine et le marché.

Le regroupement était le vrai sujet. Clé : le libellé nettoyé de sa quantité, de ses parenthèses, et de tout ce qui suit un tiret cadratin ou une virgule. « farine T65 » et « farine T65 — de gruau ou "forte" si possible » s'additionnent ; R8 cumule d'elle-même ses 100 g de levain-mère et ses 350 g de pâte, soit 450 g. **Rien ne fusionne deux écritures différentes** : « zeste d'orange ou de citron » et « zeste d'un citron » restent deux lignes, ce qui est juste. Une ligne en trop se corrige au magasin ; une fusion abusive ne se voit pas.

`echelle.js` expose `window.carnetEchelle.facteur(rid)` — la seule chose qu'il donne au reste de la page.

Arrondi : au-delà du kilo la liste affiche des kg, à 10 g près. Au dixième de kilo, 1 150 g devenait « 1,2 kg », soit 50 g de farine en trop.

QA (`node test-courses.cjs`) : 16 contrôles — cumul dans une fiche et entre fiches, regroupement des libellés précisés, titres de groupe exclus, dénombrements sans unité, ingrédients non pesés conservés, facteur répercuté, persistance après rechargement, tout décocher.

## Recherche (2026-09-16)

Un champ en tête du sommaire filtre les 68 fiches à la frappe. Il porte sur **tout le texte** d'une fiche, pas seulement sur les termes indexés à la main : « bain-marie » trouve ses 4 fiches alors que ce n'est pas une entrée d'index.

Accents et casse ignorés, plusieurs mots se cumulent (intersection), le sommaire se filtre en même temps, les titres de chapitre et de sous-catégorie restent affichés au-dessus des résultats — sans quoi on ne sait plus d'où vient une fiche. Les index sont masqués pendant une recherche. `/` met le curseur dans le champ sauf si l'on écrit déjà ailleurs, `Échap` efface.

L'index est construit dans le navigateur au chargement plutôt qu'au build : le précalculer aurait doublé le poids de la page. Il se reconstruit dès que le nombre de fiches change, ce qui couvre les **recettes personnelles** — elles arrivent de Firestore après le chargement, et sans cela elles seraient restées introuvables.

QA (`node test-recherche.cjs`) : 19 contrôles — filtrage, sommaire synchrone, index masqués, titres conservés, insensibilité aux accents et à la casse, recherche dans la méthode, intersection de deux mots, aucun résultat, remise à zéro, recette personnelle ajoutée après coup, raccourci clavier respectant une saisie en cours.

## Hors ligne (2026-09-16)

Le carnet s'ouvre désormais sans réseau et s'installe sur l'écran d'accueil.

La limite notée en v11 — « une note écrite hors ligne ne remonte pas automatiquement au retour du réseau » — venait de **trois verrous en série**, pas d'un défaut de Firestore : sans réseau la page ne chargeait pas du tout, donc Firebase n'était jamais initialisé ; le garde `!navigator.onLine` de `firebase-init.js` empêchait de charger le SDK ; et ce SDK venait d'un CDN non mis en cache. La persistance IndexedDB, elle, était déjà activée depuis v11.

Les trois sont levés : `sw.js` garde la page, les polices et le SDK Firebase ; le garde a été retiré ; `hors-ligne.js` enregistre le service worker et signale l'état du réseau dans le bandeau.

Le service worker ne touche **jamais** aux appels Firestore (`firestore.googleapis.com` et voisins passent sans interception) : s'interposer casserait la file d'attente que le SDK gère déjà.

Page servie **réseau d'abord** : une publication fraîche prime toujours, le cache n'est qu'un filet. `netlify.toml` sert `sw.js` en `no-cache`, sans quoi un service worker figé par le cache HTTP bloquerait le site sur une version. `build.py` assemble maintenant `dist/` lui-même (page, service worker, manifeste, icônes) plutôt que par des `cp` dans le toml : le service worker doit être à la racine pour couvrir tout le site.

QA (`node test-hors-ligne.cjs`, serveur local sur `dist/`) : 10 contrôles — service worker actif, page en cache, 68 fiches affichées réseau coupé, styles et sommaire présents, recalcul des quantités fonctionnel hors ligne, bandeau d'état dans les deux sens, note acceptée sans plantage. Propagation d'une nouvelle version vérifiée aussi.

**Non vérifiable depuis une session Claude Code** : la mise en cache du SDK Firebase et la file d'attente Firestore hors ligne, `gstatic.com` étant bloqué par le proxy réseau. Le mécanisme est en place ; à confirmer en vrai sur le site, mode avion, en écrivant une note puis en rétablissant le réseau.

## Recalcul des quantités (2026-09-16)

Chaque fiche porte un bandeau de réglage : compteur de parts, ou clic sur une quantité de la liste pour partir de ce qu'on a sous la main. Éphémère, rien n'est enregistré.

`quantites.py` balise les quantités au build — l'analyse se fait sur le markdown, pas dans le navigateur : une quantité que le build ne comprend pas reste figée, ce qui se voit, plutôt que d'être recalculée à tort, ce qui ne se voit pas. `echelle.js` n'a plus qu'à multiplier des valeurs déjà propres.

Suivent le facteur : la liste, les rappels de poids de la méthode, le rendement. Restent figés : durées, températures, dimensions de moule, cuillerées, et les macros (les kcal par part sont invariantes, la part gardant sa taille).

Trois pièges traités :
- **Édition.** Passer en édition rétablit d'abord les quantités d'origine, sinon un enregistrement fait pendant un recalcul figerait les quantités ajustées dans la recette elle-même. L'interception est en phase de capture, donc avant qu'`app.js` ne relève le contenu.
- **Rappels étrangers à la recette.** Un poids de la méthode n'est balisé que s'il correspond à un ingrédient de la fiche ; « garder 50 g de levain au froid » ne bouge pas.
- **Meta en liste blanche.** Seules une unité de portion connue et un poids en grammes sont balisés. Une liste d'exclusions laissait passer « 24 lip » (des lipides) et « 2 semaines » (une conservation).

QA : `node test-echelle.cjs` (après `npm install playwright`) — 16 contrôles dans Chromium, rendu mobile vérifié sans débordement.

## Lien du carnet (source de vérité vivante)

**https://carnet-de-recettes-celine.netlify.app** — site Netlify (projet `carnet-de-recettes-celine`, siteId `667569cd-4577-48ba-978f-2cb5bf1e48a4`, forfait gratuit). C'est l'adresse à ouvrir sur tous les appareils depuis le 2026-09-11.

**Déploiement continu depuis git (2026-09-16, en service).** Le site est relié au dépôt : un push sur `main` déclenche la construction et la mise en ligne. Premier build git vert le 2026-09-16 à 08:47 (commit 36ad6a7, 11 s) — Netlify a lu `netlify.toml` et produit un fichier identique au v11 déjà en ligne, ce qui vérifie que `build.py` tourne bien sur leurs serveurs. Plus de `deploy-site` à la main, plus de dossier `site/`. La configuration vit dans `netlify.toml` :

```
pip install -r requirements.txt && python3 build.py && mkdir -p dist && cp carnet-de-fournil.standalone.html dist/index.html
```

Publié : `dist/`. Pas de `PYTHON_VERSION` épinglée — `build.py` tourne dès Python 3.8 et toutes les images Netlify en fournissent une plus récente.

Liaison faite le 2026-09-16 (Project configuration → Déploiement continu → Dépôt → Link repository). Branche de production : `main`.

Le déploiement remplace le contenu du site ; les notes vivent dans Firestore et ne sont jamais touchées. Un build qui échoue ne déploie rien : la version en ligne reste celle du dernier build vert.

Repli manuel si besoin : `deploy-site` via le connecteur Netlify avec ce siteId, depuis un dossier contenant le HTML buildé en `index.html`.

Notes, journal des fournées et modifications de recettes : base Firestore du projet Firebase `carnet-recettes-3f0e0`, partagée entre le site Netlify et tout fichier HTML téléchargé. Accès ouvert sur le seul dossier `carnet`, sans authentification (choix de Céline). Le site Netlify est public pour qui connaît l'adresse — mot de passe possible via `update-visitor-access-controls` si elle le demande.

Ancien Artifact (figé en v6.1, notes séparées dans la base Claude) : https://claude.ai/code/artifact/e3b45d45-0ca3-4d43-b826-3fe08be9f851

Page privée, accessible depuis tous les appareils connectés au compte de Céline. Édition directe possible sur la page elle-même (bouton « Modifier la recette », notes, journal des fournées, section « Carnet de notes ») — synchronisée entre appareils sans passer par Claude. Pour ajouter une fiche complète et bien formatée, il faut passer par une conversation Claude.

**État publié : v11.1 sur Netlify (2026-09-16).** L'Artifact reste figé en v6.1. **v11 validée le 2026-09-11 (HTML + standalone livrés).** PDF abandonné depuis le 2026-09-15 (consultation en ligne). Testé en réel sur le site en ligne : 68 fiches, HTTPS, bandeau synchronisé, écriture d'une note depuis le site relue dans le fichier local, rendu mobile sans débordement horizontal.

**~~⚠ Maître Notion NON mis à jour en v11~~ — résolu autrement le 2026-09-15** : plutôt que de rattraper Notion, le maître v11 (`carnet-kefir-levain.md`, MD5 a91ec147f8249c5980d925d754312bd9, 68 fiches) a été versionné dans git, qui fait foi désormais. La page Notion « Carnet de recettes — MAÎTRE » (3d78c668-27b7-81a0-9416-ec81354c4eb1) reste figée au v10 et n'est plus à jour : ne plus s'en servir comme source.

v11.1 (2026-09-16) — outillage et fruits pesés : `verifie.py` (contrôle des fiches, bloquant au build), `quantites.py` + `echelle.js` (recalcul des quantités dans la page), `macros.py` (recoupement des macros déclarées). Pommes et bananes pesées dans R3, R4, R20, R21. Déploiement continu depuis git. Aucune recette modifiée.

v11 (2026-09-11) — restructuration par appareil + 22 fiches + synchronisation Firebase :
- **Rangement** : 4 chapitres par appareil (1. Cuisson traditionnelle · 2. Ninja Woodfire · 3. Turbo Cuisine · 4. Ninja Creami), sous-catégories `Salé · type` / `Sucré · type` / `Bases · sujet`. Les bases ouvrent le chapitre qui les emploie. Recette sur deux appareils : chapitre de la cuisson principale.
- **Numéros cachés à l'affichage** : titres, sommaire, index et renvois montrent le nom de la fiche ; les numéros restent les identifiants (ancres, notes, journal Firestore). Dictionnaire `COURT` dans build.py pour les noms qui tombent mal (K1, K2, W3, T3, T4). Dans le maître on écrit toujours le numéro.
- **22 fiches** : R22-R27 (eau d'avoine, boissons chaudes, crème), R28-R29 (crackers Woodfire), R30-R31 (rillettes), W1-W4 (Woodfire), T2-T9 (Turbo, dont fusions S6d + automne 2 → T3 à deux finitions, automne 3 + S4 → T4). Toutes en niveau B. Macros recalculées (Ciqual), pas recopiées.
- **G9 matcha retirée**, numéro non réattribué. « Les seize parfums » → quinze.
- **Corrections** : protéines fausses sur T9 (≈ 40 g/part sur 3 parts, pas 35 sur 2), T8 (≈ 50 g), T7 (≈ 41 g) ; Rissolé ajouté à T9 ; piège sécurité haricots rouges (T5) ; piège « sel = pois chiches fermes » retiré (contesté) ; intro avoine réécrite (deux usages de l'amidon, R26-R27 lient au frémissement).
- **T1** : meta 14-24 h + paragraphe « Réglage de l'acidité » (6-7 h / 8-10 h / 12 h).
- **build.py** : index par type de plat (depuis les titres h3), 11 ingrédients et 7 techniques ajoutés, faux positifs corrigés (« c. à café » → café, « empêche » → pêche, renvois comptés comme ingrédients).
- **style.css** : correctif présent depuis v9 — dans les listes d'ingrédients sans groupes, le poids s'affichait comme un titre de groupe.
- **Firebase** : nouveau fichier `firebase-init.js` (config du projet `carnet-recettes-3f0e0`, injecté par build.py avant app.js). app.js tente d'abord la base Claude (Artifact), puis Firebase (fichier HTML hors Artifact), puis localStorage. Règles Firestore ouvertes sur le seul dossier `carnet` (mode « simple », sans authentification — choix de Céline). Testé en réel : écriture puis relecture dans une session neuve, journal des fournées, mode hors ligne (bandeau « sur cet appareil seulement », aucun plantage). Limite connue : une note écrite hors ligne ne remonte pas automatiquement au retour du réseau.
- **Fichiers à remettre dans le projet** : build.py, style.css, app.js, firebase-init.js, REGLES-RECETTES.md, PASSATION.md.

v10 (build) : maître v10 buildé tel quel. Correctif build.py : la colonne d'ingrédients coupait au premier `</ul>` interne — sur les fiches à groupes, le 2ᵉ groupe fuyait dans la colonne méthode. Extraction désormais équilibrée sur les listes imbriquées.

v10 (build) : maître Notion v10 (MD5 5f5e4323…0332) buildé tel quel. Correctif build.py : la colonne d'ingrédients coupait au premier </ul> interne — sur les fiches à groupes (R4-R8, R11, R17, B1-B3) le 2ᵉ groupe fuyait dans la colonne méthode. Extraction désormais équilibrée sur les listes imbriquées. VERSION build.py ramenée de « v11 » à « v10 » pour coller au maître. QA : 47 fiches, 0 ancre cassée, sommaire et index complets, 17 encarts kéfir, JS valide, PDF 56 pages.

**~~MAÎTRE SUR NOTION (2026-09-10)~~ — périmé depuis le 2026-09-15, voir « Source de vérité » en tête** : la source unique du carnet est la pièce jointe `carnet-kefir-levain.md` de la page Notion privée « Carnet de recettes — MAÎTRE » (page `3d78c668-27b7-81a0-9416-ec81354c4eb1`, file_upload_id courant et MD5 inscrits sur la page). Toute conversation commence par télécharger ce fichier (`download-attachment`) — jamais par une copie locale ou projet. Après un « valide » : nouveau `create_file_upload` + envoi curl, puis mise à jour du bloc fichier et de la ligne Version sur la page. Céline ne manipule plus rien. Détails : RÈGLES-RECETTES.md §6.

**~~Projet allégé (2026-09-10)~~ — le dépôt git porte maintenant le md maître en plus des six fichiers** : le projet contient exactement six fichiers — REGLES-RECETTES.md, PASSATION.md, build.py, style.css, app.js, pdf.js. Le md maître vit sur Notion (voir ci-dessus), pas dans le projet. Les HTML et carnet-de-fournil.md sont des PRODUITS du build : ne jamais les remettre dans le projet, build.py les régénère (doublon .md compris). creami.txt est archivé sur la page Notion MAÎTRE, section Archives (déjà intégré en G1-G16 / B1-B5).

**RÈGLES-RECETTES.md fait référence** pour le gabarit de fiche, les macros obligatoires, la checklist de vérification et le workflow discussion → intégration (« intègre au carnet » → « valide » → « republie »). Le lire avant toute création ou modification de fiche.

v9.1 : le carnet devient officiellement le livre de recettes perso de Céline — titre « Carnet de recettes » (sous-titre conservé), paragraphe de version sous le titre supprimé de la page (l'historique vit ici, la version reste dans le kicker et le colophon). Noms de fichiers et URL d'Artifact inchangés (« carnet-de-fournil » reste l'identifiant technique). — à republier sur demande explicite de Céline.

v7 (corrections + navigation) : erreurs arithmétiques G9/G12 corrigées, allégations sucre/protéines R1·R3·R7·R8·R16 recalculées ; sommaire 3 niveaux, ancres stables (#r14), liens croisés automatiques sur toute référence R/G/B/K/T, double index auto-généré (ingrédients, techniques), retour sommaire par fiche.

v9 (mise en page fiches + titre) : retour de Céline sur capture annotée — les marges latérales mortes sont récupérées (page 1480 px). Chaque fiche R/B + K1/T1 passe en deux zones : colonne d'ingrédients à gauche (liste verticale, poids en gras mono alignés, sticky au défilement), méthode à droite avec chaque poids rappelé entre parenthèses au moment du geste (passe éditoriale fiche par fiche, 62 remplacements). Les G gardent leur tableau 3 notes comme liste d'ingrédients, avec rappels de poids ajoutés dans les méthodes (G2, G3, G5, G9, G14). Sous-titre élargi « pâtes levées, glaces & fermentations — au kéfir de fruits », lead réécrit sur le fil conducteur kéfir (direction 1 validée par défaut). Index en 3 colonnes sur grand écran.

v8 (restructuration) : chapitres par famille — 3. Recettes au kéfir et au levain (R1-R14 + Semaine type + Dépannage des pâtes levées en clôture) · 4. Flans (R17, R20, R21 + conseils bain-marie Woodfire) · 5. Cuisine asiatique (R18-R19) · 6. Glaces et boissons Creami (R15-R16 transformées en versions Creami [Sorbet / Frozen Yogurt marbré, méthode sans machine supprimée], G1-G16, B1-B5, bloc Trucs et astuces) · 7. Kéfir d'eau (conseils remontés en intro de chapitre, retirés de K3) · 8. Turbo Cuisine. Encart « Le kéfir de cette recette » (F1 + lien K1) injecté automatiquement par build.py dans toute fiche R utilisant le kéfir (R1-R17). Aucun numéro de fiche modifié : notes et journal restent synchronisés.

## Politique de travail — IMPORTANT

Céline a demandé explicitement : **enregistrer les corrections/ajouts dans les fichiers sans republier automatiquement**, pour éviter le surcoût de tokens à chaque petit ajout. Ne relancer le pipeline complet (build.py → mise en ligne sur Netlify) **que si elle le demande explicitement** (« mets à jour », « republie », « envoie-moi la version à jour »).

## Contenu du dossier

- `carnet-source/` — fichiers sources à éditer pour toute évolution :
  - `carnet-kefir-levain.md` — le markdown maître (8 chapitres par famille, fiches numérotées ; `carnet-de-fournil.md` est son doublon, à maintenir identique)
  - `build.py` — génère `carnet-de-fournil.html` (pour Artifact) et `.standalone.html` (mise en ligne et export) à partir du markdown + `style.css` + `app.js`
  - `style.css` — design system « Carnet de fournil » (palette crème/brun, Fraunces/Literata/IBM Plex Mono, dark mode, print)
  - `app.js` — logique d'édition/notes/journal synchronisée (capacité `db` de l'Artifact, fallback localStorage)
- `carnet-formats/` — toutes les formes actuelles du carnet : `.md`, `.html` (Artifact), `.standalone.html`
- `recherches-brutes/` — sources utilisées pour construire le carnet : recherche initiale sur le levain/alternatives à la levure, extraction du classeur Creami (glaces), extraction des fiches kéfir d'eau

## Numérotation des fiches

R = kéfir/levain dur · G = glaces Creami · B = boissons Creami · K = fiches kéfir d'eau · T = Turbo Cuisine.
Convention niveau : **A** = pratique établie/convergente entre sources · **B** = adaptation raisonnée, à valider au premier essai.

## Équipement de Céline (à respecter dans toute nouvelle recette)

- **Ninja Creami Deluxe** — glaces/boissons base skyr
- **Ninja Woodfire** — flans au bain-marie (plat moyen posé dans un grand plat d'eau chaude, mode vapeur/four). C'est là que se font les flans, pas au Turbo Cuisine.
- **Moulinex Turbo Cuisine** — pas de panier vapeur, seulement une grille posée au fond de la cuve ; pas de lait en poudre dans le skyr
- **N'aime pas les bao** (steamed buns) — à ne pas proposer

## Tâches en attente (proposées, pas encore faites)

1. Réécrire les réglages Ninja Woodfire (mode, température, position, temps) pour : R9 pizza, R10 focaccia, R11 pita, R13 gressins — actuellement instructions four classique.
2. Fiches Turbo Cuisine additionnelles envisagées : étuve à levain/pâte, compotes/purées sous pression (pour R1/R20 et Creami G3/G5/G7). **Ne pas** faire de fiche bao (T4 abandonnée).
3. Aucune de ces tâches n'a été validée par Céline — à confirmer avant d'éditer.

## Points de fact-check tranchés dans cette conversation

- **Consommation électrique Turbo Cuisine (mode yaourt ~10h)** : pas de donnée mesurée fiable trouvée (aucune spec constructeur par mode). Fourchette raisonnée par physique de pertes thermiques : 0,25–0,65 kWh. Recommandation donnée : méthode par inertie thermique (chauffer puis éteindre l'appareil) plutôt que le faire tourner 10h, et acheter un wattmètre pour une mesure réelle plutôt que de se fier à une estimation.
- Recette skyr Turbo Cuisine **sans lait en poudre**, avec égouttage (torchon + passoire, 3-4h pour yaourt grec, 6-8h pour skyr, une nuit pour plus ferme) — corrigée après relecture de Céline.

## Mémoire persistante (topics/recettes-maison.md)

Copie de ce qui est stocké en mémoire Claude au moment de cette passation — utile si la nouvelle conversation n'y a pas accès directement :

> Sauce soja maison pour riz vinaigré/pokéball, base 60g de sauce soja sucrée : 9g de miso, 35g d'eau, 5g de sauce soja foncée, 4-5g d'huile de sésame, pointe de piment togarashi selon goût — ajustable au prochain essai.
> Riz vinaigré pour pokéball/sushi : ratio cuisson 1 volume de riz pour 1,1 volume d'eau (ex. 450g riz cru pour 500g d'eau) ; assaisonnement sur 450g de riz cru : 50g de vinaigre de riz, 27g de sucre, 5g de sel (réduit de 7g à 5g car sursalé une fois combiné à la sauce soja).
> S'intéresse au levain maison et aux alternatives à la levure de boulanger.
> Fait du kéfir de fruits régulièrement, en a toujours sous la main.
> A une Ninja Creami Deluxe ; classeur de 45 recettes de glace base skyr intégré au carnet.
> Kéfir d'eau : 30g de grains, 1L d'eau non chlorée, 60g de sucre blanc, figue ou datte un cycle sur deux ; F1 ouverte 24-48h puis F2 fermée 24-36h.
> Flan pomme-cannelle protéiné et flan banane-chocolat protéiné (recettes complètes dans le carnet, fiches R20/R21).
> A un Moulinex Turbo Cuisine : pas de panier vapeur, seulement une grille ; pas de lait en poudre.
> A un Ninja Woodfire : flans au bain-marie. N'aime pas les bao.

*(Cette mémoire vit normalement dans le système de Claude et sera accessible telle quelle dans toute nouvelle conversation — cette copie est un filet de sécurité.)*

## Comment reprendre le build technique

```
cd carnet-source/
python3 build.py          # régénère carnet-de-fournil.html + .standalone.html
```

Puis publier via l'outil Artifact (action `publish`, en réutilisant l'URL existante ci-dessus pour mettre à jour la même page plutôt que d'en créer une nouvelle).
