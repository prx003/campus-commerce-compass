import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useCloudState } from "@/lib/cloud-state";

// ---------------- Types ----------------
export type Role = "System Administrator" | "HR Personnel" | "Department Manager";

export type Module =
  | "dashboard"
  | "employees"
  | "attendance"
  | "leave"
  | "payroll"
  | "performance"
  | "users"
  | "reports";

export type Employee = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  dept: string;
  salary: number; // monthly gross in INR
  join: string;
  status: "Active" | "On Leave" | "Probation";
  documents: string[];
};

export type LeaveRequest = {
  id: string;
  empId: string;
  type: "Casual" | "Sick" | "Earned" | "Unpaid";
  from: string;
  to: string;
  days: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
};

export type AttStatus = "Present" | "Absent" | "Leave";

export type Evaluation = {
  id: string;
  empId: string;
  period: string;
  kpi: number; // 0-100
  goals: number; // 0-100
  rating: "Outstanding" | "Exceeds" | "Meets" | "Needs Improvement";
  note: string;
};

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
};

// ---------------- RBAC ----------------
export const ROLE_PERMISSIONS: Record<Role, Module[]> = {
  "System Administrator": [
    "dashboard",
    "employees",
    "attendance",
    "leave",
    "payroll",
    "performance",
    "users",
    "reports",
  ],
  "HR Personnel": [
    "dashboard",
    "employees",
    "attendance",
    "leave",
    "payroll",
    "performance",
    "reports",
  ],
  "Department Manager": ["dashboard", "attendance", "leave", "performance", "reports"],
};

// ---------------- Seed data ----------------
const seedEmployees: Employee[] = [
  { id: "E-1001", name: "Neha Kapoor", email: "neha.kapoor@edusphere.in", phone: "+91 98200 11223", role: "Counselor", dept: "Admissions", salary: 68000, join: "2022-04-11", status: "Active", documents: ["Offer Letter.pdf", "ID Proof.pdf"] },
  { id: "E-1002", name: "Rajiv Sharma", email: "rajiv.sharma@edusphere.in", phone: "+91 98201 44556", role: "Senior Teacher", dept: "Mathematics", salary: 92000, join: "2019-06-01", status: "Active", documents: ["Degree.pdf"] },
  { id: "E-1003", name: "Priya Singh", email: "priya.singh@edusphere.in", phone: "+91 98202 77889", role: "HR Manager", dept: "Operations", salary: 112000, join: "2018-01-15", status: "Active", documents: ["Offer Letter.pdf", "PAN.pdf"] },
  { id: "E-1004", name: "Karthik Iyer", email: "karthik.iyer@edusphere.in", phone: "+91 98203 22110", role: "Coordinator", dept: "Academics", salary: 78500, join: "2021-09-20", status: "On Leave", documents: [] },
  { id: "E-1005", name: "Anjali Mehta", email: "anjali.mehta@edusphere.in", phone: "+91 98204 55667", role: "Lab Assistant", dept: "Science", salary: 42000, join: "2023-02-08", status: "Probation", documents: ["ID Proof.pdf"] },
  { id: "E-1006", name: "Sameer Khan", email: "sameer.khan@edusphere.in", phone: "+91 98205 88990", role: "Teacher", dept: "English", salary: 64000, join: "2020-07-12", status: "Active", documents: ["Degree.pdf", "Offer Letter.pdf"] },
];

const seedLeaves: LeaveRequest[] = [
  { id: "L-501", empId: "E-1004", type: "Casual", from: "2025-09-28", to: "2025-09-30", days: 3, reason: "Family function", status: "Approved" },
  { id: "L-502", empId: "E-1001", type: "Sick", from: "2025-09-26", to: "2025-09-27", days: 2, reason: "Fever", status: "Approved" },
  { id: "L-503", empId: "E-1005", type: "Earned", from: "2025-10-02", to: "2025-10-06", days: 5, reason: "Travel", status: "Pending" },
  { id: "L-504", empId: "E-1002", type: "Casual", from: "2025-10-10", to: "2025-10-10", days: 1, reason: "Personal", status: "Pending" },
];

const seedEvals: Evaluation[] = [
  { id: "P-1", empId: "E-1002", period: "Q3 2025", kpi: 92, goals: 88, rating: "Exceeds", note: "Strong results in board prep." },
  { id: "P-2", empId: "E-1003", period: "Q3 2025", kpi: 96, goals: 94, rating: "Outstanding", note: "Excellent team leadership." },
  { id: "P-3", empId: "E-1001", period: "Q3 2025", kpi: 78, goals: 80, rating: "Meets", note: "Consistent counseling outcomes." },
  { id: "P-4", empId: "E-1005", period: "Q3 2025", kpi: 64, goals: 60, rating: "Needs Improvement", note: "Improve lab documentation." },
];

const seedUsers: AppUser[] = [
  { id: "U-1", name: "Priya Singh", email: "priya.singh@edusphere.in", role: "HR Personnel", active: true },
  { id: "U-2", name: "Admin", email: "admin@edusphere.in", role: "System Administrator", active: true },
  { id: "U-3", name: "Rajiv Sharma", email: "rajiv.sharma@edusphere.in", role: "Department Manager", active: true },
];

// ---------------- Context ----------------
type HRState = {
  role: Role;
  setRole: (r: Role) => void;
  signedIn: boolean;
  signIn: (r: Role) => void;
  signOut: () => void;
  can: (m: Module) => boolean;

  employees: Employee[];
  addEmployee: (e: Omit<Employee, "id" | "documents">) => void;
  updateEmployee: (id: string, e: Partial<Employee>) => void;
  removeEmployee: (id: string) => void;
  addDocument: (id: string, doc: string) => void;

  attendance: Record<string, AttStatus>; // empId -> today status
  setAttendance: (empId: string, s: AttStatus) => void;

  leaves: LeaveRequest[];
  addLeave: (l: Omit<LeaveRequest, "id" | "status">) => void;
  setLeaveStatus: (id: string, s: LeaveRequest["status"]) => void;

  evaluations: Evaluation[];
  addEvaluation: (e: Omit<Evaluation, "id">) => void;

  users: AppUser[];
  addUser: (u: Omit<AppUser, "id">) => void;
  toggleUser: (id: string) => void;
  setUserRole: (id: string, r: Role) => void;
};

const HRContext = createContext<HRState | null>(null);

function useLocal<T>(key: string, initial: T) {
  const [val, setVal] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(val));
    } catch {
      /* ignore */
    }
  }, [key, val]);
  return [val, setVal] as const;
}

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 7)}`;

export function HRProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useLocal<Role>("hr.role", "System Administrator");
  const [signedIn, setSignedIn] = useLocal<boolean>("hr.signedIn", false);
  const [employees, setEmployees] = useCloudState<Employee[]>("hr.employees", seedEmployees);
  const [attendance, setAtt] = useCloudState<Record<string, AttStatus>>("hr.attendance", {
    "E-1001": "Present",
    "E-1002": "Present",
    "E-1003": "Present",
    "E-1004": "Leave",
    "E-1005": "Absent",
    "E-1006": "Present",
  });
  const [leaves, setLeaves] = useCloudState<LeaveRequest[]>("hr.leaves", seedLeaves);
  const [evaluations, setEvals] = useCloudState<Evaluation[]>("hr.evals", seedEvals);
  const [users, setUsers] = useCloudState<AppUser[]>("hr.users", seedUsers);

  const value: HRState = useMemo(
    () => ({
      role,
      setRole,
      signedIn,
      signIn: (r) => {
        setRole(r);
        setSignedIn(true);
      },
      signOut: () => setSignedIn(false),
      can: (m) => ROLE_PERMISSIONS[role].includes(m),

      employees,
      addEmployee: (e) =>
        setEmployees((list) => [{ ...e, id: uid("E"), documents: [] }, ...list]),
      updateEmployee: (id, e) =>
        setEmployees((list) => list.map((x) => (x.id === id ? { ...x, ...e } : x))),
      removeEmployee: (id) => setEmployees((list) => list.filter((x) => x.id !== id)),
      addDocument: (id, doc) =>
        setEmployees((list) =>
          list.map((x) => (x.id === id ? { ...x, documents: [...x.documents, doc] } : x)),
        ),

      attendance,
      setAttendance: (empId, s) => setAtt((a) => ({ ...a, [empId]: s })),

      leaves,
      addLeave: (l) => setLeaves((list) => [{ ...l, id: uid("L"), status: "Pending" }, ...list]),
      setLeaveStatus: (id, s) =>
        setLeaves((list) => list.map((x) => (x.id === id ? { ...x, status: s } : x))),

      evaluations,
      addEvaluation: (e) => setEvals((list) => [{ ...e, id: uid("P") }, ...list]),

      users,
      addUser: (u) => setUsers((list) => [{ ...u, id: uid("U") }, ...list]),
      toggleUser: (id) =>
        setUsers((list) => list.map((x) => (x.id === id ? { ...x, active: !x.active } : x))),
      setUserRole: (id, r) =>
        setUsers((list) => list.map((x) => (x.id === id ? { ...x, role: r } : x))),
    }),
    [role, signedIn, employees, attendance, leaves, evaluations, users, setRole, setSignedIn, setEmployees, setAtt, setLeaves, setEvals, setUsers],
  );

  return <HRContext.Provider value={value}>{children}</HRContext.Provider>;
}

export function useHR() {
  const ctx = useContext(HRContext);
  if (!ctx) throw new Error("useHR must be used within HRProvider");
  return ctx;
}

// ---------------- Payroll helpers ----------------
export function computePayroll(e: Employee) {
  const basic = Math.round(e.salary * 0.5);
  const hra = Math.round(e.salary * 0.2);
  const allowances = Math.round(e.salary * 0.3);
  const pf = Math.round(basic * 0.12);
  const tax = Math.round(e.salary * 0.1);
  const deductions = pf + tax;
  const net = e.salary - deductions;
  return { basic, hra, allowances, pf, tax, deductions, gross: e.salary, net };
}

export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
