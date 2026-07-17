"use client";

// Proof of placement upload (D5).
//
// An unverified student picks the company they interned at, attaches their
// certificate or offer letter (pdf/png/jpg, max 5 MB) and sends it. An
// admin checks it later; once approved, the student can write reviews.

import * as React from "react";
import Link from "next/link";
import { FileUp } from "lucide-react";

import { apiGet, apiUpload } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/states";
import { Card } from "@/components/ui/card";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // must match the backend's limit
const ALLOWED_TYPES = [".pdf", ".png", ".jpg", ".jpeg"];

interface CompanyOption {
  id: number;
  name: string;
}

export default function VerifyPage() {
  const { user, isLoading, refetch } = useAuth();

  const [companies, setCompanies] = React.useState<CompanyOption[]>([]);
  const [companyId, setCompanyId] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  // load the company list for the dropdown
  React.useEffect(() => {
    (async () => {
      const result = await apiGet("/companies", { per_page: 50 });
      if (result.ok) {
        setCompanies((result.data as { companies: CompanyOption[] }).companies);
      }
    })();
  }, []);

  // ---------- who is asking? ----------
  if (isLoading) return <LoadingState label="Checking your account…" />;

  if (!user) {
    return (
      <Card title="Log in first">
        <p className="text-body text-ink-secondary">
          You need an account to verify a placement.
        </p>
        <Button asChild variant="primary" size="sm">
          <Link href="/login">Log in</Link>
        </Button>
      </Card>
    );
  }

  if (user.role !== "student") {
    return (
      <Card title="For students only">
        <p className="text-body text-ink-secondary">
          Placement verification is for student accounts.
        </p>
      </Card>
    );
  }

  if (user.is_verified) {
    return (
      <Card title="You are already verified">
        <p className="text-body text-ink-secondary">
          Your placement was approved — you can write reviews right away.
        </p>
        <Button asChild variant="primary" size="sm">
          <Link href="/companies">Browse companies</Link>
        </Button>
      </Card>
    );
  }

  // ---------- proof already sent in this visit ----------
  if (sent) {
    return (
      <Card title="Proof received">
        <p className="text-body text-ink-secondary">
          Thank you! An admin will look at your document. Once it is approved,
          your account becomes verified and you can write reviews.
        </p>
        <Button asChild variant="secondary" size="sm">
          <Link href="/account">Go to my account</Link>
        </Button>
      </Card>
    );
  }

  // ---------- the upload form ----------
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const chosen = e.target.files?.[0] ?? null;
    if (!chosen) {
      setFile(null);
      return;
    }
    // same checks the server does, but instant, so nobody waits on a
    // doomed upload
    const name = chosen.name.toLowerCase();
    if (!ALLOWED_TYPES.some((ext) => name.endsWith(ext))) {
      setError("Only pdf, png or jpg files are allowed.");
      setFile(null);
      return;
    }
    if (chosen.size > MAX_FILE_SIZE) {
      setError("That file is bigger than 5 MB. Try a smaller scan or photo.");
      setFile(null);
      return;
    }
    setFile(chosen);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!companyId) {
      setError("Choose the company where you interned.");
      return;
    }
    if (!file) {
      setError("Attach your certificate or offer letter.");
      return;
    }

    const formData = new FormData();
    formData.append("company_id", companyId);
    formData.append("file", file);

    setIsSubmitting(true);
    const result = await apiUpload("/verification-proofs", formData);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    await refetch(); // in case the account state changed
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-lg space-y-8 py-8">
      <header className="space-y-2">
        <h1 className="font-display text-heading text-ink">
          Verify your placement
        </h1>
        <p className="text-body text-ink-secondary">
          Upload your internship certificate or offer letter. An admin checks
          it, and the file is deleted after the decision — it is never shown
          to anyone else.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="company" className="text-label text-ink">
            Where did you intern?
          </label>
          <select
            id="company"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            className="w-full rounded-control border border-border bg-white px-3.5 py-3 text-body text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Choose a company…</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="proof" className="text-label text-ink">
            Your proof document
          </label>
          <label
            htmlFor="proof"
            className="flex cursor-pointer flex-col items-center gap-2 rounded-card border border-dashed border-border bg-paper px-6 py-10 text-center"
          >
            <FileUp className="h-6 w-6 text-ink-muted" />
            <span className="text-body text-ink-secondary">
              {file ? file.name : "Click to choose a pdf, png or jpg (max 5 MB)"}
            </span>
          </label>
          <input
            id="proof"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="sr-only"
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" variant="primary" loading={isSubmitting}>
          Send for verification
        </Button>
      </form>
    </div>
  );
}