// @ts-nocheck
import { Link } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useDB, byId, eligibleFor, type DB } from "@/components/placement/lib/store";
import { SECTIONS, type RoleId } from "@/components/placement/lib/config";
import { DataTable, PageHeader, StatusBadge } from "./crud";

function Stat({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <div className="font-display text-3xl font-semibold tabular-nums">{value}</div>
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
      </div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b px-5 py-3"><h2 className="text-sm font-semibold">{title}</h2>{action}</div>
      <div className="p-5">{children}</div>
    </section>
  );
}
const stageCount = (db: DB, s: string) => db.applications.filter((a) => a.stage === s).length;
const atLeast = (db: DB, i: number) => { const order = ["Registered", "Shortlisted", "Interview", "Selected", "Offer"]; return db.applications.filter((a) => order.indexOf(a.stage) >= i).length; };
const eligibleTotal = (db: DB) => new Set(db.drives.filter((d) => !["Completed", "Cancelled"].includes(d.status)).flatMap((d) => eligibleFor(db, d).map((s) => s.id))).size;

function Funnel() {
  const db = useDB();
  const data = ["Registered", "Shortlisted", "Interview", "Selected", "Offer"].map((s, i) => ({ s, n: atLeast(db, i) }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}><CartesianGrid vertical={false} stroke="var(--border)" /><XAxis dataKey="s" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="n" name="Students" fill="var(--primary)" radius={[4, 4, 0, 0]} /></BarChart>
    </ResponsiveContainer>
  );
}

export function Dashboard({ role }: { role: RoleId }) {
  const db = useDB();
  const g = (title: string) => <PageHeader title={title} desc="Overview of the current placement season · Batch 2026–27" />;
  if (role === "officer") {
    const pendingOpps = db.opportunities.filter((o) => ["Submitted", "Under Review"].includes(o.status));
    return (
      <div className="space-y-6">
        {g("Placement Dashboard")}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
          <Stat label="Total Companies" value={db.companies.length} />
          <Stat label="Active Opportunities" value={db.opportunities.filter((o) => ["Submitted", "Under Review", "Approved"].includes(o.status)).length} />
          <Stat label="Active Drives" value={db.drives.filter((d) => ["Open", "In Progress", "Registration Closed"].includes(d.status)).length} />
          <Stat label="Eligible Students" value={eligibleTotal(db)} />
          <Stat label="Shortlisted" value={atLeast(db, 1)} />
          <Stat label="Selected" value={atLeast(db, 3)} />
          <Stat label="Offers Received" value={db.offers.length} />
        </div>
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2"><Panel title="Upcoming Placement Drives" action={<Link to="/placement/$role/$section" params={{ role, section: "drives" }} className="text-xs text-primary">View all</Link>}><DataTable rows={db.drives.filter((d) => d.status !== "Completed")} section={SECTIONS.drives} role={role} sectionId="drives" /></Panel></div>
          <Panel title="Recruitment Progress"><Funnel /></Panel>
        </div>
        {pendingOpps.length > 0 && <Panel title="Opportunities awaiting your review"><DataTable rows={pendingOpps} section={SECTIONS.opportunities} role={role} sectionId="opportunities" /></Panel>}
      </div>
    );
  }
  if (role === "industry") {
    return (
      <div className="space-y-6">
        {g("Industry Relations")}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Stat label="Total Companies" value={db.companies.length} />
          <Stat label="Active Relationships" value={db.companies.filter((c) => c.relationship === "Active").length} />
          <Stat label="Active MOUs" value={db.mous.filter((m) => m.status === "Active").length} />
          <Stat label="Placement Opportunities" value={db.opportunities.filter((o) => o.type === "Placement").length} />
          <Stat label="Internship Opportunities" value={db.opportunities.filter((o) => o.type === "Internship").length} />
          <Stat label="Pending Follow-ups" value={db.followups.filter((f) => f.status === "Pending").length} />
        </div>
        <Panel title="My opportunities & review status"><DataTable rows={db.opportunities} section={SECTIONS.opportunities} role={role} sectionId="placement-opps" /></Panel>
        <Panel title="Recent outreach"><DataTable rows={db.outreach.slice(0, 5)} section={SECTIONS.outreach} role={role} sectionId="outreach" /></Panel>
      </div>
    );
  }
  if (role === "counselor") {
    const reg = new Set(db.applications.map((a) => a.studentId));
    const inDrives = db.students.filter((s) => reg.has(s.id));
    const pie = ["Preparation Required", "In Preparation", "Ready"].map((k, i) => ({ k, n: db.students.filter((s) => s.readiness === k).length, c: ["var(--destructive)", "var(--warning)", "var(--success)"][i] }));
    return (
      <div className="space-y-6">
        {g("Career Counseling")}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Stat label="Under Preparation" value={inDrives.filter((s) => s.readiness !== "Ready").length} />
          <Stat label="Resumes Reviewed" value={db.resumeReviews.length} />
          <Stat label="Mock Interviews" value={db.mockInterviews.length} />
          <Stat label="Guidance Sessions" value={db.guidance.length} />
          <Stat label="Students Ready" value={db.students.filter((s) => s.readiness === "Ready").length} />
          <Stat label="Requiring Preparation" value={db.students.filter((s) => s.readiness === "Preparation Required").length} />
        </div>
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2"><Panel title="Students in active placement drives"><DataTable rows={inDrives} section={SECTIONS.preparation} role={role} sectionId="students" /></Panel></div>
          <Panel title="Readiness distribution">
            <ResponsiveContainer width="100%" height={200}><PieChart><Pie data={pie} dataKey="n" nameKey="k" innerRadius={50} outerRadius={80}>{pie.map((p) => <Cell key={p.k} fill={p.c} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
            <div className="space-y-1.5">{pie.map((p) => <div key={p.k} className="flex justify-between text-sm"><StatusBadge value={p.k} /><span className="tabular-nums">{p.n}</span></div>)}</div>
          </Panel>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {g("Alumni Relations")}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Total Alumni" value={db.alumni.length} />
        <Stat label="Active Alumni" value={db.alumni.filter((a) => a.status === "Active").length} />
        <Stat label="Alumni Mentors" value={db.alumni.filter((a) => a.mentor === "Yes").length} />
        <Stat label="Referrals" value={db.referrals.length} />
        <Stat label="Mentorship Activities" value={db.mentorships.length} />
      </div>
      <Panel title="Recent referrals"><DataTable rows={db.referrals} section={SECTIONS.referrals} role={role} sectionId="referrals" /></Panel>
      <Panel title="Mentorship activity"><DataTable rows={db.mentorships} section={SECTIONS.mentorship} role={role} sectionId="mentorship" /></Panel>
    </div>
  );
}

export function ReportsView() {
  const db = useDB();
  const byCompany = db.companies.map((c) => ({ c: c.name.split(" ")[0], offers: db.offers.filter((o) => o.companyId === c.id).length, regs: db.applications.filter((a) => byId(db, "drives", a.driveId)?.companyId === c.id).length }));
  const byCourse = [...new Set(db.students.map((s) => s.course))].map((k) => ({ k, total: db.students.filter((s) => s.course === k).length, placed: db.offers.filter((o) => byId(db, "students", o.studentId)?.course === k).length }));
  return (
    <div className="space-y-6">
      <PageHeader title="Reports" desc="Placement outcomes for the current batch." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Students placed" value={new Set(db.offers.map((o) => o.studentId)).size} />
        <Stat label="Placement rate" value={`${Math.round((new Set(db.offers.map((o) => o.studentId)).size / Math.max(1, db.students.length)) * 100)}%`} />
        <Stat label="Offers accepted" value={db.offers.filter((o) => ["Accepted", "Joined"].includes(o.status)).length} />
        <Stat label="Drives conducted" value={db.drives.length} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Registrations vs offers by company"><ResponsiveContainer width="100%" height={240}><BarChart data={byCompany}><CartesianGrid vertical={false} stroke="var(--border)" /><XAxis dataKey="c" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="regs" name="Registered" fill="var(--muted-foreground)" radius={[4, 4, 0, 0]} /><Bar dataKey="offers" name="Offers" fill="var(--primary)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></Panel>
        <Panel title="Course-wise placement">
          <table className="w-full text-sm"><thead><tr className="text-left text-xs text-muted-foreground"><th className="pb-2">Course</th><th>Students</th><th>Placed</th><th>Rate</th></tr></thead>
            <tbody>{byCourse.map((r) => <tr key={r.k} className="border-t"><td className="py-2">{r.k}</td><td>{r.total}</td><td>{r.placed}</td><td>{Math.round((r.placed / r.total) * 100)}%</td></tr>)}</tbody></table>
        </Panel>
      </div>
    </div>
  );
}
