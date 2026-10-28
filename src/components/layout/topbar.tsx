import { Bell, Search, Sparkles, Sun, Moon, ChevronDown } from "lucide-react";
import { useAuth, ROLE_LABELS } from "@/lib/auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";

export function Topbar() {
  const { theme, toggle } = useTheme();
  const { user, roles } = useAuth();
  void user;
  const name = "Guest";
  const initials = name.split(/[\s@.]/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

  return (
    <header className="h-16 shrink-0 border-b border-border glass sticky top-0 z-30 flex items-center gap-3 px-4 md:px-6">
      <button className="hidden lg:flex items-center gap-2 text-sm font-medium px-2.5 py-1.5 rounded-md hover:bg-accent">
        <span className="size-6 rounded gradient-primary grid place-items-center text-primary-foreground text-[10px] font-bold">G</span>
        <span>Greenwood Intl.</span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </button>

      <div className="flex-1 max-w-xl relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search students, invoices, leads…"
          className="w-full h-9 pl-9 pr-16 text-sm rounded-md bg-secondary border border-transparent focus:bg-card focus:border-border focus:outline-none focus:ring-2 focus:ring-ring/30 transition"
        />
        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-muted-foreground border border-border rounded px-1.5 py-0.5 bg-card">
          ⌘K
        </kbd>
      </div>

      <Button size="sm" variant="ghost" className="gap-1.5 hidden md:inline-flex">
        <Sparkles className="size-4 text-primary" />
        <span className="text-sm">Ask AI</span>
      </Button>


      <button
        onClick={toggle}
        className="size-9 grid place-items-center rounded-md hover:bg-accent text-muted-foreground"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </button>

      <button className="size-9 grid place-items-center rounded-md hover:bg-accent text-muted-foreground relative">
        <Bell className="size-4" />
        <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive ring-2 ring-background" />
      </button>

      <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-md hover:bg-accent">
        <div className="size-8 rounded-full bg-gradient-to-br from-primary to-chart-5 grid place-items-center text-primary-foreground text-xs font-semibold">
          {initials}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-xs font-semibold leading-tight">{name}</div>
          <div className="text-[10px] text-muted-foreground">{roles.map((r) => ROLE_LABELS[r]).join(", ") || "No role"}</div>
        </div>
      </button>
    </header>
  );
}
