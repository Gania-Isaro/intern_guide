"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login?from=%2Fdashboard");
    }
  }, [isLoading, user, router]);

   if (isLoading || !user) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
      <p className="text-sm text-muted-foreground">
        Logged in as {user.email} ({user.role})
      </p>
    </div>
  );
}