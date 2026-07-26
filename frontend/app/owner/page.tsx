"use client";

// The company owner's home page. Everything an owner can do starts here:
// see the profile, post internships, read the charts, and answer past interns.
// The full edit form lives at /owner/company.

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";

import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { Badge, Button, Card, Input, StarRating } from "@/components/ui";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { NotAllowed, RedirectToLogin } from "@/components/auth/gates";
import { CompanyCharts } from "@/components/company/company-charts";
import {
  AMENITY_LABELS,
  COMPENSATION_LABELS,
  SCHEDULE_LABELS,
  WORK_MODE_LABELS,
  labelFor,
  payLine,
} from "@/lib/labels";

// ---------------------------------------------------------------- types
// These match exactly what GET /me/company sends back.

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
  average_rating: number | null;
  amenities: string[];
}

interface Internship {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  deadline: string | null;
  is_active: boolean;
  compensation: string;
  stipend_amount: number | null;
  stipend_currency: string | null;
  stipend_period: string | null;
  work_mode: string;
  schedule: string;
  duration_months: number | null;
  start_date: string | null;
  openings: number | null;
  field: string | null;
}

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_name: string;
  reply: { body: string; created_at: string } | null;
}

interface MyCompany {
  company: Company;
  internships: Internship[];
  reviews: Review[];
}

// The badge component says "Verified", which is what an approved company is
const BADGE_FOR = {
  approved: "verified",
  pending: "pending",
  rejected: "rejected",
} as const;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ---------------------------------------------------------------- page

export default function OwnerDashboardPage() {
  const { user, isLoading } = useAuth();

  const [data, setData] = React.useState<MyCompany | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await apiGet("/me/company");
    if (result.ok) setData(result.data as MyCompany);
    else setError(result.error);
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

  // A brand new owner has no business yet. That is a normal first day, not a
  // failure, so it gets its own message instead of the red error card.
  // (The API says "no company is linked to your account yet" with a 404.)
  if (error && error.toLowerCase().includes("no company")) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
        <h1 className="text-heading">You haven&apos;t registered a business yet</h1>
        <p className="text-body text-ink-secondary">
          Add your company and an admin will check it. Once it is approved you
          can post internships, see your stats, and reply to past interns.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Button asChild>
            <Link href="/owner/register">Register my business</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/companies">Browse companies</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return <ErrorState description={error ?? "Could not load your company."} onRetry={load} />;
  }

  const { company } = data;
  const internships = data.internships ?? [];
  const reviews = data.reviews ?? [];

  return (
    <div className="space-y-10 py-2">
      <CompanyHeader company={company} />

      <Internships
        companyId={company.id}
        internships={internships}
        onChanged={load}
      />

      <section className="space-y-4">
        <h2 className="text-heading">Your stats</h2>
        {company.status === "approved" ? (
          <CompanyCharts companyId={company.id} />
        ) : (
          <p className="text-ink-secondary">
            Charts appear once an admin approves your company.
          </p>
        )}
      </section>

      <PastInterns reviews={reviews} onReplied={load} />
    </div>
  );
}

// ------------------------------------------------------- company header

function CompanyHeader({ company }: { company: Company }) {
  // only the parts that are actually filled in, joined with a dot
  const facts = [
    company.industry,
    company.location,
    company.size ? `${company.size} people` : null,
    company.founded_year ? `Founded ${company.founded_year}` : null,
  ].filter(Boolean);

  return (
    <Card className="p-lg">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-heading">{company.name}</h1>
            <Badge status={BADGE_FOR[company.status]} />
          </div>

          {facts.length > 0 && (
            <p className="text-ink-secondary">{facts.join(" · ")}</p>
          )}

          {company.average_rating !== null && (
            <StarRating value={company.average_rating} readOnly showValue />
          )}
        </div>

        <div className="flex gap-3">
          <Button asChild>
            <Link href="/owner/company">Edit profile</Link>
          </Button>
          {company.status === "approved" && (
            <Button asChild variant="secondary">
              <Link href={`/companies/${company.id}`}>View public page</Link>
            </Button>
          )}
        </div>
      </div>

      {company.status === "pending" && (
        <p className="mt-4 rounded-control bg-pending-tint p-4 text-body text-pending">
          An admin still has to approve this company. Until then it does not
          show up in search and students cannot review it.
        </p>
      )}

      {company.description && (
        <p className="mt-4 text-body text-ink-secondary">{company.description}</p>
      )}

      {/* "?? []" keeps the page alive if the API ever sends no amenities key */}
      {(company.amenities ?? []).length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {(company.amenities ?? []).map((code) => (
            <span
              key={code}
              className="rounded-chip bg-primary-tint px-3 py-1.5 text-sm text-primary-deep"
            >
              {labelFor(AMENITY_LABELS, code)}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}

// ---------------------------------------------------------- internships

function Internships({
  companyId,
  internships,
  onChanged,
}: {
  companyId: number;
  internships: Internship[];
  onChanged: () => void;
}) {
  const [adding, setAdding] = React.useState(false);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-heading">Your internships</h2>
        <Button size="sm" onClick={() => setAdding((open) => !open)}>
          {adding ? "Close the form" : "Add an internship"}
        </Button>
      </div>

      {adding && (
        <AddInternshipForm
          companyId={companyId}
          onPosted={() => {
            setAdding(false);
            onChanged(); // reload, so the new posting shows in the list below
          }}
        />
      )}

      {internships.length === 0 ? (
        <p className="text-ink-secondary">You have not posted an internship yet.</p>
      ) : (
        <div className="space-y-3">
          {internships.map((role) => (
            <InternshipRow key={role.id} role={role} onToggled={onChanged} />
          ))}
        </div>
      )}
    </section>
  );
}

function InternshipRow({
  role,
  onToggled,
}: {
  role: Internship;
  onToggled: () => void;
}) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function toggle() {
    setBusy(true);
    setError(null);
    const result = await apiPost(`/internships/${role.id}/toggle`, {});
    if (result.ok) {
      toast.success(role.is_active ? "Internship closed." : "Internship opened.");
      onToggled();
    } else {
      toast.error(result.error);
      setError(result.error);
    }
    setBusy(false);
  }

  const facts = [
    payLine(role),
    labelFor(WORK_MODE_LABELS, role.work_mode),
    labelFor(SCHEDULE_LABELS, role.schedule),
    role.location,
    role.duration_months ? `${role.duration_months} months` : null,
    role.openings ? `${role.openings} opening${role.openings > 1 ? "s" : ""}` : null,
    role.deadline ? `Apply by ${formatDate(role.deadline)}` : null,
  ].filter(Boolean);

  return (
    <Card className="p-lg">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-card-title">{role.title}</p>
          <p className="text-sm text-ink-secondary">{facts.join(" · ")}</p>
          {role.description && (
            <p className="pt-1 text-body text-ink-secondary">{role.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span
            className={
              role.is_active
                ? "rounded-chip bg-primary-tint px-3 py-1.5 text-sm text-primary-deep"
                : "rounded-chip bg-paper px-3 py-1.5 text-sm text-ink-muted"
            }
          >
            {role.is_active ? "Open" : "Closed"}
          </span>
          <Button variant="secondary" size="sm" onClick={toggle} disabled={busy}>
            {role.is_active ? "Close it" : "Open it"}
          </Button>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </Card>
  );
}

function AddInternshipForm({
  companyId,
  onPosted,
}: {
  companyId: number;
  onPosted: () => void;
}) {
  const [form, setForm] = React.useState({
    title: "",
    field: "",
    description: "",
    location: "",
    compensation: "unpaid",
    stipend_amount: "",
    stipend_period: "",
    work_mode: "onsite",
    schedule: "full_time",
    duration_months: "",
    openings: "",
    start_date: "",
    deadline: "",
  });
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  // one small helper instead of a separate onChange for every field
  function set(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) {
      setMessage("The internship needs a title.");
      return;
    }
    setSaving(true);
    setMessage(null);
    const result = await apiPost(`/companies/${companyId}/internships`, form);
    if (result.ok) {
      toast.success("Internship posted.");
      onPosted();
    } else {
      toast.error(result.error);
      setMessage(result.error);
      setSaving(false);
    }
  }

  return (
    <Card className="p-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="title"
          label="Title"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Software engineering intern"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="field"
            label="Field"
            value={form.field}
            onChange={(e) => set("field", e.target.value)}
            placeholder="Engineering"
          />
          <Input
            id="internship_location"
            label="Location"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="Kigali"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            id="compensation"
            label="Pay"
            value={form.compensation}
            onChange={(value) => set("compensation", value)}
            options={COMPENSATION_LABELS}
          />
          <Select
            id="work_mode"
            label="Where"
            value={form.work_mode}
            onChange={(value) => set("work_mode", value)}
            options={WORK_MODE_LABELS}
          />
          <Select
            id="schedule"
            label="Hours"
            value={form.schedule}
            onChange={(value) => set("schedule", value)}
            options={SCHEDULE_LABELS}
          />
        </div>

        {/* only worth asking about once there is money involved */}
        {(form.compensation === "paid" || form.compensation === "stipend") && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="stipend_amount"
              label="Amount"
              type="number"
              inputMode="numeric"
              value={form.stipend_amount}
              onChange={(e) => set("stipend_amount", e.target.value)}
              placeholder="150000"
            />
            <Select
              id="stipend_period"
              label="Per"
              value={form.stipend_period}
              onChange={(value) => set("stipend_period", value)}
              options={{
                hour: "Hour",
                week: "Week",
                month: "Month",
                total: "Whole internship",
              }}
              placeholder="Not saying"
            />
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="duration_months"
            label="Length in months"
            type="number"
            inputMode="numeric"
            value={form.duration_months}
            onChange={(e) => set("duration_months", e.target.value)}
            placeholder="3"
          />
          <Input
            id="openings"
            label="Openings"
            type="number"
            inputMode="numeric"
            value={form.openings}
            onChange={(e) => set("openings", e.target.value)}
            placeholder="2"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="start_date"
            label="Starts on"
            type="date"
            value={form.start_date}
            onChange={(e) => set("start_date", e.target.value)}
          />
          <Input
            id="deadline"
            label="Apply by"
            type="date"
            value={form.deadline}
            onChange={(e) => set("deadline", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="internship_description"
            className="text-label text-ink-secondary"
          >
            What the intern will do
          </label>
          <textarea
            id="internship_description"
            rows={4}
            className="rounded-control border border-border bg-white px-3 py-2 text-body outline-none focus:border-primary"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        {message && <p className="text-sm text-danger">{message}</p>}

        <Button type="submit" disabled={saving}>
          {saving ? "Posting…" : "Post the internship"}
        </Button>
      </form>
    </Card>
  );
}

// A plain dropdown that reads the same label maps the rest of the app uses
function Select({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Record<string, string>;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-label text-ink-secondary">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-control border border-border bg-white px-3 py-2 text-body outline-none focus:border-primary"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {Object.entries(options).map(([code, text]) => (
          <option key={code} value={code}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}

// --------------------------------------------------------- past interns

function PastInterns({
  reviews,
  onReplied,
}: {
  reviews: Review[];
  onReplied: () => void;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-heading">Past interns</h2>

      {reviews.length === 0 ? (
        <p className="text-ink-secondary">
          No approved reviews yet. They show up here as soon as an admin lets
          them through.
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewRow key={review.id} review={review} onReplied={onReplied} />
          ))}
        </div>
      )}
    </section>
  );
}

function ReviewRow({
  review,
  onReplied,
}: {
  review: Review;
  onReplied: () => void;
}) {
  const [body, setBody] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function sendReply(event: React.FormEvent) {
    event.preventDefault();
    if (!body.trim()) {
      setError("Write something first.");
      return;
    }
    setSaving(true);
    setError(null);
    const result = await apiPost(`/reviews/${review.id}/reply`, { body });
    if (result.ok) {
      toast.success("Reply sent.");
      onReplied();
    } else {
      toast.error(result.error);
      setError(result.error);
      setSaving(false);
    }
  }

  return (
    <Card className="p-lg">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-card-title">{review.reviewer_name}</p>
        <div className="flex items-center gap-3">
          <StarRating value={review.rating} readOnly showValue />
          <span className="text-sm text-ink-muted">{formatDate(review.created_at)}</span>
        </div>
      </div>

      {review.comment && (
        <p className="mt-3 text-body text-ink-secondary">{review.comment}</p>
      )}

      {review.reply ? (
        <div className="mt-4 border-l-2 border-primary pl-4">
          <p className="text-label text-ink">Your reply</p>
          <p className="mt-1 text-body text-ink-secondary">{review.reply.body}</p>
          <p className="mt-1 text-sm text-ink-muted">
            {formatDate(review.reply.created_at)}
          </p>
        </div>
      ) : (
        // one reply per review, so this form disappears once it is sent
        <form onSubmit={sendReply} className="mt-4 space-y-2">
          <textarea
            rows={2}
            aria-label={`Reply to ${review.reviewer_name}`}
            placeholder="Reply to this intern…"
            className="w-full rounded-control border border-border bg-white px-3 py-2 text-body outline-none focus:border-primary"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" variant="secondary" size="sm" disabled={saving}>
            {saving ? "Sending…" : "Send reply"}
          </Button>
        </form>
      )}
    </Card>
  );
}
