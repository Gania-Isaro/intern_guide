"use client";

// Manage companies (E4).
//
// Three tabs so nothing is buried under anything else:
//   Waiting      - businesses owners registered, needing a yes or no
//   All companies- every company, with edit / hide / delete
//   Add a company- the create form
// Editing happens on its own page, /admin/companies/<id>/edit.

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";

import { apiDelete, apiGet, apiPost } from "@/lib/api";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AMENITY_LABELS, labelFor } from "@/lib/labels";
import { useAuth } from "@/components/providers/auth-provider";
import { AdminTabs } from "@/components/layout/admin-tabs";
import { NotAllowed, RedirectToLogin } from "@/components/auth/gates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";

interface Company {
  id: number;
  name: string;
  industry: string | null;
  location: string | null;
  status: "pending" | "approved" | "rejected";
  average_rating: number | null;
  owner_name: string | null;
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

type Tab = "waiting" | "all" | "add";

export default function ManageCompaniesPage() {
  const { user, isLoading } = useAuth();

  // Start on "Waiting" only when something is actually waiting, so the admin
  // never lands on an empty tab.
  const [tab, setTab] = React.useState<Tab>("all");
  const pickedFirstTab = React.useRef(false);
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [pending, setPending] = React.useState<PendingCompany[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<number | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  // the company the admin is about to permanently delete (drives the dialog)
  const [toDelete, setToDelete] = React.useState<Company | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const [allResult, pendingResult] = await Promise.all([
      apiGet("/admin/companies/all"),
      apiGet("/admin/companies"),
    ]);
    if (!allResult.ok) {
      setError(allResult.error);
    } else {
      setCompanies((allResult.data as { companies: Company[] }).companies);
      if (pendingResult.ok) {
        const waiting = (pendingResult.data as { companies: PendingCompany[] }).companies;
        setPending(waiting);
        if (!pickedFirstTab.current) {
          pickedFirstTab.current = true;
          if (waiting.length > 0) setTab("waiting");
        }
      }
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    if (user?.role === "admin") load();
  }, [user, load]);

  if (isLoading) return <LoadingState label="Checking your account…" />;
  if (!user) return <RedirectToLogin />;
  if (user.role !== "admin") {
    return (
      <NotAllowed
        title="Admins only"
        text="Only admins can add or edit companies."
      />
    );
  }

  // Approve or reject one newly registered business.
  async function decide(id: number, choice: "approve" | "reject") {
    setBusyId(id);
    setNotice(null);
    const result = await apiPost(`/admin/companies/${id}/${choice}`, {});
    if (result.ok) {
      toast.success(`Company ${choice === "approve" ? "approved" : "rejected"}.`);
      await load();
    } else {
      toast.error(result.error);
      setNotice(result.error);
    }
    setBusyId(null);
  }

  // Hide a live company from students, or put a hidden one back.
  async function setLive(id: number, live: boolean) {
    setBusyId(id);
    setNotice(null);
    const action = live ? "activate" : "deactivate";
    const result = await apiPost(`/admin/companies/${id}/${action}`, {});
    if (result.ok) {
      toast.success(live ? "Company is visible to students again." : "Company hidden from students.");
      await load();
    } else {
      toast.error(result.error);
      setNotice(result.error);
    }
    setBusyId(null);
  }

  // Delete for good. Everything attached to the company goes with it, so
  // the admin has to confirm first.
  // The Delete button just opens the confirm dialog; the real work waits for
  // a deliberate confirmation.
  function remove(company: Company) {
    setToDelete(company);
  }

  async function confirmDelete() {
    if (!toDelete) return;
    const company = toDelete;
    setToDelete(null);
    setBusyId(company.id);
    setNotice(null);
    const result = await apiDelete(`/admin/companies/${company.id}`);
    if (result.ok) {
      toast.success(`${company.name} was deleted.`);
      await load();
    } else {
      toast.error(result.error);
      setNotice(result.error);
    }
    setBusyId(null);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-10 px-4">
      <ConfirmDialog
        open={toDelete !== null}
        title={toDelete ? `Delete ${toDelete.name}?` : ""}
        description="Its internships and reviews are deleted too. This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
      <div>
        <h1 className="text-2xl font-bold">Manage companies</h1>
        <p className="text-ink-secondary">
          Add a company students can review, or fix an existing one.
        </p>
      </div>

      <AdminTabs />

      {/* which of the three sections is showing */}
      <div className="flex flex-wrap gap-2">
        <TabButton current={tab} value="waiting" onClick={setTab}>
          Waiting ({pending.length})
        </TabButton>
        <TabButton current={tab} value="all" onClick={setTab}>
          All companies ({companies.length})
        </TabButton>
        <TabButton current={tab} value="add" onClick={setTab}>
          Add a company
        </TabButton>
      </div>

      {notice && (
        <p className="rounded-control bg-paper p-3 text-sm text-ink-secondary">{notice}</p>
      )}

      {loading ? (
        <LoadingState label="Loading companies…" />
      ) : error ? (
        <ErrorState description={error} onRetry={load} />
      ) : tab === "waiting" ? (
        <WaitingList pending={pending} busyId={busyId} onDecide={decide} />
      ) : tab === "all" ? (
        <AllList
          companies={companies}
          busyId={busyId}
          onSetLive={setLive}
          onDelete={remove}
        />
      ) : (
        <AddCompanyForm
          onCreated={async () => {
            await load();
            setTab("all");
            setNotice("Company created.");
          }}
        />
      )}
    </div>
  );
}

function TabButton({
  current,
  value,
  onClick,
  children,
}: {
  current: Tab;
  value: Tab;
  onClick: (tab: Tab) => void;
  children: React.ReactNode;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onClick(value)}
      className={
        active
          ? "rounded-chip border border-primary bg-primary-tint px-4 py-2 text-sm font-semibold text-primary-deep"
          : "rounded-chip border border-border bg-white px-4 py-2 text-sm text-ink-secondary hover:border-primary"
      }
    >
      {children}
    </button>
  );
}

// ------------------------------------------------- waiting for a decision

function WaitingList({
  pending,
  busyId,
  onDecide,
}: {
  pending: PendingCompany[];
  busyId: number | null;
  onDecide: (id: number, choice: "approve" | "reject") => void;
}) {
  if (pending.length === 0) {
    return (
      <EmptyState
        title="Nothing waiting"
        description="When an owner registers a business, it shows up here for a decision."
      />
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-secondary">
        Owners registered these themselves. They stay hidden from students until
        you approve them.
      </p>

      {pending.map((company) => (
        <div
          key={company.id}
          className="space-y-3 rounded-card border border-border bg-white p-lg shadow-soft"
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

          {(company.amenities ?? []).length > 0 && (
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
              disabled={busyId === company.id}
              onClick={() => onDecide(company.id, "approve")}
            >
              Approve
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={busyId === company.id}
              onClick={() => onDecide(company.id, "reject")}
            >
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ------------------------------------------------------------ all companies

const STATUS_TEXT = {
  approved: "Live",
  pending: "Waiting",
  rejected: "Hidden",
} as const;

function AllList({
  companies,
  busyId,
  onSetLive,
  onDelete,
}: {
  companies: Company[];
  busyId: number | null;
  onSetLive: (id: number, live: boolean) => void;
  onDelete: (company: Company) => void;
}) {
  const [filter, setFilter] = React.useState("");

  const shown = companies.filter((company) =>
    company.name.toLowerCase().includes(filter.trim().toLowerCase())
  );

  return (
    <div className="space-y-3">
      <Input
        id="filter"
        placeholder="Filter by name…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      {shown.length === 0 ? (
        <EmptyState title="No matches" description="No company has that name." />
      ) : (
        shown.map((company) => (
          <div
            key={company.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-white p-lg shadow-soft"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{company.name}</p>
                <span
                  className={
                    company.status === "approved"
                      ? "rounded-chip bg-primary-tint px-2.5 py-1 text-sm text-primary-deep"
                      : company.status === "pending"
                        ? "rounded-chip bg-pending-tint px-2.5 py-1 text-sm text-pending"
                        : "rounded-chip bg-danger-tint px-2.5 py-1 text-sm text-danger"
                  }
                >
                  {STATUS_TEXT[company.status]}
                </span>
              </div>
              <p className="text-sm text-ink-secondary">
                {[company.industry, company.location].filter(Boolean).join(" · ") ||
                  "No details yet"}
              </p>
              {company.owner_name && (
                <p className="text-sm text-ink-muted">Owner: {company.owner_name}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild variant="secondary" size="sm">
                <Link href={`/admin/companies/${company.id}/edit`}>Edit</Link>
              </Button>

              {company.status === "approved" ? (
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={busyId === company.id}
                  onClick={() => onSetLive(company.id, false)}
                >
                  Deactivate
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={busyId === company.id}
                  onClick={() => onSetLive(company.id, true)}
                >
                  Activate
                </Button>
              )}

              <Button
                variant="secondary"
                size="sm"
                className="border-danger text-danger hover:bg-danger-tint"
                disabled={busyId === company.id}
                onClick={() => onDelete(company)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ------------------------------------------------------------ add a company

function AddCompanyForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = React.useState(EMPTY_FORM);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) {
      setMessage("The company needs a name.");
      return;
    }
    setSaving(true);
    setMessage(null);

    const result = await apiPost("/companies", form);
    if (result.ok) {
      toast.success(`${form.name} was added.`);
      setForm(EMPTY_FORM);
      onCreated();
    } else {
      toast.error(result.error);
      setMessage(result.error);
    }
    setSaving(false);
  }

  return (
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
      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-label text-ink-secondary">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          className="rounded-control border border-border bg-white px-3 py-2 text-body outline-none focus:border-ring focus:ring-2 focus:ring-ring"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      {message && <p className="text-sm text-danger">{message}</p>}

      <Button type="submit" disabled={saving}>
        {saving ? "Creating…" : "Create company"}
      </Button>
    </form>
  );
}
