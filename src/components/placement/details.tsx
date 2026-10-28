// @ts-nocheck
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Pencil, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDB, byId, eligibleFor, isEligible, upsert, type Rec } from "@/components/placement/lib/store";
import { SECTIONS, STATUS, refLabel, type RoleId } from "@/components/placement/lib/config";
import { DataTable, RecordDialog, StatusBadge, NavLinkTo } from "./crud";

function Shell({ role, back, title, sub, badge, onEdit, children }: { role: RoleId; back: string; title: string; sub?: string; badge?: string; onEdit?: () => void; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <Link to="/placement/$role/$section" params={{ role, section: back }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Back to {SECTIONS[back]?.title ?? "list"}</Link>
      <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-5">
        <div><div className="flex items-center gap-3"><h1 className="font-display text-2xl font-semibold">{title}</h1>{badge && <StatusBadge value={badge} />}</div>{sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}</div>
        {onEdit && <Button variant="outline" onClick={onEdit}><Pencil className="size-4" />Edit</Button>}
      </div>
      {children}
    </div>
  );
}
function Info({ items }: { items: [string, any][] }) {
  return <dl className="grid gap-x-8 gap-y-4 rounded-lg border bg-card p-5 sm:grid-cols-2 lg:grid-cols-4">{items.map(([k, v]) => <div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="mt-0.5 text-sm font-medium">{v || "—"}</dd></div>)}</dl>;
}
function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h2 className="mb-3 text-sm font-semibold">{title}</h2>{children}</section>;
}

export function Detail({ role, sectionId, id }: { role: RoleId; sectionId: string; id: string }) {
  const db = useDB();
  const section = SECTIONS[sectionId];
  const rec = byId(db, section?.collection, id);
  const [edit, setEdit] = useState(false);
  if (!section || !rec) return <p className="text-muted-foreground">Record not found.</p>;
  const canEdit = section.editors.includes(role);
  const editDlg = edit && <RecordDialog open onOpenChange={setEdit} section={section} initial={rec} title={`Edit ${section.title}`} />;
  const oe = canEdit ? () => setEdit(true) : undefined;
  const table = (sid: string, rows: Rec[]) => <DataTable rows={rows} section={SECTIONS[sid]} role={role} sectionId={sid} empty="Nothing recorded." />;

  if (section.detail === "company") {
    return (
      <Shell role={role} back={sectionId} title={rec.name} sub={`${rec.industry} · ${rec.location}`} badge={rec.relationship} onEdit={oe}>
        <Info items={[["Industry", rec.industry], ["Location", rec.location], ["Website", rec.website], ["Contact person", rec.contactName], ["Email", rec.contactEmail], ["Phone", rec.contactPhone]]} />
        <Block title="Opportunities">{table("placement-opps", db.opportunities.filter((o) => o.companyId === id))}</Block>
        <Block title="Placement drives">{table("drives", db.drives.filter((d) => d.companyId === id))}</Block>
        <Block title="Outreach history">{table("outreach", db.outreach.filter((o) => o.companyId === id))}</Block>
        <Block title="MOUs">{table("mous", db.mous.filter((o) => o.companyId === id))}</Block>
        {editDlg}
      </Shell>
    );
  }

  if (section.detail === "drive") {
    const company = byId(db, "companies", rec.companyId);
    const opp = byId(db, "opportunities", rec.opportunityId);
    const apps = db.applications.filter((a) => a.driveId === id);
    const registered = new Set(apps.map((a) => a.studentId));
    const notReg = eligibleFor(db, rec).filter((s) => !registered.has(s.id));
    const n = (s: string[]) => apps.filter((a) => s.includes(a.stage)).length;
    return (
      <Shell role={role} back={sectionId} title={`${company?.name} — ${rec.role}`} sub={`${rec.date} · ${rec.venue ?? ""}`} badge={rec.status} onEdit={oe}>
        <Info items={[["Company", company?.name], ["Job role", rec.role], ["Eligibility", `CGPA ≥ ${rec.minCgpa} · ${rec.courses}`], ["Vacancies", rec.vacancies], ["Package", opp?.package], ["Registered", apps.length], ["Shortlisted+", n(["Shortlisted", "Interview", "Selected", "Offer"])], ["Selected / Offers", `${n(["Selected", "Offer"])} / ${db.offers.filter((o) => o.driveId === id).length}`]]} />
        <Block title="Registered students & recruitment stage">{table("recruitment", apps)}</Block>
        <Block title={`Eligible students not yet registered (${notReg.length})`}>
          <div className="overflow-hidden rounded-lg border bg-card divide-y">
            {notReg.length === 0 && <p className="p-4 text-sm text-muted-foreground">All eligible students are registered.</p>}
            {notReg.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <div><span className="font-medium">{s.name}</span> <span className="text-muted-foreground">· {s.course} · CGPA {s.cgpa}</span></div>
                <div className="flex items-center gap-3"><StatusBadge value={s.readiness} />{role === "officer" && <Button size="sm" variant="outline" onClick={() => { upsert("applications", { driveId: id, studentId: s.id, stage: "Registered", updated: new Date().toISOString().slice(0, 10) }); toast.success(`${s.name} registered`); }}><UserPlus className="size-3.5" />Register</Button>}</div>
              </div>
            ))}
          </div>
        </Block>
        <Block title="Offers">{table("offers", db.offers.filter((o) => o.driveId === id))}</Block>
        {editDlg}
      </Shell>
    );
  }

  if (section.detail === "student") {
    const apps = db.applications.filter((a) => a.studentId === id);
    const eligible = db.drives.filter((d) => isEligible(rec, d));
    return (
      <Shell role={role} back={sectionId} title={rec.name} sub={`${rec.rollNo} · ${rec.course} · ${rec.year}`} badge={rec.readiness} onEdit={oe}>
        <Info items={[["Student ID", rec.rollNo], ["Course", rec.course], ["Year / semester", rec.year], ["CGPA", rec.cgpa], ["Email", rec.email], ["Resume status", <StatusBadge value={rec.resumeStatus} />], ["Readiness", <StatusBadge value={rec.readiness} />], ["Offers", db.offers.filter((o) => o.studentId === id).length]]} />
        <Block title="Eligible drives">
          <div className="flex flex-wrap gap-2">{eligible.length === 0 ? <span className="text-sm text-muted-foreground">None</span> : eligible.map((d) => <span key={d.id} className="rounded-md border bg-card px-3 py-1.5 text-sm">{refLabel(db, "drives", d)}{registeredMark(apps, d.id)}</span>)}</div>
        </Block>
        <Block title="Registered drives & recruitment stage">{table("recruitment", apps)}</Block>
        <Block title="Resume reviews">{table("resumes", db.resumeReviews.filter((r) => r.studentId === id))}</Block>
        <Block title="Mock interviews">{table("mocks", db.mockInterviews.filter((r) => r.studentId === id))}</Block>
        <Block title="Career guidance">{table("guidance", db.guidance.filter((r) => r.studentId === id))}</Block>
        <Block title="Alumni support">{table("mentorship", db.mentorships.filter((r) => r.studentId === id))}</Block>
        <Block title="Offers">{table("offers", db.offers.filter((r) => r.studentId === id))}</Block>
        {editDlg}
      </Shell>
    );
  }

  const statusVal = rec.status ?? rec.stage;
  return (
    <Shell role={role} back={sectionId} title={section.columns[0] ? String(section.columns[0].get(rec, db)) : section.title} sub={section.title} badge={statusVal} onEdit={oe}>
      <Info items={section.fields.map((f) => [f.label, f.ref ? (() => { const r = byId(db, f.ref!, rec[f.key]); return r ? refLabel(db, f.ref!, r) : "—"; })() : rec[f.key]])} />
      {rec.companyId && <p className="text-sm">Company: <NavLinkTo role={role} section="companies" id={rec.companyId}>{byId(db, "companies", rec.companyId)?.name}</NavLinkTo></p>}
      {editDlg}
    </Shell>
  );
}
const registeredMark = (apps: Rec[], driveId: string) => { const a = apps.find((x) => x.driveId === driveId); return a ? <span className="ml-2 text-xs text-muted-foreground">· {a.stage}</span> : null; };
void STATUS;
