import Link from "next/link";
import { Button } from "@/components/ui";

export default function EmployersPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-6 py-8">
      <h1 className="font-display text-heading text-ink">InternGuide for employers</h1>
      <p className="text-body text-ink-secondary">
        Students read InternGuide before choosing where to intern. A company
        account lets you keep your profile accurate and hear directly from the
        interns who have worked with you.
      </p>
      <ul className="flex flex-col gap-2 text-body text-ink-secondary">
        <li>— Claim and manage your company profile</li>
        <li>— See how past interns rate mentorship, workload and pay</li>
        <li>— Build trust with the next group of applicants</li>
      </ul>
      <div>
        <Button asChild variant="primary">
          <Link href="/register">Create a company account</Link>
        </Button>
      </div>
    </div>
  );
}