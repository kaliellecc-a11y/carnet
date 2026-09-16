/* Service worker du carnet — pour qu'il s'ouvre en cuisine sans réseau.

   Le carnet tient dans un seul fichier : mettre la page en cache suffit à le
   rendre lisible hors ligne. Restent deux dépendances extérieures, chargées au
   premier passage en ligne puis servies depuis le cache : les polices Google,
   et le SDK Firebase que firebase-init.js va chercher sur gstatic.

   Ce que ce fichier ne touche jamais : les appels à Firestore lui-même. La
   persistance IndexedDB du SDK gère déjà la file d'attente hors ligne et la
   rejoue à la reconnexion ; s'interposer ne ferait que casser ce mécanisme.

   Stratégies :
     page      réseau d'abord, cache en secours — une version fraîche prime,
               mais l'absence de réseau ne doit jamais donner une page blanche
     polices   cache d'abord : elles ne changent pas
     SDK       cache d'abord, pour la même raison
*/

const CACHE = "carnet-__VERSION__";

const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icones/icone-192.png",
  "./icones/icone-512.png",
];

// Ressources tierces à garder, une fois chargées.
const DURABLES = [
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "www.gstatic.com/firebasejs",
];

// Tout ce qui parle à Firestore passe sans être touché.
const RESEAU_SEUL = [
  "firestore.googleapis.com",
  "firebaseinstallations.googleapis.com",
  "identitytoolkit.googleapis.com",
];

self.addEventListener("install", (ev) => {
  ev.waitUntil(
    caches.open(CACHE)
      // addAll échoue en bloc : on ajoute un par un pour qu'une ressource
      // manquante n'empêche pas le reste d'être mis en cache.
      .then((c) => Promise.all(PRECACHE.map((u) => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (ev) => {
  ev.waitUntil(
    caches.keys()
      .then((noms) => Promise.all(noms.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

function durable(url) {
  return DURABLES.some((d) => url.href.includes(d));
}

function intouchable(url) {
  return RESEAU_SEUL.some((d) => url.hostname.includes(d));
}

async function reseauDAbord(req) {
  try {
    const rep = await fetch(req);
    if (rep && rep.ok) {
      const cache = await caches.open(CACHE);
      cache.put("./index.html", rep.clone());
    }
    return rep;
  } catch (e) {
    const cache = await caches.open(CACHE);
    return (await cache.match("./index.html")) || (await cache.match("./")) || Response.error();
  }
}

async function cacheDAbord(req) {
  const cache = await caches.open(CACHE);
  const garde = await cache.match(req);
  if (garde) return garde;
  try {
    const rep = await fetch(req);
    // Une réponse opaque (police d'un autre domaine) est gardée telle quelle :
    // on ne peut pas la lire, mais on peut la resservir.
    if (rep && (rep.ok || rep.type === "opaque")) cache.put(req, rep.clone());
    return rep;
  } catch (e) {
    return Response.error();
  }
}

self.addEventListener("fetch", (ev) => {
  const req = ev.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (intouchable(url)) return;

  if (req.mode === "navigate") {
    ev.respondWith(reseauDAbord(req));
    return;
  }
  if (durable(url)) {
    ev.respondWith(cacheDAbord(req));
  }
});
