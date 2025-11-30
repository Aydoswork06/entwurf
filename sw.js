self.addEventListener("install", (event) => {
  // Kannst hier später Cache definieren
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Platz für Cleanup
});

self.addEventListener("fetch", (event) => {
  // MVP: nur durchreichen
  return;
});
// PWA: Service Worker registrieren
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch(err => console.error("SW-Registration failed:", err));
  });
}
