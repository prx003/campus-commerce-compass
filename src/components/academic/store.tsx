import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useCloudState } from "@/lib/cloud-state";
import {
  STUDENTS, SEED_TASKS, SEED_SLOTS, SEED_CARE_NOTES, SEED_ANNOUNCEMENTS,
  DEFAULT_SETTINGS, SEED_AUDIT, seedAttendance, seedGrades,
  type Student, type Task, type Slot, type AttendanceRecord, type GradeEntry,
  type CareNote, type Announcement, type AcademicSettings, type AuditEntry,
} from "./data";

export type Persona = "super_admin" | "administrator" | "teacher" | "student" | "parent";

export const PERSONAS: { id: Persona; label: string; blurb: string }[] = [
  { id: "super_admin", label: "Super Admin", blurb: "Full access — system settings, audit logs, all reports" },
  { id: "administrator", label: "Administrator", blurb: "Enrollment, tasks, scheduling, attendance overrides" },
  { id: "teacher", label: "Teacher", blurb: "Attendance, grades, tasks, timetable, care notes" },
  { id: "student", label: "Student", blurb: "Personal dashboard, tasks, timetable, grades" },
  { id: "parent", label: "Parent", blurb: "Child progress, attendance alerts, report cards" },
];

const PERSONA_PAGES: Record<Persona, string[] | "all"> = {
  super_admin: "all",
  administrator: ["/academic", "/academic/students", "/academic/task", "/academic/timetable", "/academic/attendance", "/academic/gradebook", "/academic/care", "/academic/announcements", "/academic/reports"],
  teacher: ["/academic", "/academic/students", "/academic/task", "/academic/timetable", "/academic/attendance", "/academic/gradebook", "/academic/care", "/academic/announcements"],
  student: ["/academic", "/academic/task", "/academic/timetable", "/academic/gradebook", "/academic/announcements"],
  parent: ["/academic", "/academic/task", "/academic/timetable", "/academic/gradebook", "/academic/care", "/academic/announcements"],
};

export function personaCan(p: Persona, path: string) {
  const pages = PERSONA_PAGES[p];
  if (pages === "all") return true;
  return pages.includes(path);
}

function personaEmail(p: Persona) {
  const map: Record<Persona, string> = {
    super_admin: "admin@college.edu",
    administrator: "administrator@college.edu",
    teacher: "r.sharma@college.edu",
    student: "student@college.edu",
    parent: "parent@college.edu",
  };
  return map[p];
}

type AcademicContextValue = {
  students: Student[]; setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  tasks: Task[]; setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  slots: Slot[]; setSlots: React.Dispatch<React.SetStateAction<Slot[]>>;
  attendance: AttendanceRecord[]; setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  grades: GradeEntry[]; setGrades: React.Dispatch<React.SetStateAction<GradeEntry[]>>;
  careNotes: CareNote[]; setCareNotes: React.Dispatch<React.SetStateAction<CareNote[]>>;
  announcements: Announcement[]; setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  settings: AcademicSettings; setSettings: React.Dispatch<React.SetStateAction<AcademicSettings>>;
  audit: AuditEntry[]; setAudit: React.Dispatch<React.SetStateAction<AuditEntry[]>>;
  persona: Persona;
  setPersona: (p: Persona) => void;
  logAudit: (action: string, target: string) => void;
  resetDemo: () => void;
};

const AcademicContext = createContext<AcademicContextValue | null>(null);

export function AcademicProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useCloudState<Student[]>("academic.students", STUDENTS);
  const [tasks, setTasks] = useCloudState<Task[]>("academic.tasks", SEED_TASKS);
  const [slots, setSlots] = useCloudState<Slot[]>("academic.slots", SEED_SLOTS);
  const [attendance, setAttendance] = useCloudState<AttendanceRecord[]>("academic.attendance", seedAttendance());
  const [grades, setGrades] = useCloudState<GradeEntry[]>("academic.grades", seedGrades());
  const [careNotes, setCareNotes] = useCloudState<CareNote[]>("academic.careNotes", SEED_CARE_NOTES);
  const [announcements, setAnnouncements] = useCloudState<Announcement[]>("academic.announcements", SEED_ANNOUNCEMENTS);
  const [settings, setSettings] = useCloudState<AcademicSettings>("academic.settings", DEFAULT_SETTINGS);
  const [audit, setAudit] = useCloudState<AuditEntry[]>("academic.audit", SEED_AUDIT);
  const [persona, setPersonaState] = useState<Persona>(() => {
    if (typeof window === "undefined") return "super_admin";
    return (localStorage.getItem("academia_persona") as Persona) || "super_admin";
  });

  const setPersona = useCallback((p: Persona) => {
    setPersonaState(p);
    localStorage.setItem("academia_persona", p);
  }, []);

  const personaLabel = PERSONAS.find((p) => p.id === persona)?.label ?? persona;

  const logAudit = useCallback(
    (action: string, target: string) => {
      setAudit((prev) =>
        [{ ts: new Date().toISOString().replace("T", " ").slice(0, 16), user: personaEmail(persona), action, target }, ...prev].slice(0, 400),
      );
    },
    [persona, setAudit],
  );

  const resetDemo = useCallback(() => {
    setStudents(STUDENTS);
    setTasks(SEED_TASKS);
    setSlots(SEED_SLOTS);
    setAttendance(seedAttendance());
    setGrades(seedGrades());
    setCareNotes(SEED_CARE_NOTES);
    setAnnouncements(SEED_ANNOUNCEMENTS);
    setSettings(DEFAULT_SETTINGS);
    setAudit((prev) =>
      [{ ts: new Date().toISOString().replace("T", " ").slice(0, 16), user: "system", action: "RESET_DEMO_DATA", target: "All academic modules" }, ...prev].slice(0, 400),
    );
    toast.success("Demo data reset", { description: "All academic modules restored to their original seed data." });
  }, [setStudents, setTasks, setSlots, setAttendance, setGrades, setCareNotes, setAnnouncements, setSettings, setAudit]);

  const value = useMemo<AcademicContextValue>(
    () => ({
      students, setStudents, tasks, setTasks, slots, setSlots, attendance, setAttendance,
      grades, setGrades, careNotes, setCareNotes, announcements, setAnnouncements,
      settings, setSettings, audit, setAudit, persona, setPersona, logAudit, resetDemo,
    }),
    [students, setStudents, tasks, setTasks, slots, setSlots, attendance, setAttendance,
      grades, setGrades, careNotes, setCareNotes, announcements, setAnnouncements,
      settings, setSettings, audit, setAudit, persona, setPersona, logAudit, resetDemo],
  );

  return <AcademicContext.Provider value={value}>{children}</AcademicContext.Provider>;
}

export function useAcademic() {
  const ctx = useContext(AcademicContext);
  if (!ctx) throw new Error("useAcademic must be used inside <AcademicProvider>");
  return ctx;
}

/** Sticky page header shared by all academic pages. */
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Small select styled consistently with the module. */
export function MiniSelect({
  value, onChange, options, ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  ariaLabel: string;
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-md border border-border bg-background px-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export const PRIORITY_TONE: Record<string, string> = {
  High: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  Low: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
};

export const STATUS_TONE: Record<string, string> = {
  Pending: "bg-secondary text-secondary-foreground",
  "In Progress": "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  Completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  Overdue: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
};
