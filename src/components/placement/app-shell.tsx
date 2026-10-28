import { Link, useRouterState } from "@tanstack/react-router";
import { icons, LayoutDashboard, ArrowLeft } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { ROLES, SECTIONS, type RoleId } from "@/components/placement/lib/config";
import { ModuleShell } from "@/components/layout/module-shell";
import { cn } from "@/lib/utils";

export function AppShell({ role, children }: { role: RoleId; children: React.ReactNode }) {
  const path = useRouterState({ select: s => s.location.pathname });
  const r = ROLES[role];
  const base = `/placement/${role}`;
  const tab = (active: boolean) => cn("module-nav-item flex min-h-10 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium", active && "module-nav-active");
  return <ModuleShell title="Placement" subtitle={r.label}
    navigation={<><Link to="/placement/$role" params={{ role }} className={tab(path === base)}><LayoutDashboard className="size-[18px] shrink-0" />Dashboard</Link>{r.nav.map(s => { const iconName = SECTIONS[s].icon; const I = Object.entries(icons).find(([name]) => name === iconName)?.[1] ?? icons.Circle; return <Link key={s} to="/placement/$role/$section" params={{ role, section: s }} className={tab(path.startsWith(`${base}/${s}`))}><I className="size-[18px] shrink-0" /><span>{SECTIONS[s].title}</span></Link>; })}</>}
    footer={<Link to="/placement" className={tab(false)}><ArrowLeft className="size-4" />Switch role</Link>}
    actions={<span className="text-sm text-muted-foreground">{r.person}</span>}>
    {children}<Toaster />
  </ModuleShell>;
}
