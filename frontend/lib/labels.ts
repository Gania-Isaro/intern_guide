// This file contains labels for various enums used in the frontend. It is used to provide human-readable labels for values that are stored in the database as codes.

export const AMENITY_LABELS: Record<string, string> = {
  meals: "Meals provided",
  transport_allowance: "Transport allowance",
  health_insurance: "Health insurance",
  laptop_provided: "Laptop provided",
  accommodation: "Accommodation",
  training_program: "Training programme",
  mentorship_program: "Mentorship programme",
  certificate: "Certificate on completion",
  return_offer: "Possible job offer after",
  flexible_hours: "Flexible hours",
};

export const COMPENSATION_LABELS: Record<string, string> = {
  paid: "Paid",
  stipend: "Stipend",
  unpaid: "Unpaid",
  academic_credit: "Academic credit",
  intern_pays: "Intern pays a fee",
};

export const WORK_MODE_LABELS: Record<string, string> = {
  onsite: "On site",
  hybrid: "Hybrid",
  remote: "Remote",
};

export const SCHEDULE_LABELS: Record<string, string> = {
  full_time: "Full time",
  part_time: "Part time",
  flexible: "Flexible",
};

/** Falls back to the raw code, so an unknown value shows something readable. */
export function labelFor(labels: Record<string, string>, value: string | null) {
  if (!value) return "";
  return labels[value] ?? value.replace(/_/g, " ");
}


export function payLine(role: {
  compensation: string;
  stipend_amount: number | null;
  stipend_currency: string | null;
  stipend_period: string | null;
}) {
  const label = labelFor(COMPENSATION_LABELS, role.compensation);
  if (!role.stipend_amount) return label;

  const money = `${role.stipend_amount.toLocaleString()} ${role.stipend_currency ?? ""}`.trim();
  return role.stipend_period ? `${money} / ${role.stipend_period}` : money;
}
