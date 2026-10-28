import { useStore, staffName } from '../store/StoreContext';
import { PageHeader } from './PageHeader';
import { StatCard } from './StatCard';
import { DataTable, StatusBadge } from './DataTable';
import { resourceEffectiveStatus as sharedResourceStatus } from '../roles/hod/subjectAllocationLogic';
import { Wrench, Calendar, Clock, CheckSquare, AlertTriangle, Eye, ClipboardCheck, Send, Plus, Download, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Resource, ResourceAllocation, MaintenanceRequest, ResourceRequest, ResourceHistory } from '../data/types';

/**
 * Helper: determine effective status of a resource based on subject allocations
 * and the published timetable. A subject allocation alone marks the resource
 * "Allocated / Reserved" — it becomes "In Use" only during the actual scheduled
 * class time and returns to "Available" afterwards.
 */
export function effectiveResourceStatus(data: ReturnType<typeof useStore>['data'], r: Resource): string {
  return sharedResourceStatus(data, r);
}

function ResourceStatusView({ status }: { status: string }) {
  return <StatusBadge status={status} />;
}

function categoryLabel(cat: string) {
  return cat.split('-').map((c) => c.charAt(0).toUpperCase() + c.slice(1)).join(' ');
}

/* Modal helper for allocation details */
function AllocationDetailModal({ resource, allocations, history, onClose }: { resource: Resource; allocations: ResourceAllocation[]; history: ResourceHistory[]; onClose: () => void }) {
  const { data } = useStore();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-w-2xl w-full bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-100 sticky top-0 bg-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{resource.name}</h2>
            <p className="text-sm text-slate-500">{categoryLabel(resource.category)} · {resource.location}</p>
          </div>
          <button type="button" className="btn-secondary text-xs" onClick={onClose}>Close</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card p-3 text-center"><p className="text-xs text-slate-500">Status</p><div className="mt-1"><ResourceStatusView status={resource.status} /></div></div>
            <div className="card p-3 text-center"><p className="text-xs text-slate-500">Category</p><p className="text-sm font-semibold text-slate-900 mt-1">{categoryLabel(resource.category)}</p></div>
            <div className="card p-3 text-center"><p className="text-xs text-slate-500">Location</p><p className="text-sm font-semibold text-slate-900 mt-1">{resource.location}</p></div>
            <div className="card p-3 text-center"><p className="text-xs text-slate-500">Current</p><div className="mt-1">{resource.isLab ? <span className="badge bg-blue-100 text-blue-700">Lab</span> : <span className="badge bg-slate-100 text-slate-600">Non-Lab</span>}</div></div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Content — Allocations</h3>
            {allocations.length === 0 ? (
              <p className="text-sm text-slate-400">No allocations recorded for this resource.</p>
            ) : (
              <DataTable
                rows={allocations}
                columns={[
                  { key: 'allocatedTo', header: 'Allocated To', render: (a) => <span className="font-medium text-slate-900">{staffName(data, a.allocatedTo)}</span> },
                  { key: 'date', header: 'Date' },
                  { key: 'fromTime', header: 'From Time' },
                  { key: 'toTime', header: 'To Time' },
                ]}
              />
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">History</h3>
            {history.length === 0 ? (
              <p className="text-sm text-slate-400">No history recorded for this resource.</p>
            ) : (
              <div className="space-y-2">
                {history.map((h) => (
                  <div key={h.id} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 text-xs">
                    <span className="text-slate-400">{h.date}</span>
                    <span className="font-medium text-slate-700 capitalize">{h.action.replace(/-/g, ' ')}</span>
                    <span className="text-slate-600">{h.details}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AllocateModal({ resource, onClose }: { resource: Resource; onClose: () => void }) {
  const { data, allocateResource, updateResource, addResourceHistory, addNotification } = useStore();
  const [allocatedTo, setAllocatedTo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [fromTime, setFromTime] = useState('09:00');
  const [toTime, setToTime] = useState('10:00');

  const submit = () => {
    if (!allocatedTo) return;
    const alloc: ResourceAllocation = { id: `ra${Date.now()}`, resourceId: resource.id, allocatedTo, date, fromTime, toTime };
    allocateResource(alloc);
    updateResource(resource.id, { status: 'in-use' });
    addResourceHistory({ id: `rh${Date.now()}`, resourceId: resource.id, action: 'allocated', date, staffId: allocatedTo, details: `Allocated to ${staffName(data, allocatedTo)} on ${date} ${fromTime}–${toTime}` });
    addNotification({ id: `n${Date.now()}`, title: 'Resource allocated', message: `${resource.name} allocated to you on ${date} (${fromTime}–${toTime})`, date: new Date().toISOString().slice(0, 10), audience: [data.staff.find((s) => s.id === allocatedTo)?.role ?? 'professor'], read: false });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-100"><h2 className="text-lg font-semibold text-slate-900">Allocate {resource.name}</h2><p className="text-sm text-slate-500">{resource.location}</p></div>
        <div className="px-6 py-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Allocate To</label>
            <select className="input w-full" value={allocatedTo} onChange={(e) => setAllocatedTo(e.target.value)}>
              <option value="">Select staff...</option>
              {data.staff.filter((s) => s.departmentId === resource.departmentId).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
              <input type="date" className="input w-full" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">From</label>
              <input type="time" className="input w-full" value={fromTime} onChange={(e) => setFromTime(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">To</label>
              <input type="time" className="input w-full" value={toTime} onChange={(e) => setToTime(e.target.value)} />
            </div>
          </div>
          <button className="btn-primary w-full" onClick={submit} disabled={!allocatedTo}><CheckSquare className="w-4 h-4" /> Confirm Allocation</button>
        </div>
      </div>
    </div>
  );
}

function MaintenanceModal({ resource, onClose }: { resource: Resource; onClose: () => void }) {
  const { data, currentUser, addMaintenanceRequest, updateResource, addResourceHistory } = useStore();
  const [assignedTo, setAssignedTo] = useState('');
  const [desc, setDesc] = useState('');

  const submit = () => {
    if (!assignedTo || !desc.trim()) return;
    const req: MaintenanceRequest = { id: `mr${Date.now()}`, resourceId: resource.id, requestedBy: currentUser?.id ?? '', assignedTo, description: desc, status: 'pending', progress: 0, date: new Date().toISOString().slice(0, 10) };
    addMaintenanceRequest(req);
    updateResource(resource.id, { status: 'under-maintenance' });
    addResourceHistory({ id: `rh${Date.now()}`, resourceId: resource.id, action: 'maintenance', date: new Date().toISOString().slice(0, 10), details: `Maintenance requested: ${desc}` });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-100"><h2 className="text-lg font-semibold text-slate-900">Maintenance Request — {resource.name}</h2></div>
        <div className="px-6 py-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Assign To (Lab Technician)</label>
            <select className="input w-full" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
              <option value="">Select technician...</option>
              {data.staff.filter((s) => s.role === 'lab-assistant').map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
            <textarea className="input w-full" rows={3} placeholder="Describe the issue..." value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <button className="btn-primary w-full" onClick={submit} disabled={!assignedTo || !desc.trim()}><Send className="w-4 h-4" /> Submit Maintenance Request</button>
        </div>
      </div>
    </div>
  );
}

function NewResourceModal({ deptId, onClose }: { deptId: string; onClose: () => void }) {
  const { currentUser, addResourceRequest } = useStore();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');

  const submit = () => {
    if (!name.trim() || !category) return;
    const req: ResourceRequest = { id: `rr${Date.now()}`, resourceName: name, category: category as Resource['category'], departmentId: deptId, requestedBy: currentUser?.id ?? '', date: new Date().toISOString().slice(0, 10), status: 'pending', notes };
    addResourceRequest(req);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-100"><h2 className="text-lg font-semibold text-slate-900">Request New Resource</h2></div>
        <div className="px-6 py-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Resource Name</label>
            <input className="input w-full" placeholder="e.g. New Projector" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
            <select className="input w-full" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select category...</option>
              {['classroom', 'computer', 'projector', 'smart-board', 'furniture', 'teaching-equipment', 'book', 'other-equipment'].map((c) => <option key={c} value={c}>{categoryLabel(c)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Notes</label>
            <textarea className="input w-full" rows={3} placeholder="Why is this resource needed?" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <button className="btn-primary w-full" onClick={submit} disabled={!name.trim() || !category}><Plus className="w-4 h-4" /> Submit Request</button>
        </div>
      </div>
    </div>
  );
}

/* ===== HOD Resource Management Page ===== */
export function ResourceManagement({ deptId }: { deptId: string }) {
  const { data, updateResource, addResourceHistory, addNotification } = useStore();
  const [selected, setSelected] = useState<Resource | null>(null);
  const [allocating, setAllocating] = useState<Resource | null>(null);
  const [maintaining, setMaintaining] = useState<Resource | null>(null);
  const [showNewResource, setShowNewResource] = useState(false);

  const deptResources = useMemo(() => data.resources.filter((r) => r.departmentId === deptId), [data.resources, deptId]);

  const stats = {
    total: deptResources.length,
    available: deptResources.filter((r) => r.status === 'available').length,
    inUse: deptResources.filter((r) => r.status === 'in-use').length,
    maintenance: deptResources.filter((r) => r.status === 'under-maintenance' || r.status === 'damaged').length,
  };

  const retire = (r: Resource) => {
    if (!confirm(`Retire ${r.name}? This cannot be undone.`)) return;
    updateResource(r.id, { status: 'retired' });
    addResourceHistory({ id: `rh${Date.now()}`, resourceId: r.id, action: 'retired', date: new Date().toISOString().slice(0, 10), details: 'Retired from service' });
    addNotification({ id: `n${Date.now()}`, title: 'Resource retired', message: `${r.name} has been retired`, date: new Date().toISOString().slice(0, 10), audience: ['hod'], read: false });
  };

  return (
    <div>
      <PageHeader title="Resources" description="Department resources, allocation, maintenance, and requests" action={
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => setShowNewResource(true)}><Plus className="w-4 h-4" /> Resource Request</button>
        </div>
      } />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Resources" value={stats.total} icon={<Wrench className="w-5 h-5" />} accent="slate" />
        <StatCard label="Available" value={stats.available} icon={<CheckSquare className="w-5 h-5" />} accent="emerald" />
        <StatCard label="In Use" value={stats.inUse} icon={<Calendar className="w-5 h-5" />} accent="blue" />
        <StatCard label="Under Maintenance" value={stats.maintenance} icon={<AlertTriangle className="w-5 h-5" />} accent={stats.maintenance > 0 ? 'amber' : 'emerald'} />
      </div>

      <div className="card overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Department Resources</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Resource</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Location</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deptResources.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{r.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{categoryLabel(r.category)}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{r.location}</td>
                  <td className="px-4 py-3"><ResourceStatusView status={effectiveResourceStatus(data, r)} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        title="View"
                        aria-label="View details"
                        onClick={() => setSelected(r)}
                      ><Eye className="h-4 w-4" /></button>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                        title="Allocate"
                        aria-label="Allocate resource"
                        onClick={() => setAllocating(r)}
                        disabled={r.status !== 'available'}
                      ><Calendar className="h-4 w-4" /></button>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-amber-50 hover:text-amber-600"
                        title="Maintenance"
                        aria-label="Request maintenance"
                        onClick={() => setMaintaining(r)}
                      ><ClipboardCheck className="h-4 w-4" /></button>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                        title="Retire"
                        aria-label="Retire resource"
                        onClick={() => retire(r)}
                      ><XCircle className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Maintenance Requests</h3>
        <DataTable
          rows={data.maintenanceRequests.filter((m) => data.resources.find((r) => r.id === m.resourceId)?.departmentId === deptId)}
          columns={[
            { key: 'resourceId', header: 'Resource', render: (m) => { const r = data.resources.find((x) => x.id === m.resourceId); return <span className="font-medium text-slate-900">{r?.name ?? '—'}</span>; } },
            { key: 'assignedTo', header: 'Assigned To', render: (m) => staffName(data, m.assignedTo) },
            { key: 'description', header: 'Description' },
            { key: 'status', header: 'Status', render: (m) => <StatusBadge status={m.status} /> },
            { key: 'progress', header: 'Progress', render: (m) => `${m.progress}%` },
          ]}
          emptyMessage="No maintenance requests."
        />
      </div>

      {selected && <AllocationDetailModal resource={selected} allocations={data.resourceAllocations.filter((a) => a.resourceId === selected.id)} history={data.resourceHistory.filter((h) => h.resourceId === selected.id)} onClose={() => setSelected(null)} />}
      {allocating && <AllocateModal resource={allocating} onClose={() => setAllocating(null)} />}
      {maintaining && <MaintenanceModal resource={maintaining} onClose={() => setMaintaining(null)} />}
      {showNewResource && <NewResourceModal deptId={deptId} onClose={() => setShowNewResource(false)} />}
    </div>
  );
}

/* ===== Teaching Staff: My Resources ===== */
export function MyResources() {
  const { data, currentUser } = useStore();
  const allocations = useMemo(() => data.resourceAllocations.filter((a) => a.allocatedTo === currentUser?.id), [data.resourceAllocations, currentUser]);

  const rows = allocations.map((a) => {
    const r = data.resources.find((x) => x.id === a.resourceId);
    return { id: a.id, resource: r?.name ?? '—', category: r ? categoryLabel(r.category) : '—', location: r?.location ?? '—', date: a.date, fromTime: a.fromTime, toTime: a.toTime };
  });

  return (
    <div>
      <PageHeader title="My Resources" description="Resources allocated to you" />
      <DataTable
        rows={rows}
        columns={[
          { key: 'resource', header: 'Resource', render: (r) => <span className="font-medium text-slate-900">{r.resource}</span> },
          { key: 'category', header: 'Category' },
          { key: 'location', header: 'Location' },
          { key: 'date', header: 'Date' },
          { key: 'fromTime', header: 'From Time' },
          { key: 'toTime', header: 'To Time' },
        ]}
        emptyMessage="No resources allocated to you."
      />
    </div>
  );
}

/* ===== Lab Assistant: Maintenance Requests ===== */
export function LabMaintenanceRequests() {
  const { data, currentUser, updateMaintenanceRequest, updateResource, addResourceHistory, addNotification } = useStore();
  const [progressInput, setProgressInput] = useState<Record<string, number>>({});

  const requests = data.maintenanceRequests.filter((m) => m.assignedTo === currentUser?.id && m.status !== 'completed');

  const markComplete = (m: MaintenanceRequest) => {
    updateMaintenanceRequest(m.id, { status: 'completed', progress: 100 });
    updateResource(m.resourceId, { status: 'available' });
    addResourceHistory({ id: `rh${Date.now()}`, resourceId: m.resourceId, action: 'maintenance-completed', date: new Date().toISOString().slice(0, 10), details: 'Maintenance completed, resource available' });
    addNotification({ id: `n${Date.now()}`, title: 'Maintenance completed', message: `${data.resources.find((r) => r.id === m.resourceId)?.name ?? 'Resource'} maintenance completed and is now available`, date: new Date().toISOString().slice(0, 10), audience: ['hod'], read: false });
  };

  const updateProgress = (m: MaintenanceRequest, val: number) => {
    updateMaintenanceRequest(m.id, { progress: val, status: val > 0 ? 'in-progress' : 'pending' });
  };

  return (
    <div>
      <PageHeader title="Maintenance Requests" description="Resource maintenance assigned to you" />
      <DataTable
        rows={requests}
        columns={[
          { key: 'resourceId', header: 'Resource', render: (m) => { const r = data.resources.find((x) => x.id === m.resourceId); return <span className="font-medium text-slate-900">{r?.name ?? '—'}</span>; } },
          { key: 'requestedBy', header: 'Requested By', render: (m) => staffName(data, m.requestedBy) },
          { key: 'description', header: 'Description' },
          { key: 'progress', header: 'Progress', render: (m) => (
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={100}
                value={progressInput[m.id] ?? m.progress}
                onChange={(e) => setProgressInput({ ...progressInput, [m.id]: Number(e.target.value) })}
                onMouseUp={(e) => updateProgress(m, Number((e.target as HTMLInputElement).value))}
                onTouchEnd={(e) => updateProgress(m, Number((e.target as HTMLInputElement).value))}
                className="w-24"
              />
              <span className="text-xs font-medium text-slate-700">{progressInput[m.id] ?? m.progress}%</span>
            </div>
          ) },
          { key: 'status', header: 'Status', render: (m) => <StatusBadge status={(progressInput[m.id] ?? m.progress) > 0 ? 'in-progress' : m.status} /> },
          { key: 'action', header: 'Action', render: (m) => (
            <button className="btn-success text-xs" onClick={() => markComplete(m)}><CheckSquare className="w-3.5 h-3.5" /> Mark Complete</button>
          ) },
        ]}
        emptyMessage="No maintenance requests assigned to you."
      />
    </div>
  );
}