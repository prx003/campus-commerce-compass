import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileCheck, Calendar, Users, MessageSquare, ClipboardCheck } from "lucide-react";
import { Section, StatCard } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubTabs } from "./_app.admission";

export const Route = createFileRoute("/_app/admission/screening")({
  component: ScreeningPage,
});

const SUBS = ["Document Verification", "Entrance Exam Management", "Interview Scheduling", "Faculty Evaluation", "Internal Remarks"];

function ScreeningPage() {
  const [sub, setSub] = useState(SUBS[0]);
  return (
    <div className="space-y-4">
      <SubTabs items={SUBS} value={sub} onChange={setSub} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending verification" value="38" icon={FileCheck} accent="warning" />
        <StatCard label="Exams scheduled" value="12" icon={ClipboardCheck} accent="primary" />
        <StatCard label="Interviews this week" value="46" icon={Calendar} />
        <StatCard label="Evaluators" value="14" icon={Users} accent="success" />
      </div>

      {sub === "Document Verification" && (
        <Section title="Document verification queue">
          <ul className="divide-y divide-border -my-2">
            {[
              { n: "Riya Patel", d: "Birth certificate, transfer cert", s: "Pending" },
              { n: "Aman Verma", d: "Address proof", s: "In Review" },
              { n: "Diya Nair", d: "All documents", s: "Verified" },
              { n: "Vivaan Shah", d: "Photo, ID proof", s: "Pending" },
            ].map((x) => (
              <li key={x.n} className="py-3 flex items-center gap-3">
                <div className="size-8 rounded-md bg-primary/10 text-primary grid place-items-center text-xs font-semibold">{x.n.split(" ").map((p) => p[0]).join("")}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{x.n}</div>
                  <div className="text-xs text-muted-foreground">{x.d}</div>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${x.s === "Verified" ? "bg-success/10 text-success" : x.s === "In Review" ? "bg-chart-2/15 text-chart-2" : "bg-warning/15 text-warning-foreground"}`}>{x.s}</span>
                <Button size="sm" variant="outline">Review</Button>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {sub === "Entrance Exam Management" && (
        <Section title="Entrance exams" action={<Button size="sm">Schedule exam</Button>}>
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Exam</th>
                  <th className="px-3 py-3 text-left font-medium">Grade</th>
                  <th className="px-3 py-3 text-left font-medium">Date</th>
                  <th className="px-3 py-3 text-right font-medium">Candidates</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Aptitude", "Grade 6", "May 18", 84, "Scheduled"],
                  ["Reasoning", "Grade 9", "May 20", 62, "Scheduled"],
                  ["English", "Grade 11", "May 12", 41, "Completed"],
                ].map((r) => (
                  <tr key={r[0] as string} className="border-t border-border hover:bg-secondary/40">
                    <td className="px-5 py-3 font-medium">{r[0]}</td>
                    <td className="px-3 py-3 text-muted-foreground">{r[1]}</td>
                    <td className="px-3 py-3 text-muted-foreground">{r[2]}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{r[3]}</td>
                    <td className="px-5 py-3"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${r[4] === "Completed" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}>{r[4]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {sub === "Interview Scheduling" && (
        <Section title="Upcoming interviews">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { t: "10:00", d: "May 14", n: "Aarav Sharma", g: "Grade 6", p: "Panel A" },
              { t: "11:30", d: "May 14", n: "Diya Nair", g: "KG-2", p: "Panel B" },
              { t: "14:00", d: "May 15", n: "Vivaan Shah", g: "Grade 7", p: "Panel A" },
              { t: "15:30", d: "May 15", n: "Saanvi Joshi", g: "Grade 2", p: "Panel C" },
            ].map((i) => (
              <div key={i.n} className="rounded-lg border border-border p-3 flex items-center gap-3">
                <div className="size-12 rounded-md bg-primary/10 text-primary grid place-items-center">
                  <div className="text-[10px] font-semibold">{i.d}</div>
                  <div className="text-xs font-bold -mt-0.5">{i.t}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{i.n}</div>
                  <div className="text-xs text-muted-foreground">{i.g} · {i.p}</div>
                </div>
                <Button size="sm" variant="outline">Reschedule</Button>
              </div>
            ))}
          </div>
        </Section>
      )}

      {sub === "Faculty Evaluation" && (
        <Section title="Faculty evaluation scores">
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Applicant</th>
                  <th className="px-3 py-3 text-left font-medium">Evaluator</th>
                  <th className="px-3 py-3 text-right font-medium">Aptitude</th>
                  <th className="px-3 py-3 text-right font-medium">Communication</th>
                  <th className="px-5 py-3 text-right font-medium">Overall</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Riya Patel", "Mr. Khanna", 84, 78, 82],
                  ["Diya Nair", "Ms. Iyer", 91, 88, 90],
                  ["Vivaan Shah", "Mr. Khanna", 76, 72, 74],
                ].map((r) => (
                  <tr key={r[0] as string} className="border-t border-border hover:bg-secondary/40">
                    <td className="px-5 py-3 font-medium">{r[0]}</td>
                    <td className="px-3 py-3 text-muted-foreground">{r[1]}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{r[2]}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{r[3]}</td>
                    <td className="px-5 py-3 text-right tabular-nums font-semibold">{r[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {sub === "Internal Remarks" && (
        <Section title="Internal remarks" action={<Button size="sm" className="gap-1.5"><MessageSquare className="size-4" /> Add remark</Button>}>
          <Input placeholder="Add a quick remark…" className="mb-3" />
          <ul className="space-y-3">
            {[
              { a: "Mr. Khanna", n: "Riya Patel", t: "Strong logical reasoning, recommend offer.", d: "2h ago" },
              { a: "Ms. Iyer", n: "Diya Nair", t: "Excellent communication, top of cohort.", d: "5h ago" },
              { a: "Dean", n: "Vivaan Shah", t: "Borderline case — schedule a second round.", d: "Yesterday" },
            ].map((r, i) => (
              <li key={i} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{r.a} <span className="text-muted-foreground font-normal">on</span> {r.n}</div>
                  <div className="text-[11px] text-muted-foreground">{r.d}</div>
                </div>
                <div className="text-sm text-muted-foreground mt-1">{r.t}</div>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
