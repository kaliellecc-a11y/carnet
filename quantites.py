#!/usr/bin/env python3
"""Balisage des quantités, pour que la page sache recalculer une recette.

`build.py` appelle ces fonctions pendant la construction : chaque poids devient
un élément porteur de sa valeur numérique, et `app.js` n'a plus qu'à multiplier.

Analyser le HTML dans le navigateur serait fragile — une quantité mal écrite
passerait inaperçue et la page se tromperait en cuisine. Ici, une quantité que
le build ne comprend pas reste simplement du texte figé : elle ne bougera pas,
ce qui est visible tout de suite.

Ce qui est balisé :
  - les poids de la liste d'ingrédients
  - les nombres nus (œufs, jaunes, blancs), avec leur équivalent en grammes
  - les rappels de poids dans la méthode, mais seulement ceux qui correspondent
    à un ingrédient de la fiche — « garder 50 g de levain au froid » relève de
    l'entretien, pas du rendement, et ne doit jamais suivre le facteur
  - les nombres du rendement dans la ligne meta

Ce qui ne l'est jamais : durées, températures, dimensions de moule, et les
macros (kcal pour 100 g et kcal par part sont invariantes — quand le nombre de
parts suit le facteur, la part garde sa taille).
"""

from __future__ import annotations

import re

from verifie import PIECES, bloc_ingredients, decoupe_fiches, poids_attendus

# Unités de portion : leur présence autorise le réglage « pour N parts ».
PORTIONS = {
    "part", "parts", "portion", "portions", "personne", "personnes",
    "tranche", "tranches", "pièce", "pièces", "pot", "pots", "mug", "mugs",
    "pancakes", "gaufres", "blinis", "crêpes", "beignets", "pitas", "naans",
    "cookies", "muffins", "crackers", "galettes", "boules", "verres", "bols",
    "brioche", "brioches", "pains", "pizzas", "parts",
}

# Segments de la meta qui ne décrivent pas le rendement.
HORS_RENDEMENT = ("travail", "total", "kcal", "min", "°c", "repos", "cuisson", "protéines")

# Unités qu'un facteur ne doit pas toucher : un moule ne rétrécit pas.
UNITES_FIGEES = {"cm", "mm", "°", "%", "h", "min"}

# « 1 400 g » s'écrit avec une espace de milliers ; « 1,5 L » avec une virgule.
NOMBRE = r"\d+(?:[  ]\d{3})*(?:[.,]\d+)?"
POIDS_FORT = re.compile(
    r"<strong>(" + NOMBRE + r")(?:\s*-\s*(" + NOMBRE + r"))?\s*(g|kg|L|ml|cl)</strong>")
NOMBRE_FORT = re.compile(
    r"<strong>(\d+)(?:\s*(?:à|-)\s*(\d+))?</strong>(\s*)([a-zà-ÿœ]+)")
PARENTHESE = re.compile(r"\(([^()]*)\)")
POIDS_TEXTE = re.compile(r"(?<![\d.,])(" + NOMBRE + r")\s*g\b")
NOMBRE_META = re.compile(r"(?<![\d.,])(\d+)(\s+)([a-zà-ÿ]+)")


def _nombre(v: str) -> float:
    return float(v.replace(" ", "").replace("\u00a0", "").replace(",", "."))


def _affiche(v: float) -> str:
    """Un poids s'écrit sans décimale inutile, et jamais au dixième près."""
    if v >= 10:
        return f"{round(v):g}"
    return f"{round(v, 1):g}".replace(".", ",")


def quantites_du_maitre(md: str) -> dict[str, set[float]]:
    """Pour chaque fiche, les valeurs qui font partie de sa recette.

    Un poids de la liste et le total de son groupe sont tous deux légitimes :
    la méthode rappelle « levain-mère (200 g) » là où la liste détaille
    100 g + 100 g.
    """
    connus: dict[str, set[float]] = {}
    for rid, corps in decoupe_fiches(md):
        valeurs: set[float] = set()
        for poids, total in poids_attendus(bloc_ingredients(corps)):
            valeurs.add(poids)
            if total is not None:
                valeurs.add(total)
        connus[rid] = valeurs
    return connus


def balise_liste(html: str) -> str:
    """Les quantités de la liste d'ingrédients.

    Ici le contexte lève toute ambiguïté : dans une liste d'ingrédients, un
    nombre en gras est une quantité, qu'il porte une unité (« 250 g ») ou non
    (« 2 œufs », « 1 banane »). Les fourchettes suivent le facteur par leurs
    deux bornes.

    Les cuillerées restent figées à dessein : ce sont des épices et des
    assaisonnements, qui ne se multiplient pas linéairement, et un tiers de
    cuillère à café ne se mesure pas.
    """

    def poids(m):
        v, v2, unite = _nombre(m.group(1)), m.group(2), m.group(3)
        borne = f' data-g2="{_nombre(v2):g}"' if v2 else ""
        texte = f"{m.group(1)}-{v2}" if v2 else m.group(1)
        return (f'<strong class="q" data-g="{v:g}"{borne} data-unite="{unite}">'
                f'{texte} {unite}</strong>')

    html = POIDS_FORT.sub(poids, html)

    def piece(m):
        n, n2, espace, mot = m.group(1), m.group(2), m.group(3), m.group(4)
        gramme = PIECES.get(mot.lower())
        equiv = f' data-ug="{gramme:g}"' if gramme else ""
        borne = f' data-n2="{n2}"' if n2 else ""
        texte = f"{n} à {n2}" if n2 else n
        return (f'<strong class="q q-piece" data-n="{n}"{borne}{equiv}>'
                f'{texte}</strong>{espace}{mot}')

    return NOMBRE_FORT.sub(piece, html)


def balise_methode(html: str, connus: set[float]) -> str:
    """Les rappels de poids entre parenthèses, quand ils citent un ingrédient."""

    def parenthese(m):
        contenu = m.group(1)

        def poids(p):
            v = _nombre(p.group(1))
            if v not in connus:
                return p.group(0)
            return f'<b class="q" data-g="{v:g}">{p.group(1)} g</b>'

        return "(" + POIDS_TEXTE.sub(poids, contenu) + ")"

    return PARENTHESE.sub(parenthese, html)


def balise_meta(html: str) -> tuple[str, float | None]:
    """Les nombres du rendement. Rend aussi la portion de référence, s'il y en a.

    La ligne meta mêle des grandeurs sans rapport : un temps de travail ne suit
    pas le facteur, un nombre de parts si. Le tri se fait par liste blanche —
    seules une unité de portion reconnue et un poids en grammes sont balisés.

    Reconnaître au contraire tout sauf une liste d'exclusions se paie cher :
    « 24 lip » (des lipides) et « 2 semaines » (une durée de conservation) y
    passaient pour des rendements. Un nombre non reconnu reste figé, ce qui se
    voit ; un nombre recalculé à tort ne se voit pas.
    """
    reference: float | None = None
    segments = html.split(" · ")
    sortie = []

    for seg in segments:
        nu = re.sub(r"<.*?>", "", seg).lower()
        if any(k in nu for k in HORS_RENDEMENT):
            sortie.append(seg)
            continue

        def nombre(m):
            nonlocal reference
            n, espace, mot = m.group(1), m.group(2), m.group(3)
            if mot.lower() not in PORTIONS:
                return m.group(0)
            if reference is None:
                reference = float(n)
            return f'<b class="q" data-n="{n}">{n}</b>{espace}{mot}'

        seg = NOMBRE_META.sub(nombre, seg)
        # « 450 g d'eau filtrée » : un rendement pesé, sans unité de portion
        seg = POIDS_TEXTE.sub(
            lambda p: f'<b class="q" data-g="{_nombre(p.group(1)):g}">{p.group(1)} g</b>',
            seg,
        )
        sortie.append(seg)

    return " · ".join(sortie), reference


def barre(rid: str, reference: float | None) -> str:
    """Le bandeau de réglage, en tête de fiche."""
    parts = ""
    if reference:
        parts = (f'<span class="ech-parts">pour '
                 f'<button type="button" class="ech-moins" aria-label="Moins">−</button>'
                 f'<input class="ech-n" type="number" min="1" step="1" value="{reference:g}" '
                 f'aria-label="Quantité voulue">'
                 f'<button type="button" class="ech-plus" aria-label="Plus">+</button></span>')
    ref_attr = ' data-ref="{:g}"'.format(reference) if reference else ""
    return (
        f'<div class="echelle" data-rid="{rid}"{ref_attr}>'
        f'{parts}'
        f'<span class="ech-facteur" aria-live="polite"></span>'
        f'<button type="button" class="btn ech-reset" hidden>Quantités d\'origine</button>'
        f'<span class="ech-aide">Touche une quantité pour partir de ce que tu as.</span>'
        f'<p class="ech-garde" hidden>Températures, durées et taille de moule ne suivent pas. '
        f'Au-delà du double ou en dessous de la moitié, revois le sel et le levant.</p>'
        f'</div>'
    )
