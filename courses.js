/* Liste de courses : les ingrédients de plusieurs fiches, additionnés.

   Une case par fiche, et la liste cumule — aux quantités réglées, puisque le
   recalcul est déjà là. Elle survit à la fermeture de l'onglet, sur l'appareil
   où elle a été faite : préparer sa liste puis aller au marché n'aurait aucun
   sens si elle disparaissait entre les deux.

   Le facteur est figé au moment où l'on coche, comme un panier : rerégler la
   fiche ensuite ne rejoue pas la liste. Décocher puis recocher la met à jour.

   Le regroupement est le vrai sujet. « farine T65 » doit s'additionner d'une
   fiche à l'autre, et même deux fois dans la même — R8 en emploie 100 g pour
   son levain-mère et 350 g pour sa pâte. Mais rien ne doit fusionner ce qui
   diffère : le libellé, nettoyé de ses précisions, sert de clé, et deux
   écritures différentes font deux lignes. Une ligne en trop se voit et se
   corrige au magasin ; une fusion abusive de deux ingrédients ne se voit pas. */
(function () {
  "use strict";

  var CLE = "carnet:courses";
  var choix = {};           // rid -> facteur figé
  var panneau, bouton, corps;

  function lis() {
    try { return JSON.parse(localStorage.getItem(CLE) || "{}") || {}; }
    catch (e) { return {}; }
  }
  function ecris() {
    try { localStorage.setItem(CLE, JSON.stringify(choix)); } catch (e) {}
  }

  function facteur(rid) {
    return (window.carnetEchelle && window.carnetEchelle.facteur(rid)) || 1;
  }

  function nom(rid) {
    var t = document.querySelector('.echelle[data-rid="' + rid + '"]');
    var art = t && t.closest(".fiche");
    var n = art && art.querySelector(".rname");
    return n ? n.textContent.trim() : rid;
  }

  /* « farine T65 — de gruau ou « forte » si possible » et « farine T65 » sont
     le même achat. On retire la quantité, les précisions entre parenthèses,
     puis tout ce qui suit un tiret cadratin ou une virgule. */
  function libelle(li) {
    var copie = li.cloneNode(true);
    var sous = copie.querySelectorAll("ul, .q");
    for (var i = 0; i < sous.length; i++) sous[i].parentNode.removeChild(sous[i]);
    var t = copie.textContent.replace(/\s+/g, " ").trim();
    t = t.replace(/^[·\-–—\s]+/, "");
    t = t.replace(/\([^)]*\)/g, " ");
    t = t.split(/\s[—–]\s/)[0];
    t = t.split(",")[0];
    return t.replace(/\s+/g, " ").trim();
  }

  function releve(rid, f, panier) {
    var barre = document.querySelector('.echelle[data-rid="' + rid + '"]');
    var art = barre && barre.closest(".fiche");
    if (!art) return;
    var lis = art.querySelectorAll(".ing li");
    for (var i = 0; i < lis.length; i++) {
      var li = lis[i];
      if (li.querySelector("ul")) continue;      // intitulé de groupe
      var texte = libelle(li);
      if (!texte) continue;

      var q = li.querySelector(".q");
      var unite = "", valeur = 0;
      if (q) {
        var g = q.getAttribute("data-g");
        if (g !== null) { valeur = parseFloat(g) * f; unite = q.getAttribute("data-unite") || "g"; }
        else { valeur = parseFloat(q.getAttribute("data-n")) * f; unite = ""; }
      }

      var cle = texte.toLowerCase() + "|" + unite;
      if (!panier[cle]) panier[cle] = { texte: texte, unite: unite, total: 0, chiffre: !!q, fiches: [] };
      panier[cle].total += valeur;
      if (panier[cle].fiches.indexOf(rid) === -1) panier[cle].fiches.push(rid);
    }
  }

  /* Au-delà du kilo on lit mieux en kg, mais arrondi à 10 g près : au dixième
     de kilo, 1 150 g devient « 1,2 kg » et on achète 50 g de farine en trop. */
  function fmt(v, unite) {
    if (!unite) return String(Math.round(v * 10) / 10).replace(".", ",");
    if (unite === "g" && v >= 1000) {
      return String(Math.round(v / 10) / 100).replace(".", ",") + " kg";
    }
    return (v >= 10 ? String(Math.round(v)) : String(Math.round(v * 10) / 10).replace(".", ",")) + " " + unite;
  }

  function texteListe() {
    var rids = Object.keys(choix);
    if (!rids.length) return "";
    var panier = {};
    for (var i = 0; i < rids.length; i++) releve(rids[i], choix[rids[i]], panier);

    var lignes = ["Liste de courses", ""];
    var cles = Object.keys(panier).sort(function (a, b) {
      return panier[a].texte.localeCompare(panier[b].texte, "fr");
    });
    for (var k = 0; k < cles.length; k++) {
      var e = panier[cles[k]];
      lignes.push("- " + (e.chiffre ? fmt(e.total, e.unite) + " · " : "") + e.texte);
    }
    lignes.push("", "Pour : " + rids.map(function (r) {
      var f = choix[r];
      return nom(r) + (f !== 1 ? " (×" + String(Math.round(f * 10) / 10).replace(".", ",") + ")" : "");
    }).join(" · "));
    return lignes.join("\n");
  }

  function dessine() {
    var rids = Object.keys(choix);
    bouton.textContent = rids.length ? "Liste de courses (" + rids.length + ")" : "Liste de courses";
    bouton.hidden = rids.length === 0;

    if (!panneau.hidden) {
      var panier = {};
      for (var i = 0; i < rids.length; i++) releve(rids[i], choix[rids[i]], panier);
      var cles = Object.keys(panier).sort(function (a, b) {
        return panier[a].texte.localeCompare(panier[b].texte, "fr");
      });
      var html = "";
      if (!cles.length) {
        html = '<p class="co-vide">Coche une fiche pour commencer.</p>';
      } else {
        html = "<ul class='co-liste'>";
        for (var k = 0; k < cles.length; k++) {
          var e = panier[cles[k]];
          html += "<li>" + (e.chiffre ? '<b class="co-q">' + fmt(e.total, e.unite) + "</b> " : "")
            + escape_(e.texte)
            + (e.fiches.length > 1 ? ' <span class="co-src">' + e.fiches.length + " fiches</span>" : "")
            + "</li>";
        }
        html += "</ul><p class='co-pour'>Pour : " + rids.map(function (r) {
          var f = choix[r];
          return escape_(nom(r)) + (f !== 1 ? " ×" + String(Math.round(f * 10) / 10).replace(".", ",") : "");
        }).join(" · ") + "</p>";
      }
      corps.innerHTML = html;
    }

    var cases = document.querySelectorAll(".co-case");
    for (var c = 0; c < cases.length; c++) {
      cases[c].checked = Object.prototype.hasOwnProperty.call(choix, cases[c].value);
    }
  }

  function escape_(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function bascule(rid, actif) {
    if (actif) choix[rid] = facteur(rid);
    else delete choix[rid];
    ecris();
    dessine();
  }

  function copie() {
    var t = texteListe();
    if (!t) return;
    var dit = function (m) {
      var e = panneau.querySelector(".co-etat");
      e.textContent = m;
      setTimeout(function () { e.textContent = ""; }, 2500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () { dit("Copiée"); },
        function () { dit("Copie refusée par le navigateur"); });
      return;
    }
    // Repli pour les navigateurs sans presse-papiers asynchrone.
    var z = document.createElement("textarea");
    z.value = t; z.setAttribute("readonly", "");
    z.style.position = "fixed"; z.style.left = "-9999px";
    document.body.appendChild(z); z.select();
    try { document.execCommand("copy"); dit("Copiée"); } catch (e) { dit("Copie impossible"); }
    document.body.removeChild(z);
  }

  function demarre() {
    var barres = document.querySelectorAll(".echelle");
    if (!barres.length) return;

    choix = lis();

    for (var i = 0; i < barres.length; i++) {
      (function (b) {
        var rid = b.getAttribute("data-rid");
        var l = document.createElement("label");
        l.className = "co-label";
        l.innerHTML = '<input type="checkbox" class="co-case" value="' + rid + '"> courses';
        l.querySelector(".co-case").addEventListener("change", function (ev) {
          bascule(rid, ev.target.checked);
        });
        b.insertBefore(l, b.querySelector(".ech-aide"));
      })(barres[i]);
    }

    bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = "co-ouvre";
    bouton.hidden = true;
    bouton.addEventListener("click", function () {
      panneau.hidden = false;
      dessine();
      panneau.querySelector(".co-copier").focus();
    });
    document.body.appendChild(bouton);

    panneau = document.createElement("aside");
    panneau.className = "co-panneau";
    panneau.hidden = true;
    panneau.setAttribute("aria-label", "Liste de courses");
    panneau.innerHTML =
      '<div class="co-tete"><strong>Liste de courses</strong>' +
      '<button type="button" class="co-fermer" aria-label="Fermer">×</button></div>' +
      '<div class="co-corps"></div>' +
      '<div class="co-pied"><button type="button" class="btn co-copier">Copier</button>' +
      '<button type="button" class="btn co-vider">Tout décocher</button>' +
      '<span class="co-etat" aria-live="polite"></span></div>';
    document.body.appendChild(panneau);
    corps = panneau.querySelector(".co-corps");

    panneau.querySelector(".co-fermer").addEventListener("click", function () { panneau.hidden = true; });
    panneau.querySelector(".co-copier").addEventListener("click", copie);
    panneau.querySelector(".co-vider").addEventListener("click", function () {
      choix = {}; ecris(); dessine(); panneau.hidden = true;
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && !panneau.hidden) panneau.hidden = true;
    });

    dessine();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarre);
  else demarre();
})();
