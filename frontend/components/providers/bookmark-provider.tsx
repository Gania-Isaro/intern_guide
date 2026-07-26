"use client";

// Holds the set of companies the logged-in user has saved, so any company card
// can show a filled/empty heart and toggle it. Updates optimistically (the
// heart flips instantly) and confirms with a toast.

import * as React from "react";
import { toast } from "sonner";

import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";

interface BookmarkContextValue {
  isBookmarked: (companyId: number) => boolean;
  toggle: (company: { id: number; name: string }) => void;
}

const BookmarkContext = React.createContext<BookmarkContextValue | undefined>(undefined);

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = React.useState<Set<number>>(new Set());

  // load the saved ids whenever the logged-in user changes
  React.useEffect(() => {
    if (!user) {
      setIds(new Set());
      return;
    }
    let active = true;
    (async () => {
      const result = await apiGet("/me/bookmark-ids");
      if (active && result.ok) {
        setIds(new Set((result.data as { company_ids: number[] }).company_ids));
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const toggle = React.useCallback(
    (company: { id: number; name: string }) => {
      const wasSaved = ids.has(company.id);
      setIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.delete(company.id);
        else next.add(company.id);
        return next;
      });
      if (wasSaved) {
        apiDelete(`/me/bookmarks/${company.id}`);
        toast.success(`Removed ${company.name} from saved.`);
      } else {
        apiPost("/me/bookmarks", { company_id: company.id });
        toast.success(`Saved ${company.name}.`);
      }
    },
    [ids]
  );

  const value = React.useMemo(
    () => ({ isBookmarked: (companyId: number) => ids.has(companyId), toggle }),
    [ids, toggle]
  );

  return <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>;
}

export function useBookmarks() {
  const ctx = React.useContext(BookmarkContext);
  if (!ctx) throw new Error("useBookmarks must be used within BookmarkProvider");
  return ctx;
}
