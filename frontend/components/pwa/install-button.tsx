"use client";

// "Download app" control for the navbar. Installing a PWA is browser-driven and
// differs by platform, so this is a smart button, not a link:
//   - Chrome / Edge / Android: capture the browser's install event and, on click,
//     show the native install dialog.
//   - iPhone Safari: no programmatic install exists, so show a short instructions
//     popup (Share -> Add to Home Screen).
//   - Already installed (running standalone): render nothing.

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Download, Share, X } from "lucide-react";

import { cn } from "@/lib/utils";

// The browser's install event (not in the standard TS DOM types yet).
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function runningAsApp() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari exposes this instead of display-mode
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function InstallButton({ className }: { className?: string }) {
  const [deferred, setDeferred] = React.useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = React.useState(false);
  const [ios, setIos] = React.useState(false);
  const [showIosHelp, setShowIosHelp] = React.useState(false);

  React.useEffect(() => {
    setInstalled(runningAsApp());
    setIos(isIos());

    const onPrompt = (e: Event) => {
      e.preventDefault(); // stop Chrome's mini-infobar; we drive it from the button
      setDeferred(e as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Nothing to offer if it's already installed, or if this browser can neither
  // prompt (no captured event) nor be guided (not iOS).
  if (installed) return null;
  const canPrompt = !!deferred;
  if (!canPrompt && !ios) return null;

  async function handleClick() {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice.catch(() => undefined);
      setDeferred(null); // the captured event can only be used once
      return;
    }
    setShowIosHelp(true); // iOS: show the manual steps
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={cn("inline-flex items-center gap-2", className)}
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        Download app
      </button>

      <Dialog.Root open={showIosHelp} onOpenChange={setShowIosHelp}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-card border border-border bg-white p-6 shadow-soft focus:outline-none">
            <Dialog.Title className="pr-8 font-display text-card-title text-ink">
              Add InternGuide to your home screen
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-body text-ink-secondary">
              On iPhone, install it from Safari in three steps.
            </Dialog.Description>
            <ol className="mt-4 space-y-3 text-sm text-ink-secondary">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-ink">1.</span>
                <span className="inline-flex flex-wrap items-center gap-1">
                  Tap the Share button
                  <Share className="h-4 w-4 text-primary" aria-hidden="true" />
                  in Safari&apos;s toolbar.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-ink">2.</span>
                <span>Scroll down and tap &ldquo;Add to Home Screen&rdquo;.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-ink">3.</span>
                <span>Tap &ldquo;Add&rdquo; in the top corner. Done.</span>
              </li>
            </ol>
            <Dialog.Close
              className="absolute right-4 top-4 rounded-sm text-ink-muted hover:text-ink focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Close"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
