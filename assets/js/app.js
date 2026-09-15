/* Logique principale du carnet.
   Souche : remplacer par le app.js du projet. */

const CONTENEUR = "#carnet";

export function rendreCarnet(recettes = []) {
  const cible = document.querySelector(CONTENEUR);
  if (!cible) return;
  // TODO : rendu des recettes (kéfir, levain) dans le carnet.
  cible.textContent = recettes.length
    ? ""
    : "Aucune recette chargée.";
}

document.addEventListener("DOMContentLoaded", () => {
  rendreCarnet([]);
});
