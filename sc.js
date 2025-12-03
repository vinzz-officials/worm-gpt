const UPSTREAM = "https://ajudanxgpt.netlify.app";   // website target
const LOCAL_OVERRIDE = "/prompt.js";            // file lokal pengganti
const TARGET_JS_NAME = "js/sk.js";                 // nama js yang mau diganti

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // Jika request minta JS tertentu → ganti pakai punya kita
  if (url.pathname.includes(TARGET_JS_NAME)) {
    event.respondWith(fetch(LOCAL_OVERRIDE));
    return;
  }

  // Selain itu → ambil dari website target
  event.respondWith(fetch(UPSTREAM + url.pathname));
});
