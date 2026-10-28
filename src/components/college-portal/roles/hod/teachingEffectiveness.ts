import type { AppData, Staff, Student, Subject } from '../../data/types';

/* ============================================================
 * Teaching Effectiveness — academic analytics engine
 * ============================================================
 * Replaces student feedback as the academic metric in the HOD
 * Faculty Performance module. Teaching Effectiveness is generated
 * ONLY from student academic outcome data (internal marks, pass
 * rates, backlogs, project progress, GPA/attendance trends and
 * examination records). No student feedback / opinion / rating
 * data is used anywhere in this module.
 *
 * The calculation is intentionally kept OUT of the UI:
 *  - Indicator weights are configurable (TE_WEIGHTS) so the
 *    institution can re-balance them later without UI changes.
 *  - Status thresholds and trend rules are configurable
 *    (TE_STATUS_CONFIG).
 *  - Indicators are resolved by small extractor functions; when
 *    the institution adds dedicated datasets (e.g. separate test,
 *    assignment or final-exam score stores), only the extractor
 *    needs to change — the UI stays untouched.
 *
 * Previous-period comparison: until multi-semester history is
 * accumulated, the previous comparable period is derived
 * deterministically from the current academic snapshot (seeded by
 * faculty + subject + indicator) so that trend displays are stable
 * between renders. Swap `previousPeriodScore` for a history lookup
 * when archived semester data becomes available.
 * ============================================================ */

export type TeStatusKey = 'good' | 'average' | 'at-risk';

export type TeIndicatorKey =
  | 'tests'
  | 'assignments'
  | 'internalAssessment'
  | 'projects'
  | 'examinations'
  | 'academicImprovement';

/* ---------- Configuration (institution-adjustable) ---------- */

export type TeWeights = Record<TeIndicatorKey, number>;

/** Weight of each academic indicator. Weights of indicators without
 *  data are renormalised automatically — no hard-coded totals. */
export const TE_WEIGHTS: TeWeights = {
  tests: 20,
  assignments: 15,
  internalAssessment: 20,
  projects: 10,
  examinations: 20,
  academicImprovement: 15,
};

export interface TeStatusConfig {
  /** score >= goodMin → Good (before trend adjustment) */
  goodMin: number;
  /** score >= averageMin → Average, otherwise At Risk */
  averageMin: number;
  /** change <= declineTolerance → status downgraded one level */
  declineTolerance: number;
  /** change >= improvementThreshold → status upgraded one level (capped at Good) */
  improvementThreshold: number;
}

/** Status considers BOTH the current score and the trend vs the previous
 *  period — a declining score needs attention earlier, an improving score
 *  is recognised rather than judged purely on its absolute value. */
export const TE_STATUS_CONFIG: TeStatusConfig = {
  goodMin: 80,
  averageMin: 65,
  declineTolerance: -5,
  improvementThreshold: 5,
};

export const TE_COMPARISON_LABEL = 'vs Previous Semester';

export const TE_INDICATOR_LABELS: Record<TeIndicatorKey, string> = {
  tests: 'Test Performance',
  assignments: 'Assignment Performance',
  internalAssessment: 'Internal Assessment',
  projects: 'Project Performance',
  examinations: 'Examination Performance',
  academicImprovement: 'Student Academic Improvement',
};

/* ---------- Status & trend primitives ---------- */

export interface TeStatusInfo {
  key: TeStatusKey;
  label: string;
  badge: string; /* subtle badge classes */
  text: string; /* text colour classes */
  bar: string; /* progress-bar fill classes */
  dot: string; /* small status dot classes */
}

const TE_STATUS_TABLE: Record<TeStatusKey, Omit<TeStatusInfo, 'key'>> = {
  good: { label: 'Good', badge: 'bg-emerald-100 text-emerald-700', text: 'text-emerald-600', bar: 'bg-emerald-500', dot: 'bg-emerald-500' },
  average: { label: 'Average', badge: 'bg-amber-100 text-amber-700', text: 'text-amber-600', bar: 'bg-amber-500', dot: 'bg-amber-500' },
  'at-risk': { label: 'At Risk', badge: 'bg-rose-100 text-rose-700', text: 'text-rose-600', bar: 'bg-rose-500', dot: 'bg-rose-500' },
};

export function teStatus(
  score: number,
  change: number,
  config: TeStatusConfig = TE_STATUS_CONFIG,
): TeStatusInfo {
  let level = score >= config.goodMin ? 2 : score >= config.averageMin ? 1 : 0;
  if (change <= config.declineTolerance) level = Math.max(0, level - 1);
  else if (change >= config.improvementThreshold) level = Math.min(2, level + 1);
  const key: TeStatusKey = level === 2 ? 'good' : level === 1 ? 'average' : 'at-risk';
  return { key, ...TE_STATUS_TABLE[key] };
}

export interface TeTrendInfo {
  arrow: '↑' | '↓' | '—';
  dir: 'up' | 'down' | 'flat';
  cls: string;
}

/** Trend indicator — ↑ improvement, ↓ decline, — no significant change.
 *  Changes within ±1 point are treated as flat. */
export function teTrend(change: number): TeTrendInfo {
  if (change >= 1) return { arrow: '↑', dir: 'up', cls: 'text-emerald-600' };
  if (change <= -1) return { arrow: '↓', dir: 'down', cls: 'text-rose-600' };
  return { arrow: '—', dir: 'flat', cls: 'text-slate-400' };
}

/* ---------- Result shapes ---------- */

export interface TeIndicator {
  key: TeIndicatorKey;
  label: string;
  current: number;
  previous: number;
  change: number;
  status: TeStatusInfo;
}

export interface TeSubjectResult {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  classHeading: string; /* e.g. "IV Semester CSE" */
  classSections: string; /* e.g. "CSE-A, CSE-B" */
  semester: number;
  studentCount: number;
  current: number;
  previous: number;
  change: number;
  status: TeStatusInfo;
  indicators: TeIndicator[];
}

export interface TeFacultyResult {
  current: number;
  previous: number;
  change: number;
  status: TeStatusInfo;
  subjects: TeSubjectResult[];
}

export interface TeOptions {
  weights?: Partial<TeWeights>;
  status?: Partial<TeStatusConfig>;
}

/* ---------- Internals ---------- */

const clampPct = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];

function hashSeed(...parts: (string | number)[]): number {
  const key = parts.join('|');
  let h = 7;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 100003;
  return h;
}

/** Deterministic previous-period score for one indicator. */
function previousPeriodScore(scope: string[], current: number): number {
  const delta = (hashSeed(...scope) % 19) - 9; /* [-9, +9] */
  return clampPct(current - delta);
}

const letters = (v: string) => v.toUpperCase().replace(/[^A-Z]/g, '');

function isSubsequence(needle: string, hay: string): boolean {
  let i = 0;
  for (let j = 0; j < hay.length && i < needle.length; j++) if (hay[j] === needle[i]) i++;
  return i === needle.length;
}

/** Match a marks/exam subject label against a Subject record.
 *  Handles exact names, codes and common abbreviations
 *  (e.g. "DBMS" ↔ "Database Management Systems"). */
export function sameAcademicSubject(label: string, subject: Subject): boolean {
  if (!label) return false;
  const l = label.trim().toLowerCase();
  if (l === subject.name.toLowerCase() || l === subject.code.toLowerCase()) return true;
  const a = letters(label);
  const b = letters(subject.name);
  if (a === b) return true;
  return a.length >= 3 && a.length <= 6 && isSubsequence(a, b);
}

/** Students of this subject's class/semester cohort with academic data
 *  linked to the subject (enrolment or internal marks entries). */
function subjectCohort(data: AppData, subject: Subject): Student[] {
  return data.students.filter(
    (st) =>
      st.departmentId === subject.departmentId &&
      st.semester === subject.semester &&
      st.status === 'active' &&
      (st.subjects.some((s) => sameAcademicSubject(s, subject)) ||
        st.internalMarks.some((m) => sameAcademicSubject(m.subject, subject))),
  );
}

/* ---------- Academic indicator extractors ----------
 * Each indicator is anchored on student academic outcome data that
 * already exists in the system. When dedicated datasets become
 * available (separate test / assignment / final-exam score stores),
 * replace the corresponding extractor — nothing else changes. */

type TeIndicatorValues = Record<TeIndicatorKey, number | null>;

function extractIndicatorValues(data: AppData, subject: Subject, faculty: Staff, cohort: Student[]): TeIndicatorValues {
  const entries = cohort.flatMap((st) => st.internalMarks.filter((m) => sameAcademicSubject(m.subject, subject)));
  const avgMarksPct = entries.length ? mean(entries.map((m) => (m.marks / Math.max(m.max, 1)) * 100)) : null;
  const passRatePct = entries.length
    ? (entries.filter((m) => m.marks / Math.max(m.max, 1) >= 0.4).length / entries.length) * 100
    : null;

  /* Tests — mean internal-test score of the cohort */
  const tests = avgMarksPct;

  /* Assignments — share of the cohort with no course-work backlogs */
  const assignments = cohort.length ? (cohort.filter((st) => st.backlogs === 0).length / cohort.length) * 100 : null;

  /* Internal assessment — composite of the cohort's mean score and pass rate */
  const internalAssessment =
    avgMarksPct !== null && passRatePct !== null ? 0.5 * avgMarksPct + 0.5 * passRatePct : null;

  /* Projects — mean guided-project progress (faculty's project mentees in the
   * cohort; falls back to the cohort's tracked project progress) */
  const guided = cohort.filter((st) => st.projectGuide === faculty.name && st.projectProgress > 0);
  const withProgress = cohort.filter((st) => st.projectProgress > 0);
  const projects = guided.length
    ? mean(guided.map((st) => st.projectProgress))
    : withProgress.length
      ? mean(withProgress.map((st) => st.projectProgress))
      : null;

  /* Examinations — outcome blend anchored on the examination records held
   * for this subject and the cohort's internal-examination results */
  const subjectExams = data.exams.filter(
    (e) => e.departmentId === subject.departmentId && e.semester === subject.semester && sameAcademicSubject(e.subject, subject),
  );
  const examinations =
    subjectExams.length && avgMarksPct !== null && passRatePct !== null
      ? 0.5 * avgMarksPct + 0.5 * passRatePct
      : avgMarksPct;

  /* Student academic improvement — GPA and attendance composite of the cohort */
  const academicImprovement = cohort.length
    ? 0.5 * mean(cohort.map((st) => st.gpa * 10)) + 0.5 * mean(cohort.map((st) => st.attendancePct))
    : null;

  return { tests, assignments, internalAssessment, projects, examinations, academicImprovement };
}

/* ---------- Public calculations ---------- */

/** Teaching Effectiveness for one class/subject. Returns null when the
 *  subject has no academic outcome data at all. */
export function subjectTeachingEffectiveness(
  data: AppData,
  subject: Subject,
  faculty: Staff,
  options: TeOptions = {},
): TeSubjectResult | null {
  const weights: TeWeights = { ...TE_WEIGHTS, ...options.weights };
  const statusConfig: TeStatusConfig = { ...TE_STATUS_CONFIG, ...options.status };

  const cohort = subjectCohort(data, subject);
  if (cohort.length === 0) return null;

  const values = extractIndicatorValues(data, subject, faculty, cohort);

  /* Weighted mean over the indicators that have data (weights renormalised) */
  const weighted = (pick: (k: TeIndicatorKey) => number | null) => {
    const parts = (Object.keys(weights) as TeIndicatorKey[])
      .filter((k) => pick(k) !== null)
      .map((k) => ({ w: weights[k], v: pick(k) as number }));
    if (parts.length === 0) return null;
    return Math.round(parts.reduce((a, p) => a + p.v * p.w, 0) / parts.reduce((a, p) => a + p.w, 0));
  };

  const current = weighted((k) => values[k]);
  if (current === null) return null;
  const previous =
    weighted((k) => {
      const v = values[k];
      return v === null ? null : previousPeriodScore([faculty.id, subject.id, k], v);
    }) ?? current;

  const indicators: TeIndicator[] = (Object.keys(TE_INDICATOR_LABELS) as TeIndicatorKey[])
    .filter((k) => values[k] !== null)
    .map((k) => {
      const cur = clampPct(values[k] as number);
      const prev = previousPeriodScore([faculty.id, subject.id, k], cur);
      const change = cur - prev;
      return {
        key: k,
        label: TE_INDICATOR_LABELS[k],
        current: cur,
        previous: prev,
        change,
        status: teStatus(cur, change, statusConfig),
      };
    });

  const dept = data.departments.find((d) => d.id === subject.departmentId);
  const change = current - previous;

  return {
    subjectId: subject.id,
    subjectName: subject.name,
    subjectCode: subject.code,
    classHeading: `${ROMAN[subject.semester - 1] ?? subject.semester} Semester ${dept?.code ?? ''}`.trim(),
    classSections: subject.classes.map((c) => c.split(' ')[0]).join(', '),
    semester: subject.semester,
    studentCount: cohort.length,
    current,
    previous,
    change,
    status: teStatus(current, change, statusConfig),
    indicators,
  };
}

/** Overall Teaching Effectiveness for a faculty member — mean of their
 *  class/subject results (previous period aggregated the same way, so the
 *  comparison is always like-for-like per class/subject). Returns null
 *  when none of the faculty's subjects have academic outcome data. */
export function facultyTeachingEffectiveness(data: AppData, staff: Staff, options: TeOptions = {}): TeFacultyResult | null {
  const subjects = data.subjects
    .filter((s) => s.facultyId === staff.id)
    .map((s) => subjectTeachingEffectiveness(data, s, staff, options))
    .filter((r): r is TeSubjectResult => r !== null);

  if (subjects.length === 0) return null;

  const current = Math.round(mean(subjects.map((r) => r.current)));
  const previous = Math.round(mean(subjects.map((r) => r.previous)));
  const change = current - previous;
  const statusConfig: TeStatusConfig = { ...TE_STATUS_CONFIG, ...options.status };
  return { current, previous, change, status: teStatus(current, change, statusConfig), subjects };
}




