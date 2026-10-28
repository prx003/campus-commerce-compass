import { createFileRoute } from "@tanstack/react-router";
import { Users, Wallet, CalendarDays, Gauge, CalendarCheck, Briefcase } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { PageHeader, Section, StatCard } from "@/components/ui/page";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useHR, computePayroll, inr } from "@/components/hr/store";

export const Route = createFileRoute("/_app/hr/")({
  component: Dashboard,
});

const chartConfig = {
  count: { label: "Employees", color: "var(--chart-1)" },
};

function Dashboard() {
  const { employees, attendance, leaves, evaluations } = useHR();

  const present = Object.values(attendance).filter((s) => s === "Present").length;
  const absent = Object.values(attendance).filter((s) => s === "Absent").length;
  const onLeave = Object.values(attendance).filter((s) => s === "Leave").length;
  const pendingLeaves = leaves.filter((l) => l.status === "Pending").length;
  const payrollTotal = employees.reduce((s, e) => s + computePayroll(e).net, 0);
  const avgKpi = evaluations.length
    ? Math.round(evaluations.reduce((s, e) => s + e.kpi, 0) / evaluations.length)
    : 0;

  const byDept = Object.entries(
    employees.reduce<Record<string, number>>((acc, e) => {
      acc[e.dept] = (acc[e.dept] || 0) + 1;
      return acc;
    }, {}),
  ).map(([dept, count]) => ({ dept, count }));

  const attData = [
    { name: "Present", value: present, color: "hsl(142 71% 45%)" },
    { name: "Absent", value: absent, color: "hsl(0 72% 51%)" },
    { name: "On Leave", value: onLeave, color: "hsl(38 92% 50%)" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="HR Dashboard"
        subtitle={`${employees.length} employees · payroll cycle ${new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total employees" value={String(employees.length)} icon={Users} />
        <StatCard label="Present today" value={`${present}/${employees.length}`} icon={CalendarCheck} accent="success" />
        <StatCard label="Pending leaves" value={String(pendingLeaves)} icon={CalendarDays} accent="warning" />
        <StatCard label="Net payroll" value={inr(payrollTotal)} icon={Wallet} accent="primary" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Avg KPI score" value={`${avgKpi}%`} icon={Gauge} accent="success" />
        <StatCard label="On leave today" value={String(onLeave)} icon={CalendarDays} accent="warning" />
        <StatCard label="Absent today" value={String(absent)} icon={Briefcase} accent="destructive" />
        <StatCard label="Departments" value={String(byDept.length)} icon={Briefcase} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Section title="Headcount by department" className="lg:col-span-2">
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <BarChart data={byDept}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="dept" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </Section>

        <Section title="Attendance summary">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={attData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {attData.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5">
            {attData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ background: d.color }} />
                  {d.name}
                </span>
                <span className="font-semibold tabular-nums">{d.value}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
