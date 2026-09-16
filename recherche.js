/* Recherche dans le carnet.

   68 fiches, un sommaire à trois niveaux et trois index : il manquait de
   pouvoir taper « potimarron » quand c'est ce qu'on a dans le panier. La
   recherche porte sur tout le texte des fiches — titre, meta, ingrédients,
   méthode, variantes, pièges — là où l'index des ingrédients ne connaît que
   les termes inscrits à la main dans build.py.

   L'index se construit dans le navigateur au chargement, en une passe sur les
   fiches. Le précalculer au build aurait doublé le poids de la page pour un
   gain de quelques millisecondes.

   Tout est local : la recherche fonctionne sans réseau, comme le reste. */
(function () {
  "use strict";

  var index = [];        // {article, texte}
  var enfants = [];      // enfants directs de .content, dans l'ordre du document
  var contenu, champ, compteur, minute, perso;

  /* « kefir » doit trouver « kéfir », et « POELE » trouver « poêle ». */
  function normalise(s) {
    return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function construis() {
    contenu = contenu || document.querySelector(".content");
    if (!contenu) return false;
    enfants = Array.prototype.slice.call(contenu.children);
    perso = document.querySelector(".mes-recettes");
    index = [];
    var arts = contenu.querySelectorAll("article.fiche");
    for (var i = 0; i < arts.length; i++) {
      index.push({ article: arts[i], texte: normalise(arts[i].textContent) });
    }
    return index.length > 0;
  }

  /* Les recettes ajoutées à la main arrivent de Firestore après le chargement,
     et sont refaites à chaque modification : l'index est reconstruit dès que
     leur nombre change, sinon elles resteraient introuvables. */
  function aJour() {
    if (contenu.querySelectorAll("article.fiche").length !== index.length) construis();
  }

  function montreTout() {
    for (var i = 0; i < enfants.length; i++) enfants[i].classList.remove("masque");
    var items = document.querySelectorAll(".mr-item");
    for (var p = 0; p < items.length; p++) items[p].classList.remove("masque");
    var liens = document.querySelectorAll(".toc li");
    for (var j = 0; j < liens.length; j++) liens[j].classList.remove("masque");
    compteur.textContent = "";
    document.body.classList.remove("en-recherche");
  }

  function filtre(q) {
    var mots = normalise(q).split(/\s+/).filter(Boolean);
    if (!mots.length) { montreTout(); return; }

    document.body.classList.add("en-recherche");
    aJour();

    var gardes = [];
    for (var i = 0; i < index.length; i++) {
      var e = index[i], ok = true;
      for (var m = 0; m < mots.length; m++) {
        if (e.texte.indexOf(mots[m]) === -1) { ok = false; break; }
      }
      if (ok) gardes.push(e.article);
    }

    /* On masque tout, puis on rouvre : la fiche trouvée, et les titres de
       section qui la surplombent — sans quoi un résultat apparaît sans qu'on
       sache de quel chapitre il vient. */
    var visibles = [];
    var h2 = null, h3 = null;
    for (var k = 0; k < enfants.length; k++) {
      var el = enfants[k];
      var nom = el.tagName;
      if (nom === "H2") { h2 = el; h3 = null; }
      else if (nom === "H3") { h3 = el; }
      else if (gardes.indexOf(el) !== -1) {
        visibles.push(el);
        if (h2) visibles.push(h2);
        if (h3) visibles.push(h3);
      }
      el.classList.add("masque");
    }
    for (var v = 0; v < visibles.length; v++) visibles[v].classList.remove("masque");

    /* Les recettes personnelles vivent dans leur propre section : on la rouvre
       si l'une d'elles répond, en ne gardant que celles-là. */
    if (perso) {
      var miens = perso.querySelectorAll(".mr-item"), vus = 0;
      for (var w = 0; w < miens.length; w++) {
        var gardeMien = gardes.indexOf(miens[w]) !== -1;
        miens[w].classList.toggle("masque", !gardeMien);
        if (gardeMien) vus++;
      }
      if (vus) perso.classList.remove("masque");
    }

    // Le sommaire suit : seules les fiches trouvées y restent.
    var ids = {};
    for (var g = 0; g < gardes.length; g++) {
      var t = gardes[g].querySelector("h4[id]");
      if (t) ids["#" + t.id] = true;
    }
    var items = document.querySelectorAll(".toc li");
    for (var n = 0; n < items.length; n++) {
      var a = items[n].querySelector("a");
      var garde = items[n].classList.contains("rec")
        ? (a && ids[a.getAttribute("href")])
        : false;
      items[n].classList.toggle("masque", !garde);
    }

    compteur.textContent = gardes.length === 0
      ? "aucune fiche"
      : gardes.length + (gardes.length > 1 ? " fiches" : " fiche");
  }

  function demarre() {
    var nav = document.querySelector(".toc");
    if (!nav || !construis()) return;

    var boite = document.createElement("div");
    boite.className = "rech";
    boite.innerHTML =
      '<label class="rech-label" for="rech-champ">Rechercher</label>' +
      '<input id="rech-champ" class="rech-champ" type="search" autocomplete="off" ' +
      'placeholder="kéfir, potimarron, beignet…" aria-describedby="rech-compteur">' +
      '<span id="rech-compteur" class="rech-compteur" aria-live="polite"></span>';
    nav.insertBefore(boite, nav.firstChild);

    champ = boite.querySelector(".rech-champ");
    compteur = boite.querySelector(".rech-compteur");

    champ.addEventListener("input", function () {
      clearTimeout(minute);
      var q = champ.value;
      minute = setTimeout(function () { filtre(q); }, 120);
    });
    champ.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") { champ.value = ""; filtre(""); }
    });

    // « / » met le curseur dans la recherche, sauf si l'on est déjà en train
    // d'écrire ailleurs — une note, un journal, une fiche en cours d'édition.
    document.addEventListener("keydown", function (ev) {
      if (ev.key !== "/" || ev.ctrlKey || ev.metaKey || ev.altKey) return;
      var a = document.activeElement;
      if (a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.isContentEditable)) return;
      ev.preventDefault();
      champ.focus();
      champ.select();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarre);
  else demarre();
})();
