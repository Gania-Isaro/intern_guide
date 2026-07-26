"use client";

// Editing one company, on its own page, so the admin no longer has to scroll
// back up a shared form. The id comes from the address: /admin/companies/2/edit

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { apiGet, apiPost } from "@/lib/api";
import { AMENITY_LABELS, labelFor } from "@/lib/labels";
import { useAuth } from "@/components/providers/auth-provider";
import { AdminTabs } from "@/components/layout/admin-tabs";
import { NotAllowed, RedirectToLogin } from "@/components/auth/gates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorState, LoadingState } from "@/components/ui/states";

const SIZES = ["1-10", "11-50", "51-200", "200+"];

interface Company {
  id: number;
  name: string;
  description: string | null;
  industry: string | null;
  location: string | null;
  website: string | null;
  google_address: string | null;
  size: string | null;
  founded_year: number | null;
  status: "pending" | "approved" | "rejected";
  amenities: string[];
}

export default function AdminEditCompanyPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const companyId = params.id;

  const [form, setForm] = React.useState({
    name: "",
    industry: "",
    location: "",
    website: "",
    description: "",
    google_address: "",
    size: "",
    founded_year: "",
  });
  const [amenities, setAmenities] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await apiGet(`/admin/companies/${companyId}`);
    if (result.ok) {
      const { company } = result.data as { company: Company };
      setForm({
        name: company.name ?? "",
        industry: company.industry ?? "",
        location: company.location ?? "",
        website: company.website ?? "",
        description: company.description ?? "",
        google_address: company.google_address ?? "",
        size: company.size ?? "",
        founded_year: company.founded_year ? String(company.founded_year) : "",
      });
      setAmenities(company.amenities ?? []);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [companyId]);

  React.useEffect(() => {
    if (user?.role === "admin") load();
  }, [user, load]);

  if (isLoading) return <LoadingState label="Checking your account…" />;
  if (!user) return <RedirectToLogin />;
  if (user.role !== "admin") {
    return (
      <NotAllowed title="Admins only" text="Only admins can edit companies." />
    );
  }
  if (loading) return <LoadingState label="Loading the company…" />;
  if (error) return <ErrorState description={error} onRetry={load} />;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) {
      setMessage("The company needs a name.");
      return;
    }
    setSaving(true);
    setMessage(null);
    const result = await apiPost(`/companies/${companyId}/edit`, {
      ...form,
      amenities,
    });
    if (result.ok) {
      toast.success("Company updated.");
      router.push("/admin/companies"); // back to the list
    } else {
      toast.error(result.error);
      setMessage(result.error);
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-10 px-4">
      <div>
        <h1 className="text-2xl font-bold">Edit {form.name || "company"}</h1>
        <p className="text-ink-secondary">
          This is what students see on the company page.
        </p>
      </div>

      <AdminTabs />

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-card border border-border bg-white p-lg shadow-soft"
      >
        <Input
          id="name"
          label="Name"
          autoComplete="organization"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="industry"
            label="Industry"
            value={form.industry}
            onChange={(e) => setForm({ ...form, industry: e.target.value })}
          />
          <Input
            id="location"
            label="Location"
            autoComplete="address-level2"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </div>
        <Input
          id="website"
          label="Website"
          type="url"
          inputMode="url"
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
        />
        <Input
          id="google_address"
          label="Address on Google Maps"
          autoComplete="street-address"
          value={form.google_address}
          onChange={(e) => setForm({ ...form, google_address: e.target.value })}
          placeholder="KG 7 Ave, Kigali, Rwanda"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="size" className="text-label text-ink-secondary">
              Company size
            </label>
            <select
              id="size"
              value={form.size}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
              className="rounded-control border border-border bg-white px-3 py-2 text-body outline-none focus:border-ring focus:ring-2 focus:ring-ring"
            >
              <option value="">Not saying</option>
              {SIZES.map((size) => (
                <option key={size} value={size}>
                  {size} people
                </option>
              ))}
            </select>
          </div>
          <Input
            id="founded_year"
            label="Founded in"
            type="number"
            inputMode="numeric"
            value={form.founded_year}
            onChange={(e) => setForm({ ...form, founded_year: e.target.value })}
            placeholder="2018"
          />
        </div>

        <fieldset className="space-y-2">
          <legend className="text-label text-ink-secondary">
            What they offer interns
          </legend>
          <div className="flex flex-wrap gap-2 pt-1">
            {Object.keys(AMENITY_LABELS).map((code) => {
              const isOn = amenities.includes(code);
              return (
                <button
                  key={code}
                  type="button"
                  aria-pressed={isOn}
                  onClick={() =>
                    setAmenities(
                      isOn
                        ? amenities.filter((item) => item !== code)
                        : [...amenities, code]
                    )
                  }
                  className={
                    isOn
                      ? "rounded-chip border border-primary bg-primary-tint px-3 py-1.5 text-sm text-primary-deep"
                      : "rounded-chip border border-border bg-white px-3 py-1.5 text-sm text-ink-secondary hover:border-primary"
                  }
                >
                  {labelFor(AMENITY_LABELS, code)}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="text-label text-ink-secondary">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            className="rounded-control border border-border bg-white px-3 py-2 text-body outline-none focus:border-ring focus:ring-2 focus:ring-ring"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {message && <p className="text-sm text-danger">{message}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
          <Button asChild variant="secondary">
            <Link href="/admin/companies">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
