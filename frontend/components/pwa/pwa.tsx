"use client";

import * as React from "react";
import { WifiOff } from "lucide-react";

// Registers the service worker (production only) and shows a small banner while
// the device is offline, so users understand why fresh data isn't loading.
export function Pwa() {
  const [offline, setOffline] = React.useState(false);

  React.useEffect(() => {
    // register the service worker that powers offline support
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // registration failing must never break the app
      });
    }

    // track connectivity. The online/offline events are authoritative, so we
    // set state directly from them (rather than re-reading navigator.onLine).
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    setOffline(!navigator.onLine); // initial state on mount
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center gap-2 bg-ink px-4 py-2.5 text-sm font-medium text-white"
    >
      <WifiOff className="h-4 w-4" aria-hidden="true" />
      You&apos;re offline - showing saved pages
    </div>
  );
}
