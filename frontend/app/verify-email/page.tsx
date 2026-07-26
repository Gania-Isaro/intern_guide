"use client";

// After registering, a new account confirms its email here with the 6-digit
// code we emailed. Until that's done, the account can't log in.

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { apiPost } from "@/lib/api";

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-200";
const buttonClass =
  "w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [resending, setResending] = React.useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (code.trim().length !== 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setIsSubmitting(true);
    const result = await apiPost("/auth/verify-email", { email, code: code.trim() });
    setIsSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success("Email verified - you can now log in.");
    router.push("/login");
  }

  async function handleResend() {
    setResending(true);
    const result = await apiPost("/auth/resend-verification", { email });
    setResending(false);
    if (result.ok) toast.success("A new code is on its way.");
    else toast.error(result.error);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Verify your email</h1>
        <p className="text-gray-600 text-sm mb-6">
          {email ? (
            <>
              We sent a 6-digit code to <span className="font-medium">{email}</span>. Enter it
              below to activate your account.
            </>
          ) : (
            "Enter the 6-digit code we emailed you when you created your account."
          )}
        </p>

        <form onSubmit={handleVerify}>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="mb-6">
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              6-digit code
            </label>
            <input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className={`${inputClass} tracking-widest`}
            />
          </div>

          <button type="submit" disabled={isSubmitting} className={buttonClass}>
            {isSubmitting ? "Verifying..." : "Verify email"}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-4 text-center">
          Didn&apos;t get it?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-green-600 hover:underline disabled:opacity-50"
          >
            {resending ? "Sending..." : "Resend code"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <React.Suspense fallback={null}>
      <VerifyEmailForm />
    </React.Suspense>
  );
}
