// @ts-nocheck
import { useSyncExternalStore } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Rec = any;
type K = "companies" | "opportunities" | "drives" | "students" | "applications" | "offers" | "outreach" | "mous" | "followups" | "resumeReviews" | "mockInterviews" | "guidance" | "alumni" | "referrals" | "mentorships" | "tasks";
export type DB = Record<K, Rec[]> & { [k: string]: Rec[] };

const S = (n: number) => String(n);

function seed(): DB {
  return seedRaw() as DB;
}
function seedRaw() {
  const companies = [
    { id: "c1", name: "ABC Technologies", industry: "IT Services", location: "Bengaluru", website: "abctech.com", relationship: "Active", contactName: "Rahul Mehta", contactEmail: "rahul@abctech.com", contactPhone: "98450 11223" },
    { id: "c2", name: "Nova Fintech", industry: "Banking & Finance", location: "Mumbai", website: "novafin.in", relationship: "Active", contactName: "Priya Nair", contactEmail: "priya@novafin.in", contactPhone: "98200 44556" },
    { id: "c3", name: "GreenGrid Energy", industry: "Energy", location: "Pune", website: "greengrid.co", relationship: "Prospect", contactName: "Arjun Rao", contactEmail: "arjun@greengrid.co", contactPhone: "99220 77881" },
    { id: "c4", name: "MediCore Labs", industry: "Healthcare", location: "Hyderabad", website: "medicore.com", relationship: "Active", contactName: "Sneha Iyer", contactEmail: "sneha@medicore.com", contactPhone: "90000 33221" },
  ];
  const opportunities = [
    { id: "o1", companyId: "c1", type: "Placement", role: "Software Developer", description: "Full-stack development on enterprise products.", eligibility: "B.Tech CSE/IT, CGPA ≥ 7.0", minCgpa: 7, courses: "B.Tech CSE, B.Tech IT", skills: "JavaScript, React, SQL", vacancies: 10, package: "8.5 LPA", deadline: "2026-10-20", status: "Approved" },
    { id: "o2", companyId: "c2", type: "Placement", role: "Business Analyst", description: "Analytics for retail banking.", eligibility: "Any branch, CGPA ≥ 6.5", minCgpa: 6.5, courses: "B.Tech CSE, B.Tech IT, BBA, B.Com", skills: "Excel, SQL, Communication", vacancies: 6, package: "7 LPA", deadline: "2026-10-28", status: "Submitted" },
    { id: "o3", companyId: "c4", type: "Internship", role: "Research Intern", description: "6-month lab research internship.", eligibility: "B.Sc / B.Tech Biotech", minCgpa: 6, courses: "B.Sc Biotech", skills: "Lab techniques", vacancies: 4, package: "25k/month", deadline: "2026-11-05", status: "Draft" },
    { id: "o4", companyId: "c3", type: "Placement", role: "Graduate Engineer Trainee", description: "Grid operations trainee.", eligibility: "B.Tech EEE/ME, CGPA ≥ 6.5", minCgpa: 6.5, courses: "B.Tech EEE, B.Tech ME", skills: "Power systems", vacancies: 8, package: "6 LPA", deadline: "2026-11-15", status: "Under Review" },
  ];
  const drives = [
    { id: "d1", opportunityId: "o1", companyId: "c1", role: "Software Developer", date: "2026-10-24", venue: "Main Auditorium", minCgpa: 7, courses: "B.Tech CSE, B.Tech IT", vacancies: 10, status: "In Progress" },
    { id: "d2", opportunityId: "o4", companyId: "c3", role: "Graduate Engineer Trainee", date: "2026-11-18", venue: "Seminar Hall B", minCgpa: 6.5, courses: "B.Tech EEE, B.Tech ME", vacancies: 8, status: "Open" },
  ];
  const names = ["Aarav Sharma", "Diya Patel", "Ishaan Kumar", "Meera Reddy", "Kabir Singh", "Ananya Gupta", "Rohan Das", "Saanvi Joshi", "Vihaan Menon", "Tara Pillai", "Aditya Verma", "Nisha Rao"];
  const courses = ["B.Tech CSE", "B.Tech IT", "B.Tech CSE", "B.Tech EEE", "B.Tech ME", "B.Tech CSE", "BBA", "B.Tech IT", "B.Tech EEE", "B.Sc Biotech", "B.Tech CSE", "B.Com"];
  const cg = [8.6, 7.9, 7.2, 7.8, 6.9, 9.1, 7.4, 6.8, 8.2, 7.5, 6.4, 8.0];
  const ready = ["Ready", "In Preparation", "Preparation Required", "Ready", "In Preparation", "Ready", "Preparation Required", "In Preparation", "Ready", "In Preparation", "Preparation Required", "Ready"];
  const resume = ["Approved", "Needs Revision", "Pending", "Approved", "Pending", "Approved", "Pending", "Needs Revision", "Approved", "Pending", "Pending", "Approved"];
  const students = names.map((n, i) => ({ id: "s" + (i + 1), name: n, rollNo: "CS2023" + S(101 + i), course: courses[i], year: "4th Year / Sem 7", cgpa: cg[i], email: n.split(" ")[0].toLowerCase() + "@college.edu", readiness: ready[i], resumeStatus: resume[i] }));
  const st = ["Offer", "Selected", "Interview", "Shortlisted", "Registered", "Not Selected"];
  const d1 = students.filter((s) => s.cgpa >= 7 && ["B.Tech CSE", "B.Tech IT"].includes(s.course));
  const applications = d1.map((s, i) => ({ id: "a" + (i + 1), driveId: "d1", studentId: s.id, stage: st[i % st.length], updated: "2026-10-01" }));
  applications.push({ id: "a20", driveId: "d2", studentId: "s4", stage: "Registered", updated: "2026-10-01" });
  const offers = applications.filter((a) => a.stage === "Offer").map((a, i) => ({ id: "of" + (i + 1), studentId: a.studentId, driveId: a.driveId, companyId: "c1", role: "Software Developer", package: "8.5 LPA", offerDate: "2026-09-28", joiningDate: "2027-07-01", status: "Accepted" }));
  return {
    companies,
    opportunities,
    drives,
    students,
    applications,
    offers,
    outreach: [
      { id: "or1", companyId: "c3", date: "2026-09-20", type: "Meeting", contact: "Arjun Rao", discussion: "Campus hiring for GET roles", followUp: "2026-10-05", status: "Follow-up Due", remarks: "Interested in EEE batch" },
      { id: "or2", companyId: "c2", date: "2026-09-25", type: "Email", contact: "Priya Nair", discussion: "Shared batch profile", followUp: "2026-10-08", status: "Open", remarks: "" },
    ],
    mous: [
      { id: "m1", companyId: "c1", title: "Campus Recruitment & Training MOU", signed: "2025-06-10", expiry: "2028-06-09", status: "Active" },
      { id: "m2", companyId: "c4", title: "Research Internship MOU", signed: "2026-01-15", expiry: "2027-01-14", status: "Active" },
    ],
    followups: [
      { id: "f1", companyId: "c3", date: "2026-10-05", purpose: "Confirm drive schedule", owner: "Industry Relations", status: "Pending" },
      { id: "f2", companyId: "c2", date: "2026-10-08", purpose: "Get JD approval", owner: "Industry Relations", status: "Pending" },
    ],
    resumeReviews: [
      { id: "r1", studentId: "s1", date: "2026-09-18", feedback: "Strong projects section", status: "Approved" },
      { id: "r2", studentId: "s2", date: "2026-09-19", feedback: "Quantify internship impact", status: "Needs Revision" },
    ],
    mockInterviews: [
      { id: "mi1", studentId: "s1", driveId: "d1", datetime: "2026-10-10T10:00", type: "Technical", performance: "Excellent", feedback: "Clear DSA fundamentals", status: "Completed" },
      { id: "mi2", studentId: "s3", driveId: "d1", datetime: "2026-10-12T14:00", type: "HR", performance: "", feedback: "", status: "Scheduled" },
    ],
    guidance: [
      { id: "g1", studentId: "s7", date: "2026-09-22", concerns: "Unsure about analyst vs. sales roles", guidance: "Mapped strengths to analyst track", actions: "Complete SQL basics course", followUp: "2026-10-06" },
    ],
    alumni: [
      { id: "al1", name: "Karthik Subramanian", batch: "2019", course: "B.Tech CSE", organization: "ABC Technologies", designation: "Engineering Manager", location: "Bengaluru", email: "karthik@abctech.com", mentor: "Yes", status: "Active" },
      { id: "al2", name: "Pooja Bhat", batch: "2020", course: "BBA", organization: "Nova Fintech", designation: "Senior Analyst", location: "Mumbai", email: "pooja@novafin.in", mentor: "Yes", status: "Active" },
      { id: "al3", name: "Siddharth Jain", batch: "2017", course: "B.Tech EEE", organization: "GreenGrid Energy", designation: "Plant Head", location: "Pune", email: "sid@greengrid.co", mentor: "No", status: "Inactive" },
    ],
    referrals: [
      { id: "rf1", alumniId: "al1", companyId: "c1", studentId: "s6", date: "2026-09-15", status: "Accepted", remarks: "Referred for SDE drive" },
      { id: "rf2", alumniId: "al2", companyId: "c2", studentId: "s7", date: "2026-09-26", status: "Pending", remarks: "" },
    ],
    mentorships: [
      { id: "mt1", alumniId: "al1", studentId: "s3", date: "2026-09-30", activity: "System design session", notes: "Covered scalability basics", status: "Ongoing" },
    ],
    tasks: [
      { id: "t1", title: "Confirm ABC interview panel", assignee: "Industry Relations", due: "2026-10-15", status: "Open" },
      { id: "t2", title: "Mock HR rounds for d1 shortlist", assignee: "Career Counselor", due: "2026-10-18", status: "In Progress" },
    ],
  };
}

const KEY = "pcs-db-v1";
let state: DB = seed();
const initial = state;
const listeners = new Set<() => void>();
const emit = () => {
  listeners.forEach((l) => l());
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
};

export function hydrateStore() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { state = JSON.parse(raw); listeners.forEach((l) => l()); }
  } catch {}
}
export function resetStore() { state = seed(); emit(); }

export function useDB(): DB {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => state, () => initial);
}
export const getDB = () => state;

export function upsert(col: string, rec: Partial<Rec>) {
  const list = state[col] ?? [];
  if (rec.id && list.some((r) => r.id === rec.id)) {
    state = { ...state, [col]: list.map((r) => (r.id === rec.id ? { ...r, ...rec } : r)) };
  } else {
    const id = col.slice(0, 2) + Date.now().toString(36) + Math.floor(Math.random() * 1000);
    state = { ...state, [col]: [{ ...rec, id } as Rec, ...list] };
    rec = { ...rec, id };
  }
  emit();
  return rec.id as string;
}
export function remove(col: string, id: string) {
  state = { ...state, [col]: (state[col] ?? []).filter((r) => r.id !== id) };
  emit();
}

export const byId = (db: DB, col: string, id?: string) => (db[col] ?? []).find((r) => r.id === id);

export function isEligible(s: Rec, d: Rec) {
  const cs = String(d.courses ?? "").split(",").map((x) => x.trim()).filter(Boolean);
  return Number(s.cgpa) >= Number(d.minCgpa ?? 0) && (cs.length === 0 || cs.includes(s.course));
}
export const eligibleFor = (db: DB, d: Rec) => db.students.filter((s) => isEligible(s, d));
