import { useEffect, useState, type ReactNode } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { Bell, LogOut } from 'lucide-react';
import { useStore, roleLabels, deptName } from '../store/StoreContext';
import { menus } from '../config/menus';
import { DashboardRouter } from './DashboardRouter';
import { PageHeader } from '@/components/ui/page';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCollegeNavigation } from '../config/NavigationContext';

const collegeRoute = getRouteApi('/_app/college');

export function AppShell({ hideSignOut = false }: { hideSignOut?: boolean } = {}) {
  const { currentUser, data, logout, notifications, markNotificationRead } = useStore();
  const { page: activeMenu } = collegeRoute.useSearch();
  const navigate = collegeRoute.useNavigate();
  const { setWorkspaceRole } = useCollegeNavigation();
  const setActiveMenu = (page: string) => { void navigate({ search: { page } }); };
  const [notifOpen, setNotifOpen] = useState(false);
  const role = currentUser?.role ?? null;
  useEffect(() => {
    setWorkspaceRole(role);
    return () => setWorkspaceRole(null);
  }, [role, setWorkspaceRole]);
  if (!currentUser) return null;
  const userMenus = menus[currentUser.role];
  const currentActive = userMenus.find(item => item.id === activeMenu)?.id ?? userMenus[0]?.id ?? '';
  const userNotifs = notifications.filter(n => n.audience.includes(currentUser.role) && (!n.targetUserIds || n.targetUserIds.includes(currentUser.id)));
  const unreadCount = userNotifs.filter(n => !n.read).length;

  return (
    <div className="module-workspace space-y-6">
      <PageHeader
        title="College Portal"
        subtitle={`${roleLabels[currentUser.role]} · ${currentUser.name} · ${deptName(data, currentUser.departmentId)}`}
        actions={<>
          <Button variant="outline" size="sm" className="gap-1.5 relative" onClick={() => setNotifOpen(!notifOpen)}>
            <Bell className="size-4" /> Notifications
            {unreadCount > 0 && <span className="ml-1 rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">{unreadCount}</span>}
          </Button>
          {!hideSignOut && <Button variant="outline" size="sm" className="gap-1.5" onClick={logout}><LogOut className="size-4" /> Switch user</Button>}
        </>}
      />
      <div className="border-b border-border -mt-2 overflow-x-auto scrollbar-thin">
        <nav aria-label="College Portal pages" className="flex gap-1 -mb-px min-w-max">
          {userMenus.map(item => {
            const active = currentActive === item.id;
            return (
              <Button variant="ghost" key={item.id} onClick={() => setActiveMenu(item.id)} aria-current={active ? 'page' : undefined}
                className={cn("h-auto rounded-none flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap hover:bg-transparent",
                  active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
                <item.icon className="size-4" />{item.label}
              </Button>
            );
          })}
        </nav>
      </div>
      {notifOpen && <section className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Notifications</h2><Button variant="ghost" size="sm" onClick={() => setNotifOpen(false)}>Close</Button></div>
        {userNotifs.length === 0 ? <p className="text-sm text-muted-foreground">No notifications</p> : userNotifs.map(n => <Button key={n.id} variant="ghost" className="h-auto w-full justify-start whitespace-normal py-3 text-left" onClick={() => { markNotificationRead(n.id); if (n.title === 'Final Examination Schedule Published' && currentUser.role === 'hod') setActiveMenu('h-academic-management'); setNotifOpen(false); }}><span><span className="block font-medium">{n.title}</span><span className="block text-xs text-muted-foreground">{n.message}</span><span className="block text-xs text-muted-foreground">{n.date}</span></span></Button>)}
      </section>}
      <div className="min-w-0">
        <DashboardRouter activeMenu={currentActive} onNavigate={setActiveMenu} />
      </div>
    </div>
  );
}
export { useStore };
export type { ReactNode };
