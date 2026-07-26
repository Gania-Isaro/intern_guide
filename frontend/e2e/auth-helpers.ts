import path from "node:path";

// Shared auth constants for the e2e suite. Kept in a NON-test file because
// Playwright forbids one test file importing another. auth.setup.ts writes the
// session files; the authenticated specs read them via statePath().

export const PASSWORD = "Password123"; // all seed accounts; see database/seed.sql

export const ROLES = {
  admin: "admin@internguide.rw",
  owner: "grace@kivusoftware.rw", // owns Kivu Software (company 1)
  student: "aline@alustudent.com", // has an approved placement at company 1
} as const;

export type Role = keyof typeof ROLES;

export const authDir = path.join(process.cwd(), "playwright/.auth");
export const statePath = (role: Role) => path.join(authDir, `${role}.json`);
