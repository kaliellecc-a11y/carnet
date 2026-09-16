#!/usr/bin/env python3
"""Contrôle des fiches du carnet — la checklist de RÈGLES-RECETTES §5, automatisée.

    python3 verifie.py            # rapport complet
    python3 verifie.py --strict   # les avertissements comptent comme des erreurs

Deux niveaux :
  ERREUR        casse le build ou la navigation (structure, numéro, renvoi mort)
  AVERTISSEMENT écart de rédaction à corriger, sans empêcher de construire

Code de sortie : 1 s'il reste une erreur (ou un avertissement avec --strict).

Les familles n'ont pas le même gabarit : R, T et W portent Ingrédients et
Méthode ; G tient ses dosages dans le tableau à trois notes ; K décrit des
procédés en blocs libres. Le contrôle s'adapte, sinon il crie sur des fiches
parfaitement valides.
"""

from __future__ import annotations

import re
import sys
import pathlib
from collections import Counter

SRC = pathlib.Path(__file__).parent / "carnet-kefir-levain.md"

# Numéros retirés, jamais réattribués (RÈGLES-RECETTES §3).
RETIRES = {"G9"}

FAMILLES = "RGBKTW"

# Familles tenues au gabarit Ingrédients + Méthode.
GABARIT_CLASSIQUE = set("RTW")

# Familles dont la meta doit porter des macros.
MACROS_ATTENDUES = set("RTWGB")

# Types de farine : « T65 » ressemble à une fiche Turbo sans en être une.
FARINES = {"T45", "T55", "T65", "T80", "T110", "T130", "T150"}

TITRE = re.compile(r'^([A-Z]\d+) · (.+?) <span class="niveau ([ab])">([AB])</span>$')
QUANTITE = re.compile(r"^\*\*(.+?)\*\*")
POIDS_G = re.compile(r"^([\d.,]+)\s*g$")
PARENTHESE = re.compile(r"\(([^()]*)\)")
POIDS_DANS_TEXTE = re.compile(r"([\d.,]+)\s*g\b")
RENVOI = re.compile(r"(?<![\w#/-])([" + FAMILLES + r"]\d{1,2})(?![\dA-Za-z])")


class Rapport:
    def __init__(self) -> None:
        self.erreurs: list[str] = []
        self.avertissements: list[str] = []

    def erreur(self, fiche: str, texte: str) -> None:
        self.erreurs.append(f"{fiche} : {texte}")

    def avertit(self, fiche: str, texte: str) -> None:
        self.avertissements.append(f"{fiche} : {texte}")


def decoupe_fiches(md: str) -> list[tuple[str, str]]:
    """Rend la liste (identifiant, corps) de chaque fiche du maître."""
    fiches = []
    for corps in re.findall(r'<article class="fiche" markdown="1">(.*?)</article>', md, re.S):
        t = re.search(r"^#### (.+)$", corps, re.M)
        m = TITRE.match(t.group(1)) if t else None
        fiches.append(((m.group(1) if m else "?"), corps))
    return fiches


def bloc_ingredients(corps: str) -> str:
    m = re.search(r"\*\*(?:Ingrédients|Dosage)\.\*\*\s*\n(.*?)(?=\n\*\*[A-ZÉ]|\Z)", corps, re.S)
    return m.group(1) if m else ""


def bloc_methode(corps: str) -> str:
    m = re.search(r"\*\*Méthode\.\*\*(.*?)(?=\n\*\*(?:Variantes|Pièges)\.|\Z)", corps, re.S)
    return m.group(1) if m else ""


def poids_attendus(bloc: str) -> list[tuple[float, float | None]]:
    """Les poids de la liste, chacun avec la somme de son groupe s'il en a un.

    Une recette en deux temps groupe ses ingrédients sous un intitulé
    (« Levain-mère, 6 h », « Pâte »). La méthode rappelle alors le groupe d'un
    bloc — « levain-mère (200 g) » — et non chacun de ses composants. Un poids
    est donc satisfait par lui-même ou par le total de son groupe.
    """
    entrees: list[tuple[float, int | None]] = []   # (poids, indice du groupe)
    totaux: dict[int, float] = {}
    groupe: int | None = None

    for ligne in bloc.split("\n"):
        if not ligne.strip().startswith("- "):
            continue
        indente = len(ligne) - len(ligne.lstrip())
        texte = ligne.strip()[2:].strip()
        q = QUANTITE.match(texte)
        valeur = POIDS_G.match(q.group(1).strip()) if q else None

        if indente == 0:
            if valeur:
                groupe = None
                entrees.append((float(valeur.group(1).replace(",", ".")), None))
            else:
                # intitulé de groupe : « Le soir », « Pâte », « Levain-mère, 6 h »
                groupe = len(totaux)
                totaux[groupe] = 0.0
        elif valeur and groupe is not None:
            p = float(valeur.group(1).replace(",", "."))
            totaux[groupe] += p
            entrees.append((p, groupe))

    return [(p, totaux[g] if g is not None else None) for p, g in entrees]


def poids_rappeles(methode: str) -> set[float]:
    """Les poids cités entre parenthèses dans la méthode.

    Une parenthèse en porte parfois plusieurs, et pas toujours en fin de groupe :
    « farines (150 g T65 + 100 g T80) » en compte deux.
    """
    trouves = set()
    for contenu in PARENTHESE.findall(methode):
        for v in POIDS_DANS_TEXTE.findall(contenu):
            trouves.add(float(v.replace(",", ".")))
    return trouves


def controle_structure(rid: str, corps: str, rap: Rapport) -> None:
    famille = rid[0]
    titre = re.search(r"^#### (.+)$", corps, re.M)
    if not titre:
        rap.erreur(rid, "pas de titre de fiche (#### X1 · Nom)")
        return
    if not TITRE.match(titre.group(1)):
        rap.erreur(rid, f"titre hors gabarit : {titre.group(1)[:60]}")
    if '<p class="meta">' not in corps:
        rap.erreur(rid, "ligne meta absente")

    if famille in GABARIT_CLASSIQUE:
        if not bloc_ingredients(corps):
            rap.erreur(rid, "bloc **Ingrédients.** ou **Dosage.** absent")
        if not bloc_methode(corps):
            rap.erreur(rid, "bloc **Méthode.** absent")
    elif famille == "G" and re.search(r"Note \d", corps):
        # Une fiche G qui annonce des notes doit les tenir dans un tableau ;
        # celles qui décrivent une technique ou des toppings n'en ont pas.
        if "|---" not in corps:
            rap.erreur(rid, "meta annonçant des notes, mais pas de tableau")


def controle_poids(rid: str, corps: str, rap: Rapport) -> None:
    """Chaque poids de la liste doit être rappelé dans la méthode (§5.2)."""
    methode = bloc_methode(corps)
    liste = poids_attendus(bloc_ingredients(corps))
    if not liste or not methode:
        # Les fiches de procédé (K) dosent sans décrire de gestes : rien à rappeler.
        return
    rappeles = poids_rappeles(methode)
    manquants = sorted({p for p, total in liste if p not in rappeles and total not in rappeles})
    if manquants:
        apercu = ", ".join(f"{p:g} g" for p in manquants[:6])
        reste = f" (+{len(manquants) - 6})" if len(manquants) > 6 else ""
        rap.avertit(rid, f"poids jamais rappelés dans la méthode : {apercu}{reste}")


def controle_macros(rid: str, corps: str, rap: Rapport) -> None:
    if rid[0] not in MACROS_ATTENDUES:
        return
    meta = re.search(r'<p class="meta">(.*?)</p>', corps, re.S)
    if not meta:
        return
    texte = meta.group(1)
    # Une fiche peut renoncer aux macros, à condition de le dire.
    if "kcal" not in texte and "macros non comptées" not in texte:
        rap.avertit(rid, "meta sans macros (chantier « complète les macros »)")


def controle_numeros(fiches: list[tuple[str, str]], rap: Rapport) -> set[str]:
    ids = [rid for rid, _ in fiches]
    for rid, n in Counter(ids).items():
        if n > 1:
            rap.erreur(rid, f"numéro attribué {n} fois — les notes s'accrochent au numéro")
    for rid in ids:
        if rid in RETIRES:
            rap.erreur(rid, "numéro retiré, jamais réattribuable (§3)")
    return set(ids)


def controle_renvois(md: str, connus: set[str], rap: Rapport) -> None:
    """Un renvoi vers une fiche inexistante produit un lien mort dans la page."""
    for rid, corps in decoupe_fiches(md):
        cites = {c for c in RENVOI.findall(corps) if c != rid and c not in FARINES}
        for c in sorted(cites - connus):
            rap.avertit(rid, f"renvoi vers {c}, qui n'est pas une fiche")


def controle_sous_categories(md: str, rap: Rapport) -> None:
    """L'index par type de plat se construit sur les h3 « Famille · Type » (§3)."""
    for t in re.findall(r"^### (.+)$", md, re.M):
        if " · " not in t:
            continue
        famille = t.split(" · ", 1)[0]
        if famille not in {"Salé", "Sucré", "Bases"}:
            rap.erreur("(sommaire)", f"sous-catégorie « {t} » : famille inattendue « {famille} »")


def prochains_numeros(connus: set[str]) -> dict[str, str]:
    suite = {}
    for f in FAMILLES:
        pris = [int(r[1:]) for r in connus | RETIRES if r[0] == f]
        suite[f] = f"{f}{max(pris) + 1}" if pris else f"{f}1"
    return suite


def main() -> int:
    strict = "--strict" in sys.argv
    md = SRC.read_text(encoding="utf-8")
    fiches = decoupe_fiches(md)
    rap = Rapport()

    connus = controle_numeros(fiches, rap)
    for rid, corps in fiches:
        controle_structure(rid, corps, rap)
        controle_poids(rid, corps, rap)
        controle_macros(rid, corps, rap)
    controle_renvois(md, connus, rap)
    controle_sous_categories(md, rap)

    print(f"{len(fiches)} fiches contrôlées")
    if rap.erreurs:
        print(f"\n{len(rap.erreurs)} ERREUR(S)")
        for e in rap.erreurs:
            print("  ✗", e)
    if rap.avertissements:
        print(f"\n{len(rap.avertissements)} avertissement(s)")
        for a in rap.avertissements:
            print("  ·", a)
    if not rap.erreurs and not rap.avertissements:
        print("rien à signaler")

    suite = prochains_numeros(connus)
    print("\nprochains numéros libres : " + " · ".join(suite[f] for f in FAMILLES))

    if rap.erreurs or (strict and rap.avertissements):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
