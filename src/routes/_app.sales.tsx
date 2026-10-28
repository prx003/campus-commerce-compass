import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Download, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AgentSideNav } from "@/components/sales/agent-sidenav";
import { AdmissionsProvider } from "@/components/sales/admissions/context";
import { RoleSwitcher } from "@/components/sales/admissions/workspace";

export const Route = createFileRoute("/_app/sales")({
  component: SalesLayout,
});

const TABS: {
  to: "/sales" | "/sales/agents" | "/sales/leads" | "/sales/applications" | "/sales/finance" | "/sales/form-builder" | "/sales/call-center";
  label: string;
  exact?: boolean;
}[] = [
  { to: "/sales", label: "Dashboard", exact: true },
  { to: "/sales/agents", label: "Agents" },
  { to: "/sales/leads", label: "Lead Pool" },
  { to: "/sales/call-center", label: "Call Center" },
  { to: "/sales/applications", label: "Skill AI Admissions" },
  { to: "/sales/finance", label: "Finance Desk" },
  { to: "/sales/form-builder", label: "Form Builder" },
];

function SalesLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <AdmissionsProvider>
      <div className="space-y-6">
        <PageHeader
        title="Sales"
        subtitle="Pipeline, agents, leads and live performance"
        actions={
          <>
            <RoleSwitcher />
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="size-4" /> Export
            </Button>
            <Link to="/sales/application">
              <Button size="sm" className="gap-1.5">
                <Plus className="size-4" /> New application
              </Button>
            </Link>
          </>
        }
      />
      <div className="border-b border-border -mt-2 overflow-x-auto scrollbar-thin">
        <nav className="flex gap-1 -mb-px min-w-max">
          {TABS.map((t) => {
            const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap",
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex">
        {!pathname.startsWith("/sales/call-center") && <AgentSideNav />}
        <div className={cn("flex-1 min-w-0", !pathname.startsWith("/sales/call-center") && "pl-6")}>
          <Outlet />
        </div>
      </div>
      </div>
    </AdmissionsProvider>
  );
}
