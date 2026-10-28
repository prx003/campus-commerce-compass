import { createFileRoute } from "@tanstack/react-router";
import { Users, BookOpen, Briefcase, ClipboardList } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { ATTENDANCE_TREND, PROGRAM_DISTRIBUTION, STUDENTS } from "@/components/academic/data";

export const Route = createFileRoute("/_app/academic/")({
  component: AcademicDashboard,
});

const COLORS = ["#2563eb", "#16a34a", "#9333ea", "#ea580c", "#0891b2"];

function SummaryCard({
  label, value, icon: Icon, tone,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  tone: "blue" | "green" | "purple" | "orange";
}) {
  const toneMap = {
    blue: "bg-blue-50 text-blue-600 ring-blue-100",
    green: "bg-green-50 text-green-600 ring-green-100",
    purple: "bg-purple-50 text-purple-600 ring-purple-100",
    orange: "bg-orange-50 text-orange-600 ring-orange-100",
  } as const;
  return (
    <div className="rounded-xl bg-card border border-border p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</div>
          <div className="mt-2 text-3xl font-bold tracking-tight tabular-nums">{value}</div>
        </div>
        <div className={`size-11 rounded-xl grid place-items-center ring-4 ${toneMap[tone]}`}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

function AcademicDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of academic operations for the current term</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Total Students" value={STUDENTS.length} icon={Users} tone="blue" />
        <SummaryCard label="Active Courses" value={5} icon={BookOpen} tone="green" />
        <SummaryCard label="Faculty Members" value={42} icon={Briefcase} tone="purple" />
        <SummaryCard label="Assessments" value={28} icon={ClipboardList} tone="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl bg-card border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Attendance Trend</h3>
              <p className="text-xs text-muted-foreground">Last 14 days</p>
            </div>
            <div className="text-xs text-muted-foreground">0 – 100%</div>
          </div>
          {ATTENDANCE_TREND.length === 0 ? (
            <div className="h-64 grid place-items-center text-sm text-muted-foreground">No attendance data available</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ATTENDANCE_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef0f3" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="pct" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-xl bg-card border border-border p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-semibold">Program Distribution</h3>
            <p className="text-xs text-muted-foreground">Students per course</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={PROGRAM_DISTRIBUTION} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                  {PROGRAM_DISTRIBUTION.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
