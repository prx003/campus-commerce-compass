import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

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

type AuthState = { user: null; roles: AppRole[]; loading: boolean; setRole: (r: AppRole | null) => void };
const KEY = "app-role";
const Ctx = createContext<AuthState>({ user: null, roles: [], loading: true, setRole: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const saved = localStorage.getItem(KEY) as AppRole | null;
    if (saved && saved in ROLE_LABELS) setRoleState(saved);
    setLoading(false);
  }, []);
  const setRole = (r: AppRole | null) => {
    if (r) localStorage.setItem(KEY, r); else localStorage.removeItem(KEY);
    setRoleState(r);
  };
  const value: AuthState = { user: null, roles: role ? [role] : [], loading, setRole };
  if (!loading && !role) return <Ctx.Provider value={value}><RolePicker onPick={setRole} /></Ctx.Provider>;
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function RolePicker({ onPick }: { onPick: (r: AppRole) => void }) {
  return (
    <div className="min-h-screen w-full grid place-items-center bg-background p-6">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-semibold">Choose your role</h1>
        <p className="text-sm text-muted-foreground mt-1 mb-6">You'll only see the sections for this role.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {(Object.keys(ROLE_LABELS) as AppRole[]).map((r) => (
            <Button key={r} variant="outline" className="h-14 justify-start" onClick={() => onPick(r)}>
              {ROLE_LABELS[r]}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

export const useAuth = () => useContext(Ctx);
