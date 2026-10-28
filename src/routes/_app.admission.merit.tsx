import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trophy, Award, ListOrdered, Mail, FileText } from "lucide-react";
import { Section, StatCard } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { SubTabs } from "./_app.admission";

export const Route = createFileRoute("/_app/admission/merit")({
  component: MeritPage,
});

const SUBS = ["Generate Merit List", "Rank List", "Shortlisted Candidates", "Seat Allocation", "Offer Letter Generation"];

const RANKED = [
  { r: 1, n: "Diya Nair", g: "KG-2", s: 91, st: "Shortlisted" },
  { r: 2, n: "Riya Patel", g: "Grade 6", s: 84, st: "Shortlisted" },
  { r: 3, n: "Kabir Mehta", g: "Grade 4", s: 88, st: "Allocated" },
  { r: 4, n: "Vivaan Shah", g: "Grade 7", s: 76, st: "Waitlist" },
  { r: 5, n: "Anaya Roy", g: "Grade 11", s: 72, st: "Waitlist" },
];

function MeritPage() {
  const [sub, setSub] = useState(SUBS[0]);
  return (
    <div className="space-y-4">
      <SubTabs items={SUBS} value={sub} onChange={setSub} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="On merit list" value="248" icon={Trophy} accent="primary" />
        <StatCard label="Shortlisted" value="142" icon={Award} accent="success" />
        <StatCard label="Seats allocated" value="96" icon={ListOrdered} />
        <StatCard label="Offers sent" value="84" icon={Mail} accent="warning" />
      </div>

      {sub === "Generate Merit List" && (
        <Section title="Generate merit list" action={<Button size="sm" className="gap-1.5"><FileText className="size-4" /> Generate</Button>}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              ["Program / Grade", "Grade 6"],
              ["Cycle", "2026 – Cycle A"],
              ["Weighting", "Exam 60% · Interview 40%"],
            ].map(([l, v]) => (
              <div key={l} className="rounded-lg border border-border p-3">
                <div className="text-[11px] text-muted-foreground">{l}</div>
                <div className="text-sm font-semibold mt-1">{v}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {(sub === "Rank List" || sub === "Shortlisted Candidates") && (
        <Section title={sub}>
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Rank</th>
                  <th className="px-3 py-3 text-left font-medium">Candidate</th>
                  <th className="px-3 py-3 text-left font-medium">Grade</th>
                  <th className="px-3 py-3 text-right font-medium">Score</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {(sub === "Shortlisted Candidates" ? RANKED.filter((r) => r.st === "Shortlisted") : RANKED).map((r) => (
                  <tr key={r.r} className="border-t border-border hover:bg-secondary/40">
                    <td className="px-5 py-3 font-mono text-xs text-primary font-semibold">#{r.r}</td>
                    <td className="px-3 py-3 font-medium">{r.n}</td>
                    <td className="px-3 py-3 text-muted-foreground">{r.g}</td>
                    <td className="px-3 py-3 text-right tabular-nums font-semibold">{r.s}</td>
                    <td className="px-5 py-3"><span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">{r.st}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {sub === "Seat Allocation" && (
        <Section title="Seat allocation by program">
          <div className="space-y-2">
            {[
              { p: "Grade 6 – Section A", t: 40, f: 32 },
              { p: "Grade 6 – Section B", t: 40, f: 38 },
              { p: "Grade 9 – Science", t: 30, f: 12 },
              { p: "Grade 11 – Commerce", t: 35, f: 28 },
            ].map((s) => {
              const pct = Math.round((s.f / s.t) * 100);
              return (
                <div key={s.p} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{s.p}</span>
                    <span className="tabular-nums text-muted-foreground">{s.f}/{s.t}</span>
                  </div>
                  <div className="h-1.5 mt-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {sub === "Offer Letter Generation" && (
        <Section title="Offer letters" action={<Button size="sm" className="gap-1.5"><Mail className="size-4" /> Generate batch</Button>}>
          <ul className="divide-y divide-border -my-2">
            {RANKED.slice(0, 4).map((r) => (
              <li key={r.r} className="py-3 flex items-center gap-3">
                <div className="size-8 rounded-md bg-success/10 text-success grid place-items-center"><Mail className="size-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{r.n}</div>
                  <div className="text-xs text-muted-foreground">Offer for {r.g} · Cycle 2026-A</div>
                </div>
                <Button size="sm" variant="outline">Preview</Button>
                <Button size="sm">Send</Button>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
