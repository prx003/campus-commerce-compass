import type { AppData, AssignedTask, Staff, TimetableEntry, WorkloadSettings } from '../../data/types';
import { getActiveAllocations } from './mentoringLogic';

/* ============================================================
 * Daily Workload aggregation layer
 * Single source of truth for the HOD "Workload" page.
 *
 *   Timetable (published, per weekday)  → Teaching + Lab hours
 *   Mentor allocations (configurable)   → Mentoring hours
 *   HOD-assigned tasks (by date)        → Additional work hours
 *   ------------------------------------------------
 *   Sum                                        → Daily Workload Hours
 * ============================================================ */

export const TEACHING_ROLES = ['professor', 'associate-professor', 'assistant-professor', 'lecturer', 'teaching-assistant'] as const;

/* ---------- Date helpers ---------- */

export function dayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

export function isoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Compact label, e.g. "30 Aug", "1 Sep" */
export function formatDayLabel(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/** Full label, e.g. "Mon, 31 Aug 2026" */
export function formatFullDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

/** Pretty display of a YYYY-MM-DD string, e.g. "02 Sep 2026" */
export function formatIso(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Hours spanned by a slot string, e.g. "14:00-16:00" → 2 */
export function slotHours(slot: string): number {
  const m = slot.match(/^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/);
  if (!m) return 1;
  const start = Number(m[1]) * 60 + Number(m[2]);
  const end = Number(m[3]) * 60 + Number(m[4]);
  return Math.max(0.5, (end - start) / 60);
}

/* ---------- Workload primitives ---------- */

export interface WorkloadLine {
  id: string;
  label: string;      /* class label, e.g. "III Semester – Section A" */
  subject: string;
  hours: number;
  slot?: string;
  room?: string;
  kind: 'teaching' | 'lab';
}

/** Human-readable class label from a timetable entry, e.g. "III Semester · Section A". */
export function entryClassLabel(entry: TimetableEntry): string {
  const ord = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
  };
  return `${ord(entry.semester)} Semester · Section ${entry.section}`;
}

export interface FacultyDailyWorkload {
  facultyId: string;
  teachingLines: WorkloadLine[];
  teachingHours: number;
  labLines: WorkloadLine[];
  labHours: number;
  menteeCount: number;
  mentoringHours: number;
  mentoringDetail: { batches: number; studentsPerBatch: number; hoursPerBatch: number };
  additionalTasks: AssignedTask[];
  additionalHours: number;
  total: number;
}
export function computeFacultyDailyWorkload(
  data: AppData,
  faculty: Staff,
  date: Date
): FacultyDailyWorkload {
  const day = dayName(date);
  const entries = data.timetable.filter(
    (t) => t.facultyId === faculty.id && t.published && t.day === day
  );

  const teachingLines: WorkloadLine[] = [];
  const labLines: WorkloadLine[] = [];
  let teachingHours = 0;
  let labHours = 0;

  for (const e of entries) {
    const hrs = slotHours(e.slot);
    const line: WorkloadLine = {
      id: e.id,
      label: entryClassLabel(e),
      subject: e.subject,
      hours: hrs,
      slot: e.slot,
      room: e.room,
      kind: e.isLab ? 'lab' : 'teaching',
    };
    if (e.isLab) {
      labLines.push(line);
      labHours += hrs;
    } else {
      teachingLines.push(line);
      teachingHours += hrs;
    }
  }

  // Mentoring — institution-configurable rule (see workloadSettings.mentoringRule)
  const setting = data.workloadSettings?.mentoringRule;
  const rule = setting?.enabled === false
    ? null
    : {
        scheduleDay: setting?.scheduleDay ?? 'Monday',
        studentsPerBatch: setting?.studentsPerBatch ?? 20,
        hoursPerBatch: setting?.hoursPerBatch ?? 1,
      };
  const menteeCount = getActiveAllocations(data).filter((a) => a.mentorId === faculty.id).length;
  let mentoringHours = 0;
  const mentoringDetail = { batches: 0, studentsPerBatch: rule?.studentsPerBatch ?? 0, hoursPerBatch: rule?.hoursPerBatch ?? 0 };
  if (rule && menteeCount > 0 && day === rule.scheduleDay) {
    const batches = Math.max(1, Math.ceil(menteeCount / rule.studentsPerBatch));
    mentoringDetail.batches = batches;
    mentoringHours = batches * rule.hoursPerBatch;
  }

  // Additional assigned work for the selected date
  const dateIso = isoDate(date);
  const additionalTasks = data.assignedTasks.filter(
    (t) => t.facultyId === faculty.id && t.date === dateIso
  );
  const additionalHours = additionalTasks.reduce((sum, t) => sum + t.allocatedHours, 0);

  return {
    facultyId: faculty.id,
    teachingLines,
    teachingHours,
    labLines,
    labHours,
    menteeCount,
    mentoringHours,
    mentoringDetail,
    additionalTasks,
    additionalHours,
    total: teachingHours + labHours + mentoringHours + additionalHours,
  };
}

/* ---------- Workload indicators ---------- */

export type WorkloadLevel = 'low' | 'moderate' | 'high' | 'overloaded';

export const WORKLOAD_LEVEL_INFO: Record<WorkloadLevel, { label: string; badge: string; bar: string; text: string }> = {
  low: { label: 'Low', badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500', text: 'text-emerald-700' },
  moderate: { label: 'Moderate', badge: 'bg-blue-100 text-blue-700', bar: 'bg-blue-500', text: 'text-blue-700' },
  high: { label: 'High', badge: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500', text: 'text-amber-700' },
  overloaded: { label: 'Overloaded', badge: 'bg-rose-100 text-rose-700', bar: 'bg-rose-600', text: 'text-rose-700' },
};

export function workloadIndicator(hours: number, settings: WorkloadSettings): WorkloadLevel {
  const { low = 2, moderate = 4, high = 6 } = settings?.thresholds ?? { low: 2, moderate: 4, high: 6 };
  if (hours > high) return 'overloaded';
  if (hours > moderate) return 'high';
  if (hours > low) return 'moderate';
  return 'low';
}

/* ---------- Department-level aggregation ---------- */

export interface WorkloadRow {
  id: string;
  faculty: Staff;
  workload: FacultyDailyWorkload;
  indicator: WorkloadLevel;
  capacity: number;
  available: number;   /* positive → spare capacity, negative → over capacity */
}

export interface DeptWorkloadSummary {
  totalFaculty: number;
  average: number;
  highest: { hours: number; name: string } | null;
  availableCapacity: number;
  overloadedCount: number;
}

export interface DeptWorkload {
  rows: WorkloadRow[];
  summary: DeptWorkloadSummary;
}

export function computeDeptWorkload(data: AppData, deptId: string, date: Date): DeptWorkload {
  const settings = data.workloadSettings ?? {
    dailyCapacity: 8,
    thresholds: { low: 2, moderate: 4, high: 6 },
    mentoringRule: { enabled: true, scheduleDay: 'Monday', studentsPerBatch: 20, hoursPerBatch: 1 },
  };
  const capacity = settings.dailyCapacity || 8;

  const faculty = data.staff.filter(
    (s) => s.departmentId === deptId && TEACHING_ROLES.includes(s.role as (typeof TEACHING_ROLES)[number])
  );

  const rows: WorkloadRow[] = faculty.map((f) => {
    const workload = computeFacultyDailyWorkload(data, f, date);
    return {
      id: f.id,
      faculty: f,
      workload,
      indicator: workloadIndicator(workload.total, settings),
      capacity,
      available: capacity - workload.total,
    };
  });

  const total = rows.reduce((a, r) => a + r.workload.total, 0);
  const highest = rows.reduce<{ hours: number; name: string } | null>(
    (best, r) => (!best || r.workload.total > best.hours ? { hours: r.workload.total, name: r.faculty.name } : best),
    null
  );
  const availableCapacity = rows.filter((r) => r.available > 0).reduce((a, r) => a + r.available, 0);

  return {
    rows,
    summary: {
      totalFaculty: rows.length,
      average: rows.length ? Math.round((total / rows.length) * 10) / 10 : 0,
      highest,
      availableCapacity,
      overloadedCount: rows.filter((r) => r.indicator === 'overloaded').length,
    },
  };
}

/* ---------- Categorical labels ---------- */

export const WORK_CATEGORY_LABELS: Record<string, string> = {
  examination: 'Examination',
  documentation: 'Documentation',
  accreditation: 'Accreditation',
  coordination: 'Department Coordination',
  event: 'Event Coordination',
  'result-analysis': 'Result Analysis',
  committee: 'Committee Work',
  'student-activities': 'Student Activities',
  other: 'Other',
};

export const TASK_PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-rose-100 text-rose-700',
};