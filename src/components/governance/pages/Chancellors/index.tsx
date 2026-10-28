import { ReactElement, useEffect, useRef, useState } from 'react';
import {
  Award, BarChart2, BarChart3, BookOpen, Briefcase, Building2, Calendar,
  CheckSquare, Compass, Expand, FileText, GraduationCap, Handshake, MessageSquare,
  Network, Rocket, Settings, TrendingUp, Users2,
} from 'lucide-react';
import Layout from '@/components/governance/Layout';
import AcademicPerformance from '@/components/governance/pages/Chancellor/AcademicPerformance';
import GraduationConvocation from '@/components/governance/pages/Chancellor/GraduationConvocation';
import InstitutionalAchievements from '@/components/governance/pages/Chancellor/InstitutionalAchievements';
import InstitutionalDevelopment from '@/components/governance/pages/Chancellor/InstitutionalDevelopment';
import AdministrativeReports from '@/components/governance/pages/ProChancellor/AdministrativeReports';
import CommitteeReports from '@/components/governance/pages/ProChancellor/CommitteeReports';
import CommunicationDashboard from '@/components/governance/pages/ProChancellor/CommunicationDashboard';
import DecisionMonitoring from '@/components/governance/pages/ProChancellor/DecisionMonitoring';
import ExecutiveMeetings from '@/components/governance/pages/ProChancellor/ExecutiveMeetings';
import InstitutionalProjects from '@/components/governance/pages/ProChancellor/InstitutionalProjects';
import Approvals from '@/components/governance/pages/ViceChancellor/Approvals';
import Collaboration from '@/components/governance/pages/ViceChancellor/Collaboration';
import Dealing from '@/components/governance/pages/ViceChancellor/Dealing';
import Expansion from '@/components/governance/pages/ViceChancellor/Expansion';
import OutcomesDashboard from '@/components/governance/pages/ViceChancellor/OutcomesDashboard';
import DepartmentPerformance from '@/components/governance/pages/ProViceChancellor/DepartmentPerformance';
import HigherAuthorityCoordination from '@/components/governance/pages/ProViceChancellor/HigherAuthorityCoordination';
import InstitutionalCoordination from '@/components/governance/pages/ProViceChancellor/InstitutionalCoordination';
import InstitutionalImprovementPlans from '@/components/governance/pages/ProViceChancellor/InstitutionalImprovementPlans';
import PolicyImplementation from '@/components/governance/pages/ProViceChancellor/PolicyImplementation';

const CATEGORIES = [
  { id: 'academic', label: 'Academic Leadership', icon: <GraduationCap className="w-4 h-4" />, modules: ['academicPerformance', 'graduation'] },
  { id: 'governance', label: 'Governance & Strategic Decisions', icon: <Compass className="w-4 h-4" />, modules: ['achievements', 'development'] },
  { id: 'meetings', label: 'Meetings & Committees', icon: <Calendar className="w-4 h-4" />, modules: ['executiveMeetings', 'committee'] },
  { id: 'reports', label: 'Reports & Compliance', icon: <FileText className="w-4 h-4" />, modules: ['admin', 'comms'] },
  { id: 'approvals', label: 'Approvals & Policies', icon: <CheckSquare className="w-4 h-4" />, modules: ['approvals', 'policy'] },
  { id: 'management', label: 'Institutional Management', icon: <Network className="w-4 h-4" />, modules: ['coordination', 'dealing', 'collaboration', 'authority'] },
  { id: 'performance', label: 'Performance Monitoring', icon: <BarChart2 className="w-4 h-4" />, modules: ['decisions', 'outcomes', 'deptperformance'] },
  { id: 'projects', label: 'Institutional Projects & Initiatives', icon: <Rocket className="w-4 h-4" />, modules: ['expansion', 'projects', 'improvement'] },
];

const MODULES: Record<string, { label: string; icon: ReactElement; content: ReactElement }> = {
  academicPerformance: { label: 'Academic Performance', icon: <BarChart3 className="w-4 h-4" />, content: <AcademicPerformance /> },
  graduation: { label: 'Graduation & Convocation', icon: <GraduationCap className="w-4 h-4" />, content: <GraduationConvocation /> },
  achievements: { label: 'Institutional Achievements', icon: <Award className="w-4 h-4" />, content: <InstitutionalAchievements /> },
  development: { label: 'Institutional Development', icon: <Compass className="w-4 h-4" />, content: <InstitutionalDevelopment /> },
  executiveMeetings: { label: 'Executive Meetings', icon: <Calendar className="w-4 h-4" />, content: <ExecutiveMeetings /> },
  committee: { label: 'Committee Reports', icon: <BookOpen className="w-4 h-4" />, content: <CommitteeReports /> },
  admin: { label: 'Administrative Reports', icon: <FileText className="w-4 h-4" />, content: <AdministrativeReports /> },
  comms: { label: 'Communication Dashboard', icon: <MessageSquare className="w-4 h-4" />, content: <CommunicationDashboard /> },
  approvals: { label: 'Approvals', icon: <CheckSquare className="w-4 h-4" />, content: <Approvals /> },
  policy: { label: 'Policy Implementation', icon: <Settings className="w-4 h-4" />, content: <PolicyImplementation /> },
  decisions: { label: 'Decision Monitoring', icon: <CheckSquare className="w-4 h-4" />, content: <DecisionMonitoring /> },
  outcomes: { label: 'Outcomes Dashboard', icon: <BarChart2 className="w-4 h-4" />, content: <OutcomesDashboard /> },
  deptperformance: { label: 'Department Performance', icon: <TrendingUp className="w-4 h-4" />, content: <DepartmentPerformance /> },
  coordination: { label: 'Institutional Coordination', icon: <Network className="w-4 h-4" />, content: <InstitutionalCoordination /> },
  dealing: { label: 'Operations & Dealing', icon: <Briefcase className="w-4 h-4" />, content: <Dealing /> },
  collaboration: { label: 'Collaboration', icon: <Handshake className="w-4 h-4" />, content: <Collaboration /> },
  authority: { label: 'Higher Authority Coordination', icon: <Users2 className="w-4 h-4" />, content: <HigherAuthorityCoordination /> },
  expansion: { label: 'Expansion', icon: <Expand className="w-4 h-4" />, content: <Expansion /> },
  projects: { label: 'Institutional Projects', icon: <Rocket className="w-4 h-4" />, content: <InstitutionalProjects /> },
  improvement: { label: 'Improvement Plans', icon: <Building2 className="w-4 h-4" />, content: <InstitutionalImprovementPlans /> },
};

export default function Chancellors() {
  const [activeCategory, setActiveCategory] = useState('academic');
  const [activeModules, setActiveModules] = useState<Record<string, string>>({ academic: 'academicPerformance' });
  const [tabTransition, setTabTransition] = useState<'idle' | 'exiting' | 'entering'>('idle');
  const pendingModule = useRef<string | null>(null);
  const transitionTimer = useRef<number | undefined>(undefined);
  const category = CATEGORIES.find(item => item.id === activeCategory) || CATEGORIES[0];
  const activeModule = activeModules[activeCategory] || category.modules[0];
  const activeContent = MODULES[activeModule];

  const selectCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    setActiveModules(previous => ({ ...previous, [categoryId]: previous[categoryId] || CATEGORIES.find(item => item.id === categoryId)!.modules[0] }));
  };

  const selectModule = (moduleId: string) => {
    if (moduleId === activeModule || tabTransition !== 'idle') return;
    pendingModule.current = moduleId;
    setTabTransition('exiting');
  };

  useEffect(() => () => {
    if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
  }, []);

  useEffect(() => {
    if (tabTransition !== 'exiting' || !pendingModule.current) return;
    transitionTimer.current = window.setTimeout(() => {
      const nextModule = pendingModule.current;
      if (nextModule) setActiveModules(previous => ({ ...previous, [activeCategory]: nextModule }));
      pendingModule.current = null;
      setTabTransition('entering');
      transitionTimer.current = window.setTimeout(() => setTabTransition('idle'), 240);
    }, 140);
  }, [activeCategory, tabTransition]);

  const navItems = CATEGORIES.map(item => ({ ...item, id: item.id }));

  return (
    <Layout role="chancellors" navItems={navItems} activeModule={activeCategory} onModuleChange={selectCategory}>
      <div className="mb-6">
        <div className="mb-4">
          <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-1">Chancellors</p>
          <h1 className="text-2xl font-bold text-foreground">{category.label}</h1>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {category.modules.map(moduleId => {
            const module = MODULES[moduleId];
            const isActive = moduleId === activeModule;
            return (
              <button
                key={moduleId}
                onClick={() => selectModule(moduleId)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out ${isActive ? 'border-primary bg-primary text-primary-foreground shadow-sm' : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary'}`}
              >
                {module.icon}
                {module.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className={`tab-content-transition ${tabTransition === 'exiting' ? 'tab-content-exiting' : ''}`} key={activeModule}>
        {activeContent.content}
      </div>
    </Layout>
  );
}
