// Service Worker EasyClinic — mode hors-ligne / PWA
const CACHE_NAME = "easyclinic-cache-v2";
const FICHIERS_A_METTRE_EN_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", (evenement) => {
  self.skipWaiting();
  evenement.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FICHIERS_A_METTRE_EN_CACHE).catch(() => {});
    })
  );
});

self.addEventListener("activate", (evenement) => {
  evenement.waitUntil(
    caches.keys().then((noms) =>
      Promise.all(
        noms.filter((nom) => nom !== CACHE_NAME).map((nom) => caches.delete(nom))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (evenement) => {
  if (evenement.request.method !== "GET") return;
  evenement.respondWith(
    caches.match(evenement.request).then((reponseEnCache) => {
      const recuperationReseau = fetch(evenement.request)
        .then((reponseReseau) => {
          if (reponseReseau && reponseReseau.status === 200) {
            const copie = reponseReseau.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(evenement.request, copie));
          }
          return reponseReseau;
        })
        .catch(() => reponseEnCache);
      return reponseEnCache || recuperationReseau;
    })
  );
});
