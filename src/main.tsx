import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register Service Worker for offline capability only in production
if ("serviceWorker" in navigator) {
  if ((import.meta as any).env?.PROD) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) =>
          console.log("Service Worker registered successfully:", reg.scope),
        )
        .catch((err) =>
          console.error("Service Worker registration failed:", err),
        );
    });
  } else {
    // In dev mode, unregister any active service worker and clear caches so Vite assets are always fresh
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
    if ("caches" in window) {
      caches.keys().then((keys) => {
        for (const key of keys) {
          caches.delete(key);
        }
      });
    }
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
