"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiPost } from "@/lib/api";
import { validateLoginForm } from "@/lib/validation";
import { useAuth } from "@/components/providers/auth-provider";
import { PasswordInput } from "@/components/ui/password-input";
import { FieldError } from "@/components/ui/field-error";
  

// Where to go after logging in. Middleware adds ?from=/owner when it bounces a
// logged-out person, so we send them back there. Only our own paths are allowed
// ("/something", but not "//evil.com"), so this can't be used to redirect a
// user off to another site.
function safeReturnPath() {
  const from = new URLSearchParams(window.location.search).get("from");
  if (from && from.startsWith("/") && !from.startsWith("//")) {
    return from;
  }
  return "/";
}

function inputClass(hasError: boolean) {
  const base =
    "w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring";
  return hasError ? `${base} border-danger` : `${base} border-gray-300`;
}

export default function LoginPage() {
  const router = useRouter();
  const { refetch } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }
 
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");

    const validationErrors = validateLoginForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    const result = await apiPost("/auth/login", formData);
    setIsSubmitting(false);

    if (!result.ok) {
      // an unverified account is sent to the verify step, not left on an error
      if (/verify your email/i.test(result.error)) {
        sessionStorage.setItem("pendingVerifyEmail", formData.email);
        toast.error(result.error);
        router.push("/verify-email");
        return;
      }
      setSubmitError(result.error);
      return;
    }

    await refetch(); // reload /auth/me so the navbar shows the user immediately
    toast.success("Welcome back!");
    router.push(safeReturnPath());
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-lg shadow-sm border border-gray-200"
      >
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Welcome back
        </h1>
        <p className="text-gray-600 text-sm mb-6">Log in to manage your reviews.</p>

        {submitError && (
          <p role="alert" className="text-danger text-sm mb-4">{submitError}</p>
        )}

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={inputClass(!!errors.email)}
          />
          <FieldError id="email-error">{errors.email}</FieldError>
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            className={inputClass(!!errors.password)}
          />
          <FieldError id="password-error">{errors.password}</FieldError>
        </div>

        <p className="text-sm text-right mb-6">
          <a href="/forgot-password" className="text-primary-deep underline">
            Forgot password?
          </a>
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>

        <p className="text-sm text-gray-600 mt-4 text-center">
          or
        </p>

        <p className="text-sm text-gray-600 mt-4 text-center">
          New to InternGuide?{" "}
          <a href="/register" className="text-primary-deep underline">
            Create an account
          </a>
        </p>
      </form>
    </div>
  );
}
