"use client";

// Manage companies (E4): the admin adds a new company or fixes the
// details of an existing one. One form does both jobs - empty it means
// "create", picking a company fills it and it means "edit".

import * as React from "react";
import Link from "next/link";

import { apiGet, apiPost } from "@/lib/api";
import { AMENITY_LABELS, labelFor } from "@/lib/labels";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorState, LoadingState } from "@/components/ui/states";

interface Company {
  id: number;
  name: string;
  industry: string | null;
  location: string | null;
  website: string | null;
  description?: string | null;
}

interface PendingCompany {
  id: number;
  name: string;
  description: string | null;
  industry: string | null;
  location: string | null;
  website: string | null;
  google_address: string | null;
  size: string | null;
  founded_year: number | null;
  owner_name: string;
  owner_email: string;
  amenities: string[];
}

const EMPTY_FORM = {
  name: "",
  industry: "",
  location: "",
  website: "",
  description: "",
};

export default function ManageCompaniesPage() {
  const { user, isLoading } = useAuth();

  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
    // businesses owners registered themselves, waiting for a yes or no
  const [pending, setPending] = React.useState<PendingCompany[]>([]);
  const [deciding, setDeciding] = React.useState<number | null>(null);

  const [form, setForm] = React.useState(EMPTY_FORM);
  // null = the form creates a new company; an id = the form edits that one
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const loadCompanies = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await apiGet("/companies", { per_page: 50, sort: "name" });
    if (result.ok) {
      setCompanies((result.data as { companies: Company[] }).companies);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, []);

    const loadPending = React.useCallback(async () => {
    const result = await apiGet("/admin/companies");
    if (result.ok) {
      setPending((result.data as { companies: PendingCompany[] }).companies);
    }
  }, []);

  React.useEffect(() => {
    if (user?.role === "admin") {
      loadCompanies();
      loadPending();
    }
  }, [user, loadCompanies, loadPending]);

  if (isLoading) return <LoadingState label="Checking your account…" />;
  if (!user || user.role !== "admin") {
    return (
      <div className="mx-auto max-w-lg py-16 text-center space-y-3">
        <h1 className="text-2xl font-bold">Admins only</h1>
        <p className="text-ink-secondary">
          Only admins can add or edit companies.
        </p>
        <Button asChild variant="secondary" size="sm">
          <Link href="/">Back to the homepage</Link>
        </Button>
      </div>
    );
  }

  async function startEditing(company: Company) {
    // the list endpoint is slim - fetch the full record so website and
    // description land in the form too (otherwise saving would wipe them)
    setEditingId(company.id);
    setMessage(null);
    const result = await apiGet(`/companies/${company.id}`);
    const full = result.ok ? (result.data as Company) : company;
    setForm({
      name: full.name ?? "",
      industry: full.industry ?? "",
      location: full.location ?? "",
      website: full.website ?? "",
      description: full.description ?? "",
    });
  }

  function startCreating() {
    setEditingId(null);
    setMessage(null);
    setForm(EMPTY_FORM);
  }

  // Approve or reject one business. On success it leaves the queue straight
  // away, and an approval also lands in the list below it.
  async function decide(id: number, choice: "approve" | "reject") {
    setDeciding(id);
    const result = await apiPost(`/admin/companies/${id}/${choice}`, {});
    if (result.ok) {
      setPending((current) => current.filter((company) => company.id !== id));
      if (choice === "approve") await loadCompanies();
    } else {
      setMessage(result.error);
    }
    setDeciding(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) {
      setMessage("The company needs a name.");
      return;
    }
    setSaving(true);
    setMessage(null);

    const endpoint =
      editingId === null ? "/companies" : `/companies/${editingId}/edit`;
    const result = await apiPost(endpoint, form);

    if (result.ok) {
      // reset the form by hand (startCreating would wipe the message too)
      setEditingId(null);
      setForm(EMPTY_FORM);
      setMessage(editingId === null ? "Company created." : "Company updated.");
      await loadCompanies(); // show the fresh list right away
    } else {
      setMessage(result.error);
    }
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10 py-10 px-4">
      <div>
        <h1 className="text-2xl font-bold">Manage companies</h1>
        <p className="text-ink-secondary">
          Add a company students can review, or fix an existing one.
        </p>
      </div>


      {/* ---------- businesses waiting for a decision ---------- */}
      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            Waiting for approval ({pending.length})
          </h2>
          <p className="text-sm text-ink-secondary">
            Owners registered these themselves. They stay hidden from students
            until you approve them.
          </p>

          {pending.map((company) => (
            <div
              key={company.id}
              className="space-y-3 rounded-card border border-border bg-white p-5 shadow-soft"
            >
              <div>
                <p className="font-medium">{company.name}</p>
                <p className="text-sm text-ink-secondary">
                  {[company.industry, company.location].filter(Boolean).join(" · ") ||
                    "No details given"}
                </p>
                <p className="text-sm text-ink-muted">
                  Registered by {company.owner_name} ({company.owner_email})
                </p>
              </div>

              {company.description && (
                <p className="text-sm text-ink-secondary">{company.description}</p>
              )}

              <div className="flex flex-wrap gap-2 text-sm text-ink-secondary">
                {company.website && <span>{company.website}</span>}
                {company.google_address && <span>· {company.google_address}</span>}
                {company.size && <span>· {company.size} people</span>}
                {company.founded_year && <span>· founded {company.founded_year}</span>}
              </div>

              {company.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {company.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="rounded-chip bg-paper px-2.5 py-1 text-sm text-ink-secondary"
                    >
                      {labelFor(AMENITY_LABELS, amenity)}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={deciding === company.id}
                  onClick={() => decide(company.id, "approve")}
                >
                  Approve
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={deciding === company.id}
                  onClick={() => decide(company.id, "reject")}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ---------- the add / edit form ---------- */}
      <form
        onSubmit={handleSubmit}
        className="rounded-card border border-border bg-white p-6 shadow-soft space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {editingId === null ? "Add a company" : `Editing: ${form.name || "…"}`}
          </h2>
          {editingId !== null && (
            <Button type="button" variant="ghost" size="sm" onClick={startCreating}>
              Cancel, add a new one instead
            </Button>
          )}
        </div>

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
        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="text-label text-ink-secondary">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            className="rounded-input border border-border bg-white px-3 py-2 text-body outline-none focus:border-primary"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {message && <p className="text-sm text-ink-secondary">{message}</p>}

        <Button type="submit" disabled={saving}>
          {editingId === null ? "Create company" : "Save changes"}
        </Button>
      </form>

      {/* ---------- the list ---------- */}
      {loading ? (
        <LoadingState label="Loading companies…" />
      ) : error ? (
        <ErrorState description={error} onRetry={loadCompanies} />
      ) : (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">All companies ({companies.length})</h2>
          {companies.map((company) => (
            <div
              key={company.id}
              className="flex items-center justify-between gap-3 rounded-card border border-border bg-white px-4 py-3 shadow-soft"
            >
              <div>
                <p className="font-medium">{company.name}</p>
                <p className="text-sm text-ink-secondary">
                  {[company.industry, company.location].filter(Boolean).join(" · ") ||
                    "No details yet"}
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => startEditing(company)}>
                Edit
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}