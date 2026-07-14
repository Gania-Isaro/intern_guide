"use client";
import { useAuth } from "@/components/providers/auth-provider";

export default function AccountPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <p className="text-center py-10">Loading...</p>;
  if (!user) return <p className="text-center py-10">Please log in to view your account.</p>;

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">My Account</h1>
      <div className="space-y-3">
        <p><span className="font-semibold">Name:</span> {user.name}</p>
        <p><span className="font-semibold">Email:</span> {user.email}</p>
        <p><span className="font-semibold">Role:</span> {user.role}</p>
        <p>
          <span className="font-semibold">Verification status:</span>{" "}
          {user.is_verified ? "Verified intern" : "Not yet verified"}
        </p>
      </div>
    </div>
  );
}