/* Mise en service du hors ligne, et signalement de l'état du réseau.

   Le service worker n'a de sens que sur un site servi en http(s). Ouvert
   depuis le disque (file://), le carnet reste un fichier autonome qui marche
   déjà sans réseau : on ne tente rien.

   Le bandeau de synchronisation dit ce qui est vrai à l'instant : les notes
   écrites hors ligne partent en file d'attente dans Firestore et remontent à
   la reconnexion — encore faut-il le dire, sinon on croit les avoir perdues. */
(function () {
  "use strict";

  if (location.protocol === "http:" || location.protocol === "https:") {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("./sw.js").catch(function () {});
      });
    }
  }

  var banniere = document.querySelector(".sync-etat");
  if (!banniere) return;
  var texteEnLigne = null;

  function etat() {
    if (texteEnLigne === null) texteEnLigne = banniere.textContent;
    if (navigator.onLine) {
      banniere.textContent = texteEnLigne;
      banniere.classList.remove("hors-ligne");
    } else {
      banniere.textContent = "Hors ligne : le carnet reste lisible, et les notes "
        + "que tu écris repartiront à la reconnexion.";
      banniere.classList.add("hors-ligne");
    }
  }

  window.addEventListener("online", etat);
  window.addEventListener("offline", etat);
  // Le bandeau est rempli par app.js au démarrage : on passe après lui.
  setTimeout(etat, 300);
})();
