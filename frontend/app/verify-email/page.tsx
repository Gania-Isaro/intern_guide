"use client";

// After registering, a new account confirms its email here with the 6-digit
// code we emailed. Until that's done, the account can't log in.
//
// The email is handed over in sessionStorage (set by register/login) rather
// than the URL, so it never lands in the address bar or browser history. A
// legacy ?email= query param is still read as a fallback for older links.

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { apiPost } from "@/lib/api";

// Must match the backend's OTP_TTL_MINUTES so the countdown matches the code.
const CODE_TTL_SECONDS = 10 * 60;

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring";
const buttonClass =
  "w-full bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

function formatCountdown(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Prefer the email we stashed at register/login; fall back to a legacy query
  // param so old email links or bookmarks still work.
  const [email, setEmail] = React.useState("");
  React.useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? window.sessionStorage.getItem("pendingVerifyEmail")
        : null;
    setEmail(stored || searchParams.get("email") || "");
  }, [searchParams]);

  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [resending, setResending] = React.useState(false);

  // Seconds left before the emailed code expires. Starts on mount (right after
  // the code was sent) and resets whenever a new one is requested.
  const [secondsLeft, setSecondsLeft] = React.useState(CODE_TTL_SECONDS);
  const expired = secondsLeft <= 0;

  React.useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (expired) {
      setError("That code has expired. Request a new one below.");
      return;
    }
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
    window.sessionStorage.removeItem("pendingVerifyEmail");
    toast.success("Email verified - you can now log in.");
    router.push("/login");
  }

  async function handleResend() {
    setResending(true);
    const result = await apiPost("/auth/resend-verification", { email });
    setResending(false);
    if (result.ok) {
      setCode("");
      setError("");
      setSecondsLeft(CODE_TTL_SECONDS); // restart the countdown for the new code
      toast.success("A new code is on its way.");
    } else {
      toast.error(result.error);
    }
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
          {error && <p role="alert" className="text-danger text-sm mb-4">{error}</p>}

          <div className="mb-2">
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
              disabled={expired}
              className={`${inputClass} tracking-widest disabled:bg-gray-50 disabled:text-gray-400`}
            />
          </div>

          {/* live expiry status, so the user knows how long the code is good for */}
          <p className="mb-6 text-xs" aria-live="polite">
            {expired ? (
              <span className="text-danger">
                Your code has expired. Request a new one below.
              </span>
            ) : (
              <span className="text-gray-500">
                Code expires in{" "}
                <span className="font-medium tabular-nums">{formatCountdown(secondsLeft)}</span>
              </span>
            )}
          </p>

          <button type="submit" disabled={isSubmitting || expired} className={buttonClass}>
            {isSubmitting ? "Verifying..." : "Verify email"}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-4 text-center">
          {expired ? "Code expired?" : "Didn't get it?"}{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-primary-deep underline disabled:opacity-50 font-medium"
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
