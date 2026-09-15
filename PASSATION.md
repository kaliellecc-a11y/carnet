# Passation — Carnet de fournil

Dossier de reprise pour continuer ce projet dans une autre conversation, sans avoir à réexpliquer le contexte.

## Source de vérité — le dépôt git (2026-09-15)

**Le maître est `carnet-kefir-levain.md` dans le dépôt https://github.com/kaliellecc-a11y/carnet**, branche `main`. Toute conversation commence par un `git pull` — jamais par une copie locale, un fichier joint ou la pièce jointe Notion.

Le dépôt porte tout le projet : le md maître, `build.py`, `style.css`, `app.js`, `firebase-init.js`, `REGLES-RECETTES.md`, `PASSATION.md`. Les HTML produits par le build restent hors du dépôt (`.gitignore`) — `build.py` les régénère.

Bascule vérifiée : le md versionné porte le MD5 `a91ec147f8249c5980d925d754312bd9` (68 fiches), celui du maître v11, et `python3 build.py` reproduit `carnet-de-fournil.html` et `.standalone.html` à l'octet près.

Ce que git remplace : la page Notion « MAÎTRE », le cycle `create_file_upload` + curl, les MD5 recopiés à la main et la ligne « Historique » de la page. `git log` et `git diff` donnent la même information, sans risque de désynchronisation entre deux copies. Les entrées Notion plus bas dans ce document sont conservées comme historique daté — elles ne décrivent plus le fonctionnement courant.

**PDF abandonné (2026-09-15)** : le carnet se consulte en ligne. `pdf.js` n'est pas repris dans le dépôt et l'étape PDF sort du pipeline. Le `.standalone.html` reste produit — il sert la mise en ligne et la consultation d'un fichier hors réseau.

## Lien du carnet (source de vérité vivante)

**https://carnet-de-recettes-celine.netlify.app** — site Netlify (projet `carnet-de-recettes-celine`, siteId `667569cd-4577-48ba-978f-2cb5bf1e48a4`, forfait gratuit). C'est l'adresse à ouvrir sur tous les appareils depuis le 2026-09-11.

Redéploiement (aucune manipulation pour Céline) : copier le HTML buildé en `site/index.html`, puis, via le connecteur Netlify, `deploy-site` avec ce siteId — la commande renvoyée s'exécute depuis le dossier `site/`. Le déploiement remplace le contenu ; les notes vivent dans Firestore et ne sont jamais touchées.

Notes, journal des fournées et modifications de recettes : base Firestore du projet Firebase `carnet-recettes-3f0e0`, partagée entre le site Netlify et tout fichier HTML téléchargé. Accès ouvert sur le seul dossier `carnet`, sans authentification (choix de Céline). Le site Netlify est public pour qui connaît l'adresse — mot de passe possible via `update-visitor-access-controls` si elle le demande.

Ancien Artifact (figé en v6.1, notes séparées dans la base Claude) : https://claude.ai/code/artifact/e3b45d45-0ca3-4d43-b826-3fe08be9f851

Page privée, accessible depuis tous les appareils connectés au compte de Céline. Édition directe possible sur la page elle-même (bouton « Modifier la recette », notes, journal des fournées, section « Carnet de notes ») — synchronisée entre appareils sans passer par Claude. Pour ajouter une fiche complète et bien formatée, il faut passer par une conversation Claude.

**État publié : v11 sur Netlify (2026-09-11).** L'Artifact reste figé en v6.1. **v11 validée le 2026-09-11 (HTML + standalone livrés).** PDF abandonné depuis le 2026-09-15 (consultation en ligne). Testé en réel sur le site en ligne : 68 fiches, HTTPS, bandeau synchronisé, écriture d'une note depuis le site relue dans le fichier local, rendu mobile sans débordement horizontal.

**~~⚠ Maître Notion NON mis à jour en v11~~ — résolu autrement le 2026-09-15** : plutôt que de rattraper Notion, le maître v11 (`carnet-kefir-levain.md`, MD5 a91ec147f8249c5980d925d754312bd9, 68 fiches) a été versionné dans git, qui fait foi désormais. La page Notion « Carnet de recettes — MAÎTRE » (3d78c668-27b7-81a0-9416-ec81354c4eb1) reste figée au v10 et n'est plus à jour : ne plus s'en servir comme source.

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
