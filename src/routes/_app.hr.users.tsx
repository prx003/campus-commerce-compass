import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, X, ShieldCheck } from "lucide-react";
import { PageHeader, Section, StatCard } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { ModuleGuard } from "@/components/hr/layout";
import { useHR, ROLE_PERMISSIONS, type Role } from "@/components/hr/store";

export const Route = createFileRoute("/_app/hr/users")({
  component: () => (
    <ModuleGuard module="users">
      <UserManagement />
    </ModuleGuard>
  ),
});

const ROLES: Role[] = ["System Administrator", "HR Personnel", "Department Manager"];

function UserManagement() {
  const { users, addUser, toggleUser, setUserRole } = useHR();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "HR Personnel" as Role, active: true });

  const create = () => {
    if (!form.name.trim()) return;
    addUser(form);
    setOpen(false);
    setForm({ name: "", email: "", role: "HR Personnel", active: true });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        subtitle="Create users, assign roles & manage permissions"
        actions={<Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}><Plus className="size-4" /> Create user</Button>}
      />

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total users" value={String(users.length)} icon={ShieldCheck} />
        <StatCard label="Active" value={String(users.filter((u) => u.active).length)} icon={ShieldCheck} accent="success" />
        <StatCard label="Roles" value={String(ROLES.length)} icon={ShieldCheck} accent="primary" />
      </div>

      <Section title="Users & roles">
        <div className="overflow-x-auto -m-5">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-medium">User</th>
                <th className="px-3 py-3 text-left font-medium">Role</th>
                <th className="px-3 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-border hover:bg-secondary/40">
                  <td className="px-5 py-3">
                    <div className="font-medium">{u.name}</div>
                    <div className="text-[11px] text-muted-foreground">{u.email}</div>
                  </td>
                  <td className="px-3 py-3">
                    <select className="inp !h-8 !w-auto" value={u.role} onChange={(e) => setUserRole(u.id, e.target.value as Role)}>
                      {ROLES.map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${u.active ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"}`}>
                      {u.active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => toggleUser(u.id)}>{u.active ? "Disable" : "Enable"}</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Role permissions (RBAC matrix)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {ROLES.map((r) => (
            <div key={r} className="rounded-lg border border-border p-4">
              <div className="font-medium text-sm mb-2">{r}</div>
              <div className="flex flex-wrap gap-1.5">
                {ROLE_PERMISSIONS[r].map((m) => (
                  <span key={m} className="text-[11px] font-medium px-2 py-0.5 rounded bg-primary/10 text-primary capitalize">{m}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Create User</h3>
              <button onClick={() => setOpen(false)} className="size-8 grid place-items-center rounded hover:bg-secondary"><X className="size-4" /></button>
            </div>
            <div className="space-y-3">
              <label className="block"><span className="text-xs font-medium text-muted-foreground">Name</span><input className="inp mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
              <label className="block"><span className="text-xs font-medium text-muted-foreground">Email</span><input className="inp mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
              <label className="block"><span className="text-xs font-medium text-muted-foreground">Role</span>
                <select className="inp mt-1" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={create}>Create</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
