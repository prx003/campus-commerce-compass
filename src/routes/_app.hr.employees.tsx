import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Plus, Pencil, Trash2, Eye, Upload, X, FileText, Search } from "lucide-react";
import { PageHeader, Section } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { ModuleGuard } from "@/components/hr/layout";
import { useHR, inr, type Employee } from "@/components/hr/store";

export const Route = createFileRoute("/_app/hr/employees")({
  component: () => (
    <ModuleGuard module="employees">
      <Employees />
    </ModuleGuard>
  ),
});

const empty = {
  name: "",
  email: "",
  phone: "",
  role: "",
  dept: "",
  salary: 50000,
  join: new Date().toISOString().slice(0, 10),
  status: "Active" as Employee["status"],
};

function Employees() {
  const { employees, addEmployee, updateEmployee, removeEmployee, addDocument } = useHR();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Employee | null>(null);
  const [viewing, setViewing] = useState<Employee | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(empty);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.dept.toLowerCase().includes(query.toLowerCase()) ||
      e.role.toLowerCase().includes(query.toLowerCase()),
  );

  const openCreate = () => {
    setForm(empty);
    setEditing(null);
    setCreating(true);
  };
  const openEdit = (e: Employee) => {
    setForm({ name: e.name, email: e.email, phone: e.phone, role: e.role, dept: e.dept, salary: e.salary, join: e.join, status: e.status });
    setEditing(e);
    setCreating(true);
  };
  const save = () => {
    if (!form.name.trim()) return;
    if (editing) updateEmployee(editing.id, form);
    else addEmployee(form);
    setCreating(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Management"
        subtitle={`${employees.length} employees`}
        actions={
          <Button size="sm" className="gap-1.5" onClick={openCreate}>
            <Plus className="size-4" /> Add Employee
          </Button>
        }
      />

      <Section
        title="Employee directory"
        action={
          <div className="relative">
            <Search className="size-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="h-8 w-44 rounded-md border border-border bg-background pl-8 pr-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        }
      >
        <div className="overflow-x-auto -m-5">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Name</th>
                <th className="px-3 py-3 text-left font-medium">Role</th>
                <th className="px-3 py-3 text-left font-medium">Dept</th>
                <th className="px-3 py-3 text-left font-medium">Status</th>
                <th className="px-3 py-3 text-right font-medium">Salary</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-t border-border hover:bg-secondary/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-full bg-gradient-to-br from-primary/80 to-chart-5 grid place-items-center text-primary-foreground text-[11px] font-semibold">
                        {e.name.split(" ").map((p) => p[0]).join("")}
                      </div>
                      <div>
                        <div className="font-medium">{e.name}</div>
                        <div className="text-[11px] text-muted-foreground">{e.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{e.role}</td>
                  <td className="px-3 py-3 text-muted-foreground">{e.dept}</td>
                  <td className="px-3 py-3">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-secondary">{e.status}</span>
                  </td>
                  <td className="px-3 py-3 text-right font-semibold tabular-nums">{inr(e.salary)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewing(e)} className="size-7 grid place-items-center rounded hover:bg-secondary" title="View"><Eye className="size-4" /></button>
                      <button onClick={() => openEdit(e)} className="size-7 grid place-items-center rounded hover:bg-secondary" title="Edit"><Pencil className="size-4" /></button>
                      <button onClick={() => removeEmployee(e.id)} className="size-7 grid place-items-center rounded hover:bg-destructive/10 text-destructive" title="Delete"><Trash2 className="size-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Create / Edit modal */}
      {creating && (
        <Modal title={editing ? "Edit Employee" : "Add Employee"} onClose={() => setCreating(false)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Full name"><input className="inp" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Email"><input className="inp" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Phone"><input className="inp" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="Role"><input className="inp" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></Field>
            <Field label="Department"><input className="inp" value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })} /></Field>
            <Field label="Monthly salary (₹)"><input type="number" className="inp" value={form.salary} onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })} /></Field>
            <Field label="Joining date"><input type="date" className="inp" value={form.join} onChange={(e) => setForm({ ...form, join: e.target.value })} /></Field>
            <Field label="Status">
              <select className="inp" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Employee["status"] })}>
                <option>Active</option>
                <option>On Leave</option>
                <option>Probation</option>
              </select>
            </Field>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setCreating(false)}>Cancel</Button>
            <Button size="sm" onClick={save}>{editing ? "Save changes" : "Add employee"}</Button>
          </div>
        </Modal>
      )}

      {/* View profile modal */}
      {viewing && (
        <Modal title="Employee Profile" onClose={() => setViewing(null)}>
          <div className="flex items-center gap-3">
            <div className="size-14 rounded-full bg-gradient-to-br from-primary/80 to-chart-5 grid place-items-center text-primary-foreground text-lg font-semibold">
              {viewing.name.split(" ").map((p) => p[0]).join("")}
            </div>
            <div>
              <div className="text-lg font-semibold">{viewing.name}</div>
              <div className="text-sm text-muted-foreground">{viewing.role} · {viewing.dept}</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Info label="Employee ID" value={viewing.id} />
            <Info label="Status" value={viewing.status} />
            <Info label="Email" value={viewing.email} />
            <Info label="Phone" value={viewing.phone} />
            <Info label="Joined" value={viewing.join} />
            <Info label="Salary" value={inr(viewing.salary)} />
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold">Documents</h4>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => fileRef.current?.click()}>
                <Upload className="size-4" /> Upload
              </Button>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) addDocument(viewing.id, f.name);
                  setViewing((v) => (v ? { ...v, documents: [...v.documents, e.target.files?.[0]?.name ?? ""] } : v));
                  e.target.value = "";
                }}
              />
            </div>
            <div className="space-y-1.5">
              {viewing.documents.length === 0 && <p className="text-sm text-muted-foreground">No documents uploaded.</p>}
              {viewing.documents.map((d, i) => (
                <div key={i} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
                  <FileText className="size-4 text-muted-foreground" /> {d}
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border px-3 py-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">{title}</h3>
          <button onClick={onClose} className="size-8 grid place-items-center rounded hover:bg-secondary"><X className="size-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
