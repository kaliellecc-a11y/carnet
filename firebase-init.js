/* Firebase — synchronisation des notes entre appareils (projet carnet-recettes).
   Chargé seulement si le carnet n'est pas dans un contexte qui fournit déjà une base (Artifact Claude).
   La clé ci-dessous identifie le projet, elle n'est pas un secret : la protection vient des règles Firestore. */
window.CARNET_FIREBASE = {
  apiKey: "AIzaSyDJA7s8u_MUN29ybgJVoRsBWu0vC8xXZ8Q",
  authDomain: "carnet-recettes-3f0e0.firebaseapp.com",
  projectId: "carnet-recettes-3f0e0",
  storageBucket: "carnet-recettes-3f0e0.firebasestorage.app",
  messagingSenderId: "986020445204",
  appId: "1:986020445204:web:ae58b72da682e3a705fb01"
};

/* Charge le SDK compat (v10) à la demande et rend une façade identique à celle de window.claude.use("db") :
   db.doc(path).get() / .set(data) / .onSnapshot(fn, err) */
window.carnetFirebase = function () {
  var cfg = window.CARNET_FIREBASE;
  if (!cfg || !cfg.apiKey || /^COLLE/.test(cfg.apiKey)) return Promise.resolve(null);
  if (!navigator.onLine && !window.firebase) return Promise.resolve(null);

  function load(src) {
    return new Promise(function (ok, ko) {
      var s = document.createElement("script");
      s.src = src; s.async = true;
      s.onload = ok; s.onerror = function () { ko(new Error("chargement " + src)); };
      document.head.appendChild(s);
    });
  }
  var base = "https://www.gstatic.com/firebasejs/10.12.2/";
  return load(base + "firebase-app-compat.js")
    .then(function () { return load(base + "firebase-firestore-compat.js"); })
    .then(function () {
      if (!window.firebase) return null;
      if (!firebase.apps.length) firebase.initializeApp(cfg);
      var fs = firebase.firestore();
      try { fs.enablePersistence({ synchronizeTabs: true }).catch(function () {}); } catch (e) {}
      return { doc: function (path) { return fs.doc(path); } };
    })
    .catch(function () { return null; });
};
