export const COURSES = ["B.Sc", "B.Com", "B.A", "BCA", "BBA"] as const;
export const YEARS = ["1st Year", "2nd Year", "3rd Year"] as const;

export type Course = (typeof COURSES)[number];
export type Year = (typeof YEARS)[number];

export type Student = {
  id: string;
  name: string;
  email: string;
  course: Course;
  year: Year;
  phone: string;
  attendance: number;
  gpa: number;
  cgpa: number;
  subjects: { name: string; marks: number; max: number }[];
  monthlyAttendance: { month: string; pct: number }[];
  assignments: { title: string; status: "Submitted" | "Pending" | "Late" }[];
  remarks: string;
};

const SUBJECTS_BY_COURSE: Record<Course, string[]> = {
  "B.Sc": ["Mathematics", "Physics", "Chemistry", "Biology", "English"],
  "B.Com": ["Accountancy", "Economics", "Business Law", "Statistics", "English"],
  "B.A": ["History", "Political Science", "Sociology", "Psychology", "English"],
  BCA: ["Programming in C", "Data Structures", "DBMS", "Web Tech", "Mathematics"],
  BBA: ["Management", "Marketing", "Finance", "HR", "Economics"],
};

const FIRST = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Ayaan", "Krishna", "Ishaan", "Rohan", "Ananya", "Diya", "Saanvi", "Aanya", "Pari", "Anika", "Navya", "Kiara", "Myra", "Sara"];
const LAST = ["Sharma", "Verma", "Patel", "Iyer", "Nair", "Reddy", "Khan", "Joshi", "Pillai", "Gupta", "Mehta", "Das", "Bose", "Shah", "Rao"];

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function makeStudent(idx: number, course: Course, year: Year): Student {
  const r = rand(idx * 37 + course.length * 13 + year.length);
  const first = FIRST[Math.floor(r() * FIRST.length)];
  const last = LAST[Math.floor(r() * LAST.length)];
  const name = `${first} ${last}`;
  const id = `${course.replace(/\./g, "").toUpperCase()}-${year[0]}-${String(idx).padStart(3, "0")}`;
  const attendance = Math.round(55 + r() * 45);
  const gpa = +(5 + r() * 5).toFixed(2);
  const subjects = SUBJECTS_BY_COURSE[course].map((n) => ({
    name: n,
    marks: Math.round(40 + r() * 60),
    max: 100,
  }));
  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
  const monthlyAttendance = months.map((m) => ({ month: m, pct: Math.round(60 + r() * 40) }));
  const assignments = [
    { title: "Mid-term Project", status: r() > 0.3 ? "Submitted" : "Pending" },
    { title: "Lab Report 3", status: r() > 0.5 ? "Submitted" : "Late" },
    { title: "Term Paper", status: r() > 0.4 ? "Submitted" : "Pending" },
  ] as Student["assignments"];
  return {
    id,
    name,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@college.edu`,
    course,
    year,
    phone: `+91 9${Math.floor(r() * 900000000 + 100000000)}`,
    attendance,
    gpa,
    cgpa: +(gpa - 0.2 + r() * 0.4).toFixed(2),
    subjects,
    monthlyAttendance,
    assignments,
    remarks:
      attendance < 75
        ? "Attendance below required minimum. Counselling recommended."
        : gpa > 8
        ? "Excellent academic performance. Encourage to mentor peers."
        : "Consistent performer. Maintain current trajectory.",
  };
}

export const STUDENTS: Student[] = (() => {
  const out: Student[] = [];
  let idx = 1;
  COURSES.forEach((c) => {
    YEARS.forEach((y) => {
      const n = 8 + (idx % 4);
      for (let i = 0; i < n; i++) out.push(makeStudent(idx++, c, y));
    });
  });
  return out;
})();

export const ATTENDANCE_TREND = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (13 - i));
  return {
    day: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    pct: Math.round(72 + Math.sin(i / 2) * 8 + (i % 3) * 2),
  };
});

export const PROGRAM_DISTRIBUTION = COURSES.map((c) => ({
  name: c,
  value: STUDENTS.filter((s) => s.course === c).length,
}));

export const AUDIT_LOGS = [
  { ts: "2025-06-17 09:42", user: "admin@college.edu", action: "LOGIN", target: "Dashboard", ip: "10.0.1.21" },
  { ts: "2025-06-17 09:51", user: "r.sharma@college.edu", action: "UPDATE_MARKS", target: "BSC-1-004", ip: "10.0.3.18" },
  { ts: "2025-06-17 10:14", user: "admin@college.edu", action: "ADD_STUDENT", target: "BCA-2-011", ip: "10.0.1.21" },
  { ts: "2025-06-17 10:33", user: "p.joshi@college.edu", action: "EXPORT_REPORT", target: "Attendance-Jun", ip: "10.0.2.07" },
  { ts: "2025-06-17 11:02", user: "k.verma@college.edu", action: "SCHEDULE_EVENT", target: "Internal Test - CS-11", ip: "10.0.4.05" },
  { ts: "2025-06-17 11:25", user: "admin@college.edu", action: "DELETE_RECORD", target: "Old-Term-Plan-2023", ip: "10.0.1.21" },
  { ts: "2025-06-17 11:48", user: "m.khan@college.edu", action: "UPDATE_REMARKS", target: "BA-3-006", ip: "10.0.5.12" },
  { ts: "2025-06-17 12:07", user: "admin@college.edu", action: "ROLE_CHANGE", target: "faculty:s.pillai", ip: "10.0.1.21" },
];

export const REPORTS = [
  { name: "Term Attendance Report", period: "Apr – Jun 2025", generated: "Jun 15, 2025", size: "2.4 MB", format: "PDF" },
  { name: "Internal Assessment Summary", period: "May 2025", generated: "May 30, 2025", size: "1.1 MB", format: "XLSX" },
  { name: "Faculty Workload Analysis", period: "Spring 2025", generated: "Jun 10, 2025", size: "780 KB", format: "PDF" },
  { name: "Course-wise GPA Distribution", period: "Spring 2025", generated: "Jun 12, 2025", size: "1.6 MB", format: "PDF" },
  { name: "At-Risk Students Watchlist", period: "Jun 2025", generated: "Jun 16, 2025", size: "420 KB", format: "XLSX" },
  { name: "Assignment Submission Audit", period: "Apr – Jun 2025", generated: "Jun 14, 2025", size: "990 KB", format: "PDF" },
];

// ============ Academic Management System (AMS) seeds ============

export type Priority = "High" | "Medium" | "Low";
export type TaskStatus = "Pending" | "In Progress" | "Completed" | "Overdue";

export type Task = {
  id: string;
  title: string;
  description: string;
  course: string;
  assignee: string;
  priority: Priority;
  status: TaskStatus;
  deadline: string; // yyyy-mm-dd
};

function iso(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export const SEED_TASKS: Task[] = [
  { id: "t1", title: "Physics Unit Test — Waves", description: "Compile the question bank and print papers for Section A.", course: "B.Sc", assignee: "Dr. R. Sharma", priority: "High", status: "In Progress", deadline: iso(1) },
  { id: "t2", title: "Lab Report Review", description: "Review and grade semester 2 lab reports for DBMS.", course: "BCA", assignee: "Prof. M. Khan", priority: "Medium", status: "Pending", deadline: iso(3) },
  { id: "t3", title: "Parent-Teacher Meeting Prep", description: "Prepare progress slips for flagged students.", course: "B.Com", assignee: "Admin Office", priority: "High", status: "Pending", deadline: iso(-2) },
  { id: "t4", title: "Syllabus Coverage Audit", description: "Verify syllabus completion across all B.A sections.", course: "B.A", assignee: "Dr. A. Iyer", priority: "Low", status: "Pending", deadline: iso(6) },
  { id: "t5", title: "Assignment: Statistics Sheet 4", description: "Distribute and collect statistics assignment sheet 4.", course: "B.Com", assignee: "Prof. S. Pillai", priority: "Medium", status: "In Progress", deadline: iso(2) },
  { id: "t6", title: "C Programming Practical Exam", description: "Schedule labs and invigilators for the practical exam.", course: "BCA", assignee: "Exam Cell", priority: "High", status: "Pending", deadline: iso(5) },
  { id: "t7", title: "Library Stock Verification", description: "Semester-end verification of course reference stock.", course: "BBA", assignee: "Library Desk", priority: "Low", status: "Completed", deadline: iso(-4) },
  { id: "t8", title: "Marketing Case Study Draft", description: "Draft the retail marketing case study for term project.", course: "BBA", assignee: "Prof. K. Verma", priority: "Medium", status: "Pending", deadline: iso(8) },
  { id: "t9", title: "Chemistry Practical Re-test", description: "Arrange re-test for students who missed the practical.", course: "B.Sc", assignee: "Dr. P. Nair", priority: "High", status: "Overdue", deadline: iso(-1) },
  { id: "t10", title: "Fee Defaulter Follow-up List", description: "Share defaulter list with the accounts section.", course: "B.Com", assignee: "Accounts", priority: "Medium", status: "Pending", deadline: iso(4) },
  { id: "t11", title: "English Remedial Classes", description: "Plan remedial timetable for weak students.", course: "B.A", assignee: "Ms. J. Das", priority: "Low", status: "In Progress", deadline: iso(7) },
  { id: "t12", title: "Internal Marks Upload", description: "Upload internal assessment marks to the portal.", course: "B.Sc", assignee: "Exam Cell", priority: "High", status: "Completed", deadline: iso(-6) },
];

export const PERIOD_TIMES: Record<number, string> = {
  1: "09:00 – 09:50", 2: "09:55 – 10:45", 3: "10:50 – 11:40", 4: "11:45 – 12:35",
  5: "13:30 – 14:20", 6: "14:25 – 15:15", 7: "15:20 – 16:10", 8: "16:15 – 17:05",
};

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const SLOT_COLORS = ["sky", "emerald", "amber", "violet", "rose", "cyan", "orange", "lime"];

export type Slot = {
  id: string;
  day: number; // 0 = Mon … 5 = Sat
  period: number; // 1..8
  course: string;
  subject: string;
  instructor: string;
  room: string;
  color: number; // index into SLOT_COLORS
};

const TT_ROWS: [number, number, string, string, string, string][] = [
  // day, period, course, subject, instructor, room
  [0, 1, "B.Sc", "Mathematics", "Dr. R. Sharma", "S-101"],
  [0, 1, "B.Com", "Accountancy", "Prof. S. Pillai", "C-201"],
  [0, 2, "BCA", "Programming in C", "Prof. M. Khan", "L-102"],
  [0, 3, "B.A", "History", "Dr. A. Iyer", "A-301"],
  [0, 4, "BBA", "Management", "Prof. K. Verma", "B-401"],
  [0, 5, "B.Sc", "Physics", "Dr. P. Nair", "S-105"],
  [0, 6, "B.Com", "Economics", "Dr. V. Reddy", "C-204"],
  [1, 1, "B.Sc", "Chemistry", "Dr. P. Nair", "S-108"],
  [1, 2, "BCA", "Data Structures", "Prof. M. Khan", "L-102"],
  [1, 3, "B.Com", "Business Law", "Adv. N. Bose", "C-201"],
  [1, 4, "B.A", "Political Science", "Dr. A. Iyer", "A-305"],
  [1, 5, "BBA", "Marketing", "Prof. K. Verma", "B-402"],
  [1, 6, "B.Sc", "Biology", "Dr. P. Nair", "S-110"],
  [2, 1, "BCA", "DBMS", "Prof. M. Khan", "L-103"],
  [2, 2, "B.Com", "Statistics", "Dr. V. Reddy", "C-206"],
  [2, 3, "B.Sc", "Mathematics", "Dr. R. Sharma", "S-101"],
  [2, 4, "B.A", "Sociology", "Ms. J. Das", "A-302"],
  [2, 5, "BBA", "Finance", "Prof. K. Verma", "B-401"],
  [2, 6, "B.Sc", "Physics Lab", "Dr. P. Nair", "S-Lab 1"],
  [3, 1, "B.Sc", "English", "Ms. J. Das", "S-102"],
  [3, 2, "B.Com", "Accountancy", "Prof. S. Pillai", "C-201"],
  [3, 3, "BCA", "Web Tech", "Prof. M. Khan", "L-104"],
  [3, 4, "B.A", "Psychology", "Ms. J. Das", "A-303"],
  [3, 5, "BBA", "HR", "Prof. K. Verma", "B-403"],
  [3, 6, "B.Com", "Economics", "Dr. V. Reddy", "C-204"],
  [4, 1, "BCA", "Mathematics", "Dr. R. Sharma", "L-101"],
  [4, 2, "B.Sc", "Biology", "Dr. P. Nair", "S-110"],
  [4, 3, "B.A", "English", "Ms. J. Das", "A-301"],
  [4, 4, "B.Com", "Business Law", "Adv. N. Bose", "C-201"],
  [4, 5, "B.Sc", "Chemistry Lab", "Dr. P. Nair", "S-Lab 2"],
  [4, 6, "BBA", "Economics", "Dr. V. Reddy", "B-401"],
  [5, 1, "B.Sc", "Physics", "Dr. R. Sharma", "S-101"],
  [5, 2, "BCA", "Programming in C", "Prof. M. Khan", "L-102"],
  [5, 3, "B.Com", "Statistics", "Dr. V. Reddy", "C-206"],
  [5, 4, "B.A", "History", "Dr. A. Iyer", "A-301"],
  [5, 5, "BBA", "Management", "Prof. K. Verma", "B-401"],
];

export const SEED_SLOTS: Slot[] = TT_ROWS.map(([day, period, course, subject, instructor, room], i) => ({
  id: `s${i + 1}`,
  day, period, course, subject, instructor, room,
  color: SLOT_COLORS.indexOf(["sky", "emerald", "amber", "violet", "rose", "cyan"][i % 6]),
}));

export type AttStatus = "Present" | "Absent" | "Late" | "Excused";
export type AttendanceRecord = { id: string; date: string; course: string; year: string; studentId: string; status: AttStatus };

export function seedAttendance(): AttendanceRecord[] {
  const out: AttendanceRecord[] = [];
  const dates: string[] = [];
  for (let back = 0, got = 0; got < 8 && back < 20; back++) {
    const d = new Date();
    d.setDate(d.getDate() - back);
    if (d.getDay() !== 0) { dates.push(d.toISOString().slice(0, 10)); got++; }
  }
  let n = 0;
  for (const c of COURSES) for (const y of YEARS) {
    const roster = STUDENTS.filter((s) => s.course === c && s.year === y);
    for (const date of dates) for (const st of roster) {
      const base = st.attendance / 100;
      const r = ((n * 9301 + 49297) % 233280) / 233280;
      const status: AttStatus = r < base - 0.08 ? "Present" : r < base ? "Late" : r < base + 0.08 ? "Excused" : "Absent";
      out.push({ id: `ar${++n}`, date, course: c, year: y, studentId: st.id, status });
    }
  }
  return out;
}

export type TestType = "Term Test" | "Midterm" | "Final";
export type GradeEntry = { id: string; studentId: string; course: string; testType: TestType; marks: number; max: number };

export function seedGrades(): GradeEntry[] {
  const out: GradeEntry[] = [];
  let n = 0;
  for (const s of STUDENTS) {
    for (const t of ["Term Test", "Midterm", "Final"] as TestType[]) {
      const drift = t === "Term Test" ? -4 : t === "Midterm" ? 0 : 3;
      out.push({ id: `g${++n}`, studentId: s.id, course: s.course, testType: t, marks: Math.max(12, Math.min(100, Math.round(s.gpa * 10 + drift))), max: 100 });
    }
  }
  return out;
}

export type CareNote = { id: string; studentId: string; author: string; role: string; note: string; action: string; date: string };

export const SEED_CARE_NOTES: CareNote[] = [
  { id: "cn1", studentId: "", author: "Ms. J. Das", role: "Class Mentor", note: "Parents informed about repeated late arrivals.", action: "Guardian contacted", date: iso(-3) },
  { id: "cn2", studentId: "", author: "Dr. A. Iyer", role: "Counsellor", note: "Counselling session scheduled for upcoming internals.", action: "Counselling booked", date: iso(-1) },
];

export type Audience = "All" | "Staff Only" | "Students & Parents";
export type Announcement = { id: string; title: string; body: string; audience: Audience; date: string; author: string };

export const SEED_ANNOUNCEMENTS: Announcement[] = [
  { id: "a1", title: "Mid-semester examinations begin Monday", body: "Mid-semester examinations for all courses start Monday. Admit cards are available at the exam cell. Students must carry their ID cards to every paper.", audience: "All", date: iso(-1), author: "Exam Cell" },
  { id: "a2", title: "Faculty meeting — syllabus review", body: "All teaching staff to attend the syllabus coverage review in Conference Room A at 10:00 AM on Friday.", audience: "Staff Only", date: iso(-2), author: "Dean, Academics" },
  { id: "a3", title: "Parent-teacher meeting on Saturday", body: "The term parent-teacher meeting is scheduled for Saturday, 10 AM – 1 PM in the main auditorium. Progress slips will be shared.", audience: "Students & Parents", date: iso(0), author: "Admin Office" },
  { id: "a4", title: "Library extended hours during exams", body: "The library will remain open until 8 PM during the examination period.", audience: "Students & Parents", date: iso(1), author: "Library Desk" },
];

export type AcademicSettings = {
  academicYear: string;
  term: string;
  threshold: number;
  timezone: string;
  campusAddress: string;
};

export const DEFAULT_SETTINGS: AcademicSettings = {
  academicYear: "2025 – 2026",
  term: "Spring 2025",
  threshold: 75,
  timezone: "Asia/Kolkata (IST)",
  campusAddress: "Rush Knowledge Campus, Ring Road, Bengaluru 560001",
};

export type AuditEntry = { ts: string; user: string; action: string; target: string };

export const SEED_AUDIT: AuditEntry[] = AUDIT_LOGS.map((l) => ({ ts: l.ts, user: l.user, action: l.action, target: l.target }));
