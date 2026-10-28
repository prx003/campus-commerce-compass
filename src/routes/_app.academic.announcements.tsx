import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Megaphone, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAcademic } from "@/components/academic/store";
import type { Announcement, Audience } from "@/components/academic/data";

export const Route = createFileRoute("/_app/academic/announcements")({
  component: AcademicAnnouncements,
});

const AUDIENCES: Audience[] = ["All", "Staff Only", "Students & Parents"];

const AUDIENCE_STYLE: Record<Audience, string> = {
  All: "bg-violet-50 text-violet-700 border-violet-200",
  "Staff Only": "bg-amber-50 text-amber-700 border-amber-200",
  "Students & Parents": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function AcademicAnnouncements() {
  const { announcements, setAnnouncements, logAudit } = useAcademic();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", audience: "All" as Audience, author: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.body) return;
    const a: Announcement = {
      id: `a${Date.now()}`,
      title: form.title,
      body: form.body,
      audience: form.audience,
      author: form.author || "Administration",
      date: new Date().toISOString().slice(0, 10),
    };
    setAnnouncements((prev) => [a, ...prev]);
    logAudit("POST_ANNOUNCEMENT", a.title);
    toast.success("Announcement published");
    setForm({ title: "", body: "", audience: "All", author: "" });
    setOpen(false);
  };

  const remove = (id: string, title: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    logAudit("DELETE_ANNOUNCEMENT", title);
    toast.success("Announcement removed");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Announcements</h1>
          <p className="text-sm text-muted-foreground mt-1">Notices for staff, students and parents</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
        >
          <Plus className="size-4" /> New Announcement
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map((a) => (
          <div key={a.id} className="rounded-xl bg-card border border-border shadow-sm p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-lg bg-muted grid place-items-center shrink-0">
                  <Megaphone className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{a.title}</h3>
                  <div className="text-xs text-muted-foreground mt-0.5">{a.author} · {a.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={cn("px-2.5 py-1 rounded-full border text-[11px] font-medium", AUDIENCE_STYLE[a.audience])}>
                  {a.audience}
                </span>
                <button
                  onClick={() => remove(a.id, a.title)}
                  className="h-8 px-2.5 rounded-md border border-border text-xs font-medium text-muted-foreground hover:bg-muted"
                >
                  Remove
                </button>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{a.body}</p>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
            className="w-full max-w-md bg-card rounded-xl border border-border shadow-2xl p-6 space-y-4"
          >
            <h3 className="text-base font-semibold">New Announcement</h3>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Title</label>
              <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="mt-1 w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" required />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Message</label>
              <textarea value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} rows={4}
                className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Audience</label>
                <select value={form.audience} onChange={(e) => setForm((p) => ({ ...p, audience: e.target.value as Audience }))}
                  className="mt-1 w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {AUDIENCES.map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Posted by</label>
                <input value={form.author} onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
                  className="mt-1 w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Administration" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="h-9 px-4 rounded-md border border-border text-sm font-medium hover:bg-muted">Cancel</button>
              <button type="submit" className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Publish</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
