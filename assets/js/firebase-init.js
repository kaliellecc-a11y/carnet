/* Initialisation Firebase.
   Souche : remplacer par le firebase-init.js du projet.

   Ne pas coder les identifiants en dur ici — ce fichier est versionné.
   Poser la config réelle dans assets/js/firebase-config.local.js (ignoré par git)
   ou l'injecter à la construction via build.py. */

export const firebaseConfig = {
  apiKey: "A_RENSEIGNER",
  authDomain: "A_RENSEIGNER",
  projectId: "A_RENSEIGNER",
  storageBucket: "A_RENSEIGNER",
  messagingSenderId: "A_RENSEIGNER",
  appId: "A_RENSEIGNER",
};

export function initFirebase() {
  // TODO : initializeApp(firebaseConfig) + getFirestore/getAuth selon le besoin.
  return null;
}
