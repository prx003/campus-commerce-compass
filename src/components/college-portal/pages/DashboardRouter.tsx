import { useStore } from '../store/StoreContext';
import { PrincipalDashboard } from '../roles/principal/PrincipalDashboard';
import { DeanDashboard } from '../roles/dean/DeanDashboard';
import { HodDashboard } from '../roles/hod/HodDashboard';
import { TeachingDashboard } from '../roles/teaching/TeachingDashboard';
import { NonTeachingDashboard } from '../roles/nonteaching/NonTeachingDashboard';

export function DashboardRouter({ activeMenu, onNavigate }: { activeMenu: string; onNavigate?: (menuId: string) => void }) {
  const { currentUser } = useStore();
  if (!currentUser) return null;

  switch (currentUser.role) {
    case 'principal':
      return <PrincipalDashboard activeMenu={activeMenu} />;
    case 'dean':
      return <DeanDashboard activeMenu={activeMenu} />;
    case 'hod':
      return <HodDashboard activeMenu={activeMenu} onNavigate={onNavigate} />;
    case 'professor':
    case 'associate-professor':
    case 'assistant-professor':
    case 'lecturer':
    case 'teaching-assistant':
      return <TeachingDashboard activeMenu={activeMenu} />;
    case 'office-superintendent':
    case 'lab-assistant':
      return <NonTeachingDashboard activeMenu={activeMenu} />;
    default:
      return <p className="text-slate-500">Unknown role.</p>;
  }
}
