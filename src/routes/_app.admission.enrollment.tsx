import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, GraduationCap, Hash, Layers, UserCheck } from "lucide-react";
import { Section, StatCard } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubTabs } from "./_app.admission";

export const Route = createFileRoute("/_app/admission/enrollment")({
  component: EnrollmentPage,
});

const SUBS = ["Accept Offer", "Assign Department / Program", "Assign Roll Number", "Assign Section / Batch", "Convert to Student Record"];

const PIPELINE = [
  { id: "APP-9014", n: "Diya Nair", g: "KG-2", st: "Offer accepted" },
  { id: "APP-9015", n: "Kabir Mehta", g: "Grade 4", st: "Department assigned" },
  { id: "APP-9012", n: "Riya Patel", g: "Grade 6", st: "Roll assigned" },
  { id: "APP-9020", n: "Aarav Sharma", g: "Grade 9", st: "Section assigned" },
];

function EnrollmentPage() {
  const [sub, setSub] = useState(SUBS[0]);
  return (
    <div className="space-y-4">
      <SubTabs items={SUBS} value={sub} onChange={setSub} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Offers accepted" value="78" icon={UserCheck} accent="success" />
        <StatCard label="Programs assigned" value="64" icon={Layers} accent="primary" />
        <StatCard label="Roll numbers issued" value="58" icon={Hash} />
        <StatCard label="Converted to students" value="52" icon={GraduationCap} accent="warning" />
      </div>

      {sub === "Accept Offer" && (
        <Section title="Pending offer acceptance">
          <ul className="divide-y divide-border -my-2">
            {PIPELINE.map((p) => (
              <li key={p.id} className="py-3 flex items-center gap-3">
                <div className="font-mono text-xs text-primary font-semibold">{p.id}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{p.n}</div>
                  <div className="text-xs text-muted-foreground">{p.g}</div>
                </div>
                <Button size="sm" variant="outline">Decline</Button>
                <Button size="sm" className="gap-1.5"><CheckCircle2 className="size-4" /> Accept</Button>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {sub === "Assign Department / Program" && (
        <Section title="Assign program">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
            {[
              ["Applicant", "Diya Nair (APP-9014)"],
              ["Department", "Primary School"],
              ["Program / Stream", "General"],
              ["Academic year", "2026 – 27"],
            ].map(([l, p]) => (
              <div key={l} className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{l}</label>
                <Input placeholder={p} className="h-9 text-sm" />
              </div>
            ))}
            <div className="md:col-span-2"><Button size="sm">Assign program</Button></div>
          </div>
        </Section>
      )}

      {sub === "Assign Roll Number" && (
        <Section title="Roll number assignment">
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Applicant</th>
                  <th className="px-3 py-3 text-left font-medium">Grade</th>
                  <th className="px-3 py-3 text-left font-medium">Suggested roll</th>
                  <th className="px-5 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {PIPELINE.map((p, i) => (
                  <tr key={p.id} className="border-t border-border hover:bg-secondary/40">
                    <td className="px-5 py-3 font-medium">{p.n}</td>
                    <td className="px-3 py-3 text-muted-foreground">{p.g}</td>
                    <td className="px-3 py-3 font-mono text-xs">2026/{1024 + i}</td>
                    <td className="px-5 py-3 text-right"><Button size="sm" variant="outline">Assign</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {sub === "Assign Section / Batch" && (
        <Section title="Section / batch assignment">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {["Grade 6 – A", "Grade 6 – B", "Grade 9 – Science"].map((s) => (
              <div key={s} className="rounded-lg border border-border p-4">
                <div className="text-sm font-semibold">{s}</div>
                <div className="text-xs text-muted-foreground mt-1">Capacity 40 · Filled 32</div>
                <Button size="sm" variant="outline" className="mt-3 w-full">Add students</Button>
              </div>
            ))}
          </div>
        </Section>
      )}

      {sub === "Convert to Student Record" && (
        <Section title="Convert to student record">
          <p className="text-sm text-muted-foreground mb-3">
            Once enrollment is complete, applicants are moved out of Admissions and become permanent records inside the Students module.
          </p>
          <ul className="divide-y divide-border -my-2">
            {PIPELINE.map((p) => (
              <li key={p.id} className="py-3 flex items-center gap-3">
                <GraduationCap className="size-4 text-primary" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{p.n}</div>
                  <div className="text-xs text-muted-foreground">{p.g} · {p.st}</div>
                </div>
                <Button size="sm">Convert to student</Button>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
