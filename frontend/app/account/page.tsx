"use client";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";

// "company_owner" reads better as "Company owner" on screen
const ROLE_LABELS: Record<string, string> = {
  student: "Student",
  company_owner: "Company owner",
  admin: "Admin",
};

function roleLabel(role: string) {
  return ROLE_LABELS[role] ?? role;
}

export default function AccountPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <p className="text-center py-10">Loading...</p>;
  // Middleware already sends logged-out visitors to /login, so this only shows
  // in the rare case of an expired session - point them at logging in again.
  if (!user) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-3">
        <p className="text-ink-secondary">Please log in to view your account.</p>
        <Button asChild size="sm">
          <Link href="/login?from=/account">Log in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">My Account</h1>
      <div className="space-y-3">
        <p><span className="font-semibold">Name:</span> {user.name}</p>
        <p><span className="font-semibold">Email:</span> {user.email}</p>
        <p><span className="font-semibold">Role:</span> {roleLabel(user.role)}</p>
        {/* Verification is the "I really did this internship" proof, so it only
            means anything for a student. An admin or company owner has no such
            status, and showing one read as a contradiction. */}
        {user.role === "student" && (
          <p>
            <span className="font-semibold">Verification status:</span>{" "}
            {user.is_verified ? "Verified intern" : "Not yet verified"}
          </p>
        )}
      </div>

      {user.role === "student" && (
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="secondary" size="sm">
            <Link href="/my-reviews">My reviews</Link>
          </Button>
          {!user.is_verified && (
            <Button asChild variant="primary" size="sm">
              <Link href="/verify">Verify my placement</Link>
            </Button>
          )}
        </div>
      )}

      {/* each role gets its own front door (sprint 4) */}
      {user.role === "admin" && (
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="primary" size="sm">
            <Link href="/admin">Moderation queue</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/companies">Manage companies</Link>
          </Button>
        </div>
      )}

      {user.role === "company_owner" && (
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="primary" size="sm">
            <Link href="/owner">My company dashboard</Link>
          </Button>
        </div>
      )}
    </div>
  );
}