import type { AppData, MentorAllocation, Staff, Student } from '../../data/types';
import { ACADEMIC_YEAR, TEACHING_ROLES } from './subjectAllocationLogic';

/* ============================================================
 * Mentoring domain logic
 * Shared by the HOD "Mentoring Management" workspace and the
 * faculty-side "My Mentees" views. The central mentor–mentee
 * dataset (data.mentorAllocations) is the single source of truth.
 * ============================================================ */

export const MENTOR_CAPACITY = 20;                     /* default mentee capacity per mentor */
export const NEAR_CAPACITY_PCT = 80;                   /* ≥ this % load → Near Capacity */
export const ACTIVE_ACADEMIC_YEAR = ACADEMIC_YEAR;     /* system-controlled, never user-selected */

export type MentorAvailability = 'available' | 'near-capacity' | 'full' | 'unavailable';
export type MentorLoadState = 'balanced' | 'near-capacity' | 'full' | 'overloaded';
export type AllocationMethod = 'balanced' | 'class-wise';

export interface MentorLoad {
  mentor: Staff;
  mentees: Student[];
  count: number;
  capacity: number;
  pct: number;                 /* 0–100+ (may exceed 100 only via manual reassignment) */
  availability: MentorAvailability;   /* used by the auto-allocation mentor pool */
  loadState: MentorLoadState;         /* used by workload monitoring badges */
}

/* ---------- Central allocation queries ---------- */

export function getActiveAllocations(data: AppData): MentorAllocation[] {
  return data.mentorAllocations.filter((a) => a.status === 'active');
}

export function getAllocationForStudent(data: AppData, studentId: string): MentorAllocation | undefined {
  return data.mentorAllocations.find((a) => a.studentId === studentId && a.status === 'active');
}

export function getMenteesOfMentor(data: AppData, mentorId: string): Student[] {
  const ids = new Set(getActiveAllocations(data).filter((a) => a.mentorId === mentorId).map((a) => a.studentId));
  return data.students.filter((s) => ids.has(s.id));
}

/** Active students of the department eligible for mentoring (roll-no order). */
export function getMentoringStudents(data: AppData, deptId: string): Student[] {
  return data.students
    .filter((s) => s.departmentId === deptId && s.status === 'active')
    .sort((a, b) => a.rollNo.localeCompare(b.rollNo));
}

export function getUnallocatedStudents(data: AppData, deptId: string): Student[] {
  const allocated = new Set(getActiveAllocations(data).map((a) => a.studentId));
  return getMentoringStudents(data, deptId).filter((s) => !allocated.has(s.id));
}

/** Semesters that actually have mentoring-eligible students in the department. */
export function getMentoringSemesters(data: AppData, deptId: string): number[] {
  return [...new Set(getMentoringStudents(data, deptId).map((s) => s.semester))].sort((a, b) => a - b);
}

export function getMentoringSections(data: AppData, deptId: string, semester?: number): string[] {
  return [...new Set(
    getMentoringStudents(data, deptId)
      .filter((s) => !semester || s.semester === semester)
      .map((s) => s.section)
  )].sort();
}

/** Class label used across mentoring views, e.g. "CSE-A". */
export const mentoringClassLabel = (deptCodeStr: string, section: string) => `${deptCodeStr}-${section}`;

/* ---------- Mentor workload / capacity ---------- */

export function loadStateFor(count: number, capacity: number): MentorLoadState {
  if (count > capacity) return 'overloaded';
  if (count >= capacity) return 'full';
  if (capacity > 0 && (count / capacity) * 100 >= NEAR_CAPACITY_PCT) return 'near-capacity';
  return 'balanced';
}

export function availabilityFor(count: number, capacity: number, staffActive: boolean): MentorAvailability {
  if (!staffActive) return 'unavailable';
  if (count >= capacity) return 'full';
  if (capacity > 0 && (count / capacity) * 100 >= NEAR_CAPACITY_PCT) return 'near-capacity';
  return 'available';
}

export function getMentorLoad(data: AppData, mentor: Staff, capacity: number = MENTOR_CAPACITY): MentorLoad {
  const mentees = getMenteesOfMentor(data, mentor.id);
  const count = mentees.length;
  const pct = capacity ? Math.round((count / capacity) * 100) : 0;
  return {
    mentor,
    mentees,
    count,
    capacity,
    pct,
    availability: availabilityFor(count, capacity, mentor.status === 'active'),
    loadState: loadStateFor(count, capacity),
  };
}

/** Teaching faculty of the department eligible to be mentors (heaviest load first). */
export function getMentorPool(data: AppData, deptId: string, capacity: number = MENTOR_CAPACITY): MentorLoad[] {
  return data.staff
    .filter((s) => s.departmentId === deptId && TEACHING_ROLES.includes(s.role))
    .map((m) => getMentorLoad(data, m, capacity))
    .sort((a, b) => b.count - a.count || a.mentor.name.localeCompare(b.mentor.name));
}

/* ---------- Auto-allocation engine ---------- */

export interface AllocationPreviewRow {
  mentorId: string;
  mentorName: string;
  current: number;
  toAllocate: number;
  newTotal: number;
  capacity: number;
  exceeds: boolean;
}

export interface AllocationPlan {
  rows: AllocationPreviewRow[];
  assignments: { mentorId: string; studentIds: string[] }[];
  leftover: Student[];
  allocatable: number;
  eligibleMentors: MentorLoad[];
}

/**
 * Computes (without mutating anything) how unallocated students would be
 * distributed across the eligible mentor pool.
 *  - balanced:    each next student goes to the mentor with the most spare
 *                 capacity (ties → fewest current mentees) → even spread.
 *  - class-wise:  contiguous roll-number blocks per mentor, keeping classmates
 *                 together while still respecting mentor capacity.
 * Mentor capacity is never exceeded; students that no longer fit are returned
 * as `leftover` so the HOD sees exactly who remains unallocated.
 */
export function computeAllocationPlan(students: Student[], pool: MentorLoad[], method: AllocationMethod): AllocationPlan {
  const eligible = pool
    .filter((m) => m.availability !== 'unavailable' && m.count < m.capacity)
    .sort((a, b) => a.count - b.count || b.capacity - a.capacity);

  const ordered = [...students].sort((a, b) => a.rollNo.localeCompare(b.rollNo));
  const buckets = new Map<string, Student[]>(eligible.map((m) => [m.mentor.id, []]));

  if (method === 'balanced') {
    const remaining = new Map<string, number>(eligible.map((m) => [m.mentor.id, m.capacity - m.count]));
    const load = new Map<string, number>(eligible.map((m) => [m.mentor.id, m.count]));
    for (const student of ordered) {
      let best: MentorLoad | null = null;
      let bestRemaining = 0;
      for (const m of eligible) {
        const rem = remaining.get(m.mentor.id) ?? 0;
        if (rem <= 0) continue;
        if (!best || rem > bestRemaining || (rem === bestRemaining && (load.get(m.mentor.id) ?? 0) < (load.get(best.mentor.id) ?? 0))) {
          best = m;
          bestRemaining = rem;
        }
      }
      if (!best) break;
      buckets.get(best.mentor.id)!.push(student);
      remaining.set(best.mentor.id, bestRemaining - 1);
      load.set(best.mentor.id, (load.get(best.mentor.id) ?? 0) + 1);
    }
  } else {
    let idx = 0;
    const perMentor = eligible.length ? Math.ceil(ordered.length / eligible.length) : 0;
    for (const m of eligible) {
      let take = Math.min(perMentor, m.capacity - m.count, ordered.length - idx);
      while (take > 0) {
        buckets.get(m.mentor.id)!.push(ordered[idx++]);
        take--;
      }
      if (idx >= ordered.length) break;
    }
  }

  const assignments = eligible
    .map((m) => ({ mentor: m, students: buckets.get(m.mentor.id) ?? [] }))
    .filter((a) => a.students.length > 0);

  const totalAllocatable = assignments.reduce((n, a) => n + a.students.length, 0);

  const rows: AllocationPreviewRow[] = assignments.map((a) => {
    const newTotal = a.mentor.count + a.students.length;
    return {
      mentorId: a.mentor.mentor.id,
      mentorName: a.mentor.mentor.name,
      current: a.mentor.count,
      toAllocate: a.students.length,
      newTotal,
      capacity: a.mentor.capacity,
      exceeds: newTotal > a.mentor.capacity,
    };
  });

  return {
    rows,
    assignments: assignments.map((a) => ({ mentorId: a.mentor.mentor.id, studentIds: a.students.map((s) => s.id) })),
    leftover: ordered.slice(totalAllocatable),
    allocatable: totalAllocatable,
    eligibleMentors: eligible,
  };
}

/* ---------- Small formatting helpers ---------- */

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const uid = (prefix: string) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function formatDate(iso: string | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const initials = (name: string) => name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

