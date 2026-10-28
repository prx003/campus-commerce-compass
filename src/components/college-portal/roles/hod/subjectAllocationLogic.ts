import type {
  AppData,
  Resource,
  ResourceCategory,
  Staff,
  Subject,
  SubjectAllocation,
  SubjectType,
  TimetableEntry,
} from '../../data/types';
import { staffName } from '../../store/StoreContext';

/* ============================================================
 * Subject Allocation domain logic
 * One allocation = Subject + Faculty + Class/Sections + Resources.
 * This module is the "engine" behind the HOD allocation drawer,
 * and is shared by Timetable / Faculty Dashboard integrations.
 * ============================================================ */

export const ACADEMIC_YEAR = '2026–27';
export const MAX_RECOMMENDED_HRS = 20;
export const MAX_ALLOWED_HRS = 24;
export const SEMESTERS = [1, 2, 3, 4, 5, 6];
export const TEACHING_ROLES = ['professor', 'associate-professor', 'assistant-professor', 'lecturer', 'teaching-assistant'];

/* ---------- Labels ---------- */

const ordinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

export const semLabel = (sem: number) => `${ordinal(sem)} Semester`;
export const semShort = (sem: number) => `${ordinal(sem)} Sem`;
export const classLabel = (sem: number, section: string) => `${sem}${section}`;

export const SUBJECT_TYPE_LABELS: Record<SubjectType, string> = {
  theory: 'Theory',
  laboratory: 'Laboratory',
  seminar: 'Seminar',
  special: 'Special',
};

export const RESOURCE_CATEGORY_LABELS: Record<ResourceCategory, string> = {
  classroom: 'Classroom',
  computer: 'Computer',
  projector: 'Projector',
  'smart-board': 'Smart Board',
  furniture: 'Furniture',
  'teaching-equipment': 'Teaching Equipment',
  book: 'Book',
  'other-equipment': 'Lab / Facility',
};

/** Suggested required resource categories by subject type. */
export const DEFAULT_REQUIRED_BY_TYPE: Record<SubjectType, ResourceCategory[]> = {
  theory: ['classroom', 'projector'],
  laboratory: ['other-equipment', 'computer', 'projector'],
  seminar: ['classroom', 'projector', 'other-equipment'],
  special: ['classroom', 'projector'],
};

export const subjectTypeLabel = (t: SubjectType) => SUBJECT_TYPE_LABELS[t] ?? 'Theory';
export const categoryLabel = (c: ResourceCategory) => RESOURCE_CATEGORY_LABELS[c] ?? 'Resource';

/* ---------- Class / Section helpers ---------- */

export interface ClassInfo {
  section: string;
  label: string;
  studentCount: number;
  capacity: number;
  subjectNames: string[];
}

export function getClassSections(data: AppData, deptId: string, semester: number): ClassInfo[] {
  const students = data.students.filter(
    (s) => s.departmentId === deptId && s.semester === semester && s.status === 'active'
  );
  const sections = [...new Set(students.map((s) => s.section))].sort();
  const classRooms = data.resources.filter((r) => r.departmentId === deptId && r.category === 'classroom');
  const defaultCap = Math.max(60, ...classRooms.map((r) => r.capacity ?? 60));
  return sections.map((sec) => {
    const studentCount = students.filter((s) => s.section === sec).length;
    const subjectNames = data.subjectAllocations
      .filter(
        (a) =>
          a.departmentId === deptId &&
          a.semester === semester &&
          a.classIds.includes(sec) &&
          a.status !== 'draft'
      )
      .map((a) => data.subjects.find((s) => s.id === a.subjectId)?.name ?? '—');
    return {
      section: sec,
      label: classLabel(semester, sec),
      studentCount,
      capacity: defaultCap,
      subjectNames,
    };
  });
}

/* ---------- Time helpers (resource lifecycle) ---------- */

function timeInSlot(slot: string, nowMin: number) {
  const [s, e] = slot.split('-');
  const [sh, sm] = s.split(':').map(Number);
  const [eh, em] = e.split(':').map(Number);
  const start = sh * 60 + sm;
  const end = eh * 60 + em;
  return nowMin >= start && nowMin < end;
}

/**
 * Time-aware resource status:
 * Available → Allocated/Reserved (subject allocation) → Reserved (timetable slot today) →
 * In Use (during the scheduled class) → Available (after the class).
 * A subject allocation alone never marks a resource permanently "In Use".
 */
export function resourceEffectiveStatus(data: AppData, res: Resource): string {
  if (res.status === 'under-maintenance' || res.status === 'damaged' || res.status === 'retired') return res.status;

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const day = now.toLocaleString('en', { weekday: 'long' });
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const ttBusy = data.timetable.some(
    (t) => t.published && t.room === res.name && t.day === day && timeInSlot(t.slot, nowMin)
  );
  if (ttBusy) return 'in-use';

  const raBusy = data.resourceAllocations.some((a) => {
    if (a.resourceId !== res.id || a.date !== today) return false;
    return timeInSlot(`${a.fromTime}-${a.toTime}`, nowMin);
  });
  if (raBusy) return 'in-use';

  const inAllocation = data.subjectAllocations.some(
    (a) => a.status !== 'draft' && a.resourceIds.includes(res.id)
  );
  if (inAllocation) return 'allocated';

  return res.status === 'in-use' ? 'available' : res.status;
}

/** Timetable-level reservations for a resource (published timetable only). */
export function resourceTimetableReservations(data: AppData, res: Resource): TimetableEntry[] {
  return data.timetable.filter((t) => t.published && t.room === res.name);
}

/* ---------- Faculty workload ---------- */

export function currentFacultyLoad(data: AppData, facultyId: string, excludeAllocationId?: string) {
  return data.subjectAllocations
    .filter((a) => a.facultyId === facultyId && a.status !== 'draft' && a.id !== excludeAllocationId)
    .reduce((sum, a) => sum + (a.weeklyHours ?? 0), 0);
}

export type WorkloadLevel = 'ok' | 'high' | 'exceeded';

export function workloadLevel(projected: number): WorkloadLevel {
  if (projected > MAX_ALLOWED_HRS) return 'exceeded';
  if (projected > MAX_RECOMMENDED_HRS) return 'high';
  return 'ok';
}

export function facultyWorkload(data: AppData, facultyId: string, subjectHours: number, excludeAllocationId?: string) {
  const current = currentFacultyLoad(data, facultyId, excludeAllocationId);
  const projected = current + subjectHours;
  const level = workloadLevel(projected);
  return { current, subjectHours, projected, level };
}

export function maxClassStrength(data: AppData, deptId: string, semester: number, classIds: string[]) {
  return classIds.length
    ? Math.max(...classIds.map((s) => data.students.filter((x) => x.departmentId === deptId && x.semester === semester && x.section === s && x.status === 'active').length), 0)
    : 0;
}

/* ---------- Resource recommendation ---------- */

export interface ResourceOption {
  resource: Resource;
  score: number;
  level: RecommendationLevel;
  reasons: string[];
  status: string;
  maxClassStrength: number;
  capacityOk: boolean;
}

export function resourceOptions(
  data: AppData,
  subject: Subject,
  classIds: string[],
  requiredTypes: ResourceCategory[]
): ResourceOption[] {
  const strength = maxClassStrength(data, subject.departmentId, subject.semester, classIds);
  return data.resources
    .filter((r) => r.departmentId === subject.departmentId)
    .map((r) => {
      let score = 0;
      const reasons: string[] = [];
      const status = resourceEffectiveStatus(data, r);
      const isLabSubject = subject.type === 'laboratory';
      const typeMatches = requiredTypes.includes(r.category) || (isLabSubject && (r.isLab || r.category === 'computer'));

      if (typeMatches) {
        score += 30;
        reasons.push(categoryLabel(r.category));
      } else {
        reasons.push(`Type does not match (${categoryLabel(r.category)})`);
      }

      const capacityOk = r.capacity ? r.capacity >= strength : true;
      if (capacityOk) {
        score += 25;
        if (r.capacity) reasons.push(`Capacity ${r.capacity} ≥ ${strength} students`);
      } else if (r.capacity) {
        score -= 35;
        reasons.push(`Capacity ${r.capacity} < ${strength} students`);
      }

      if (status === 'available') {
        score += 25;
        reasons.push('Available');
      } else if (status === 'allocated') {
        score += 8;
        reasons.push('Allocated elsewhere (time slot still free)');
      } else if (status === 'in-use') {
        score -= 45;
        reasons.push('In use right now');
      } else {
        score -= 50;
        reasons.push(status.replace(/-/g, ' '));
      }

      if (capacityOk && r.capacity) {
        const utilization = Math.round((strength / r.capacity) * 100);
        if (utilization >= 70 && utilization <= 100) {
          score += 10;
          reasons.push(`Good fit (${utilization}% utilization)`);
        }
      }

      if (r.location) {
        score += 5;
        reasons.push(r.location);
      }

      const clamped = Math.max(0, Math.min(100, score));
      const level: RecommendationLevel = clamped >= 75 ? 'recommended' : clamped >= 40 ? 'eligible' : 'not-recommended';
      return { resource: r, score: clamped, level, reasons, status, maxClassStrength: strength, capacityOk };
    })
    .sort((a, b) => b.score - a.score);
}

/* ---------- Faculty recommendation ---------- */

export type RecommendationLevel = 'recommended' | 'eligible' | 'not-recommended';

export interface FacultyOption {
  faculty: Staff;
  score: number;
  level: RecommendationLevel;
  reasons: string[];
  matchedExpertise: boolean;
  currentLoad: number;
  projectedLoad: number;
}

/**
 * Recommendation factors (spec §9):
 * 1 expertise · 2 previous experience · 3 current workload · 4 max recommended workload ·
 * 5 availability · 6 existing class assignments · 7 timetable compatibility · 8 dept eligibility.
 */
export function facultyOptions(
  data: AppData,
  subject: Subject,
  selectedClassIds: string[],
  excludeAllocationId?: string
): FacultyOption[] {
  const facultyPool = data.staff.filter(
    (f) =>
      TEACHING_ROLES.includes(f.role) &&
      f.departmentId === subject.departmentId
  );

  return facultyPool.map((f) => {
    let score = 0;
    const reasons: string[] = [];
    const matchedExpertise = f.subjects.some(
      (sub) =>
        sub.toLowerCase().includes(subject.name.toLowerCase()) ||
        subject.name.toLowerCase().includes(sub.toLowerCase())
    );

    // 1 & 2. Subject expertise / previous experience with the subject
    if (f.subjects.some((s) => s.toLowerCase() === subject.name.toLowerCase())) {
      score += 35;
      reasons.push('Subject expertise & prior experience');
    } else if (matchedExpertise) {
      score += 20;
      reasons.push('Related subject expertise');
    }

    // 3 & 4. Current workload vs recommended / allowed maximum
    const current = currentFacultyLoad(data, f.id, excludeAllocationId);
    const projected = current + subject.weeklyHrs;
    if (current <= MAX_RECOMMENDED_HRS) {
      score += 15;
      reasons.push(`Within workload limit (${current}/${MAX_RECOMMENDED_HRS} hrs)`);
    } else if (current <= MAX_ALLOWED_HRS) {
      score += 5;
      reasons.push(`Workload is high (${current}/${MAX_RECOMMENDED_HRS} hrs)`);
    } else {
      score -= 25;
      reasons.push(`Workload exceeds allowed limit (${current}/${MAX_ALLOWED_HRS} hrs)`);
    }

    // 5. Availability
    if (f.status === 'active') {
      score += 15;
      reasons.push('Available');
    } else {
      score -= 45;
      reasons.push(`Not available (${f.status})`);
    }

    // 6. Existing class assignments
    const teachesSelected = data.subjectAllocations.some(
      (a) =>
        a.facultyId === f.id &&
        a.status !== 'draft' &&
        a.semester === subject.semester &&
        a.classIds.some((c) => selectedClassIds.includes(c))
    );
    if (teachesSelected) {
      score += 5;
      reasons.push('Already teaches a selected section this semester');
    }

    // 7. Timetable compatibility (published timetable, time-slot independent)
    const facultyTtCount = data.timetable.filter((t) => t.facultyId === f.id && t.published).length;
    if (facultyTtCount > 0) {
      score += 5;
      reasons.push(`${facultyTtCount} published timetable period(s)`);
    }

    // 8. Department eligibility
    if (f.departmentId === subject.departmentId) {
      score += 10;
      reasons.push('Department eligible');
    }

    const clamped = Math.max(0, Math.min(100, score));
    const level: RecommendationLevel = clamped >= 70 ? 'recommended' : clamped >= 40 ? 'eligible' : 'not-recommended';
    if (f.status !== 'active') {
      return { faculty: f, score: clamped, level: 'not-recommended' as const, reasons, matchedExpertise, currentLoad: current, projectedLoad: projected };
    }
    return { faculty: f, score: clamped, level, reasons, matchedExpertise, currentLoad: current, projectedLoad: projected };
  }).sort((a, b) => b.score - a.score);
}

/* ---------- Conflict detection ---------- */

export interface AllocationConflict {
  id: string;
  type: string;
  severity: 'error' | 'warning';
  message: string;
  suggestion: string;
}

export function allocationConflicts(
  data: AppData,
  alloc: Pick<SubjectAllocation, 'id' | 'subjectId' | 'departmentId' | 'semester' | 'classIds' | 'facultyId' | 'resourceIds' | 'weeklyHours' | 'requiredTypes'>
): AllocationConflict[] {
  const result: AllocationConflict[] = [];
  const subject = data.subjects.find((s) => s.id === alloc.subjectId);
  const faculty = data.staff.find((s) => s.id === alloc.facultyId);

  if (subject && (subject.departmentId !== alloc.departmentId || subject.semester !== alloc.semester)) {
    result.push({
      id: `s-${alloc.id}`, type: 'Subject eligibility', severity: 'error',
      message: `${subject.name} does not belong to the selected department or semester.`,
      suggestion: 'Select a subject from the same department and semester.',
    });
  }

  // Faculty availability
  if (alloc.facultyId) {
    if (!faculty) {
      result.push({ id: `f-${alloc.id}`, type: 'Faculty', severity: 'error', message: 'Selected faculty no longer exists.', suggestion: 'Choose another faculty member.' });
    } else {
      if (faculty.departmentId !== alloc.departmentId) {
        result.push({
          id: `fd-${alloc.id}`, type: 'Faculty eligibility', severity: 'error',
          message: `${faculty.name} belongs to another department and cannot teach this allocation.`,
          suggestion: 'Select faculty from the subject department.',
        });
      }
      if (faculty.status !== 'active') {
        result.push({
          id: `f-${alloc.id}`, type: 'Faculty availability', severity: 'error',
          message: `${faculty.name} is currently ${faculty.status} and cannot take new teaching assignments.`,
          suggestion: 'Select an available faculty member or override after consulting the faculty.',
        });
      }
      const wl = facultyWorkload(data, faculty.id, alloc.weeklyHours ?? 0, alloc.id);
      if (wl.projected > MAX_ALLOWED_HRS) {
        result.push({
          id: `w-${alloc.id}`, type: 'Workload', severity: 'error',
          message: `Projected workload ${wl.projected} hrs/week exceeds the allowed ${MAX_ALLOWED_HRS} hrs/week.`,
          suggestion: 'Assign to another faculty member or approve an explicit override.',
        });
      } else if (wl.level === 'high') {
        result.push({
          id: `w-${alloc.id}`, type: 'Workload', severity: 'warning',
          message: `Projected workload ${wl.projected} hrs/week is above the recommended ${MAX_RECOMMENDED_HRS} hrs/week.`,
          suggestion: 'Monitor the faculty load closely.',
        });
      }
    }
  }

  // Class selection
  if (alloc.classIds.length === 0) {
    result.push({ id: `c-${alloc.id}`, type: 'Classes', severity: 'warning', message: 'No class/section selected for this subject.', suggestion: 'Select at least one class/section.' });
  }

  // Duplicate allocation for same subject + overlapping class
  const duplicate = data.subjectAllocations.find(
    (a) => a.id !== alloc.id && a.subjectId === alloc.subjectId && a.status !== 'draft' && a.classIds.some((c) => alloc.classIds.includes(c))
  );
  if (duplicate) {
    result.push({
      id: `d-${alloc.id}`, type: 'Duplicate', severity: 'error',
      message: `${subject?.name ?? 'This subject'} is already allocated for the same class/section.`,
      suggestion: 'Edit the existing allocation instead of creating a new one.',
    });
  }

  // Resources
  alloc.resourceIds.forEach((rid) => {
    const res = data.resources.find((r) => r.id === rid);
    if (!res) return;
    const resId = `r-${alloc.id}-${rid}`;
    const isLabSubject = subject?.type === 'laboratory';
    const typeOk = alloc.requiredTypes.includes(res.category) || (isLabSubject && (res.isLab || res.category === 'computer'));
    if (!typeOk) {
      result.push({
        id: resId, type: 'Resource type', severity: 'warning',
        message: `${res.name} (${categoryLabel(res.category)}) does not match the required resource types for ${subject?.name ?? 'this subject'}.`,
        suggestion: 'Select a resource that matches the subject requirement, or update the requirements.',
      });
    }
    if (res.status === 'under-maintenance' || res.status === 'damaged' || res.status === 'retired') {
      result.push({
        id: resId, type: 'Resource availability', severity: 'error',
        message: `${res.name} is ${res.status.replace(/-/g, ' ')} and cannot be allocated.`,
        suggestion: 'Choose another resource.',
      });
    }
    const strength = maxClassStrength(data, alloc.departmentId, alloc.semester, alloc.classIds);
    if (res.capacity && strength > res.capacity) {
      result.push({
        id: `cap-${alloc.id}-${rid}`, type: 'Capacity', severity: 'error',
        message: `${res.name} can accommodate only ${res.capacity} students, but the selected section(s) contain ${strength} students.`,
        suggestion: 'Choose a larger resource or split the class/section.',
      });
    }
  });

  return result;
}

export function deriveAllocationStatus(
  data: AppData,
  alloc: Pick<SubjectAllocation, 'id' | 'subjectId' | 'departmentId' | 'semester' | 'classIds' | 'facultyId' | 'resourceIds' | 'weeklyHours' | 'requiredTypes'>
): 'pending' | 'partially-allocated' | 'allocated' | 'conflict' {
  const conflicts = allocationConflicts(data, alloc);
  if (conflicts.some((c) => c.severity === 'error')) return 'conflict';
  const hasFaculty = !!alloc.facultyId;
  const hasClasses = alloc.classIds.length > 0;
  const hasResources = alloc.resourceIds.length > 0;
  if (hasFaculty && hasClasses && hasResources) return 'allocated';
  if (hasFaculty || hasClasses || hasResources) return 'partially-allocated';
  return 'pending';
}

/* ---------- Timetable impact (published timetable) ---------- */

export function affectedPublishedEntries(
  data: AppData,
  alloc: SubjectAllocation,
  opts?: { oldFacultyId?: string | null; oldResourceIds?: string[] }
): TimetableEntry[] {
  const subject = data.subjects.find((s) => s.id === alloc.subjectId);
  return data.timetable.filter((t) => {
    if (!t.published || t.departmentId !== alloc.departmentId || t.semester !== alloc.semester) return false;
    if (!alloc.classIds.includes(t.section)) return false;
    if (subject && t.subject !== subject.name) return false;
    if (opts?.oldFacultyId && t.facultyId === opts.oldFacultyId) return true;
    if (opts?.oldResourceIds) {
      const oldNames = opts.oldResourceIds.map((id) => data.resources.find((r) => r.id === id)?.name ?? '');
      if (oldNames.includes(t.room)) return true;
    }
    return false;
  });
}

/* ---------- Render helpers ---------- */

export function resourceShortLabel(data: AppData, resourceIds: string[]) {
  const names = resourceIds
    .map((id) => data.resources.find((r) => r.id === id)?.name ?? '—')
    .filter(Boolean);
  if (names.length === 0) return '—';
  if (names.length <= 2) return names.join(' + ');
  return `${names.slice(0, 2).join(' + ')} +${names.length - 2}`;
}

export function allocationFacultyName(data: AppData, alloc: SubjectAllocation | null) {
  if (!alloc?.facultyId) return '—';
  return staffName(data, alloc.facultyId);
}

export const WORKLOAD_BADGES: Record<WorkloadLevel, { label: string; cls: string }> = {
  ok: { label: 'Workload OK', cls: 'bg-emerald-100 text-emerald-700' },
  high: { label: 'High Workload', cls: 'bg-amber-100 text-amber-700' },
  exceeded: { label: 'Workload Limit Exceeded', cls: 'bg-rose-100 text-rose-700' },
};