import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  CheckSquare, MessageSquare, FileText, Plus, Hash, Send, Calendar,
  Users, Paperclip, MoreHorizontal, Folder,
} from "lucide-react";
import { PageHeader, Section } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/workspace")({
  component: Workspace,
});

type Task = { id: string; title: string; assignee: string; due: string; col: "todo" | "doing" | "review" | "done"; priority: "Low" | "Med" | "High" };
const SEED: Task[] = [
  { id: "T-1", title: "Publish admission brochure 2026", assignee: "NK", due: "Jun 02", col: "todo", priority: "High" },
  { id: "T-2", title: "Draft scholarship eligibility doc", assignee: "PS", due: "Jun 04", col: "todo", priority: "Med" },
  { id: "T-3", title: "Coordinate Open House logistics", assignee: "RS", due: "May 28", col: "doing", priority: "High" },
  { id: "T-4", title: "Update CRM stage automations", assignee: "AK", due: "May 30", col: "doing", priority: "Med" },
  { id: "T-5", title: "Review Term 2 timetable", assignee: "MK", due: "May 26", col: "review", priority: "Low" },
  { id: "T-6", title: "Approve marketing creatives", assignee: "NK", due: "May 24", col: "review", priority: "Med" },
  { id: "T-7", title: "Migrate fee invoices to v2", assignee: "RS", due: "May 18", col: "done", priority: "High" },
];

const COLS = [
  { k: "todo", l: "To do", c: "bg-chart-1" },
  { k: "doing", l: "In progress", c: "bg-warning" },
  { k: "review", l: "In review", c: "bg-chart-5" },
  { k: "done", l: "Done", c: "bg-success" },
] as const;

const CHANNELS = [
  { name: "general", count: 0 },
  { name: "admissions", count: 4 },
  { name: "academics", count: 1 },
  { name: "marketing", count: 12 },
  { name: "ops-team", count: 0 },
];

const MESSAGES = [
  { who: "Neha K.", t: "10:24", m: "Just shared the updated brochure draft for Grade 6. Please review by EOD." },
  { who: "Rahul S.", t: "10:31", m: "Looks great. The CTA on page 4 needs to point to /admission/applications." },
  { who: "Priya S.", t: "10:42", m: "Open House venue confirmed — main auditorium, June 3rd at 11AM." },
  { who: "You", t: "10:48", m: "Pinning this thread to #admissions. Let's finalize the email blast tonight." },
];

const FILES = [
  { name: "Admission_Brochure_2026.pdf", size: "4.2 MB", who: "Neha K.", when: "2h ago" },
  { name: "Open_House_Plan.docx", size: "186 KB", who: "Priya S.", when: "Today" },
  { name: "Q2_Marketing_Report.xlsx", size: "1.1 MB", who: "Rahul S.", when: "Yesterday" },
  { name: "Scholarship_Policy_v3.pdf", size: "920 KB", who: "Aanya K.", when: "2 days ago" },
];

const prioColor = (p: Task["priority"]) =>
  p === "High" ? "bg-destructive/10 text-destructive"
  : p === "Med" ? "bg-warning/15 text-warning-foreground"
  : "bg-muted text-muted-foreground";

function Workspace() {
  const [tab, setTab] = useState<"tasks" | "chat" | "docs">("tasks");
  const [tasks, setTasks] = useState(SEED);
  const [draft, setDraft] = useState("");
  const [msgs, setMsgs] = useState(MESSAGES);
  const [activeChannel, setActiveChannel] = useState("admissions");

  const sendMsg = () => {
    if (!draft.trim()) return;
    setMsgs((m) => [...m, { who: "You", t: "now", m: draft.trim() }]);
    setDraft("");
  };

  const addTask = () => {
    const id = `T-${tasks.length + 1}`;
    setTasks((t) => [...t, { id, title: "Untitled task", assignee: "ME", due: "—", col: "todo", priority: "Med" }]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspace"
        subtitle="Tasks, team chat, and shared documents — all in one place"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5"><Users className="size-4" /> Invite</Button>
            <Button size="sm" className="gap-1.5" onClick={addTask}><Plus className="size-4" /> New task</Button>
          </>
        }
      />

      <div className="border-b border-border">
        <nav className="flex gap-1 -mb-px">
          {[
            { k: "tasks", l: "Tasks", i: CheckSquare },
            { k: "chat", l: "Team chat", i: MessageSquare },
            { k: "docs", l: "Documents", i: FileText },
          ].map((t) => {
            const Icon = t.i;
            return (
              <button
                key={t.k}
                onClick={() => setTab(t.k as typeof tab)}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium border-b-2 transition flex items-center gap-1.5",
                  tab === t.k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-4" /> {t.l}
              </button>
            );
          })}
        </nav>
      </div>

      {tab === "tasks" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLS.map((col) => {
            const items = tasks.filter((t) => t.col === col.k);
            return (
              <div key={col.k} className="rounded-xl border border-border bg-secondary/40 p-3">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${col.c}`} />
                    <h3 className="text-xs font-semibold uppercase tracking-wider">{col.l}</h3>
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground bg-card border border-border rounded px-1.5 py-0.5">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {items.map((t) => (
                    <div key={t.id} className="rounded-lg bg-card border border-border p-3 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition cursor-pointer">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-medium leading-snug">{t.title}</div>
                        <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal className="size-4" /></button>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${prioColor(t.priority)}`}>{t.priority}</span>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <Calendar className="size-3" /> {t.due}
                          <span className="ml-1 size-5 rounded-full bg-primary/15 text-primary text-[9px] font-bold grid place-items-center">
                            {t.assignee}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "chat" && (
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4">
          <div className="rounded-xl border border-border bg-card p-3 shadow-soft h-fit">
            <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Channels</div>
            {CHANNELS.map((c) => (
              <button
                key={c.name}
                onClick={() => setActiveChannel(c.name)}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition",
                  activeChannel === c.name ? "bg-primary/10 text-primary font-semibold" : "hover:bg-secondary text-foreground",
                )}
              >
                <Hash className="size-3.5" />
                <span className="flex-1 text-left">{c.name}</span>
                {c.count > 0 && <span className="text-[10px] bg-destructive text-destructive-foreground rounded-full px-1.5 font-bold">{c.count}</span>}
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-card shadow-soft flex flex-col h-[560px]">
            <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
              <Hash className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">{activeChannel}</h3>
              <span className="text-xs text-muted-foreground">· 14 members</span>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
              {msgs.map((m, i) => (
                <div key={i} className="flex gap-3">
                  <div className="size-8 rounded-full bg-primary/15 text-primary text-xs font-bold grid place-items-center shrink-0">
                    {m.who.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold">{m.who}</span>
                      <span className="text-[11px] text-muted-foreground">{m.t}</span>
                    </div>
                    <p className="text-sm text-foreground/90 mt-0.5">{m.m}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-border flex items-center gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMsg()}
                placeholder={`Message #${activeChannel}`}
                className="h-9 text-sm"
              />
              <Button size="sm" onClick={sendMsg} className="gap-1.5"><Send className="size-3.5" /> Send</Button>
            </div>
          </div>
        </div>
      )}

      {tab === "docs" && (
        <Section title="Shared documents" action={<Button size="sm" variant="outline" className="gap-1.5"><Paperclip className="size-3.5" /> Upload</Button>}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {FILES.map((f) => (
              <div key={f.name} className="rounded-lg border border-border p-4 hover:shadow-card hover:border-primary/30 transition cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                    <Folder className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate">{f.name}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{f.size} · {f.who}</div>
                    <div className="text-[11px] text-muted-foreground">{f.when}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
