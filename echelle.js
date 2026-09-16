/* Recalcul des quantités d'une fiche.

   Chaque quantité a été balisée au build et porte sa valeur d'origine
   (data-g pour un poids, data-n pour un dénombrement). Recalculer revient donc
   à relire l'origine et à multiplier : l'opération est idempotente, et la fiche
   revient toujours exactement à son état initial.

   Deux façons de régler : le compteur de parts, ou une quantité de la liste sur
   laquelle on tape ce qu'on a vraiment sous la main.

   Le réglage est éphémère — rien n'est enregistré, la fiche s'ouvre toujours à
   ses quantités d'origine. */
(function () {
  "use strict";

  var etat = {};        // rid -> facteur courant
  var grammes = {};     // rid -> les pièces sont-elles montrées en grammes
  var ecritEnCours = false;

  function fiche(rid) { return document.querySelector('.fiche-body[data-rid="' + rid + '"]'); }
  function barre(rid) { return document.querySelector('.echelle[data-rid="' + rid + '"]'); }

  function article(rid) {
    var b = barre(rid);
    return b ? b.closest(".fiche") : null;
  }

  /* Un poids se lit au gramme près au-dessus de 10 g, au dixième en dessous :
     personne ne pèse 187,3 g de farine, mais 4,5 g de sel a du sens. */
  function fmtPoids(v) {
    if (v >= 10) return String(Math.round(v));
    return String(Math.round(v * 10) / 10).replace(".", ",");
  }

  function fmtNombre(v) {
    var arrondi = Math.round(v * 10) / 10;
    return String(arrondi).replace(".", ",");
  }

  /* « 2 œufs » réduit de moitié donne « 1 œuf », pas « 1 œufs ». Seul le nom qui
     suit immédiatement est accordé : pousser plus loin demanderait d'accorder
     aussi les adjectifs, pour un gain nul en cuisine. */
  function accorde(el, valeur) {
    if (valeur === null) return;
    var suite = el.nextSibling;
    if (!suite || suite.nodeType !== 3) return;
    if (el.dataset.suite === undefined) el.dataset.suite = suite.nodeValue;
    var origine = el.dataset.suite;
    if (valeur > 1 || valeur <= 0) { suite.nodeValue = origine; return; }
    suite.nodeValue = origine.replace(/^(\s*)([a-zà-ÿœ]+)s\b/i, "$1$2");
  }

  function quantites(rid) {
    var art = article(rid);
    return art ? art.querySelectorAll(".q") : [];
  }

  /* Écrit les quantités de la fiche pour le facteur donné. */
  function applique(rid) {
    var f = etat[rid] || 1;
    var enGrammes = !!grammes[rid];
    var qs = quantites(rid);
    ecritEnCours = true;
    for (var i = 0; i < qs.length; i++) {
      var el = qs[i];
      var g = el.getAttribute("data-g");
      var n = el.getAttribute("data-n");
      var texte;
      if (g !== null) {
        var g2 = el.getAttribute("data-g2");
        var unite = el.getAttribute("data-unite") || "g";
        texte = fmtPoids(parseFloat(g) * f)
          + (g2 !== null ? "-" + fmtPoids(parseFloat(g2) * f) : "")
          + " " + unite;
      } else if (n !== null) {
        var n2 = el.getAttribute("data-n2");
        var ug = el.getAttribute("data-ug");
        if (enGrammes && ug !== null) {
          texte = fmtPoids(parseFloat(n) * parseFloat(ug) * f)
            + (n2 !== null ? "-" + fmtPoids(parseFloat(n2) * parseFloat(ug) * f) : "")
            + " g";
        } else {
          texte = fmtNombre(parseFloat(n) * f)
            + (n2 !== null ? " à " + fmtNombre(parseFloat(n2) * f) : "");
        }
      } else {
        continue;
      }
      if (el.textContent !== texte) el.textContent = texte;
      accorde(el, g !== null ? null : parseFloat(n) * f);
      el.classList.toggle("q-ajustee", f !== 1);
    }
    ecritEnCours = false;
    majBarre(rid);
  }

  function majBarre(rid) {
    var b = barre(rid);
    if (!b) return;
    var f = etat[rid] || 1;
    var ref = parseFloat(b.getAttribute("data-ref"));
    var champ = b.querySelector(".ech-n");
    if (champ && ref) {
      var voulu = fmtNombre(ref * f);
      if (document.activeElement !== champ) champ.value = voulu;
    }
    var libelle = b.querySelector(".ech-facteur");
    if (libelle) libelle.textContent = f === 1 ? "" : "×" + fmtNombre(f);
    var reset = b.querySelector(".ech-reset");
    if (reset) reset.hidden = f === 1;
    var garde = b.querySelector(".ech-garde");
    if (garde) garde.hidden = f >= 0.5 && f <= 2;
    b.classList.toggle("ajustee", f !== 1);
  }

  function regle(rid, facteur) {
    if (!isFinite(facteur) || facteur <= 0) return;
    etat[rid] = facteur;
    applique(rid);
  }

  function origine(rid) {
    if ((etat[rid] || 1) === 1) return;
    etat[rid] = 1;
    applique(rid);
  }

  /* Saisir une quantité : on tape ce qu'on a, le reste de la fiche s'aligne. */
  function saisir(el, rid) {
    if (el.querySelector("input")) return;
    var g = el.getAttribute("data-g");
    var base = g !== null ? parseFloat(g) : parseFloat(el.getAttribute("data-n"));
    var unite = g !== null ? (el.getAttribute("data-unite") || "g") : "";
    var affiche = el.textContent;

    var champ = document.createElement("input");
    champ.type = "text";
    champ.className = "q-saisie";
    champ.inputMode = "decimal";
    champ.value = affiche.replace(/[^\d,.]/g, "");
    champ.setAttribute("aria-label", "Quantité dont tu disposes" + (unite ? " en " + unite : ""));

    function ferme(valide) {
      var v = parseFloat(champ.value.replace(",", "."));
      el.textContent = affiche;
      if (valide && isFinite(v) && v > 0 && base > 0) regle(rid, v / base);
      else applique(rid);
    }
    champ.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") { ev.preventDefault(); ferme(true); }
      if (ev.key === "Escape") { ev.preventDefault(); ferme(false); }
    });
    champ.addEventListener("blur", function () { ferme(true); });

    el.textContent = "";
    el.appendChild(champ);
    champ.focus();
    champ.select();
  }

  function installe(b) {
    var rid = b.getAttribute("data-rid");
    var art = article(rid);
    if (!art) return;
    etat[rid] = 1;

    var ref = parseFloat(b.getAttribute("data-ref"));
    var champ = b.querySelector(".ech-n");
    if (champ && ref) {
      champ.addEventListener("input", function () {
        var v = parseFloat(champ.value.replace(",", "."));
        if (isFinite(v) && v > 0) regle(rid, v / ref);
      });
      b.querySelector(".ech-moins").addEventListener("click", function () {
        var v = Math.max(1, Math.round(ref * (etat[rid] || 1)) - 1);
        regle(rid, v / ref);
      });
      b.querySelector(".ech-plus").addEventListener("click", function () {
        var v = Math.round(ref * (etat[rid] || 1)) + 1;
        regle(rid, v / ref);
      });
    }

    b.querySelector(".ech-reset").addEventListener("click", function () { origine(rid); });

    // Bouton « en grammes » : utile seulement si la fiche compte des pièces.
    if (art.querySelector("[data-ug]")) {
      var bg = document.createElement("button");
      bg.type = "button";
      bg.className = "btn ech-grammes";
      bg.textContent = "en grammes";
      bg.setAttribute("aria-pressed", "false");
      bg.addEventListener("click", function () {
        grammes[rid] = !grammes[rid];
        bg.setAttribute("aria-pressed", grammes[rid] ? "true" : "false");
        bg.textContent = grammes[rid] ? "en pièces" : "en grammes";
        applique(rid);
      });
      b.insertBefore(bg, b.querySelector(".ech-aide"));
    }

    // Seules les quantités de la liste servent de pivot : partir d'un rappel
    // au milieu de la méthode n'aurait pas de sens de lecture.
    var liste = art.querySelectorAll(".ing .q");
    for (var i = 0; i < liste.length; i++) {
      (function (el) {
        el.classList.add("q-pivot");
        el.setAttribute("tabindex", "0");
        el.setAttribute("role", "button");
        el.addEventListener("click", function () { saisir(el, rid); });
        el.addEventListener("keydown", function (ev) {
          if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); saisir(el, rid); }
        });
      })(liste[i]);
    }

    /* Le corps de fiche est réécrit par la synchronisation des notes et par
       « Rétablir l'original » : les quantités y reprennent alors leur valeur de
       départ. On les réaligne sur le facteur en cours. */
    var corps = fiche(rid);
    if (corps && window.MutationObserver) {
      new MutationObserver(function () {
        if (ecritEnCours) return;
        if ((etat[rid] || 1) !== 1) applique(rid);
      }).observe(corps, { childList: true, subtree: true });
    }
  }

  /* Avant toute édition, la fiche revient à ses quantités d'origine : sans ça,
     un enregistrement fait pendant un recalcul figerait les quantités ajustées
     dans la recette elle-même. La capture passe avant les gestionnaires de
     app.js, donc avant qu'il ne relève le contenu à enregistrer. */
  document.addEventListener("click", function (ev) {
    var cible = ev.target;
    if (!cible || !cible.classList || !cible.classList.contains("edit")) return;
    var outils = cible.closest(".outils");
    if (outils) origine(outils.getAttribute("data-rid"));
  }, true);

  /* La liste de courses a besoin de savoir à quel facteur une fiche est réglée :
     c'est la seule chose que ce module expose au reste de la page. */
  window.carnetEchelle = {
    facteur: function (rid) { return etat[rid] || 1; }
  };

  function demarre() {
    var barres = document.querySelectorAll(".echelle");
    for (var i = 0; i < barres.length; i++) installe(barres[i]);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarre);
  else demarre();
})();
