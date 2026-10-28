import { createContext, useContext, type ReactNode } from "react";

export type AppRole =
  | "admin" | "principal" | "hr" | "academic" | "admissions"
  | "sales" | "marketing" | "governance" | "staff";

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Administrator", principal: "Principal", hr: "HR", academic: "Academic",
  admissions: "Admissions", sales: "Sales", marketing: "Marketing",
  governance: "Governance", staff: "Staff",
};

// Which menu paths each role can open. Admin and principal see everything.
const ROLE_PATHS: Record<AppRole, string[] | "all"> = {
  admin: "all",
  principal: "all",
  hr: ["/", "/hr", "/workspace"],
  academic: ["/", "/academic", "/students", "/exams", "/college", "/placement", "/workspace"],
  admissions: ["/", "/admission", "/crm", "/students", "/fees", "/workspace"],
  sales: ["/", "/sales", "/crm", "/workspace"],
  marketing: ["/", "/marketing", "/crm", "/workspace"],
  governance: ["/", "/governance", "/ai", "/workspace"],
  staff: ["/", "/workspace"],
};

export function canAccess(roles: AppRole[], path: string) {
  return roles.some((r) => {
    const p = ROLE_PATHS[r];
    if (p === "all") return true;
    return p.some((base) => (base === "/" ? path === "/" : path === base || path.startsWith(base + "/")));
  });
}

type AuthState = { user: null; roles: AppRole[]; loading: boolean };
// No sign-in: everyone gets full access to every section.
const OPEN: AuthState = { user: null, roles: ["principal"], loading: false };
const Ctx = createContext<AuthState>(OPEN);

export function AuthProvider({ children }: { children: ReactNode }) {
  return <Ctx.Provider value={OPEN}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
