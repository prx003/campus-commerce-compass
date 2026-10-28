import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  UserPlus, FileCheck, CalendarClock, Users, Plus, Search, Filter,
  CheckCircle2, Clock, XCircle, Download, ArrowUpRight, GraduationCap,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { PageHeader, Section, StatCard } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/admission")({
  component: AdmissionLayout,
});

const TABS: { to: "/admission" | "/admission/applications" | "/admission/screening" | "/admission/merit" | "/admission/enrollment" | "/admission/fees" | "/admission/reports" | "/admission/settings"; label: string; exact?: boolean }[] = [
  { to: "/admission", label: "Overview", exact: true },
  { to: "/admission/applications", label: "Applications" },
  { to: "/admission/screening", label: "Screening & Evaluation" },
  { to: "/admission/merit", label: "Merit & Selection" },
  { to: "/admission/enrollment", label: "Enrollment" },
  { to: "/admission/fees", label: "Admission Fees" },
  { to: "/admission/reports", label: "Reports" },
  { to: "/admission/settings", label: "Settings" },
];

function AdmissionLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="space-y-6">
      <PageHeader
        title="Admissions"
        subtitle="Applications, interviews, offers and admission fees"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5"><Download className="size-4" /> Export</Button>
            <Button size="sm" className="gap-1.5"><Plus className="size-4" /> New application</Button>
          </>
        }
      />
      <div className="border-b border-border -mt-2 overflow-x-auto scrollbar-thin">
        <nav className="flex gap-1 -mb-px min-w-max">
          {TABS.map((t) => {
            const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap",
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <Outlet />
    </div>
  );
}

// Shared sub-tab pill nav for sub-sections
export function SubTabs({ items, value, onChange }: { items: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it) => (
        <button
          key={it}
          onClick={() => onChange(it)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-md border transition",
            value === it
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-secondary/60",
          )}
        >
          {it}
        </button>
      ))}
    </div>
  );
}

// ───────── Overview (index)
export function AdmissionOverview() {
  const funnel = [
    { s: "Inquiries", v: 1240 },
    { s: "Applied", v: 612 },
    { s: "Tested", v: 388 },
    { s: "Interviewed", v: 246 },
    { s: "Offered", v: 184 },
    { s: "Enrolled", v: 142 },
  ];
  const colors = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-4)", "var(--color-chart-5)", "var(--color-chart-3)", "var(--color-success)"];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="New applications" value="184" delta="22%" icon={UserPlus} accent="primary" />
        <StatCard label="Offers issued" value="96" delta="11%" icon={FileCheck} accent="success" />
        <StatCard label="Interviews scheduled" value="42" delta="3%" icon={CalendarClock} accent="warning" />
        <StatCard label="Enrolled (YTD)" value="612" delta="9%" icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Section title="Admission funnel" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="s" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} width={92} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="v" radius={[0, 6, 6, 0]}>
                  {funnel.map((_, i) => <Cell key={i} fill={colors[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Today's interviews" action={<Link to="/admission/applications" className="text-xs text-primary font-medium hover:underline">View all</Link>}>
          <ul className="space-y-3">
            {[
              { t: "10:00", n: "Aarav Sharma", g: "Grade 6" },
              { t: "11:30", n: "Diya Nair", g: "KG-2" },
              { t: "14:00", n: "Vivaan Shah", g: "Grade 7" },
              { t: "15:30", n: "Saanvi Joshi", g: "Grade 2" },
            ].map((i) => (
              <li key={i.n} className="flex items-center gap-3">
                <div className="size-9 rounded-md bg-primary/10 text-primary grid place-items-center text-xs font-semibold">{i.t}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{i.n}</div>
                  <div className="text-[11px] text-muted-foreground">{i.g} · Panel A</div>
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}

// ───────── Applications list
type App = { id: string; name: string; grade: string; date: string; stage: "Pending" | "Interview" | "Offered" | "Enrolled" | "Rejected"; score: number };
const APPS: App[] = [
  { id: "APP-9012", name: "Riya Patel", grade: "Grade 6", date: "May 02", stage: "Interview", score: 84 },
  { id: "APP-9013", name: "Aman Verma", grade: "Grade 9", date: "May 03", stage: "Pending", score: 0 },
  { id: "APP-9014", name: "Diya Nair", grade: "KG-2", date: "May 04", stage: "Offered", score: 91 },
  { id: "APP-9015", name: "Kabir Mehta", grade: "Grade 4", date: "May 05", stage: "Enrolled", score: 88 },
  { id: "APP-9016", name: "Anaya Roy", grade: "Grade 11", date: "May 06", stage: "Rejected", score: 52 },
  { id: "APP-9017", name: "Vivaan Shah", grade: "Grade 7", date: "May 07", stage: "Interview", score: 76 },
  { id: "APP-9018", name: "Myra Gupta", grade: "Grade 5", date: "May 08", stage: "Pending", score: 0 },
];

const stageColor = (s: App["stage"]) =>
  s === "Enrolled" ? "bg-success/10 text-success"
  : s === "Offered" ? "bg-primary/10 text-primary"
  : s === "Interview" ? "bg-chart-2/15 text-chart-2"
  : s === "Rejected" ? "bg-destructive/10 text-destructive"
  : "bg-warning/15 text-warning-foreground";

const STATUS_TABS = ["All Applications", "New Application", "Pending", "In Review", "Approved", "Rejected", "Waitlisted"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

const stageToStatus: Record<App["stage"], StatusTab> = {
  Pending: "Pending",
  Interview: "In Review",
  Offered: "Approved",
  Enrolled: "Approved",
  Rejected: "Rejected",
};

export function AdmissionApplications() {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<StatusTab>("All Applications");

  const rows = useMemo(() => {
    const f = APPS.filter((a) => a.name.toLowerCase().includes(q.toLowerCase()) || a.id.includes(q.toUpperCase()));
    if (tab === "All Applications" || tab === "New Application") return f;
    if (tab === "Waitlisted") return [];
    return f.filter((a) => stageToStatus[a.stage] === tab);
  }, [q, tab]);

  if (tab === "New Application") {
    return (
      <div className="space-y-4">
        <SubTabs items={[...STATUS_TABS]} value={tab} onChange={(v) => setTab(v as StatusTab)} />
        <Section title="New application form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
            {[
              ["Applicant name", "e.g. Aarav Sharma"],
              ["Date of birth", "DD / MM / YYYY"],
              ["Applying for grade", "Select grade"],
              ["Parent / guardian", "Full name"],
              ["Contact email", "name@example.com"],
              ["Phone", "+91 ..."],
              ["Previous school", "Optional"],
              ["Category / quota", "General"],
            ].map(([l, p]) => (
              <div key={l} className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{l}</label>
                <Input placeholder={p} className="h-9 text-sm" />
              </div>
            ))}
            <div className="md:col-span-2 flex gap-2 pt-2">
              <Button size="sm" className="gap-1.5"><Plus className="size-4" /> Submit application</Button>
              <Button size="sm" variant="outline">Save draft</Button>
            </div>
          </div>
        </Section>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SubTabs items={[...STATUS_TABS]} value={tab} onChange={(v) => setTab(v as StatusTab)} />
      <Section title={tab} action={
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search applicant or ID" className="h-8 pl-8 text-xs w-56" />
          </div>
          <Button variant="outline" size="sm" className="gap-1.5"><Filter className="size-3.5" /> Filter</Button>
        </div>
      }>
        <div className="overflow-x-auto -m-5">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-medium">App ID</th>
                <th className="px-3 py-3 text-left font-medium">Applicant</th>
                <th className="px-3 py-3 text-left font-medium">Grade</th>
                <th className="px-3 py-3 text-left font-medium">Submitted</th>
                <th className="px-3 py-3 text-right font-medium">Score</th>
                <th className="px-5 py-3 text-left font-medium">Stage</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">No applications in this category.</td></tr>
              )}
              {rows.map((a) => (
                <tr key={a.id} className="border-t border-border hover:bg-secondary/40">
                  <td className="px-5 py-3 font-mono text-xs text-primary font-semibold">{a.id}</td>
                  <td className="px-3 py-3 font-medium">{a.name}</td>
                  <td className="px-3 py-3 text-muted-foreground">{a.grade}</td>
                  <td className="px-3 py-3 text-muted-foreground">{a.date}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{a.score || "—"}</td>
                  <td className="px-5 py-3"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${stageColor(a.stage)}`}>{a.stage}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

// ───────── Admission Fees
export function AdmissionFees() {
  const plans = [
    { g: "KG · Grade 5", reg: "₹2,500", adm: "₹35,000", sec: "₹15,000" },
    { g: "Grade 6 · 8", reg: "₹3,000", adm: "₹45,000", sec: "₹20,000" },
    { g: "Grade 9 · 10", reg: "₹3,500", adm: "₹55,000", sec: "₹25,000" },
    { g: "Grade 11 · 12", reg: "₹4,000", adm: "₹65,000", sec: "₹30,000" },
  ];
  const recent = [
    { id: "AFE-3201", name: "Diya Nair", g: "KG-2", amt: "₹52,500", st: "Paid" as const },
    { id: "AFE-3202", name: "Kabir Mehta", g: "Grade 4", amt: "₹52,500", st: "Paid" as const },
    { id: "AFE-3203", name: "Vivaan Shah", g: "Grade 7", amt: "₹68,000", st: "Pending" as const },
    { id: "AFE-3204", name: "Anaya Roy", g: "Grade 11", amt: "₹99,000", st: "Refunded" as const },
  ];
  const stColor = (s: string) =>
    s === "Paid" ? "bg-success/10 text-success"
    : s === "Pending" ? "bg-warning/15 text-warning-foreground"
    : "bg-muted text-muted-foreground";

  const SUBS = ["Fee Structure Setup", "Admission Fee Payment", "Installment Plan", "Payment Tracking", "Refund Management", "Receipt Generation"];
  const [sub, setSub] = useState(SUBS[0]);

  return (
    <div className="space-y-4">
      <SubTabs items={SUBS} value={sub} onChange={setSub} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Collected (admission)" value="₹38.2L" delta="18%" icon={CheckCircle2} accent="success" />
        <StatCard label="Pending payments" value="₹4.1L" delta="3%" icon={Clock} accent="warning" />
        <StatCard label="Refunds" value="₹62K" icon={XCircle} accent="destructive" />
        <StatCard label="Avg. ticket" value="₹54,800" delta="5%" icon={GraduationCap} />
      </div>

      {sub === "Fee Structure Setup" && (
        <Section title="Fee plan by grade">
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Grade band</th>
                  <th className="px-3 py-3 text-right font-medium">Registration</th>
                  <th className="px-3 py-3 text-right font-medium">Admission</th>
                  <th className="px-5 py-3 text-right font-medium">Security deposit</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.g} className="border-t border-border hover:bg-secondary/40">
                    <td className="px-5 py-3 font-medium">{p.g}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{p.reg}</td>
                    <td className="px-3 py-3 text-right tabular-nums font-semibold">{p.adm}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">{p.sec}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {sub === "Admission Fee Payment" && (
        <Section title="Collect admission fee">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
            {[["Application ID", "APP-9012"], ["Applicant", "Riya Patel"], ["Amount", "₹52,500"], ["Mode", "UPI / Card / Net Banking"]].map(([l, p]) => (
              <div key={l} className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{l}</label>
                <Input placeholder={p} className="h-9 text-sm" />
              </div>
            ))}
            <div className="md:col-span-2"><Button size="sm" className="gap-1.5"><CheckCircle2 className="size-4" /> Record payment</Button></div>
          </div>
        </Section>
      )}

      {sub === "Installment Plan" && (
        <Section title="Installment plans">
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Plan</th>
                  <th className="px-3 py-3 text-right font-medium">Installments</th>
                  <th className="px-3 py-3 text-right font-medium">Frequency</th>
                  <th className="px-5 py-3 text-right font-medium">Per cycle</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Standard – 2 part", 2, "Half-yearly", "₹26,250"],
                  ["Quarterly", 4, "Quarterly", "₹13,125"],
                  ["Monthly", 10, "Monthly", "₹5,250"],
                ].map((r) => (
                  <tr key={r[0] as string} className="border-t border-border hover:bg-secondary/40">
                    <td className="px-5 py-3 font-medium">{r[0]}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{r[1]}</td>
                    <td className="px-3 py-3 text-right text-muted-foreground">{r[2]}</td>
                    <td className="px-5 py-3 text-right tabular-nums font-semibold">{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {(sub === "Payment Tracking" || sub === "Receipt Generation") && (
        <Section title={sub === "Receipt Generation" ? "Generated receipts" : "Recent admission payments"}>
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Receipt</th>
                  <th className="px-3 py-3 text-left font-medium">Applicant</th>
                  <th className="px-3 py-3 text-left font-medium">Grade</th>
                  <th className="px-3 py-3 text-right font-medium">Amount</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id} className="border-t border-border hover:bg-secondary/40">
                    <td className="px-5 py-3 font-mono text-xs text-primary font-semibold">{r.id}</td>
                    <td className="px-3 py-3 font-medium">{r.name}</td>
                    <td className="px-3 py-3 text-muted-foreground">{r.g}</td>
                    <td className="px-3 py-3 text-right tabular-nums font-semibold">{r.amt}</td>
                    <td className="px-5 py-3"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${stColor(r.st)}`}>{r.st}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {sub === "Refund Management" && (
        <Section title="Refund requests">
          <ul className="divide-y divide-border -my-2">
            {[
              { n: "Anaya Roy", a: "₹62,000", r: "Withdrawn before term", s: "Approved" },
              { n: "Ishaan Kapoor", a: "₹15,000", r: "Duplicate payment", s: "Pending" },
            ].map((x) => (
              <li key={x.n} className="py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{x.n}</div>
                  <div className="text-xs text-muted-foreground">{x.r}</div>
                </div>
                <div className="text-sm font-semibold tabular-nums">{x.a}</div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${x.s === "Approved" ? "bg-success/10 text-success" : "bg-warning/15 text-warning-foreground"}`}>{x.s}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
