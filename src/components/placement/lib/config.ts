import type { DB, Rec } from "./store";
import { byId } from "./store";

export type RoleId = "officer" | "industry" | "counselor" | "alumni";
export const ROLES: Record<RoleId, { label: string; person: string; nav: string[] }> = {
  officer: { label: "Placement Officer / Director", person: "Dr. Meenakshi Rao", nav: ["opportunities", "drives", "students", "recruitment", "offers", "preparation", "alumni-support"] },
  industry: { label: "Industry Relations Executive", person: "Vikram Shetty", nav: ["companies", "mous", "internship-opps", "followups"] },
  counselor: { label: "Career Counselor", person: "Ms. Lakshmi Prasad", nav: ["students", "resumes", "mocks", "guidance", "preparation", "readiness"] },
  alumni: { label: "Alumni Relations Coordinator", person: "Mr. Faisal Khan", nav: ["alumni-directory", "alumni-support"] },
};
export const isRole = (r: string): r is RoleId => r in ROLES;

export type Field = { key: string; label: string; type?: "text" | "number" | "date" | "datetime-local" | "textarea" | "select"; options?: string[]; ref?: string; required?: boolean };
export type Column = { label: string; get: (r: Rec, db: DB) => any; status?: boolean };

export const STATUS = {
  opportunity: ["Draft", "Submitted", "Under Review", "Approved", "Closed"],
  drive: ["Draft", "Open", "Registration Closed", "In Progress", "Completed", "Cancelled"],
  stage: ["Registered", "Shortlisted", "Interview", "Selected", "Not Selected", "Offer"],
  offer: ["Offer Received", "Accepted", "Declined", "Joining Pending", "Joined"],
  prep: ["Preparation Required", "In Preparation", "Ready"],
};

const name = (col: string, key: string) => (r: Rec, db: DB) => byId(db, col, r[key])?.name ?? "—";
const company = name("companies", "companyId");
const student = name("students", "studentId");

export type Section = {
  title: string;
  icon: string;
  collection: string;
  desc: string;
  filter?: (r: Rec) => boolean;
  defaults?: Rec | Record<string, any>;
  fields: Field[];
  columns: Column[];
  editors: RoleId[];
  detail?: "company" | "drive" | "student" | "generic";
  linkCollection?: string;
  linkKey?: string;
  custom?: string;
};

const oppFields: Field[] = [
  { key: "companyId", label: "Company", type: "select", ref: "companies", required: true },
  { key: "role", label: "Job role", required: true },
  { key: "description", label: "Job description", type: "textarea" },
  { key: "eligibility", label: "Eligibility (summary)" },
  { key: "minCgpa", label: "Minimum CGPA", type: "number" },
  { key: "courses", label: "Eligible courses (comma separated)" },
  { key: "skills", label: "Required skills" },
  { key: "vacancies", label: "Vacancies", type: "number" },
  { key: "package", label: "Salary / package" },
  { key: "deadline", label: "Application deadline", type: "date" },
  { key: "status", label: "Status", type: "select", options: ["Draft", "Submitted", "Closed"] },
];
const oppCols: Column[] = [
  { label: "Company", get: company },
  { label: "Role", get: (r) => r.role },
  { label: "Vacancies", get: (r) => r.vacancies },
  { label: "Package", get: (r) => r.package },
  { label: "Deadline", get: (r) => r.deadline },
  { label: "Status", get: (r) => r.status, status: true },
];
const studentCols: Column[] = [
  { label: "Student", get: (r) => r.name },
  { label: "ID", get: (r) => r.rollNo },
  { label: "Course", get: (r) => r.course },
  { label: "Year / Sem", get: (r) => r.year },
  { label: "CGPA", get: (r) => r.cgpa },
  { label: "Drives", get: (r, db) => db.applications.filter((a) => a.studentId === r.id).map((a) => byId(db, "companies", byId(db, "drives", a.driveId)?.companyId)?.name).join(", ") || "—" },
  { label: "Resume", get: (r) => r.resumeStatus, status: true },
  { label: "Readiness", get: (r) => r.readiness, status: true },
];
const studentFields: Field[] = [
  { key: "name", label: "Student name", required: true },
  { key: "rollNo", label: "Student ID", required: true },
  { key: "course", label: "Course / program", type: "select", options: ["B.Tech CSE", "B.Tech IT", "B.Tech EEE", "B.Tech ME", "B.Sc Biotech", "BBA", "B.Com"] },
  { key: "year", label: "Year / semester" },
  { key: "cgpa", label: "CGPA", type: "number" },
  { key: "email", label: "Email" },
  { key: "resumeStatus", label: "Resume status", type: "select", options: ["Pending", "Needs Revision", "Approved"] },
  { key: "readiness", label: "Preparation status", type: "select", options: STATUS.prep },
];

export const SECTIONS: { [k: string]: Section } & Record<"companies" | "opportunities" | "drives" | "outreach" | "referrals" | "mentorship" | "preparation" | "students", Section> = {
  companies: {
    title: "Companies", icon: "Building2", collection: "companies", desc: "Recruiting partners, contacts and relationship status.", editors: ["industry"], detail: "company",
    fields: [
      { key: "name", label: "Company name", required: true },
      { key: "industry", label: "Industry" },
      { key: "location", label: "Location" },
      { key: "website", label: "Website" },
      { key: "contactName", label: "Contact person" },
      { key: "contactEmail", label: "Contact email" },
      { key: "contactPhone", label: "Contact phone" },
      { key: "relationship", label: "Relationship status", type: "select", options: ["Prospect", "Active", "Dormant"] },
    ],
    columns: [
      { label: "Company", get: (r) => r.name },
      { label: "Industry", get: (r) => r.industry },
      { label: "Location", get: (r) => r.location },
      { label: "Contact", get: (r) => r.contactName },
      { label: "Opportunities", get: (r, db) => db.opportunities.filter((o) => o.companyId === r.id).length },
      { label: "Relationship", get: (r) => r.relationship, status: true },
    ],
  },
  opportunities: {
    title: "Companies & Opportunities", icon: "Briefcase", collection: "opportunities", desc: "Review opportunities submitted by Industry Relations and convert them into drives.", editors: [], custom: "review", detail: "generic",
    filter: (r) => r.status !== "Draft", fields: oppFields,
    columns: [{ label: "Type", get: (r) => r.type }, ...oppCols],
  },
  "placement-opps": { title: "Placement Opportunities", icon: "Briefcase", collection: "opportunities", desc: "Create job opportunities and submit them to the Placement Officer.", editors: ["industry"], custom: "submit", detail: "generic", filter: (r) => r.type === "Placement", defaults: { type: "Placement", status: "Draft" }, fields: oppFields, columns: oppCols },
  "internship-opps": { title: "Internship Opportunities", icon: "GraduationCap", collection: "opportunities", desc: "Internship openings from partner companies.", editors: ["industry"], custom: "submit", detail: "generic", filter: (r) => r.type === "Internship", defaults: { type: "Internship", status: "Draft" }, fields: oppFields, columns: oppCols },
  outreach: {
    title: "Company Outreach", icon: "PhoneCall", collection: "outreach", desc: "Log of every conversation with companies.", editors: ["industry"], detail: "generic",
    fields: [
      { key: "companyId", label: "Company", type: "select", ref: "companies", required: true },
      { key: "date", label: "Contact date", type: "date" },
      { key: "type", label: "Communication type", type: "select", options: ["Call", "Email", "Meeting", "Visit", "Video Call"] },
      { key: "contact", label: "Contact person" },
      { key: "discussion", label: "Discussion", type: "textarea" },
      { key: "followUp", label: "Follow-up date", type: "date" },
      { key: "status", label: "Status", type: "select", options: ["Open", "Follow-up Due", "Closed"] },
      { key: "remarks", label: "Remarks", type: "textarea" },
    ],
    columns: [{ label: "Company", get: company }, { label: "Date", get: (r) => r.date }, { label: "Type", get: (r) => r.type }, { label: "Contact", get: (r) => r.contact }, { label: "Follow-up", get: (r) => r.followUp }, { label: "Status", get: (r) => r.status, status: true }],
  },
  mous: {
    title: "MOUs", icon: "FileSignature", collection: "mous", desc: "Memoranda of understanding with industry partners.", editors: ["industry"], detail: "generic",
    fields: [{ key: "companyId", label: "Company", type: "select", ref: "companies", required: true }, { key: "title", label: "MOU title" }, { key: "signed", label: "Signed on", type: "date" }, { key: "expiry", label: "Valid until", type: "date" }, { key: "status", label: "Status", type: "select", options: ["Draft", "Active", "Expired"] }],
    columns: [{ label: "Company", get: company }, { label: "Title", get: (r) => r.title }, { label: "Signed", get: (r) => r.signed }, { label: "Expiry", get: (r) => r.expiry }, { label: "Status", get: (r) => r.status, status: true }],
  },
  followups: {
    title: "Follow-ups", icon: "CalendarClock", collection: "followups", desc: "Pending company follow-ups.", editors: ["industry"], detail: "generic",
    fields: [{ key: "companyId", label: "Company", type: "select", ref: "companies" }, { key: "date", label: "Due date", type: "date" }, { key: "purpose", label: "Purpose" }, { key: "status", label: "Status", type: "select", options: ["Pending", "Done"] }],
    columns: [{ label: "Company", get: company }, { label: "Due", get: (r) => r.date }, { label: "Purpose", get: (r) => r.purpose }, { label: "Status", get: (r) => r.status, status: true }],
  },
  drives: {
    title: "Placement Drives", icon: "CalendarRange", collection: "drives", desc: "Campus drives created from approved opportunities.", editors: ["officer"], detail: "drive",
    fields: [
      { key: "opportunityId", label: "Opportunity", type: "select", ref: "opportunities", required: true },
      { key: "date", label: "Drive date", type: "date" },
      { key: "venue", label: "Venue" },
      { key: "minCgpa", label: "Minimum CGPA", type: "number" },
      { key: "courses", label: "Eligible courses (comma separated)" },
      { key: "vacancies", label: "Vacancies", type: "number" },
      { key: "status", label: "Status", type: "select", options: STATUS.drive },
    ],
    columns: [
      { label: "Company", get: company }, { label: "Job role", get: (r) => r.role }, { label: "Date", get: (r) => r.date },
      { label: "Eligible", get: (r, db) => db.students.filter((s) => s.cgpa >= r.minCgpa && String(r.courses).includes(s.course)).length },
      { label: "Registered", get: (r, db) => db.applications.filter((a) => a.driveId === r.id).length },
      { label: "Status", get: (r) => r.status, status: true },
    ],
  },
  students: { title: "Students", icon: "Users", collection: "students", desc: "Final-year students and their placement journey.", editors: ["officer"], detail: "student", fields: studentFields, columns: studentCols },
  recruitment: {
    title: "Recruitment Tracking", icon: "Workflow", collection: "applications", desc: "Move students through Registered → Shortlisted → Interview → Selected → Offer.", editors: ["officer"], custom: "stage", linkCollection: "students", linkKey: "studentId", detail: "student",
    fields: [{ key: "driveId", label: "Drive", type: "select", ref: "drives", required: true }, { key: "studentId", label: "Student", type: "select", ref: "students", required: true }, { key: "stage", label: "Stage", type: "select", options: STATUS.stage }],
    columns: [{ label: "Student", get: student }, { label: "Drive", get: (r, db) => { const d = byId(db, "drives", r.driveId); return d ? `${byId(db, "companies", d.companyId)?.name} · ${d.role}` : "—"; } }, { label: "Readiness", get: (r, db) => byId(db, "students", r.studentId)?.readiness, status: true }, { label: "Stage", get: (r) => r.stage, status: true }],
  },
  offers: {
    title: "Offers", icon: "BadgeCheck", collection: "offers", desc: "Final placement and offer records.", editors: ["officer"], detail: "generic",
    fields: [{ key: "studentId", label: "Student", type: "select", ref: "students", required: true }, { key: "companyId", label: "Company", type: "select", ref: "companies", required: true }, { key: "role", label: "Role" }, { key: "package", label: "Package" }, { key: "offerDate", label: "Offer date", type: "date" }, { key: "joiningDate", label: "Joining date", type: "date" }, { key: "status", label: "Status", type: "select", options: STATUS.offer }],
    columns: [{ label: "Student", get: student }, { label: "Company", get: company }, { label: "Role", get: (r) => r.role }, { label: "Package", get: (r) => r.package }, { label: "Joining", get: (r) => r.joiningDate }, { label: "Status", get: (r) => r.status, status: true }],
  },
  preparation: { title: "Career Preparation", icon: "Target", collection: "students", desc: "Preparation status of students registered in active drives.", editors: ["counselor"], detail: "student", filter: (r) => true, custom: "prep", fields: studentFields, columns: studentCols },
  readiness: { title: "Student Readiness", icon: "ShieldCheck", collection: "students", desc: "Mark each student Preparation Required, In Preparation or Ready.", editors: ["counselor"], detail: "student", custom: "readiness", fields: [{ key: "readiness", label: "Readiness", type: "select", options: STATUS.prep }], columns: studentCols.filter((c) => c.label !== "Drives") },
  resumes: {
    title: "Resume Management", icon: "FileText", collection: "resumeReviews", desc: "Resume reviews and feedback.", editors: ["counselor"], linkCollection: "students", linkKey: "studentId", detail: "student",
    fields: [{ key: "studentId", label: "Student", type: "select", ref: "students", required: true }, { key: "date", label: "Review date", type: "date" }, { key: "feedback", label: "Feedback", type: "textarea" }, { key: "status", label: "Resume status", type: "select", options: ["Pending", "Needs Revision", "Approved"] }],
    columns: [{ label: "Student", get: student }, { label: "Review date", get: (r) => r.date }, { label: "Feedback", get: (r) => r.feedback }, { label: "Status", get: (r) => r.status, status: true }],
  },
  mocks: {
    title: "Mock Interviews", icon: "Mic", collection: "mockInterviews", desc: "Schedule mock interviews and record performance.", editors: ["counselor"], linkCollection: "students", linkKey: "studentId", detail: "student",
    fields: [{ key: "studentId", label: "Student", type: "select", ref: "students", required: true }, { key: "driveId", label: "For drive", type: "select", ref: "drives" }, { key: "datetime", label: "Date & time", type: "datetime-local" }, { key: "type", label: "Type", type: "select", options: ["Technical", "HR", "Group Discussion"] }, { key: "performance", label: "Performance", type: "select", options: ["", "Excellent", "Good", "Average", "Needs Work"] }, { key: "feedback", label: "Feedback", type: "textarea" }, { key: "status", label: "Status", type: "select", options: ["Scheduled", "Completed", "Missed"] }],
    columns: [{ label: "Student", get: student }, { label: "Date/time", get: (r) => String(r.datetime).replace("T", " ") }, { label: "Type", get: (r) => r.type }, { label: "Performance", get: (r) => r.performance || "—" }, { label: "Status", get: (r) => r.status, status: true }],
  },
  guidance: {
    title: "Career Guidance", icon: "MessagesSquare", collection: "guidance", desc: "Counseling sessions, concerns and recommended actions.", editors: ["counselor"], linkCollection: "students", linkKey: "studentId", detail: "student",
    fields: [{ key: "studentId", label: "Student", type: "select", ref: "students", required: true }, { key: "date", label: "Session date", type: "date" }, { key: "concerns", label: "Student concerns", type: "textarea" }, { key: "guidance", label: "Guidance provided", type: "textarea" }, { key: "actions", label: "Recommended actions", type: "textarea" }, { key: "followUp", label: "Follow-up date", type: "date" }],
    columns: [{ label: "Student", get: student }, { label: "Date", get: (r) => r.date }, { label: "Concerns", get: (r) => r.concerns }, { label: "Actions", get: (r) => r.actions }, { label: "Follow-up", get: (r) => r.followUp }],
  },
  "alumni-directory": {
    title: "Alumni Directory", icon: "Contact", collection: "alumni", desc: "Graduates, their organizations and mentor availability.", editors: ["alumni"], detail: "generic",
    fields: [{ key: "name", label: "Name", required: true }, { key: "batch", label: "Graduation year" }, { key: "course", label: "Course" }, { key: "organization", label: "Current organization" }, { key: "designation", label: "Designation" }, { key: "location", label: "Location" }, { key: "email", label: "Email" }, { key: "mentor", label: "Available as mentor", type: "select", options: ["Yes", "No"] }, { key: "status", label: "Status", type: "select", options: ["Active", "Inactive"] }],
    columns: [{ label: "Name", get: (r) => r.name }, { label: "Batch", get: (r) => r.batch }, { label: "Organization", get: (r) => r.organization }, { label: "Designation", get: (r) => r.designation }, { label: "Mentor", get: (r) => r.mentor }, { label: "Status", get: (r) => r.status, status: true }],
  },
  referrals: {
    title: "Referrals", icon: "Share2", collection: "referrals", desc: "Alumni referrals linked to companies and students.", editors: ["alumni"], detail: "generic",
    fields: [{ key: "alumniId", label: "Alumni", type: "select", ref: "alumni", required: true }, { key: "companyId", label: "Company", type: "select", ref: "companies" }, { key: "studentId", label: "Student", type: "select", ref: "students" }, { key: "date", label: "Referral date", type: "date" }, { key: "status", label: "Status", type: "select", options: ["Pending", "Accepted", "Rejected"] }, { key: "remarks", label: "Remarks", type: "textarea" }],
    columns: [{ label: "Alumni", get: name("alumni", "alumniId") }, { label: "Company", get: company }, { label: "Student", get: student }, { label: "Date", get: (r) => r.date }, { label: "Status", get: (r) => r.status, status: true }],
  },
  mentorship: {
    title: "Mentorship", icon: "HeartHandshake", collection: "mentorships", desc: "Alumni mentors supporting current students.", editors: ["alumni"], detail: "generic",
    fields: [{ key: "alumniId", label: "Alumni mentor", type: "select", ref: "alumni", required: true }, { key: "studentId", label: "Student", type: "select", ref: "students", required: true }, { key: "date", label: "Date", type: "date" }, { key: "activity", label: "Activity" }, { key: "notes", label: "Notes", type: "textarea" }, { key: "status", label: "Status", type: "select", options: ["Planned", "Ongoing", "Completed"] }],
    columns: [{ label: "Mentor", get: name("alumni", "alumniId") }, { label: "Student", get: student }, { label: "Date", get: (r) => r.date }, { label: "Activity", get: (r) => r.activity }, { label: "Status", get: (r) => r.status, status: true }],
  },
  "alumni-support": {
    title: "Placement Support", icon: "LifeBuoy", collection: "referrals", desc: "Alumni referrals and mentorship linked to placement activity.", editors: [], custom: "support", detail: "generic",
    fields: [], columns: [],
  },
  tasks: {
    title: "Tasks", icon: "ListChecks", collection: "tasks", desc: "Small coordination items between teams.", editors: ["officer"], detail: "generic",
    fields: [{ key: "title", label: "Task", required: true }, { key: "assignee", label: "Team", type: "select", options: ["Industry Relations", "Career Counselor", "Alumni Relations", "Placement Office"] }, { key: "due", label: "Due date", type: "date" }, { key: "status", label: "Status", type: "select", options: ["Open", "In Progress", "Done"] }],
    columns: [{ label: "Task", get: (r) => r.title }, { label: "Team", get: (r) => r.assignee }, { label: "Due", get: (r) => r.due }, { label: "Status", get: (r) => r.status, status: true }],
  },
  reports: { title: "Reports", icon: "BarChart3", collection: "offers", desc: "Placement outcomes for the current batch.", editors: [], custom: "reports", fields: [], columns: [] },
};

export function refLabel(db: DB, col: string, r: Rec) {
  if (col === "opportunities") return `${byId(db, "companies", r.companyId)?.name} · ${r.role}`;
  if (col === "drives") return `${byId(db, "companies", r.companyId)?.name} · ${r.role} (${r.date})`;
  return r.name ?? r.title ?? r.id;
}
