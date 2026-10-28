import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, Award, TrendingUp, Plus } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, Section, StatCard } from "@/components/ui/page";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/exams")({
  component: Exams,
});

const subjects = [
  { s: "Math", avg: 78, top: 98 },
  { s: "Science", avg: 82, top: 99 },
  { s: "English", avg: 85, top: 96 },
  { s: "Social", avg: 74, top: 94 },
  { s: "Hindi", avg: 80, top: 95 },
  { s: "Computer", avg: 88, top: 100 },
];

const trend = [
  { t: "T1 22", v: 71 }, { t: "T2 22", v: 74 }, { t: "T3 22", v: 76 },
  { t: "T1 23", v: 78 }, { t: "T2 23", v: 81 }, { t: "T3 23", v: 83 },
  { t: "T1 24", v: 85 },
];

const grades = [
  { name: "Aarohi Singh", cls: "Grade 3-A", marks: 96, grade: "A+" },
  { name: "Ishaan Rao", cls: "Grade 12-B", marks: 89, grade: "A" },
  { name: "Reyansh Iyer", cls: "Grade 8-A", marks: 72, grade: "B+" },
  { name: "Myra Gupta", cls: "Grade 5-C", marks: 84, grade: "A" },
  { name: "Saanvi Joshi", cls: "Grade 2-B", marks: 91, grade: "A+" },
];

function gradeColor(g: string) {
  if (g.startsWith("A")) return "bg-success/10 text-success";
  if (g.startsWith("B")) return "bg-primary/10 text-primary";
  return "bg-warning/15 text-warning-foreground";
}

function Exams() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Examinations"
        subtitle="Mid-Term · September 2025"
        actions={<Button size="sm" className="gap-1.5"><Plus className="size-4" /> Enter grades</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Avg score" value="83.4%" delta="2.1%" icon={TrendingUp} />
        <StatCard label="Top scorer" value="98.6%" icon={Award} accent="success" />
        <StatCard label="Pass rate" value="96.2%" delta="0.4%" icon={ClipboardList} accent="success" />
        <StatCard label="At risk" value="42" delta="8" icon={ClipboardList} accent="destructive" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Subject performance">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjects}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="s" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="avg" radius={[6, 6, 0, 0]} fill="var(--color-primary)" />
                <Bar dataKey="top" radius={[6, 6, 0, 0]} fill="var(--color-chart-2)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>
        <Section title="Average score trend">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="t" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="v" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--color-primary)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      <Section title="Top performers">
        <ul className="divide-y divide-border -my-3">
          {grades.map((g) => (
            <li key={g.name} className="py-3 flex items-center gap-3">
              <div className="size-9 rounded-full bg-secondary grid place-items-center text-xs font-semibold">
                {g.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{g.name}</div>
                <div className="text-xs text-muted-foreground">{g.cls}</div>
              </div>
              <div className="text-sm font-semibold tabular-nums">{g.marks}%</div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded w-9 text-center ${gradeColor(g.grade)}`}>{g.grade}</span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
