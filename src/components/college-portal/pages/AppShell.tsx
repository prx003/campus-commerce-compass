import { useState, type ReactNode } from 'react';
import { Bell, LogOut } from 'lucide-react';
import { useStore, roleLabels, deptName } from '../store/StoreContext';
import { menus } from '../config/menus';
import { DashboardRouter } from './DashboardRouter';
import { ModuleShell, ModuleNavButton } from '@/components/layout/module-shell';
import { Button } from '@/components/ui/button';

export function AppShell() {
  const { currentUser, data, logout, notifications, markNotificationRead } = useStore();
  const [activeMenu, setActiveMenu] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  if (!currentUser) return null;
  const userMenus = menus[currentUser.role];
  const currentActive = userMenus.some(item => item.id === activeMenu) ? activeMenu : userMenus[0]?.id ?? '';
  const userNotifs = notifications.filter(n => n.audience.includes(currentUser.role) && (!n.targetUserIds || n.targetUserIds.includes(currentUser.id)));
  const unreadCount = userNotifs.filter(n => !n.read).length;
  return <ModuleShell title="College Portal" subtitle={roleLabels[currentUser.role]}
    navigation={userMenus.map(item => <ModuleNavButton key={item.id} active={currentActive === item.id} icon={<item.icon className="size-[18px] shrink-0" />} onClick={() => setActiveMenu(item.id)}>{item.label}</ModuleNavButton>)}
    footer={<Button variant="ghost" onClick={logout} className="module-nav-item w-full justify-start"><LogOut className="size-4" />Sign out</Button>}
    actions={<><div className="text-right"><p className="text-sm font-medium">{currentUser.name}</p><p className="text-xs text-muted-foreground">{deptName(data, currentUser.departmentId)}</p></div><Button variant="outline" size="icon" aria-label="Notifications" onClick={() => setNotifOpen(!notifOpen)}><Bell className="size-4" />{unreadCount > 0 && <span className="text-xs">{unreadCount}</span>}</Button></>}>
    {notifOpen && <section className="mb-6 border-b border-border pb-4"><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Notifications</h2><Button variant="ghost" size="sm" onClick={() => setNotifOpen(false)}>Close</Button></div>{userNotifs.length === 0 ? <p className="text-sm text-muted-foreground">No notifications</p> : userNotifs.map(n => <Button key={n.id} variant="ghost" className="h-auto w-full justify-start whitespace-normal py-3 text-left" onClick={() => { markNotificationRead(n.id); if (n.title === 'Final Examination Schedule Published' && currentUser.role === 'hod') setActiveMenu('h-academic-management'); setNotifOpen(false); }}><span><span className="block font-medium">{n.title}</span><span className="block text-xs text-muted-foreground">{n.message}</span><span className="block text-xs text-muted-foreground">{n.date}</span></span></Button>)}</section>}
    <DashboardRouter activeMenu={currentActive} onNavigate={setActiveMenu} />
  </ModuleShell>;
}
export { useStore };
export type { ReactNode };
