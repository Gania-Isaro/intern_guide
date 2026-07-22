import { UserPlus, PenLine, ShieldCheck } from "lucide-react";

const STEPS = [
  {
    icon: UserPlus,
    title: "Create your account",
    text: "Sign up as a student with your email, or as a company owner if you manage a company's profile.",
  },
  {
    icon: PenLine,
    title: "Share your internship experience",
    text: "Write an honest review of the company where you interned — mentorship, workload, pay and what you learned.",
  },
  {
    icon: ShieldCheck,
    title: "We verify before it goes live",
    text: "An admin checks that you really did your placement at that company. Only verified reviews are published, so every rating can be trusted.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col gap-10 py-8">
      <header className="flex max-w-2xl flex-col gap-3">
        <h1 className="font-display text-heading text-ink">How InternGuide works</h1>
        <p className="text-body text-ink-secondary">
          Every review on InternGuide comes from a student whose placement was
          checked by our team. Here is the journey from signing up to a
          published review.
        </p>
      </header>

      <ol className="grid gap-6 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className="flex flex-col gap-3 rounded-card border border-border bg-white p-6 shadow-soft"
          >
            <step.icon className="h-6 w-6 text-primary" />
            <h2 className="font-display text-card-title text-ink">
              {i + 1}. {step.title}
            </h2>
            <p className="text-[14px] leading-[22px] text-ink-secondary">{step.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}