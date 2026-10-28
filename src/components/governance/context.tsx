import { createContext, useContext, useState, ReactNode } from 'react';
import { useCloudState } from '@/lib/cloud-state';
import {
  Role, departments, students, faculty,
  initialPolicies, budgetItems, initialMeetings, initialProjects,
  achievements, initialAppointments, initialCollaborations, initialImprovementPlans,
  enrollmentTrends, graduationData,
  Department, Policy, Meeting, Project, Appointment, Collaboration, ImprovementPlan,
} from '@/components/governance/data';

interface AppState {
  currentRole: Role | null;
  departments: Department[];
  policies: Policy[];
  meetings: Meeting[];
  projects: Project[];
  appointments: Appointment[];
  collaborations: Collaboration[];
  improvementPlans: ImprovementPlan[];
  students: typeof students;
  faculty: typeof faculty;
  budgetItems: typeof budgetItems;
  achievements: typeof achievements;
  enrollmentTrends: typeof enrollmentTrends;
  graduationData: typeof graduationData;
}

interface AppContextType extends AppState {
  setRole: (role: Role | null) => void;
  updatePolicy: (policy: Policy) => void;
  addPolicy: (policy: Policy) => void;
  updateMeeting: (meeting: Meeting) => void;
  addMeeting: (meeting: Meeting) => void;
  updateProject: (project: Project) => void;
  addProject: (project: Project) => void;
  updateAppointment: (appt: Appointment) => void;
  addAppointment: (appt: Appointment) => void;
  updateCollaboration: (collab: Collaboration) => void;
  addCollaboration: (collab: Collaboration) => void;
  updateImprovementPlan: (plan: ImprovementPlan) => void;
  addImprovementPlan: (plan: ImprovementPlan) => void;
  updateDepartment: (dept: Department) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [depts, setDepts] = useCloudState('gov.depts', departments);
  const [policies, setPolicies] = useCloudState('gov.policies', initialPolicies);
  const [meetings, setMeetings] = useCloudState('gov.meetings', initialMeetings);
  const [projects, setProjects] = useCloudState('gov.projects', initialProjects);
  const [appointments, setAppointments] = useCloudState('gov.appointments', initialAppointments);
  const [collaborations, setCollaborations] = useCloudState('gov.collaborations', initialCollaborations);
  const [improvementPlans, setImprovementPlans] = useCloudState('gov.improvementPlans', initialImprovementPlans);

  const updatePolicy = (updated: Policy) =>
    setPolicies(prev => prev.map(p => p.id === updated.id ? updated : p));
  const addPolicy = (p: Policy) => setPolicies(prev => [p, ...prev]);

  const updateMeeting = (updated: Meeting) =>
    setMeetings(prev => prev.map(m => m.id === updated.id ? updated : m));
  const addMeeting = (m: Meeting) => setMeetings(prev => [m, ...prev]);

  const updateProject = (updated: Project) =>
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  const addProject = (p: Project) => setProjects(prev => [p, ...prev]);

  const updateAppointment = (updated: Appointment) =>
    setAppointments(prev => prev.map(a => a.id === updated.id ? updated : a));
  const addAppointment = (a: Appointment) => setAppointments(prev => [a, ...prev]);

  const updateCollaboration = (updated: Collaboration) =>
    setCollaborations(prev => prev.map(c => c.id === updated.id ? updated : c));
  const addCollaboration = (c: Collaboration) => setCollaborations(prev => [c, ...prev]);

  const updateImprovementPlan = (updated: ImprovementPlan) =>
    setImprovementPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
  const addImprovementPlan = (p: ImprovementPlan) => setImprovementPlans(prev => [p, ...prev]);

  const updateDepartment = (updated: Department) =>
    setDepts(prev => prev.map(d => d.id === updated.id ? updated : d));

  return (
    <AppContext.Provider value={{
      currentRole,
      departments: depts,
      policies,
      meetings,
      projects,
      appointments,
      collaborations,
      improvementPlans,
      students,
      faculty,
      budgetItems,
      achievements,
      enrollmentTrends,
      graduationData,
      setRole: setCurrentRole,
      updatePolicy, addPolicy,
      updateMeeting, addMeeting,
      updateProject, addProject,
      updateAppointment, addAppointment,
      updateCollaboration, addCollaboration,
      updateImprovementPlan, addImprovementPlan,
      updateDepartment,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
