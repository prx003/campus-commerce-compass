import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download } from "lucide-react";
import { Section } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { SubTabs } from "./_app.admission";

export const Route = createFileRoute("/_app/admission/reports")({
  component: ReportsPage,
});

const SUBS = ["Program-wise", "Category-wise", "Gender Distribution", "Revenue Report", "Conversion Rate", "Export Reports"];

const COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

function ReportsPage() {
  const [sub, setSub] = useState(SUBS[0]);

  const program = [
    { n: "KG", v: 64 }, { n: "Primary", v: 142 }, { n: "Middle", v: 96 }, { n: "Secondary", v: 78 }, { n: "Senior", v: 52 },
  ];
  const category = [
    { name: "General", value: 218 }, { name: "OBC", value: 96 }, { name: "SC", value: 62 }, { name: "ST", value: 28 }, { name: "EWS", value: 38 },
  ];
  const gender = [{ name: "Boys", value: 248 }, { name: "Girls", value: 232 }, { name: "Other", value: 4 }];
  const revenue = [
    { m: "Jan", v: 120 }, { m: "Feb", v: 165 }, { m: "Mar", v: 198 }, { m: "Apr", v: 240 }, { m: "May", v: 282 },
  ];
  const conv = [
    { m: "Inquiry", v: 1240, p: 100 }, { m: "Applied", v: 612, p: 49 }, { m: "Offered", v: 184, p: 15 }, { m: "Enrolled", v: 142, p: 11 },
  ];

  return (
    <div className="space-y-4">
      <SubTabs items={SUBS} value={sub} onChange={setSub} />

      {sub === "Program-wise" && (
        <Section title="Program-wise admissions">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={program}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="n" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="v" radius={[6, 6, 0, 0]}>
                  {program.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>
      )}

      {(sub === "Category-wise" || sub === "Gender Distribution") && (
        <Section title={sub === "Category-wise" ? "Category-wise admissions" : "Gender distribution"}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sub === "Category-wise" ? category : gender} dataKey="value" nameKey="name" outerRadius={100} innerRadius={56} paddingAngle={2}>
                  {(sub === "Category-wise" ? category : gender).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Section>
      )}

      {sub === "Revenue Report" && (
        <Section title="Admission revenue (₹ Lakh)">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="v" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>
      )}

      {sub === "Conversion Rate" && (
        <Section title="Enrollment conversion funnel">
          <div className="space-y-3">
            {conv.map((c) => (
              <div key={c.m}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{c.m}</span>
                  <span className="tabular-nums text-muted-foreground">{c.v.toLocaleString()} · {c.p}%</span>
                </div>
                <div className="h-2 mt-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${c.p}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {sub === "Export Reports" && (
        <Section title="Export reports">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {["Program-wise admissions", "Category-wise admissions", "Gender distribution", "Admission revenue", "Conversion rate", "Full admission summary"].map((r) => (
              <div key={r} className="rounded-lg border border-border p-4">
                <div className="text-sm font-medium">{r}</div>
                <div className="text-xs text-muted-foreground mt-1">CSV · XLSX · PDF</div>
                <Button size="sm" variant="outline" className="mt-3 gap-1.5"><Download className="size-3.5" /> Export</Button>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
