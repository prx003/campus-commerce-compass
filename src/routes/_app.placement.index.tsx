import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, GraduationCap, Handshake, Target, Users } from "lucide-react";
import { ROLES, type RoleId } from "@/components/placement/lib/config";

export const Route = createFileRoute("/_app/placement/")({
  head: () => ({
    meta: [
      { title: "Placements & Career Services — Edusphere" },
      { name: "description", content: "Connected placement portal: companies, opportunities, drives, student preparation, recruitment and offers." },
      { property: "og:title", content: "Placements & Career Services — Edusphere" },
      { property: "og:description", content: "One connected placement workflow for the Placement Office, Industry Relations, Career Counseling and Alumni Relations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const icon: Record<RoleId, any> = { officer: Target, industry: Building2, counselor: Users, alumni: Handshake };
const blurb: Record<RoleId, string> = {
  officer: "Review opportunities, run drives, track recruitment and maintain final offers.",
  industry: "Manage companies, outreach, MOUs and submit placement & internship opportunities.",
  counselor: "Review resumes, conduct mock interviews and guidance, mark student readiness.",
  alumni: "Maintain the alumni directory, record referrals and mentorship for students.",
};

function Index() {
  return (
    <div className="bg-background">
      <div className="max-w-5xl py-2">
        <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground"><GraduationCap className="size-5" /></div><div><div className="font-semibold">Edusphere</div><div className="text-sm text-muted-foreground">College Management Portal</div></div></div>
        <h1 className="mt-6 font-display text-xl font-semibold">Placements & Career Services</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground"></p>
        <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Open workspace as</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(Object.keys(ROLES) as RoleId[]).map((r) => { const I = icon[r]; return (
            <Link key={r} to="/placement/$role" params={{ role: r }} className="group flex gap-4 rounded-lg border bg-card p-5 transition-colors hover:border-primary">
              <div className="grid size-10 shrink-0 place-items-center rounded-md bg-accent text-accent-foreground"><I className="size-5" /></div>
              <div className="flex-1"><div className="flex items-center justify-between font-semibold">{ROLES[r].label}</div><p className="mt-1 text-sm text-muted-foreground">{blurb[r]}</p><p className="mt-2 text-xs text-muted-foreground">{ROLES[r].person}</p></div>
            </Link>
          ); })}
        </div>
      </div>
    </div>
  );
}
