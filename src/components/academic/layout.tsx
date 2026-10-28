import { useEffect } from "react";
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, GraduationCap, ListTodo, CalendarDays, ClipboardCheck, BookOpenCheck,
  HeartHandshake, Megaphone, FileBarChart2, ShieldCheck, Settings2,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AcademicProvider, useAcademic, personaCan, PERSONAS, type Persona } from "./store";

const NAV: { to: string; label: string; icon: React.ComponentType<{ className?: string }>; exact?: boolean }[] = [
  { to: "/academic", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/academic/students", label: "Students", icon: GraduationCap },
  { to: "/academic/task", label: "Tasks", icon: ListTodo },
  { to: "/academic/timetable", label: "Timetable", icon: CalendarDays },
  { to: "/academic/attendance", label: "Attendance", icon: ClipboardCheck },
  { to: "/academic/gradebook", label: "Gradebook", icon: BookOpenCheck },
  { to: "/academic/care", label: "Care & Watchlist", icon: HeartHandshake },
  { to: "/academic/announcements", label: "Announcements", icon: Megaphone },
  { to: "/academic/reports", label: "Reports", icon: FileBarChart2 },
  { to: "/academic/audit", label: "Audit Logs", icon: ShieldCheck },
  { to: "/academic/settings", label: "Settings", icon: Settings2 },
];

export function AcademicLayout() {
  return (
    <AcademicProvider>
      <AcademicShell />
    </AcademicProvider>
  );
}

function AcademicShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { persona, setPersona, settings, resetDemo } = useAcademic();

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const allowed = personaCan(persona, pathname);

  useEffect(() => {
    if (!allowed) navigate({ to: "/academic", replace: true });
  }, [allowed, navigate]);

  const info = PERSONAS.find((p) => p.id === persona)!;

  return (
    <div className="-m-4 md:-m-6 flex min-h-[calc(100vh-4rem)] bg-muted/30">
      <aside className="hidden md:flex w-[238px] shrink-0 flex-col bg-card border-r border-border shadow-sm transition-colors">
        <div className="px-5 py-5 border-b border-border">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Academic System</div>
          <div className="text-lg font-semibold mt-0.5">Academics</div>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV.filter((n) => personaCan(persona, n.to)).map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-[18px] shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-border">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="size-9 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-bold">
                {info.label.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-500 ring-2 ring-card" title="Online" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{info.label}</div>
              <div className="text-[11px] text-muted-foreground truncate">{settings.term} · {settings.academicYear}</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 bg-card border-b border-border px-4 md:px-5 flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground truncate">{today}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { resetDemo(); }}
              title="Reset demo data"
              aria-label="Reset demo data"
              className="h-9 w-9 grid place-items-center rounded-md border border-border bg-background hover:bg-muted"
            >
              <RotateCcw className="size-4" />
            </button>
            <select
              aria-label="Active persona"
              value={persona}
              onChange={(e) => {
                const p = e.target.value as Persona;
                setPersona(p);
                const info = PERSONAS.find((x) => x.id === p)!;
                toast.success(`Viewing as ${info.label}`, { description: info.blurb });
              }}
              className="h-9 rounded-md border border-border bg-background px-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 max-w-[150px]"
            >
              {PERSONAS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>
        </header>
        <main className="flex-1 p-5 md:p-6 overflow-x-hidden">
          {!allowed ? (
            <div className="max-w-md mx-auto mt-24 text-center">
              <ShieldCheck className="size-10 mx-auto text-muted-foreground" />
              <h2 className="text-lg font-semibold mt-3">Not available for this role</h2>
              <p className="text-sm text-muted-foreground mt-1">The {info.label} persona doesn't have access to this page.</p>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>

      {/* Mobile persona nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 flex overflow-x-auto bg-card border-t border-border px-2 py-2 gap-1">
        {NAV.filter((n) => personaCan(persona, n.to)).slice(0, 6).map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-md text-[10px] font-medium",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              <Icon className="size-4" />
              <span className="whitespace-nowrap">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
