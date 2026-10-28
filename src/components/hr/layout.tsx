import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarDays,
  Wallet,
  Gauge,
  ShieldCheck,
  FileBarChart2,
  LogOut,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HRProvider, useHR, type Module, type Role } from "./store";

const NAV: { to: string; label: string; icon: React.ComponentType<{ className?: string }>; module: Module; exact?: boolean }[] = [
  { to: "/hr", label: "Dashboard", icon: LayoutDashboard, module: "dashboard", exact: true },
  { to: "/hr/employees", label: "Employees", icon: Users, module: "employees" },
  { to: "/hr/attendance", label: "Attendance", icon: CalendarCheck, module: "attendance" },
  { to: "/hr/leave", label: "Leave", icon: CalendarDays, module: "leave" },
  { to: "/hr/payroll", label: "Payroll", icon: Wallet, module: "payroll" },
  { to: "/hr/performance", label: "Performance", icon: Gauge, module: "performance" },
  { to: "/hr/users", label: "User Management", icon: ShieldCheck, module: "users" },
  { to: "/hr/reports", label: "Reports", icon: FileBarChart2, module: "reports" },
];

const ROLES: Role[] = ["System Administrator", "HR Personnel", "Department Manager"];

function LoginGate() {
  const { signIn } = useHR();
  return (
    <div className="-m-4 md:-m-6 min-h-[calc(100vh-4rem)] grid place-items-center bg-muted/30 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-card p-7">
        <div className="size-12 rounded-xl gradient-primary grid place-items-center text-primary-foreground shadow-soft">
          <Lock className="size-6" />
        </div>
        <h1 className="mt-4 text-xl font-semibold tracking-tight">HR Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sign in with role-based access. Choose your role to continue.
        </p>
        <div className="mt-5 space-y-2.5">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => signIn(r)}
              className="w-full flex items-center justify-between rounded-lg border border-border px-4 py-3 text-left text-sm font-medium hover:border-primary hover:bg-primary/5 transition"
            >
              <span>{r}</span>
              <span className="text-[11px] text-muted-foreground">Sign in →</span>
            </button>
          ))}
        </div>
        <p className="mt-5 text-[11px] text-muted-foreground leading-relaxed">
          Demo authentication · Role determines which modules and actions are available (RBAC).
        </p>
      </div>
    </div>
  );
}

function Shell() {
  const { role, setRole, signOut, can, signedIn } = useHR();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!signedIn) return <LoginGate />;

  const items = NAV.filter((n) => can(n.module));

  return (
    <div className="-m-4 md:-m-6 flex min-h-[calc(100vh-4rem)] bg-muted/30">
      <aside
        className="hidden md:flex w-[232px] flex-col text-white shadow-xl"
        style={{ background: "linear-gradient(180deg, #0b1e4d 0%, #112a6b 60%, #15348a 100%)" }}
      >
        <div className="px-5 py-5 border-b border-white/10">
          <div className="text-[11px] uppercase tracking-widest text-white/60">Module</div>
          <div className="text-lg font-semibold mt-0.5">Human Resources</div>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {items.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="size-[18px] shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-white/10 text-[11px] leading-relaxed text-white/55">
          RBAC active · {role}
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 bg-card border-b border-border px-5 flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground hidden sm:block">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-muted-foreground hidden sm:inline">Role</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="h-8 rounded-md border border-border bg-background px-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={signOut}>
              <LogOut className="size-4" /> Sign out
            </Button>
          </div>
        </header>
        <main className="flex-1 p-5 md:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function HRLayout() {
  return (
    <HRProvider>
      <Shell />
    </HRProvider>
  );
}

// Guard helper used by sub-pages to block disallowed modules.
export function ModuleGuard({ module, children }: { module: Module; children: React.ReactNode }) {
  const { can } = useHR();
  if (!can(module)) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center shadow-soft">
        <ShieldCheck className="size-8 mx-auto text-muted-foreground" />
        <h3 className="mt-3 text-base font-semibold">Access restricted</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Your current role does not have permission to view this module.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}
