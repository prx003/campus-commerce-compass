import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users,
  GraduationCap,
  Wallet,
  TrendingUp,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Megaphone,
  Landmark,
  Scale,
  Building2,
  Sparkles,
  BookOpen,
  ClipboardList,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader, Section, StatCard } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { useAuth, canAccess, ROLE_LABELS, type AppRole } from "@/lib/auth";

export const Route = createFileRoute("/_app/")({
  component: Dashboard,
});

const revenue = [
  { m: "Jan", v: 42 }, { m: "Feb", v: 51 }, { m: "Mar", v: 48 },
  { m: "Apr", v: 62 }, { m: "May", v: 70 }, { m: "Jun", v: 81 },
  { m: "Jul", v: 78 }, { m: "Aug", v: 92 }, { m: "Sep", v: 99 },
];

const attendance = [
  { d: "Mon", p: 94 }, { d: "Tue", p: 91 }, { d: "Wed", p: 96 },
  { d: "Thu", p: 89 }, { d: "Fri", p: 93 }, { d: "Sat", p: 78 },
];

const funnel = [
  { name: "Inquiry", value: 1240, color: "var(--color-chart-1)" },
  { name: "Visit", value: 820, color: "var(--color-chart-2)" },
  { name: "Application", value: 520, color: "var(--color-chart-3)" },
  { name: "Enrolled", value: 312, color: "var(--color-chart-4)" },
];

const activity = [
  { who: "Priya Sharma", action: "submitted admission form", time: "2m ago", tag: "Lead" },
  { who: "Mr. Iyer", action: "paid Term-2 fee ₹42,000", time: "18m ago", tag: "Payment" },
  { who: "Class 9-B", action: "marked attendance (28/30)", time: "1h ago", tag: "Attendance" },
  { who: "Counselor Neha", action: "scheduled follow-up with Rohan", time: "3h ago", tag: "CRM" },
  { who: "Exam Cell", action: "published Mid-Term results", time: "Yesterday", tag: "Exam" },
];

const tasks = [
  { t: "Approve 12 admission applications", due: "Today", done: false },
  { t: "Sign payroll for September", due: "Today", done: false },
  { t: "Review fee defaulters list", due: "Tomorrow", done: false },
  { t: "Send PTM invitations — Grade 8", due: "Sep 28", done: true },
];

// Modules shown as quick-access cards, filtered by the user's role.
const MODULES: { to: string; label: string; desc: string; icon: LucideIcon }[] = [
  { to: "/crm", label: "CRM", desc: "Leads, follow-ups and enquiries", icon: Users },
  { to: "/admission", label: "Admissions", desc: "Applications, screening and enrollment", icon: ClipboardList },
  { to: "/students", label: "Students", desc: "Student records and profiles", icon: GraduationCap },
  { to: "/fees", label: "Fees", desc: "Fee collection and dues", icon: Wallet },
  { to: "/academic", label: "Academic", desc: "Classes, attendance and reports", icon: BookOpen },
  { to: "/exams", label: "Exams", desc: "Exam schedules and results", icon: ClipboardList },
  { to: "/hr", label: "HR", desc: "Staff, payroll, leave and attendance", icon: Briefcase },
  { to: "/sales", label: "Sales", desc: "Agents and lead pipeline", icon: TrendingUp },
  { to: "/marketing", label: "Marketing", desc: "Campaigns, content and events", icon: Megaphone },
  { to: "/college", label: "College Portal", desc: "Role-based college management", icon: Landmark },
  { to: "/governance", label: "Governance", desc: "Leadership and executive reports", icon: Scale },
  { to: "/placement", label: "Placement", desc: "Drives, companies and offers", icon: Building2 },
  { to: "/ai", label: "AI Assistant", desc: "Insights and predictions", icon: Sparkles },
];

// Which overview sections each role sees on the dashboard.
const ROLE_SECTIONS: Record<AppRole, string[] | "all"> = {
  admin: "all",
  principal: "all",
  hr: ["tasks", "activity"],
  academic: ["attendance", "tasks", "activity"],
  admissions: ["funnel", "tasks", "activity"],
  sales: ["funnel", "activity"],
  marketing: ["funnel", "activity"],
  governance: ["revenue", "attendance"],
  staff: ["tasks"],
};

function Dashboard() {
  const { roles } = useAuth();
  const name = "there";
  const roleLabel = roles.map((r) => ROLE_LABELS[r]).join(" · ") || "Staff";

  const modules = MODULES.filter((m) => canAccess(roles, m.to));
  const sections = roles.some((r) => ROLE_SECTIONS[r] === "all")
    ? ["revenue", "funnel", "attendance", "tasks", "activity", "ai"]
    : [...new Set(roles.flatMap((r) => ROLE_SECTIONS[r] as string[]))];
  const show = (s: string) => sections.includes(s);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${name} 👋`}
        subtitle={`Signed in as ${roleLabel}. Here's your workspace for today.`}
        actions={
          <Button variant="outline" size="sm" className="gap-1.5">
            <CalendarDays className="size-4" /> This month
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.to}
              to={m.to}
              className="rounded-lg border bg-card p-4 hover:border-primary/50 hover:shadow-sm transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                  <Icon className="size-4.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{m.label}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{m.desc}</div>
                </div>
                <ArrowRight className="size-4 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>

      {(show("revenue") || show("funnel")) && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active students" value="2,847" delta="3.2%" icon={GraduationCap} />
          <StatCard label="Open leads" value="312" delta="12.4%" icon={Users} accent="warning" />
          <StatCard label="Revenue (MTD)" value="₹48.2L" delta="8.1%" icon={Wallet} accent="success" />
          <StatCard label="Attendance avg" value="92.6%" delta="0.8%" icon={TrendingUp} trend="down" accent="destructive" />
        </div>
      )}

      {(show("revenue") || show("funnel")) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {show("revenue") && (
            <Section
              title="Revenue overview"
              className="lg:col-span-2"
              action={<button className="text-xs text-primary font-medium hover:underline">View report</button>}
            >
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenue}>
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="m" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Area type="monotone" dataKey="v" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#rev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Section>
          )}

          {show("funnel") && (
            <Section title="Admission funnel" className={show("revenue") ? "" : "lg:col-span-3"}>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={funnel} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={3}>
                      {funnel.map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {funnel.map((s) => (
                  <div key={s.name} className="flex items-center gap-2 text-xs">
                    <span className="size-2.5 rounded-full" style={{ background: s.color }} />
                    <span className="text-muted-foreground">{s.name}</span>
                    <span className="ml-auto font-medium">{s.value}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}

      {(show("attendance") || show("tasks")) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {show("attendance") && (
            <Section title="Weekly attendance" className="lg:col-span-2">
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendance}>
                    <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="d" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                    />
                    <Bar dataKey="p" radius={[6, 6, 0, 0]} fill="var(--color-primary)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Section>
          )}

          {show("tasks") && (
            <Section
              title="Tasks & reminders"
              className={show("attendance") ? "" : "lg:col-span-3"}
              action={<button className="text-xs text-primary font-medium hover:underline">All</button>}
            >
              <ul className="space-y-2.5">
                {tasks.map((t, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <CheckCircle2
                      className={`size-4 mt-0.5 ${t.done ? "text-success" : "text-muted-foreground"}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className={t.done ? "line-through text-muted-foreground" : ""}>{t.t}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{t.due}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      )}

      {(show("activity") || show("ai")) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {show("activity") && (
            <Section title="Recent activity" className="lg:col-span-2">
              <ul className="divide-y divide-border -my-3">
                {activity.map((a, i) => (
                  <li key={i} className="py-3 flex items-center gap-3">
                    <div className="size-9 rounded-full bg-secondary grid place-items-center text-xs font-semibold text-secondary-foreground shrink-0">
                      {a.who.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">
                        <span className="font-medium">{a.who}</span>{" "}
                        <span className="text-muted-foreground">{a.action}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">{a.time}</div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
                      {a.tag}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {show("ai") && (
            <Section
              title="AI insight"
              action={<span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">BETA</span>}
            >
              <div className="rounded-lg gradient-soft p-4 border border-border/60">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                  <AlertCircle className="size-4" /> Risk alert
                </div>
                <p className="text-sm mt-2 leading-relaxed">
                  <span className="font-semibold">28 students</span> across Grade 9 are predicted to drop below 75% attendance this term.
                  Recommended: schedule parent calls and assign mentors.
                </p>
                <Button size="sm" variant="outline" className="mt-3 gap-1.5">
                  View students <ArrowRight className="size-3.5" />
                </Button>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <p className="text-muted-foreground">
                  <span className="text-foreground font-medium">Conversion ↑ 6%:</span> WhatsApp follow-ups outperformed email by 2.3× this week.
                </p>
                <p className="text-muted-foreground">
                  <span className="text-foreground font-medium">Fee collection:</span> 92% likely to hit ₹52L target by Sep 30.
                </p>
              </div>
            </Section>
          )}
        </div>
      )}
    </div>
  );
}
