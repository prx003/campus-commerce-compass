import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { AppData, Role, Staff, Student, Subject, Candidate, ApprovalRequest, Grievance, Message, TimetableEntry, Notification, Policy, Complaint, NonTeachingTask, Resource, ResourceAllocation, MaintenanceRequest, ResourceRequest, ResourceHistory, ExamSchedule, ExamAttendanceRecord, SubjectAllocation, AllocationHistory, MentorAllocation, MentoringHistory, AssignedTask, WorkloadSettings } from '../data/types';
import { sampleData } from '../data/sampleData';
import { useCloudState } from '@/lib/cloud-state';
import { validateTimetableEntry } from '../roles/hod/timetableLogic';

interface StoreContextValue {
  data: AppData;
  currentUser: Staff | null;
  login: (staffId: string) => void;
  logout: () => void;
  updateStudent: (id: string, patch: Partial<Student>) => void;
  updateStaff: (id: string, patch: Partial<Staff>) => void;
  updateCandidate: (id: string, patch: Partial<Candidate>) => void;
  updateApproval: (id: string, patch: Partial<ApprovalRequest>) => void;
  addApproval: (approval: ApprovalRequest) => void;
  updateGrievance: (id: string, patch: Partial<Grievance>) => void;
  addGrievance: (g: Grievance) => void;
  markNotificationRead: (id: string) => void;
  notifications: AppData['notifications'];
  sendMessage: (m: Message) => void;
  markMessageRead: (id: string) => void;
  messages: AppData['messages'];
  updateTimetableEntry: (id: string, patch: Partial<TimetableEntry>) => void;
  addTimetableEntry: (t: TimetableEntry) => void;
  publishTimetable: (deptId: string, section: string, semester: number) => void;
  submitTimetableForApproval: (approvalId: string) => void;
  addNotification: (n: Notification) => void;
  addPolicy: (p: Policy) => void;
  updatePolicy: (id: string, patch: Partial<Policy>) => void;
  addComplaint: (c: Complaint) => void;
  updateComplaint: (id: string, patch: Partial<Complaint>) => void;
  updateNonTeachingTask: (id: string, patch: Partial<NonTeachingTask>) => void;
  updateResource: (id: string, patch: Partial<Resource>) => void;
  addResource: (r: Resource) => void;
  allocateResource: (a: ResourceAllocation) => void;
  addMaintenanceRequest: (m: MaintenanceRequest) => void;
  updateMaintenanceRequest: (id: string, patch: Partial<MaintenanceRequest>) => void;
  addResourceRequest: (r: ResourceRequest) => void;
  addResourceHistory: (h: ResourceHistory) => void;
  updateSubject: (id: string, patch: Partial<Subject>) => void;
  saveSubjectAllocation: (a: SubjectAllocation) => void;
  removeSubjectAllocation: (id: string) => void;
  addAllocationHistory: (h: AllocationHistory) => void;
  saveMentorAllocation: (a: MentorAllocation) => void;
  addMentoringHistory: (h: MentoringHistory) => void;
  addAssignedTask: (t: AssignedTask) => void;
  updateAssignedTask: (id: string, patch: Partial<AssignedTask>) => void;
  updateWorkloadSettings: (patch: Partial<WorkloadSettings>) => void;
  addExam: (exam: ExamSchedule) => void;
  updateExam: (id: string, patch: Partial<ExamSchedule>) => void;
  saveExamAttendance: (examId: string, records: ExamAttendanceRecord[], markedBy: string) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useCloudState<AppData>('college.data', sampleData);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const currentUser = useMemo(
    () => data.staff.find((s) => s.id === currentUserId) ?? null,
    [data.staff, currentUserId]
  );

  const value: StoreContextValue = {
    data,
    currentUser,
    login: (id) => setCurrentUserId(id),
    logout: () => setCurrentUserId(null),
    updateStudent: (id, patch) =>
      setData((d) => ({ ...d, students: d.students.map((s) => (s.id === id ? { ...s, ...patch } : s)) })),
    updateStaff: (id, patch) =>
      setData((d) => ({ ...d, staff: d.staff.map((s) => (s.id === id ? { ...s, ...patch } : s)) })),
    updateCandidate: (id, patch) =>
      setData((d) => ({ ...d, candidates: d.candidates.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
    updateApproval: (id, patch) =>
      setData((d) => ({ ...d, approvals: d.approvals.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),
    addApproval: (approval) =>
      setData((d) => ({ ...d, approvals: [approval, ...d.approvals] })),
    updateGrievance: (id, patch) =>
      setData((d) => ({ ...d, grievances: d.grievances.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
    addGrievance: (g) => setData((d) => ({ ...d, grievances: [g, ...d.grievances] })),
    markNotificationRead: (id) =>
      setData((d) => ({ ...d, notifications: d.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
    notifications: data.notifications,
    sendMessage: (m) => setData((d) => ({ ...d, messages: [m, ...d.messages] })),
    markMessageRead: (id) =>
      setData((d) => ({ ...d, messages: d.messages.map((m) => (m.id === id ? { ...m, read: true } : m)) })),
    messages: data.messages,
    updateTimetableEntry: (id, patch) =>
      setData((d) => {
        const current = d.timetable.find((t) => t.id === id);
        if (!current) return d;
        const next = { ...current, ...patch };
        return validateTimetableEntry(d, next, d.timetable, id).valid
          ? { ...d, timetable: d.timetable.map((t) => (t.id === id ? next : t)) }
          : d;
      }),
    addTimetableEntry: (t) =>
      setData((d) => validateTimetableEntry(d, t).valid ? { ...d, timetable: [...d.timetable, t] } : d),
    publishTimetable: (deptId, section, semester) =>
      setData((d) => ({ ...d, timetable: d.timetable.map((t) => (t.departmentId === deptId && t.section === section && t.semester === semester ? { ...t, published: true } : t)) })),
    submitTimetableForApproval: (approvalId) =>
      setData((d) => ({
        ...d,
        approvals: d.approvals.map((a) => (a.id === approvalId ? { ...a, status: 'pending' as const } : a)),
        notifications: [
          { id: `n${Date.now()}`, title: 'Timetable submitted for approval', message: `${d.approvals.find((a) => a.id === approvalId)?.title ?? 'Timetable'} submitted to Principal`, date: new Date().toISOString().slice(0, 10), audience: ['principal'] as Role[], read: false },
          ...d.notifications,
        ],
      })),
    addNotification: (n) => setData((d) => ({ ...d, notifications: [n, ...d.notifications] })),
    addPolicy: (p) => setData((d) => ({ ...d, policies: [p, ...d.policies] })),
    updatePolicy: (id, patch) =>
      setData((d) => ({ ...d, policies: d.policies.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
    addComplaint: (c) => setData((d) => ({ ...d, complaints: [c, ...d.complaints] })),
    updateComplaint: (id, patch) =>
      setData((d) => ({ ...d, complaints: d.complaints.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
    updateNonTeachingTask: (id, patch) =>
      setData((d) => ({ ...d, nonTeachingTasks: d.nonTeachingTasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
    updateResource: (id, patch) =>
      setData((d) => ({ ...d, resources: d.resources.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
    addResource: (r) => setData((d) => ({ ...d, resources: [r, ...d.resources] })),
    allocateResource: (a) => setData((d) => ({ ...d, resourceAllocations: [a, ...d.resourceAllocations] })),
    addMaintenanceRequest: (m) => setData((d) => ({ ...d, maintenanceRequests: [m, ...d.maintenanceRequests] })),
    updateMaintenanceRequest: (id, patch) =>
      setData((d) => ({ ...d, maintenanceRequests: d.maintenanceRequests.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),
    addResourceRequest: (r) => setData((d) => ({ ...d, resourceRequests: [r, ...d.resourceRequests] })),
    addResourceHistory: (h) => setData((d) => ({ ...d, resourceHistory: [h, ...d.resourceHistory] })),
    updateSubject: (id, patch) =>
      setData((d) => ({ ...d, subjects: d.subjects.map((s) => (s.id === id ? { ...s, ...patch } : s)) })),
    saveSubjectAllocation: (a) =>
      setData((d) => ({ ...d, subjectAllocations: d.subjectAllocations.some((x) => x.id === a.id) ? d.subjectAllocations.map((x) => (x.id === a.id ? a : x)) : [a, ...d.subjectAllocations] })),
    removeSubjectAllocation: (id) =>
      setData((d) => ({ ...d, subjectAllocations: d.subjectAllocations.filter((x) => x.id !== id) })),
    addAllocationHistory: (h) =>
      setData((d) => ({ ...d, allocationHistory: [h, ...d.allocationHistory] })),
    saveMentorAllocation: (a) =>
      setData((d) => ({ ...d, mentorAllocations: d.mentorAllocations.some((x) => x.id === a.id) ? d.mentorAllocations.map((x) => (x.id === a.id ? a : x)) : [a, ...d.mentorAllocations] })),
    addMentoringHistory: (h) =>
      setData((d) => ({ ...d, mentoringHistory: [h, ...d.mentoringHistory] })),
    addAssignedTask: (t) =>
      setData((d) => ({ ...d, assignedTasks: [t, ...d.assignedTasks] })),
    updateAssignedTask: (id, patch) =>
      setData((d) => ({ ...d, assignedTasks: d.assignedTasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
    updateWorkloadSettings: (patch) =>
      setData((d) => ({ ...d, workloadSettings: { ...d.workloadSettings, ...patch } })),
    addExam: (exam) => setData((d) => ({ ...d, exams: [exam, ...d.exams] })),
    updateExam: (id, patch) => setData((d) => ({ ...d, exams: d.exams.map((e) => e.id === id ? { ...e, ...patch } : e) })),
    saveExamAttendance: (examId, records, markedBy) => setData((d) => ({
      ...d,
      exams: d.exams.map((e) => e.id === examId ? { ...e, attendanceSubmittedBy: markedBy, attendanceSubmittedOn: new Date().toLocaleString() } : e),
      examAttendance: [...d.examAttendance.filter((r) => r.examId !== examId), ...records],
    })),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export const roleLabels: Record<Role, string> = {
  principal: 'Principal',
  dean: 'Dean',
  hod: 'Head of Department',
  professor: 'Professor',
  'associate-professor': 'Associate Professor',
  'assistant-professor': 'Assistant Professor',
  lecturer: 'Lecturer / Instructor',
  'teaching-assistant': 'Teaching Assistant',
  'office-superintendent': 'Office Superintendent',
  'lab-assistant': 'Lab Assistant / Technician',
};

export function deptName(data: AppData, id: string) {
  return data.departments.find((d) => d.id === id)?.name ?? '—';
}
export function deptCode(data: AppData, id: string) {
  return data.departments.find((d) => d.id === id)?.code ?? '—';
}
export function staffName(data: AppData, id: string) {
  return data.staff.find((s) => s.id === id)?.name ?? '—';
}
