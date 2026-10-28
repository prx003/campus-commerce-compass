import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Settings as SettingsIcon } from "lucide-react";
import { Section } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubTabs } from "./_app.admission";

export const Route = createFileRoute("/_app/admission/settings")({
  component: SettingsPage,
});

const SUBS = ["Admission Cycle", "Programs & Specializations", "Seat Capacity", "Reservation / Quota", "Required Documents", "Application Form Builder", "Admission Status Control"];

function Toggle({ on }: { on: boolean }) {
  return (
    <span className={`inline-flex h-5 w-9 items-center rounded-full p-0.5 transition ${on ? "bg-primary" : "bg-muted"}`}>
      <span className={`size-4 rounded-full bg-card shadow-soft transition ${on ? "translate-x-4" : ""}`} />
    </span>
  );
}

function SettingsPage() {
  const [sub, setSub] = useState(SUBS[0]);
  return (
    <div className="space-y-4">
      <SubTabs items={SUBS} value={sub} onChange={setSub} />

      {sub === "Admission Cycle" && (
        <Section title="Admission cycle" action={<Button size="sm" className="gap-1.5"><Plus className="size-4" /> New cycle</Button>}>
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Cycle</th>
                  <th className="px-3 py-3 text-left font-medium">Window</th>
                  <th className="px-3 py-3 text-left font-medium">Programs</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["2026 – Cycle A", "Mar 01 – Jun 30, 2026", "All grades", "Active"],
                  ["2025 – Cycle B", "Sep 01 – Nov 30, 2025", "Grade 11 only", "Closed"],
                  ["2026 – Cycle B", "Sep 01 – Nov 30, 2026", "Grade 9, 11", "Draft"],
                ].map((r) => (
                  <tr key={r[0]} className="border-t border-border hover:bg-secondary/40">
                    <td className="px-5 py-3 font-medium">{r[0]}</td>
                    <td className="px-3 py-3 text-muted-foreground">{r[1]}</td>
                    <td className="px-3 py-3 text-muted-foreground">{r[2]}</td>
                    <td className="px-5 py-3"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${r[3] === "Active" ? "bg-success/10 text-success" : r[3] === "Draft" ? "bg-warning/15 text-warning-foreground" : "bg-muted text-muted-foreground"}`}>{r[3]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {sub === "Programs & Specializations" && (
        <Section title="Programs & specializations" action={<Button size="sm" className="gap-1.5"><Plus className="size-4" /> Add program</Button>}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { p: "Grade 6 – 8", s: ["General"] },
              { p: "Grade 9 – 10", s: ["General", "Hindi", "Sanskrit"] },
              { p: "Grade 11 – 12", s: ["Science", "Commerce", "Humanities"] },
            ].map((g) => (
              <div key={g.p} className="rounded-lg border border-border p-4">
                <div className="text-sm font-semibold">{g.p}</div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {g.s.map((x) => (
                    <span key={x} className="text-[11px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">{x}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {sub === "Seat Capacity" && (
        <Section title="Seat capacity">
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Program</th>
                  <th className="px-3 py-3 text-right font-medium">Sections</th>
                  <th className="px-3 py-3 text-right font-medium">Per section</th>
                  <th className="px-5 py-3 text-right font-medium">Total seats</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["KG", 3, 25, 75], ["Primary (1-5)", 8, 35, 280], ["Middle (6-8)", 6, 40, 240], ["Secondary (9-10)", 4, 40, 160], ["Senior (11-12)", 6, 35, 210],
                ].map((r) => (
                  <tr key={r[0] as string} className="border-t border-border hover:bg-secondary/40">
                    <td className="px-5 py-3 font-medium">{r[0]}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{r[1]}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{r[2]}</td>
                    <td className="px-5 py-3 text-right tabular-nums font-semibold">{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {sub === "Reservation / Quota" && (
        <Section title="Reservation / quota rules">
          <div className="space-y-2">
            {[
              ["General", 50], ["OBC", 27], ["SC", 15], ["ST", 5], ["EWS", 10], ["Staff ward", 3],
            ].map(([n, p]) => (
              <div key={n as string} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="flex-1 text-sm font-medium">{n}</div>
                <div className="flex-1 max-w-xs"><div className="h-1.5 rounded-full bg-secondary overflow-hidden"><div className="h-full bg-primary" style={{ width: `${p}%` }} /></div></div>
                <div className="w-16 text-right tabular-nums text-sm font-semibold">{p}%</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {sub === "Required Documents" && (
        <Section title="Required documents" action={<Button size="sm" className="gap-1.5"><Plus className="size-4" /> Add document</Button>}>
          <ul className="divide-y divide-border -my-2">
            {[
              ["Birth certificate", true], ["Previous transfer certificate", true], ["Aadhaar / ID proof", true], ["Address proof", true], ["Passport-size photo", true], ["Caste certificate (if applicable)", false],
            ].map(([n, on]) => (
              <li key={n as string} className="py-3 flex items-center gap-3">
                <div className="flex-1 text-sm font-medium">{n}</div>
                <span className="text-xs text-muted-foreground">Required</span>
                <Toggle on={!!on} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {sub === "Application Form Builder" && (
        <Section title="Application form fields" action={<Button size="sm" className="gap-1.5"><Plus className="size-4" /> Add field</Button>}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {["Applicant name", "Date of birth", "Gender", "Parent name", "Parent contact", "Email", "Address", "Previous school", "Applying for grade", "Category"].map((f) => (
              <div key={f} className="flex items-center gap-2 rounded-lg border border-border p-2.5">
                <SettingsIcon className="size-4 text-muted-foreground" />
                <Input defaultValue={f} className="h-8 text-sm border-0 focus-visible:ring-0 px-1" />
                <span className="text-[11px] text-muted-foreground">Required</span>
                <Toggle on />
              </div>
            ))}
          </div>
        </Section>
      )}

      {sub === "Admission Status Control" && (
        <Section title="Admission status control">
          <ul className="divide-y divide-border -my-2">
            {[
              ["Accept new applications", true],
              ["Allow online entrance exam", true],
              ["Auto-generate roll numbers", true],
              ["Send offer letter via email", true],
              ["Allow waitlist", false],
              ["Lock fee structure for active cycle", true],
            ].map(([n, on]) => (
              <li key={n as string} className="py-3 flex items-center gap-3">
                <div className="flex-1 text-sm font-medium">{n}</div>
                <Toggle on={!!on} />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
