import { ReactElement, useState } from 'react';
import {
  LayoutDashboard, FileText, DollarSign, Users, UserCheck,
  BarChart3, BookOpen, Building2, ChevronRight
} from 'lucide-react';
import Layout from '@/components/governance/Layout';
import InstitutionOverview from './InstitutionOverview';
import PolicyManagement from './PolicyManagement';
import BudgetFinance from './BudgetFinance';
import StudentEnrollment from './StudentEnrollment';
import SeniorStaffAppointments from './SeniorStaffAppointments';
import InstitutionalPerformance from './InstitutionalPerformance';

const NAV_ITEMS = [
  { id: 'overview', label: 'Institution Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'policy', label: 'Policy Management', icon: <FileText className="w-4 h-4" /> },
  { id: 'budget', label: 'Budget & Finance', icon: <DollarSign className="w-4 h-4" /> },
  { id: 'enrollment', label: 'Student Enrollment', icon: <Users className="w-4 h-4" /> },
  { id: 'appointments', label: 'Senior Staff Appointments', icon: <UserCheck className="w-4 h-4" /> },
  { id: 'performance', label: 'Institutional Performance', icon: <BarChart3 className="w-4 h-4" /> },
];

const PAGES: Record<string, ReactElement> = {
  overview: <InstitutionOverview />,
  policy: <PolicyManagement />,
  budget: <BudgetFinance />,
  enrollment: <StudentEnrollment />,
  appointments: <SeniorStaffAppointments />,
  performance: <InstitutionalPerformance />,
};

export default function BoardOfTrustees() {
  const [activeModule, setActiveModule] = useState('overview');
  return (
    <Layout role="board" navItems={NAV_ITEMS} activeModule={activeModule} onModuleChange={setActiveModule}>
      {PAGES[activeModule]}
    </Layout>
  );
}
