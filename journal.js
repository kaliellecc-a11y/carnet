/* Synthèse du journal des fournées.

   Le journal est rempli fiche par fiche, et jusqu'ici rien ne le relisait
   d'ensemble : impossible de savoir ce qui attend une correction sans ouvrir
   les 68 fiches une par une.

   Les entrées sont lues dans la page, pas dans Firestore. C'est ce qui rend la
   synthèse indifférente au mode de stockage — base partagée ou localStorage —
   et évite de réécrire la logique qu'app.js tient déjà.

   Ce qui compte vraiment tient en une question : qu'est-ce qui est à reprendre.
   Une fiche dont la dernière fournée est ratée ou à corriger arrive en tête,
   même si elle a dix réussites derrière elle : c'est le dernier essai qui dit
   où en est la recette. */
(function () {
  "use strict";

  var section, corps, minute;

  function fiche(el) {
    var art = el.closest(".fiche");
    var n = art && art.querySelector(".rname");
    var h = art && art.querySelector("h4[id]");
    return {
      nom: n ? n.textContent.trim() : "",
      ancre: h ? "#" + h.id : null
    };
  }

  /* app.js affiche les dates en JJ/MM/AAAA ; on revient à l'ordre naturel pour
     pouvoir trier. Une date illisible est ignorée plutôt que placée au hasard. */
  function iso(txt) {
    var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((txt || "").trim());
    return m ? m[3] + "-" + m[2] + "-" + m[1] : null;
  }

  function jolie(d) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
    return m ? m[3] + "/" + m[2] + "/" + m[1] : d;
  }

  function releve() {
    var entrees = [];
    var lis = document.querySelectorAll(".journal .entries li");
    for (var i = 0; i < lis.length; i++) {
      var li = lis[i];
      var d = iso(li.querySelector(".jdate") && li.querySelector(".jdate").textContent);
      if (!d) continue;
      var f = fiche(li);
      entrees.push({
        date: d,
        verdict: ((li.querySelector(".jverdict") || {}).textContent || "").trim(),
        note: ((li.querySelector(".jnote") || {}).textContent || "").trim(),
        nom: f.nom,
        ancre: f.ancre
      });
    }
    entrees.sort(function (a, b) { return b.date.localeCompare(a.date); });
    return entrees;
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function lien(e) {
    return e.ancre ? '<a href="' + e.ancre + '">' + esc(e.nom) + "</a>" : esc(e.nom);
  }

  function classe(verdict) {
    if (/rat/i.test(verdict)) return "jr-rate";
    if (/corriger/i.test(verdict)) return "jr-corriger";
    return "jr-valide";
  }

  function dessine() {
    var entrees = releve();
    if (!entrees.length) {
      corps.innerHTML = '<p class="jr-vide">Le journal est vide. Note une fournée '
        + "sur une fiche, et cette page te dira ce qui a marché.</p>";
      return;
    }

    // Dernier verdict par fiche : c'est lui qui dit où en est la recette.
    var dernier = {}, compte = {}, parVerdict = { valide: 0, corriger: 0, rate: 0 };
    for (var i = 0; i < entrees.length; i++) {
      var e = entrees[i];
      if (!dernier[e.nom]) dernier[e.nom] = e;       // entrées déjà triées du plus récent
      compte[e.nom] = (compte[e.nom] || 0) + 1;
      var c = classe(e.verdict);
      parVerdict[c === "jr-rate" ? "rate" : c === "jr-corriger" ? "corriger" : "valide"]++;
    }

    var noms = Object.keys(compte);
    var html = '<p class="jr-tete"><strong>' + entrees.length + "</strong> fournée"
      + (entrees.length > 1 ? "s" : "") + " sur <strong>" + noms.length + "</strong> recette"
      + (noms.length > 1 ? "s" : "") + ", de " + jolie(entrees[entrees.length - 1].date)
      + " à " + jolie(entrees[0].date) + " — "
      + parVerdict.valide + " validée" + (parVerdict.valide > 1 ? "s" : "")
      + " · " + parVerdict.corriger + " à corriger"
      + " · " + parVerdict.rate + " ratée" + (parVerdict.rate > 1 ? "s" : "") + "</p>";

    var reprendre = noms.filter(function (n) {
      return classe(dernier[n].verdict) !== "jr-valide";
    }).sort(function (a, b) { return dernier[b].date.localeCompare(dernier[a].date); });

    if (reprendre.length) {
      html += '<div class="jr-bloc"><h3 class="jr-titre">À reprendre</h3><ul class="jr-liste">';
      for (var r = 0; r < reprendre.length; r++) {
        var d = dernier[reprendre[r]];
        html += '<li><span class="jr-verdict ' + classe(d.verdict) + '">' + esc(d.verdict)
          + "</span> " + lien(d) + ' <span class="jr-date">' + jolie(d.date) + "</span>"
          + (d.note ? ' <span class="jr-note">' + esc(d.note) + "</span>" : "") + "</li>";
      }
      html += "</ul></div>";
    } else {
      html += '<p class="jr-bravo">Rien à reprendre : la dernière fournée de chaque '
        + "recette est validée.</p>";
    }

    html += '<div class="jr-bloc"><h3 class="jr-titre">Dernières fournées</h3><ul class="jr-liste">';
    for (var k = 0; k < Math.min(10, entrees.length); k++) {
      var f = entrees[k];
      html += '<li><span class="jr-date">' + jolie(f.date) + "</span> " + lien(f)
        + ' <span class="jr-verdict ' + classe(f.verdict) + '">' + esc(f.verdict) + "</span>"
        + (f.note ? ' <span class="jr-note">' + esc(f.note) + "</span>" : "") + "</li>";
    }
    html += "</ul></div>";

    var souvent = noms.filter(function (n) { return compte[n] > 1; })
      .sort(function (a, b) { return compte[b] - compte[a]; }).slice(0, 5);
    if (souvent.length) {
      html += '<div class="jr-bloc"><h3 class="jr-titre">Les plus refaites</h3><ul class="jr-liste">';
      for (var s = 0; s < souvent.length; s++) {
        html += '<li><span class="jr-compte">' + compte[souvent[s]] + " fois</span> "
          + lien(dernier[souvent[s]]) + "</li>";
      }
      html += "</ul></div>";
    }

    corps.innerHTML = html;
  }

  function plusTard() {
    clearTimeout(minute);
    minute = setTimeout(dessine, 250);
  }

  function demarre() {
    section = document.getElementById("journal-des-fournees");
    if (!section) return;
    corps = section.querySelector(".jr-corps");

    dessine();

    /* Le journal se remplit après coup — au premier retour de Firestore, puis à
       chaque fournée ajoutée ou supprimée. On observe les listes plutôt que la
       page entière : le recalcul des quantités touche le DOM en permanence et
       relancerait la synthèse pour rien. */
    if (window.MutationObserver) {
      var obs = new MutationObserver(plusTard);
      var listes = document.querySelectorAll(".journal .entries");
      for (var i = 0; i < listes.length; i++) {
        obs.observe(listes[i], { childList: true });
      }
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarre);
  else demarre();
})();
