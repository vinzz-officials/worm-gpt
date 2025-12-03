self.addEventListener("fetch", async (event) => {
  const url = new URL(event.request.url);

  // File yang mau lu override
  if (url.pathname.endsWith("/js/sk.js")) {
    event.respondWith(fetch("/prompt.js"));
    return;
  }

  // Semua resource lain tetap ke web asli
  const upstream = "https://ajudanxgpt";
  event.respondWith(fetch(upstream + url.pathname));
});
