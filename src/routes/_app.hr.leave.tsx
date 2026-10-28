import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Check, X } from "lucide-react";
import { PageHeader, Section, StatCard } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { ModuleGuard } from "@/components/hr/layout";
import { useHR, type LeaveRequest } from "@/components/hr/store";

export const Route = createFileRoute("/_app/hr/leave")({
  component: () => (
    <ModuleGuard module="leave">
      <Leave />
    </ModuleGuard>
  ),
});

const daysBetween = (a: string, b: string) =>
  Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000) + 1);

function Leave() {
  const { employees, leaves, addLeave, setLeaveStatus, can } = useHR();
  const canApprove = can("users") || can("leave"); // managers & HR approve
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    empId: employees[0]?.id ?? "",
    type: "Casual" as LeaveRequest["type"],
    from: new Date().toISOString().slice(0, 10),
    to: new Date().toISOString().slice(0, 10),
    reason: "",
  });

  const nameOf = (id: string) => employees.find((e) => e.id === id)?.name ?? id;
  const pending = leaves.filter((l) => l.status === "Pending").length;
  const approved = leaves.filter((l) => l.status === "Approved").length;

  const apply = () => {
    addLeave({ ...form, days: daysBetween(form.from, form.to) });
    setOpen(false);
    setForm({ ...form, reason: "" });
  };

  const badge = (s: LeaveRequest["status"]) =>
    s === "Approved" ? "bg-success/10 text-success" : s === "Rejected" ? "bg-destructive/10 text-destructive" : "bg-warning/15 text-warning-foreground";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Management"
        subtitle={`${pending} pending · ${approved} approved`}
        actions={<Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}><Plus className="size-4" /> Apply Leave</Button>}
      />

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total requests" value={String(leaves.length)} icon={Plus} />
        <StatCard label="Pending" value={String(pending)} icon={Plus} accent="warning" />
        <StatCard label="Approved" value={String(approved)} icon={Plus} accent="success" />
      </div>

      <Section title="Leave requests & history">
        <div className="overflow-x-auto -m-5">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Employee</th>
                <th className="px-3 py-3 text-left font-medium">Type</th>
                <th className="px-3 py-3 text-left font-medium">Period</th>
                <th className="px-3 py-3 text-center font-medium">Days</th>
                <th className="px-3 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l.id} className="border-t border-border hover:bg-secondary/40">
                  <td className="px-5 py-3 font-medium">{nameOf(l.empId)}</td>
                  <td className="px-3 py-3 text-muted-foreground">{l.type}</td>
                  <td className="px-3 py-3 text-muted-foreground">{l.from} → {l.to}</td>
                  <td className="px-3 py-3 text-center tabular-nums">{l.days}</td>
                  <td className="px-3 py-3"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${badge(l.status)}`}>{l.status}</span></td>
                  <td className="px-5 py-3">
                    {l.status === "Pending" && canApprove ? (
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setLeaveStatus(l.id, "Approved")} className="size-7 grid place-items-center rounded hover:bg-success/10 text-success" title="Approve"><Check className="size-4" /></button>
                        <button onClick={() => setLeaveStatus(l.id, "Rejected")} className="size-7 grid place-items-center rounded hover:bg-destructive/10 text-destructive" title="Reject"><X className="size-4" /></button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground block text-right">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Apply for Leave</h3>
              <button onClick={() => setOpen(false)} className="size-8 grid place-items-center rounded hover:bg-secondary"><X className="size-4" /></button>
            </div>
            <div className="space-y-3">
              <label className="block"><span className="text-xs font-medium text-muted-foreground">Employee</span>
                <select className="inp mt-1" value={form.empId} onChange={(e) => setForm({ ...form, empId: e.target.value })}>
                  {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </label>
              <label className="block"><span className="text-xs font-medium text-muted-foreground">Type</span>
                <select className="inp mt-1" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as LeaveRequest["type"] })}>
                  <option>Casual</option><option>Sick</option><option>Earned</option><option>Unpaid</option>
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block"><span className="text-xs font-medium text-muted-foreground">From</span><input type="date" className="inp mt-1" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} /></label>
                <label className="block"><span className="text-xs font-medium text-muted-foreground">To</span><input type="date" className="inp mt-1" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} /></label>
              </div>
              <label className="block"><span className="text-xs font-medium text-muted-foreground">Reason</span><textarea className="inp mt-1" rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={apply}>Submit</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
