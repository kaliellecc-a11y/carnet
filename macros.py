#!/usr/bin/env python3
"""Recoupement des macros déclarées — diagnostic, jamais verdict.

    python3 macros.py            # toutes les fiches recoupables
    python3 macros.py R7 R20     # seulement celles-là

Une fiche annonce ses calories deux fois : pour 100 g, et par part. Les deux
doivent retomber sur le même total. L'écart se calcule sans aucune donnée
extérieure, ce qui en fait le seul contrôle de macros possible aujourd'hui.

**Cet outil ne dit pas qu'une fiche est fausse.** Quatre causes de divergence
sont parfaitement légitimes, et aucune n'est lisible depuis la fiche :

  1. La perte à la cuisson. Les macros portent sur le poids cuit (§2), le
     total d'ingrédients sur le cru. Environ −10 % pour une fournée au four,
     bien davantage pour un cracker déshydraté.
  2. Les parties non comestibles. Un haut de cuisse compte ses os dans le cru
     et pas dans l'assiette.
  3. Le rendement composé. « 4 pâtons, 16 crackers chacun » fait 64 crackers,
     pas 16.
  4. Les ingrédients non pesés. « 2 pommes » n'entre dans aucun total.

L'écart médian relevé sur le carnet est de −10 %, ce qui correspond très
exactement à la perte de cuisson documentée. Une fiche proche de cette médiane
se comporte normalement ; une fiche qui s'en écarte franchement mérite un
regard, sans plus.
"""

from __future__ import annotations

import re
import sys
import statistics

import verifie
from verifie import DENOMBRE, NEGLIGEABLES, PIECES

K100 = re.compile(r"≈\s*([\d ]+)\s*kcal\s+(?:et|pour)", re.I)
# « ≈ 165 kcal par part », mais aussi « ≈ 330 kcal et 10 g de protéines par
# part » : le gabarit autorise les deux, le recoupement doit suivre.
KPART = re.compile(
    r"≈\s*([\d ]+)\s*kcal"
    r"(?:\s+et\s+[\d.,]+\s*g\s+de\s+protéines)?"
    r"\s+par\s+([a-zà-ÿ]+)", re.I)
# Perte de matière à la cuisson, valeur de référence du carnet (§2).
PERTE_FOUR = 0.10


def meta_nue(corps: str) -> str:
    m = re.search(r'<p class="meta">(.*?)</p>', corps, re.S)
    return re.sub(r"<.*?>", "", m.group(1)) if m else ""


def poids_et_manques(corps: str) -> tuple[float, list[str]]:
    """Poids cru total, et les ingrédients qu'aucun total ne peut compter."""
    bloc = verifie.bloc_ingredients(corps)
    total = sum(p for p, _ in verifie.poids_attendus(bloc))
    manques = []
    for ligne in bloc.split("\n"):
        s = ligne.strip()
        if not s.startswith("- "):
            continue
        m = DENOMBRE.match(s[2:].strip())
        if not m:
            continue
        mot = m.group(2).lower()
        gramme = PIECES.get(mot)
        if gramme is not None:
            total += float(m.group(1)) * gramme
        elif not any(n in s.lower() for n in NEGLIGEABLES):
            manques.append(s[2:].strip()[:52])
    return total, manques


def _valeur(txt: str) -> float:
    return verifie.nombre(txt)


def recoupe(corps: str):
    """Rend (poids cru, kcal attendues, kcal déclarées, manques) ou None."""
    m = meta_nue(corps)
    k100, kpart = K100.search(m), KPART.search(m)
    if not (k100 and kpart):
        return None
    unite = kpart.group(2).lower()
    # Le nombre de parts doit porter la même unité que « kcal par X », sans
    # quoi on compare des tranches à des moules.
    part = re.search(r"(\d+)\s+" + re.escape(unite) + r"s?\b", m, re.I)
    if not part:
        return None
    total, manques = poids_et_manques(corps)
    if not total:
        return None
    attendu = _valeur(k100.group(1)) * total / 100
    declare = _valeur(kpart.group(1)) * float(part.group(1))
    return total, attendu, declare, manques


def main() -> int:
    vises = {a.upper() for a in sys.argv[1:] if not a.startswith("-")}
    md = verifie.SRC.read_text(encoding="utf-8")

    lignes, ecarts, sans_poids = [], [], []
    for rid, corps in verifie.decoupe_fiches(md):
        if vises and rid not in vises:
            continue
        r = recoupe(corps)
        if r is None:
            if "kcal" in meta_nue(corps):
                _, manques = poids_et_manques(corps)
                if manques:
                    sans_poids.append((rid, manques))
            continue
        total, attendu, declare, manques = r
        brut = (declare - attendu) / attendu * 100
        # ce que devient l'écart une fois la perte au four retirée du cru
        corrige = (declare - attendu * (1 - PERTE_FOUR)) / (attendu * (1 - PERTE_FOUR)) * 100
        ecarts.append(brut)
        if manques:
            sans_poids.append((rid, manques))
        lignes.append((rid, total, attendu, declare, brut, corrige, manques))

    if not lignes:
        print("aucune fiche recoupable")
        return 0

    print(f"{len(lignes)} fiches recoupables\n")
    print(f"{'fiche':6}{'cru':>8}{'attendu':>10}{'déclaré':>10}{'écart':>9}{'−10 % cuisson':>15}")
    for rid, total, attendu, declare, brut, corrige, manques in lignes:
        marque = " ⚠" if manques else ""
        print(f"{rid:6}{total:7.0f} g{attendu:9.0f} {declare:9.0f} "
              f"{brut:+8.1f} %{corrige:+14.1f} %{marque}")

    med = statistics.median(ecarts)
    print(f"\nécart médian : {med:+.1f} %  (la perte au four en explique environ −10 %)")
    proches = sum(1 for e in ecarts if abs(e - med) <= 8)
    print(f"{proches}/{len(ecarts)} fiches à moins de 8 points de la médiane")

    if sans_poids:
        print(f"\n⚠ ingrédients dénombrés sans poids — ils ne sont dans aucun total :")
        for rid, manques in sans_poids:
            for m in manques:
                print(f"   {rid:5} {m}")
        print("   Les peser rendrait ces fiches recoupables, et leurs macros justes.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
