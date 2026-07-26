"use client";

// A small, accessible confirmation dialog (Radix), used in place of the raw
// window.confirm() for deliberate actions like deleting a company. Radix gives
// us the focus trap, Escape-to-close, and backdrop for free.

import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel(); // closing via Escape or backdrop = cancel
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-card border border-border bg-white p-6 shadow-soft focus:outline-none">
          <Dialog.Title className="font-display text-card-title text-ink">
            {title}
          </Dialog.Title>
          {description && (
            <Dialog.Description className="mt-2 text-body text-ink-secondary">
              {description}
            </Dialog.Description>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" size="sm" onClick={onCancel}>
              {cancelLabel}
            </Button>
            <button
              type="button"
              onClick={onConfirm}
              className={
                destructive
                  ? "rounded-control bg-danger px-4 py-2 text-sm font-medium text-white hover:bg-danger/90"
                  : "rounded-control bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              }
            >
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
