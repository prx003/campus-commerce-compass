import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Wallet,
  ClipboardList,
  Briefcase,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  School,
  UserPlus,
  BookOpen,
  LayoutGrid,
  TrendingUp,
  Landmark,
  Megaphone,
  Scale,
  Building2,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth, canAccess } from "@/lib/auth";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

type Item = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | null;
  children?: { to: string; label: string }[];
};

const NAV: Item[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/crm", label: "CRM", icon: Users, badge: "12" },
  {
    to: "/admission",
    label: "Admission",
    icon: UserPlus,
    children: [
      { to: "/admission", label: "Overview" },
      { to: "/admission/applications", label: "Applications" },
      { to: "/admission/screening", label: "Screening & Evaluation" },
      { to: "/admission/merit", label: "Merit & Selection" },
      { to: "/admission/enrollment", label: "Enrollment" },
      { to: "/admission/fees", label: "Admission Fees" },
      { to: "/admission/reports", label: "Reports" },
      { to: "/admission/settings", label: "Settings" },
    ],
  },
  { to: "/academic", label: "Academic", icon: BookOpen },
  { to: "/students", label: "Students", icon: GraduationCap },
  { to: "/fees", label: "Fees", icon: Wallet, badge: "3" },
  { to: "/exams", label: "Examinations", icon: ClipboardList },
  {
    to: "/sales",
    label: "Sales",
    icon: TrendingUp,
    children: [
      { to: "/sales", label: "Dashboard" },
      { to: "/sales/agents", label: "Agents" },
      { to: "/sales/leads", label: "Lead Pool" },
      { to: "/sales/call-center", label: "Call Center" },
      { to: "/sales/call-center/upload", label: "Call Center · Upload Leads" },
      { to: "/sales/call-center/leads", label: "Call Center · Assign Leads" },
      { to: "/sales/call-center/my-leads", label: "Call Center · Agent Leads" },
      { to: "/sales/call-center/agents", label: "Call Center · Manage Agents" },
      { to: "/sales/call-center/reports", label: "Call Center · Reports" },
      { to: "/sales/applications", label: "Skill AI Admissions" },
      { to: "/sales/finance", label: "Finance Desk" },
      { to: "/sales/form-builder", label: "Form Builder" },
      { to: "/sales/application", label: "New Application" },
    ],
  },
  { to: "/workspace", label: "Workspace", icon: LayoutGrid },
  { to: "/hr", label: "HR", icon: Briefcase },
  { to: "/college", label: "College Portal", icon: Landmark },
  { to: "/marketing", label: "Marketing", icon: Megaphone, badge: "New" },
  { to: "/placement", label: "Placement", icon: Building2 },
  { to: "/governance", label: "Governance", icon: Scale },
  { to: "/ai", label: "AI Analytics", icon: Sparkles, badge: "New" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { roles } = useAuth();
  const items = [...NAV.filter((i) => canAccess(roles, i.to)), ...(roles.includes("admin") ? [{ to: "/users", label: "Users & Roles", icon: ShieldCheck } as Item] : [])];
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState<Record<string, boolean>>({
    "/admission": pathname.startsWith("/admission"),
  });

  return (
    <aside
      className={cn(
        "relative hidden md:flex flex-col bg-sidebar border-r border-sidebar-border transition-[width] duration-200",
        collapsed ? "w-[72px]" : "w-[248px]",
      )}
    >
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-sidebar-border">
        <div className="size-9 rounded-lg gradient-primary grid place-items-center text-primary-foreground shadow-soft shrink-0">
          <School className="size-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-sm font-semibold text-sidebar-foreground truncate">Edusphere</div>
            <div className="text-[11px] text-muted-foreground truncate">Greenwood Intl. School</div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-3 space-y-0.5">
        {!collapsed && (
          <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Workspace
          </div>
        )}
        {items.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const Icon = item.icon;
          const hasChildren = !!item.children?.length && !collapsed;
          const isOpen = open[item.to] ?? active;

          if (hasChildren) {
            return (
              <div key={item.to}>
                 <Button variant="ghost"
                  onClick={() => setOpen((o) => ({ ...o, [item.to]: !isOpen }))}
                  className={cn(
                    "w-full group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/60",
                  )}
                >
                  <Icon className={cn("size-[18px] shrink-0", active && "text-primary")} />
                  <span className="flex-1 truncate text-left">{item.label}</span>
                  <ChevronDown className={cn("size-3.5 transition-transform", isOpen && "rotate-180")} />
                 </Button>
                {isOpen && (
                  <div className="mt-0.5 ml-5 pl-3 border-l border-sidebar-border space-y-0.5">
                     {item.children?.map((c) => {
                       const cActive = pathname === c.to;
                      return (
                        <Link
                          key={c.to}
                          to={c.to}
                          className={cn(
                            "flex items-center rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
                            cActive
                              ? "text-primary bg-primary/10"
                              : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/40",
                          )}
                        >
                          {c.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60",
              )}
            >
              <Icon className={cn("size-[18px] shrink-0", active && "text-primary")} />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-1.5 py-0.5 rounded-md",
                        item.badge === "New"
                          ? "bg-primary/10 text-primary"
                          : "bg-destructive/10 text-destructive",
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/60"
        >
          <Settings className="size-[18px]" />
          {!collapsed && <span>Settings</span>}
        </Link>
      </div>

       <Button variant="ghost" size="icon"
        onClick={() => setCollapsed((v) => !v)}
        className="absolute -right-3 top-20 size-6 rounded-full bg-card border border-border shadow-soft grid place-items-center hover:bg-accent transition"
        aria-label="Toggle sidebar"
      >
        {collapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
       </Button>
    </aside>
  );
}
