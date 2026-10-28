// @ts-nocheck
import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Plus, Pencil, Trash2, Send, CheckCircle2, CalendarPlus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDB, upsert, remove, byId, getDB, type Rec, type DB } from "@/components/placement/lib/store";
import { SECTIONS, STATUS, refLabel, type Field, type RoleId, type Section } from "@/components/placement/lib/config";
import { cn } from "@/lib/utils";
import { ReportsView } from "./dashboards";

const tone: Record<string, string> = {
  Approved: "ok", Active: "ok", Ready: "ok", Selected: "ok", Offer: "ok", Accepted: "ok", Joined: "ok", Completed: "ok", Done: "ok", Open: "info", Submitted: "info", Registered: "info", "In Progress": "info", Ongoing: "info", Scheduled: "info", "Offer Received": "info",
  "Under Review": "warn", Shortlisted: "warn", Interview: "warn", "In Preparation": "warn", "Needs Revision": "warn", Pending: "warn", "Follow-up Due": "warn", "Joining Pending": "warn", "Registration Closed": "warn", Planned: "warn", Prospect: "warn",
  Cancelled: "bad", "Not Selected": "bad", Declined: "bad", "Preparation Required": "bad", Rejected: "bad", Expired: "bad", Missed: "bad",
};
export function StatusBadge({ value }: { value?: string }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  const t = tone[value] ?? "muted";
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium",
      t === "ok" && "bg-success/12 text-success", t === "info" && "bg-info/12 text-info", t === "warn" && "bg-warning/15 text-warning-foreground", t === "bad" && "bg-destructive/10 text-destructive", t === "muted" && "bg-muted text-muted-foreground")}>
      <span className="size-1.5 rounded-full bg-current" />{value}
    </span>
  );
}

export function FieldInput({ f, value, onChange, db }: { f: Field; value: any; onChange: (v: any) => void; db: DB }) {
  const cls = "h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
  if (f.type === "textarea") return <Textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={3} />;
  if (f.type === "select") {
    const opts = f.ref ? (db[f.ref] ?? []).map((r) => ({ v: r.id, l: refLabel(db, f.ref!, r) })) : (f.options ?? []).map((o) => ({ v: o, l: o || "—" }));
    return (
      <select className={cls} value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select…</option>
        {opts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    );
  }
  return <Input type={f.type ?? "text"} value={value ?? ""} onChange={(e) => onChange(f.type === "number" ? Number(e.target.value) : e.target.value)} />;
}

export function RecordDialog({ open, onOpenChange, section, initial, title }: { open: boolean; onOpenChange: (o: boolean) => void; section: Section; initial: Rec | Record<string, any>; title: string }) {
  const db = useDB();
  const [form, setForm] = useState<Record<string, any>>(initial);
  const [k, setK] = useState(initial);
  if (k !== initial) { setK(initial); setForm(initial); }
  const save = () => {
    const miss = section.fields.find((f) => f.required && !form[f.key]);
    if (miss) return toast.error(`${miss.label} is required`);
    let rec = { ...form };
    if (section.collection === "drives") {
      const o = byId(getDB(), "opportunities", rec.opportunityId);
      if (o) rec = { minCgpa: o.minCgpa, courses: o.courses, vacancies: o.vacancies, ...rec, companyId: o.companyId, role: o.role };
    }
    if (section.collection === "applications") rec.updated = new Date().toISOString().slice(0, 10);
    upsert(section.collection, rec);
    toast.success(`${section.title}: record saved`);
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          {section.fields.map((f) => (
            <div key={f.key} className={cn("space-y-1.5", f.type === "textarea" && "sm:col-span-2")}>
              <Label className="text-xs font-medium text-muted-foreground">{f.label}{f.required && " *"}</Label>
              <FieldInput f={f} db={db} value={form[f.key]} onChange={(v) => setForm((p) => ({ ...p, [f.key]: v }))} />
            </div>
          ))}
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={save}>Save record</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PageHeader({ title, desc, children }: { title: string; desc?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>{desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}</div>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

export function DataTable({ rows, section, role, sectionId, actions, empty = "No records yet." }: { rows: Rec[]; section: Section; role: RoleId; sectionId: string; actions?: (r: Rec) => React.ReactNode; empty?: string }) {
  const db = useDB();
  const nav = useNavigate();
  const open = (r: Rec) => {
    if (!section.detail) return;
    if (section.linkCollection) nav({ to: "/placement/$role/$section/$id", params: { role, section: role === "officer" || role === "counselor" ? "students" : sectionId, id: r[section.linkKey!] } });
    else nav({ to: "/placement/$role/$section/$id", params: { role, section: sectionId, id: r.id } });
  };
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Table>
        <TableHeader><TableRow className="bg-muted/50 hover:bg-muted/50">{section.columns.map((c) => <TableHead key={c.label} className="text-xs font-semibold uppercase tracking-wide">{c.label}</TableHead>)}{actions && <TableHead className="text-right text-xs font-semibold uppercase tracking-wide">Actions</TableHead>}</TableRow></TableHeader>
        <TableBody>
          {rows.length === 0 && <TableRow><TableCell colSpan={99} className="py-10 text-center text-muted-foreground">{empty}</TableCell></TableRow>}
          {rows.map((r) => (
            <TableRow key={r.id} className={cn(section.detail && "cursor-pointer")} onClick={() => open(r)}>
              {section.columns.map((c, i) => <TableCell key={c.label} className={cn("max-w-[260px] truncate", i === 0 && "font-medium")}>{c.status ? <StatusBadge value={c.get(r, db)} /> : (c.get(r, db) ?? "—")}</TableCell>)}
              {actions && <TableCell className="text-right" onClick={(e) => e.stopPropagation()}><div className="flex justify-end gap-1">{actions(r)}</div></TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

const sel = "h-8 rounded-md border border-input bg-background px-2 text-xs";

export function SectionPage({ role, sectionId }: { role: RoleId; sectionId: string }) {
  const section = SECTIONS[sectionId];
  const db = useDB();
  const [q, setQ] = useState("");
  const [dlg, setDlg] = useState<{ init: Record<string, any>; title: string; sec: Section } | null>(null);
  const canEdit = section.editors.includes(role);

  const rows = useMemo(() => {
    let list = db[section.collection] ?? [];
    if (section.filter) list = list.filter(section.filter);
    if (section.custom === "prep") { const reg = new Set(db.applications.map((a) => a.studentId)); list = list.filter((s) => reg.has(s.id)); }
    if (q) list = list.filter((r) => section.columns.some((c) => String(c.get(r, db) ?? "").toLowerCase().includes(q.toLowerCase())));
    return list;
  }, [db, section, q]);

  if (section.custom === "reports") return <ReportsView />;
  if (section.custom === "support") return <SupportView role={role} />;

  const actions = (r: Rec) => (
    <>
      {section.custom === "submit" && r.status === "Draft" && <Button size="sm" variant="outline" onClick={() => { upsert("opportunities", { id: r.id, status: "Submitted" }); toast.success("Submitted to Placement Officer"); }}><Send className="size-3.5" />Submit to Placement Officer</Button>}
      {section.custom === "review" && (
        <>
          {["Submitted"].includes(r.status) && <Button size="sm" variant="ghost" onClick={() => upsert("opportunities", { id: r.id, status: "Under Review" })}>Review</Button>}
          {["Submitted", "Under Review"].includes(r.status) && <Button size="sm" variant="outline" onClick={() => { upsert("opportunities", { id: r.id, status: "Approved" }); toast.success("Opportunity approved"); }}><CheckCircle2 className="size-3.5" />Approve</Button>}
          {r.status === "Approved" && !db.drives.some((d) => d.opportunityId === r.id) && <Button size="sm" onClick={() => setDlg({ sec: SECTIONS.drives, title: "Create placement drive", init: { opportunityId: r.id, status: "Open", minCgpa: r.minCgpa, courses: r.courses, vacancies: r.vacancies } })}><CalendarPlus className="size-3.5" />Create drive</Button>}
          {db.drives.some((d) => d.opportunityId === r.id) && <span className="text-xs text-muted-foreground">Drive created</span>}
        </>
      )}
      {section.custom === "stage" && (
        <select className={sel} value={r.stage} onChange={(e) => {
          const stage = e.target.value; upsert("applications", { id: r.id, stage, updated: new Date().toISOString().slice(0, 10) });
          if (stage === "Offer" && !db.offers.some((o) => o.studentId === r.studentId && o.driveId === r.driveId)) {
            const d = byId(db, "drives", r.driveId); const o = byId(db, "opportunities", d?.opportunityId);
            upsert("offers", { studentId: r.studentId, driveId: r.driveId, companyId: d?.companyId, role: d?.role, package: o?.package, offerDate: new Date().toISOString().slice(0, 10), status: "Offer Received" });
            toast.success("Offer record created");
          }
        }}>{STATUS.stage.map((s) => <option key={s}>{s}</option>)}</select>
      )}
      {(section.custom === "readiness" || section.custom === "prep") && role === "counselor" && (
        <select className={sel} value={r.readiness} onChange={(e) => { upsert("students", { id: r.id, readiness: e.target.value }); toast.success("Readiness updated"); }}>{STATUS.prep.map((s) => <option key={s}>{s}</option>)}</select>
      )}
      {canEdit && section.custom !== "readiness" && section.custom !== "prep" && (
        <>
          <Button size="icon" variant="ghost" className="size-8" onClick={() => setDlg({ sec: section, title: `Edit ${section.title}`, init: r })}><Pencil className="size-3.5" /></Button>
          <Button size="icon" variant="ghost" className="size-8 text-destructive" onClick={() => { remove(section.collection, r.id); toast("Record deleted"); }}><Trash2 className="size-3.5" /></Button>
        </>
      )}
    </>
  );
  const hasActions = canEdit || ["submit", "review", "stage"].includes(section.custom ?? "") || (role === "counselor" && ["readiness", "prep"].includes(section.custom ?? ""));

  return (
    <div>
      <PageHeader title={section.title} desc={section.desc}>
        <div className="relative"><Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" /><Input placeholder="Filter records…" className="w-56 pl-8" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        {canEdit && !["readiness", "prep"].includes(section.custom ?? "") && <Button onClick={() => setDlg({ sec: section, title: `New ${section.title.replace(/s$/, "")}`, init: { ...(section.defaults ?? {}) } })}><Plus className="size-4" />Add</Button>}
      </PageHeader>
      {!canEdit && !section.custom && <p className="mb-3 text-xs text-muted-foreground">View only — this record type is managed by another team.</p>}
      <DataTable rows={rows} section={section} role={role} sectionId={sectionId} actions={hasActions ? actions : undefined} />
      {dlg && <RecordDialog open onOpenChange={(o) => !o && setDlg(null)} section={dlg.sec} initial={dlg.init} title={dlg.title} />}
    </div>
  );
}

function SupportView({ role }: { role: RoleId }) {
  const db = useDB();
  return (
    <div>
      <PageHeader title="Placement Support" desc="Alumni referrals and mentorship connected to companies, drives and students." />
      <h2 className="mb-3 text-sm font-semibold">Referrals</h2>
      <DataTable rows={db.referrals} section={SECTIONS.referrals} role={role} sectionId="referrals" />
      <h2 className="mb-3 mt-8 text-sm font-semibold">Mentorship</h2>
      <DataTable rows={db.mentorships} section={SECTIONS.mentorship} role={role} sectionId="mentorship" />
    </div>
  );
}

export function NavLinkTo({ role, section, id, children }: { role: RoleId; section: string; id: string; children: React.ReactNode }) {
  return <Link to="/placement/$role/$section/$id" params={{ role, section, id }} className="font-medium text-primary hover:underline">{children}</Link>;
}
