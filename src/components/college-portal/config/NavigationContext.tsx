import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Role } from '../data/types';

const NavigationContext = createContext<{
  workspaceRole: Role | null;
  setWorkspaceRole: (role: Role | null) => void;
}>({ workspaceRole: null, setWorkspaceRole: () => {} });

export function CollegeNavigationProvider({ children }: { children: ReactNode }) {
  const [workspaceRole, setWorkspaceRole] = useState<Role | null>(null);
  return <NavigationContext.Provider value={{ workspaceRole, setWorkspaceRole }}>{children}</NavigationContext.Provider>;
}

export const useCollegeNavigation = () => useContext(NavigationContext);