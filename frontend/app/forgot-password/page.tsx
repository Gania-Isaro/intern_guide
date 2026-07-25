"use client";

// Forgot-password, done as a one-time code (OTP) by email, one thing per step:
//
//   Step 1 ("email"):    type your email, we send a 6-digit code to it.
//   Step 2 ("code"):     type the code, we check it (nothing else yet).
//   Step 3 ("password"): only now do you set the new password.
//   Step 4 ("done"):     success, with a link back to login.
//
// The email and code are kept in state, so the later steps already have them.

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { PasswordInput } from "@/components/ui/password-input";

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-200";

const buttonClass =
  "w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

type Step = "email" | "code" | "password" | "done";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [notice, setNotice] = useState(""); // the "we sent a code" line
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: ask the server to email a code.
  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Enter your email.");
      return;
    }

    setIsSubmitting(true);
    const result = await apiPost("/auth/forgot-password", { email });
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setNotice(
      "A 6-digit code is on its way to your email. Enter it below."
    );
    setStep("code");
  }

  // Step 2: check the code only. The password field appears after this passes.
  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (code.trim().length !== 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    setIsSubmitting(true);
    const result = await apiPost("/auth/verify-reset-code", { email, code: code.trim() });
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setStep("password");
  }

  // Step 3: set the new password (code was already verified in step 2).
  async function submitNewPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    const result = await apiPost("/auth/reset-password", {
      email,
      code: code.trim(),
      new_password: newPassword,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      // the code may have expired between steps: send them back to re-enter it
      setError(result.error);
      setStep("code");
      return;
    }
    setStep("done");
  }

  function startOver() {
    setStep("email");
    setError("");
    setCode("");
    setNewPassword("");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          {step === "done" ? "Password reset" : "Reset your password"}
        </h1>

        {/* ---------- step 1: enter email ---------- */}
        {step === "email" && (
          <form onSubmit={requestCode}>
            <p className="text-gray-600 text-sm mb-6">
              Enter the email for your account and we&apos;ll send you a code.
            </p>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>

            <button type="submit" disabled={isSubmitting} className={buttonClass}>
              {isSubmitting ? "Sending..." : "Send code"}
            </button>
          </form>
        )}

        {/* ---------- step 2: enter the code ---------- */}
        {step === "code" && (
          <form onSubmit={verifyCode}>
            {notice && <p className="text-gray-600 text-sm mb-6">{notice}</p>}

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <div className="mb-6">
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                6-digit code
              </label>
              <input
                id="code"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className={`${inputClass} tracking-widest`}
              />
            </div>

            <button type="submit" disabled={isSubmitting} className={buttonClass}>
              {isSubmitting ? "Checking..." : "Verify code"}
            </button>

            <button
              type="button"
              onClick={startOver}
              className="w-full text-sm text-gray-600 hover:underline mt-4 text-center"
            >
              Wrong email? Start over
            </button>
          </form>
        )}

        {/* ---------- step 3: set the new password ---------- */}
        {step === "password" && (
          <form onSubmit={submitNewPassword}>
            <p className="text-gray-600 text-sm mb-6">
              Code verified. Choose a new password for your account.
            </p>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <div className="mb-6">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New password
              </label>
              <PasswordInput
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                autoFocus
              />
              <p className="text-gray-500 text-xs mt-1">At least 8 characters.</p>
            </div>

            <button type="submit" disabled={isSubmitting} className={buttonClass}>
              {isSubmitting ? "Saving..." : "Set new password"}
            </button>
          </form>
        )}

        {/* ---------- step 4: done ---------- */}
        {step === "done" && (
          <>
            <p className="text-gray-600 text-sm mb-6">
              Your password has been reset. You can now log in with your new password.
            </p>
            <a href="/login" className={`${buttonClass} block text-center`}>
              Go to login
            </a>
          </>
        )}

        {step !== "done" && (
          <p className="text-sm text-gray-600 mt-4 text-center">
            Remembered it?{" "}
            <a href="/login" className="text-green-600 hover:underline">
              Back to login
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
