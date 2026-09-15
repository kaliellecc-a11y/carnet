#!/usr/bin/env python3
"""Construction du carnet.

Souche : remplacer par le build.py du projet.

Assemble les sources (index.html, assets/, content/) dans dist/,
qui est le dossier publié.
"""

from __future__ import annotations

import shutil
from pathlib import Path

RACINE = Path(__file__).parent
DIST = RACINE / "dist"

# Fichiers et dossiers copiés tels quels vers dist/.
A_COPIER = ["index.html", "assets"]


def nettoyer() -> None:
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True)


def copier() -> None:
    for nom in A_COPIER:
        source = RACINE / nom
        if not source.exists():
            continue
        cible = DIST / nom
        if source.is_dir():
            shutil.copytree(source, cible)
        else:
            shutil.copy2(source, cible)


def construire() -> None:
    nettoyer()
    copier()
    # TODO : rendu des recettes de content/*.md vers le HTML final.
    print(f"Construit dans {DIST}")


if __name__ == "__main__":
    construire()
