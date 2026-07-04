"use client";

import { useAuth } from "@/components/providers/auth-provider";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
      <p className="text-sm text-muted-foreground">
        Logged in as {user?.email} ({user?.role})
      </p>
    </div>
  );
}