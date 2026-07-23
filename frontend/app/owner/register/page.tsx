"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { apiPost } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/states";
import { AMENITY_LABELS, labelFor } from "@/lib/labels";

const SIZES = ["1-10", "11-50", "51-200", "200+"];

const EMPTY_FORM = {
  name: "",
  industry: "",
  location: "",
  website: "",
  description: "",
  google_address: "",
  size: "",
  founded_year: "",
};

export default function RegisterBusinessPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = React.useState(EMPTY_FORM);
  const [amenities, setAmenities] = React.useState<string[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  if (isLoading) return <LoadingState label="Checking your account…" />;

  if (!user || user.role !== "company_owner") {
    return (
      <div className="mx-auto max-w-lg space-y-3 py-16 text-center">
        <h1 className="text-2xl font-bold">Company owners only</h1>
        <p className="text-ink-secondary">
          Register with a company owner account to add your business.
        </p>
        <Button asChild variant="secondary" size="sm">
          <Link href="/">Back to the homepage</Link>
        </Button>
      </div>
    );
  }

  // what they see straight after sending it in
  if (done) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Thanks, that is with us</h1>
        <p className="text-ink-secondary">
          An admin will check your business before it goes live. Once it is
          approved you can post internships and reply to reviews from your
          dashboard.
        </p>
        <Button asChild variant="primary" size="sm">
          <Link href="/owner">Go to my dashboard</Link>
        </Button>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) {
      setMessage("Your business needs a name.");
      return;
    }
    setSaving(true);
    setMessage(null);

    const result = await apiPost("/companies/register", { ...form, amenities });

    if (result.ok) {
      setDone(true);
    } else {
      // e.g. the name is taken, or this account already registered a business
      setMessage(result.error);
      setSaving(false);
    }
  }

  function toggleAmenity(code: string) {
    setAmenities(
      amenities.includes(code)
        ? amenities.filter((item) => item !== code)
        : [...amenities, code]
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold">Register your business</h1>
        <p className="text-ink-secondary">
          Tell students what it is really like to intern with you. An admin
          checks every business before it appears on the site.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="name"
          label="Business name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="industry"
            label="Industry"
            value={form.industry}
            onChange={(e) => setForm({ ...form, industry: e.target.value })}
            placeholder="Software"
          />
          <Input
            id="location"
            label="City"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Kigali"
          />
        </div>

        <Input
          id="website"
          label="Website"
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
          placeholder="https://"
        />

        {/* handed straight to Google Maps on your public page */}
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
              How many people work there
            </label>
            <select
              id="size"
              value={form.size}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
              className="rounded-input border border-border bg-white px-3 py-2 text-body outline-none focus:border-primary"
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

        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="text-label text-ink-secondary">
            What you do
          </label>
          <textarea
            id="description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="rounded-input border border-border bg-white px-3 py-2 text-body outline-none focus:border-primary"
          />
        </div>

        <fieldset className="space-y-2">
          <legend className="text-label text-ink-secondary">
            What you offer interns
          </legend>
          <p className="text-sm text-ink-muted">
            Students filter on these, so only tick what you really provide.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {Object.keys(AMENITY_LABELS).map((code) => {
              const isOn = amenities.includes(code);
              return (
                <button
                  key={code}
                  type="button"
                  aria-pressed={isOn}
                  onClick={() => toggleAmenity(code)}
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

        {message && <p className="text-sm text-danger">{message}</p>}

        <Button type="submit" disabled={saving}>
          {saving ? "Sending…" : "Send for approval"}
        </Button>
      </form>
    </div>
  );
}
