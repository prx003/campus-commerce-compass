import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, GraduationCap, Wallet, Sparkles, Landmark, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, canAccess } from "@/lib/auth";

const ITEMS = [
  { to: "/", icon: LayoutDashboard, label: "Home" },
  { to: "/crm", icon: Users, label: "CRM" },
  { to: "/students", icon: GraduationCap, label: "Students" },
  { to: "/fees", icon: Wallet, label: "Fees" },
  { to: "/college", icon: Landmark, label: "College" },
  { to: "/governance", icon: Scale, label: "Govern" },
  { to: "/ai", icon: Sparkles, label: "AI" },
] as const;

export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { roles } = useAuth();
  const items = ITEMS.filter((i) => canAccess(roles, i.to));
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 h-16 border-t border-border bg-card/95 backdrop-blur grid grid-cols-7">
      {items.map((it) => {
        const active = it.to === "/" ? pathname === "/" : pathname.startsWith(it.to);
        const Icon = it.icon;
        return (
          <Link
            key={it.to}
            to={it.to}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-[10px] font-medium",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="size-5" />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
