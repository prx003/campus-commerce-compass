import { ModuleShell, ModuleNavButton } from '@/components/layout/module-shell';
import type { ReactNode } from "react";
import { ChevronRight, Landmark } from "lucide-react";
import type { Role } from "@/components/governance/data";
import { ROLES } from "@/components/governance/data";
import { useApp } from "@/components/governance/context";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  category?: string;
}

interface LayoutProps {
  role: Role;
  navItems: NavItem[];
  activeModule: string;
  onModuleChange: (id: string) => void;
  children: ReactNode;
}

export default function Layout({ role, navItems, activeModule, onModuleChange, children }: LayoutProps) {
  const { setRole } = useApp();
  const roleInfo = ROLES.find((item) => item.id === role);
  const activeNav = navItems.find((item) => item.id === activeModule);

  if (!roleInfo) return null;

  return (
    <ModuleShell title="Governance" subtitle={roleInfo.title}
      navigation={navItems.map(item => <ModuleNavButton key={item.id} active={item.id === activeModule} icon={<span className="size-[18px] shrink-0">{item.icon}</span>} onClick={() => onModuleChange(item.id)}>{item.label}</ModuleNavButton>)}
      actions={<Select value={role} onValueChange={(value) => setRole(value as Role)}><SelectTrigger aria-label="Switch governance role" className="h-8 w-full sm:w-64"><SelectValue /></SelectTrigger><SelectContent>{ROLES.map(item => <SelectItem key={item.id} value={item.id}>{item.title}</SelectItem>)}</SelectContent></Select>}>
      {children}
    </ModuleShell>
  );
}
