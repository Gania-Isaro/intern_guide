"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { NotAllowed, RedirectToLogin } from "@/components/auth/gates";
import { AMENITY_LABELS, labelFor } from "@/lib/labels";

const SIZES = ["1-10", "11-50", "51-200", "200+"];

interface MyCompany {
  company: {
    id: number;
    name: string;
    description: string | null;
    industry: string | null;
    location: string | null;
    website: string | null;
    google_address: string | null;
    size: string | null;
    founded_year: number | null;
    amenities: string[];
  };
}

export default function EditCompanyPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [companyId, setCompanyId] = React.useState<number | null>(null);
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
  // the perks ticked on this page, sent to the API as a list of codes
  const [amenities, setAmenities] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await apiGet("/me/company");
    if (result.ok) {
      const { company } = result.data as MyCompany;
      setCompanyId(company.id);
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
  }, []);

  React.useEffect(() => {
    if (user?.role === "company_owner") load();
  }, [user, load]);

  if (isLoading) return <LoadingState label="Checking your account…" />;
  if (!user) return <RedirectToLogin />;
  if (user.role !== "company_owner") {
    return (
      <NotAllowed
        title="Company owners only"
        text="This page is for the person who manages a company profile."
      />
    );
  }
  if (loading) return <LoadingState label="Loading your company…" />;
  if (error || companyId === null) {
    return <ErrorState description={error ?? "Could not load your company."} onRetry={load} />;
  }

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
      toast.success("Company profile updated.");
      router.push("/owner"); // back to the dashboard, which reloads fresh data
    } else {
      toast.error(result.error);
      setMessage(result.error);
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 py-10 px-4">
      <div>
        <h1 className="text-2xl font-bold">Edit company profile</h1>
        <p className="text-ink-secondary">
          This is what students see on your company page.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="name"
          label="Name"
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
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </div>
        <Input
          id="website"
          label="Website"
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
        />

        {/* Anything Google Maps can find works, because that is literally what
            we hand it. Search your business on Google Maps and copy the
            address it shows. */}
        <Input
          id="google_address"
          label="Address on Google Maps"
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
              className="rounded-control border border-border bg-white px-3 py-2 text-body outline-none focus:border-primary"
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
            value={form.founded_year}
            onChange={(e) => setForm({ ...form, founded_year: e.target.value })}
            placeholder="2018"
          />
        </div>

        {/* What students filter on. Only tick what you really provide - these
            show as tags on your public page. */}
        <fieldset className="space-y-2">
          <legend className="text-label text-ink-secondary">
            What you offer interns
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
            className="rounded-control border border-border bg-white px-3 py-2 text-body outline-none focus:border-primary"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {message && <p className="text-sm text-ink-secondary">{message}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            Save changes
          </Button>
          <Button asChild variant="secondary">
            <Link href="/owner">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
 