import { useMemo, useState } from 'react';
import { useStore, staffName } from '../../store/StoreContext';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import type { AppData, Subject, SubjectAllocation, AllocationHistory, ResourceCategory, Staff, Notification } from '../../data/types';
import {
  semLabel,
  semShort,
  classLabel,
  subjectTypeLabel,
  categoryLabel,
  getClassSections,
  facultyOptions,
  resourceOptions,
  resourceEffectiveStatus,
  facultyWorkload,
  allocationConflicts,
  deriveAllocationStatus,
  affectedPublishedEntries,
  resourceShortLabel,
  allocationFacultyName,
  DEFAULT_REQUIRED_BY_TYPE,
  SEMESTERS,
  MAX_RECOMMENDED_HRS,
  MAX_ALLOWED_HRS,
  ACADEMIC_YEAR,
  type FacultyOption,
  type ResourceOption,
  type WorkloadLevel,
} from './subjectAllocationLogic';
import {
  Plus,
  History,
  Search,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  Save,
  CheckSquare,
  Clock,
  MapPin,
  Star,
  ClipboardList,
  UserCheck,
  RefreshCw,
  Wrench,
  ChevronRight,
  ShieldAlert,
  Layers,
} from 'lucide-react';

interface DrawerForm {
  classIds: string[];
  facultyId: string | null;
  resourceIds: string[];
  requiredTypes: ResourceCategory[];
}

interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

const deptCodeShort = (data: AppData, deptId: string) => data.departments.find((d) => d.id === deptId)?.code ?? 'DEPT';

export function SubjectAllocationWorkspace({
  deptId,
  embedded = false,
  semesterOverride,
  sectionOverride,
}: {
  deptId: string;
  embedded?: boolean;
  semesterOverride?: number;
  sectionOverride?: string;
}) {
  const store = useStore();
  const { data, currentUser } = store;
  const { saveSubjectAllocation, updateSubject, removeSubjectAllocation, addAllocationHistory, updateStaff, addNotification } = store;

  const [semester, setSemester] = useState(() => {
    if (semesterOverride !== undefined) return semesterOverride;
    const deptSubs = data.subjects.filter((s) => s.departmentId === deptId);
    const available = SEMESTERS.filter((sem) => deptSubs.some((s) => s.semester === sem));
    return available.includes(6) ? 6 : (available[0] ?? 1);
  });
  const [sectionFilter, setSectionFilter] = useState(sectionOverride ?? 'all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [drawer, setDrawer] = useState<{ subject: Subject; allocation: SubjectAllocation | null; opening: 'assign' | 'edit' } | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [resourcePopover, setResourcePopover] = useState<{ subject: Subject; allocation: SubjectAllocation | null; x: number; y: number } | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (type: ToastItem['type'], message: string) => {
    const id = `t${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  };

  const deptSubjects = useMemo(
    () => data.subjects.filter((s) => s.departmentId === deptId && s.semester === semester),
    [data.subjects, deptId, semester]
  );
  const deptAllocations = useMemo(
    () => data.subjectAllocations.filter((a) => a.departmentId === deptId && a.semester === semester),
    [data.subjectAllocations, deptId, semester]
  );
  const classOptions = useMemo(() => getClassSections(data, deptId, semester), [data, deptId, semester]);

  const allocFor = (subjectId: string) =>
    data.subjectAllocations.find((a) => a.subjectId === subjectId && a.departmentId === deptId && a.semester === semester) ?? null;

  const rowStatus = (subject: Subject) => allocFor(subject.id)?.status ?? 'pending';

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return deptSubjects
      .filter((subject) => {
        const alloc = allocFor(subject.id);
        if (sectionFilter !== 'all') {
          const inAlloc = alloc?.classIds.includes(sectionFilter) ?? false;
          const inSubjectClasses = subject.classes.some((c) => c.includes(`-${sectionFilter} Sem-${semester}`));
          if (!inAlloc && !inSubjectClasses) return false;
        }
        if (typeFilter !== 'all' && subject.type !== typeFilter) return false;
        if (statusFilter !== 'all' && rowStatus(subject) !== statusFilter) return false;
        if (q) {
          const facName = alloc?.facultyId ? staffName(data, alloc.facultyId).toLowerCase() : '';
          if (!subject.name.toLowerCase().includes(q) && !subject.code.toLowerCase().includes(q) && !facName.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => Number(a.code.replace(/\D/g, '')) - Number(b.code.replace(/\D/g, '')) || a.code.localeCompare(b.code));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deptSubjects, data.staff, data.subjectAllocations, deptId, semester, sectionFilter, typeFilter, statusFilter, search]);

  const stats = useMemo(() => {
    const statuses = filteredRows.map(rowStatus);
    const allocs = filteredRows.map((s) => allocFor(s.id));
    const facultyIds = new Set(allocs.filter((a) => a?.facultyId).map((a) => a!.facultyId));
    const resourceIds = new Set(allocs.filter((a) => (a?.resourceIds.length ?? 0) > 0).flatMap((a) => a!.resourceIds));
    return {
      total: filteredRows.length,
      allocated: statuses.filter((s) => s === 'allocated').length,
      partial: statuses.filter((s) => s === 'partially-allocated').length,
      pending: statuses.filter((s) => s === 'pending' || s === 'draft').length,
      facultyCount: facultyIds.size,
      resourceCount: resourceIds.size,
      conflicts: statuses.filter((s) => s === 'conflict').length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredRows, data.staff, data.subjectAllocations]);

  /* ---------------- Persistence callbacks ---------------- */

  const buildAlloc = (subject: Subject, form: DrawerForm, existing: SubjectAllocation | null, status: SubjectAllocation['status']): SubjectAllocation => {
    const now = new Date().toISOString().slice(0, 10);
    return {
      id: existing?.id ?? `al${Date.now()}`,
      subjectId: subject.id,
      departmentId: deptId,
      semester,
      academicYear: ACADEMIC_YEAR,
      classIds: form.classIds,
      facultyId: form.facultyId,
      resourceIds: form.resourceIds,
      requiredTypes: form.requiredTypes,
      status,
      weeklyHours: subject.weeklyHrs,
      createdBy: existing?.createdBy ?? currentUser?.id ?? '',
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
  };

  const finalizeAllocation = (
    subject: Subject,
    form: DrawerForm,
    existing: SubjectAllocation | null,
    mode: 'assign' | 'edit',
    overrides: { workloadOverride?: boolean; capacityOverrideIds?: string[] }
  ) => {
    const status = deriveAllocationStatus(data, {
      id: existing?.id ?? 'new', subjectId: subject.id, departmentId: deptId, semester,
      classIds: form.classIds, facultyId: form.facultyId, resourceIds: form.resourceIds,
      weeklyHours: subject.weeklyHrs, requiredTypes: form.requiredTypes,
    });
    const alloc = buildAlloc(subject, form, existing, status);

    if (mode === 'assign') {
      const stale = data.subjectAllocations.find((a) => a.subjectId === subject.id && a.departmentId === deptId && a.semester === semester);
      if (stale) removeSubjectAllocation(stale.id);
    }
    saveSubjectAllocation(alloc);

    /* Keep the subject master in sync (legacy facultyId consumers auto-update) */
    updateSubject(subject.id, {
      facultyId: form.facultyId ?? '',
      classes: form.classIds.map((sec) => `${deptCodeShort(data, deptId)}-${sec} Sem-${semester}`),
    });

    /* Audit trail */
    buildHistory(data, subject, existing, alloc, semester, currentUser?.id ?? '').forEach(addAllocationHistory);

    /* Faculty workloads, dashboards, notifications */
    synchronizeFaculty(data, {
      oldFacultyId: existing?.facultyId ?? null,
      newFacultyId: form.facultyId,
      subject,
      alloc,
      deptId,
      semester,
      updateStaff,
      addNotification,
      overrides,
    });

    if (mode === 'assign') {
      addToast('success', `Allocation Successful — ${subject.name} is now active for the assigned faculty, classes and resources.`);
    } else {
      addToast('info', `${subject.name} allocation updated and all conflicts re-validated.`);
    }
    setDrawer(null);
  };

  const saveDraftAllocation = (subject: Subject, form: DrawerForm, existing: SubjectAllocation | null) => {
    const alloc = buildAlloc(subject, form, existing, 'draft');
    const stale = data.subjectAllocations.find((a) => a.subjectId === subject.id && a.departmentId === deptId && a.semester === semester && a.status === 'draft');
    if (existing) saveSubjectAllocation(alloc);
    else {
      if (stale) removeSubjectAllocation(stale.id);
      saveSubjectAllocation(alloc);
    }
    addAllocationHistory({
      id: `ah${Date.now()}`,
      allocationId: alloc.id,
      subjectId: subject.id,
      date: new Date().toISOString().slice(0, 10),
      changeType: existing ? 'draft-saved' : 'created',
      previous: existing ? existing.status : '',
      current: 'draft',
      changedBy: currentUser?.id ?? '',
      reason: 'Draft saved for later review',
    });
    addToast('info', `Draft saved for ${subject.name}. You can continue later.`);
    setDrawer(null);
  };

  /* ---------------- Confirm preflight ---------------- */
  const [confirmState, setConfirmState] = useState<{
    subject: Subject;
    form: DrawerForm;
    existing: SubjectAllocation | null;
    mode: 'assign' | 'edit';
    items: { id: string; type: string; message: string; overrideable: boolean }[];
    impacted: import('../../data/types').TimetableEntry[];
    workloadOverride: boolean;
    capacityOverrides: string[];
  } | null>(null);

  const requestConfirm = (subject: Subject, form: DrawerForm) => {
    const existing = data.subjectAllocations.find((a) => a.subjectId === subject.id && a.departmentId === deptId && a.semester === semester) ?? null;
    const conflicts = allocationConflicts(data, {
      id: existing?.id ?? 'new', subjectId: subject.id, departmentId: deptId, semester,
      classIds: form.classIds, facultyId: form.facultyId, resourceIds: form.resourceIds,
      weeklyHours: subject.weeklyHrs, requiredTypes: form.requiredTypes,
    });
    const items = conflicts.map((c) => ({
      id: c.id, type: c.type, message: c.message,
      overrideable: c.severity === 'error' && (c.type === 'Workload' || c.type === 'Capacity'),
    }));

    const blocked = conflicts.filter((c) => c.severity === 'error' && c.type !== 'Workload' && c.type !== 'Capacity');
    if (blocked.length > 0) {
      addToast('error', `${blocked.length} blocker(s): ` + blocked.map((b) => b.message).join(' · '));
      return;
    }

    /* Timetable impact when published entries reference the old faculty/resource */
    const tempAlloc: SubjectAllocation = {
      id: existing?.id ?? 'new', subjectId: subject.id, departmentId: deptId, semester,
      classIds: form.classIds, facultyId: form.facultyId, resourceIds: form.resourceIds,
      requiredTypes: form.requiredTypes, status: 'allocated', weeklyHours: subject.weeklyHrs,
      academicYear: ACADEMIC_YEAR, createdBy: currentUser?.id ?? '', createdAt: '', updatedAt: '',
    };
    let impacted: import('../../data/types').TimetableEntry[] = [];
    if (existing) {
      if (existing.facultyId !== form.facultyId) {
        impacted = affectedPublishedEntries(data, tempAlloc, { oldFacultyId: existing.facultyId });
      } else {
        const removedRes = existing.resourceIds.filter((r) => !form.resourceIds.includes(r));
        if (removedRes.length > 0) impacted = affectedPublishedEntries(data, tempAlloc, { oldResourceIds: removedRes });
      }
    }

    const needsOverride = items.some((i) => i.overrideable);
    if (needsOverride || impacted.length > 0) {
      setConfirmState({ subject, form, existing, mode: existing ? 'edit' : 'assign', items, impacted, workloadOverride: false, capacityOverrides: [] });
      return;
    }
    finalizeAllocation(subject, form, existing, existing ? 'edit' : 'assign', {});
  };

  const performConfirmed = () => {
    if (!confirmState) return;
    finalizeAllocation(
      confirmState.subject,
      confirmState.form,
      confirmState.existing,
      confirmState.mode,
      { workloadOverride: confirmState.workloadOverride, capacityOverrideIds: confirmState.capacityOverrides }
    );
    setConfirmState(null);
  };

  return (
    <div>
      <PageHeader
        title="Subject Allocation"
        description="Allocate subjects to faculty and assign the required classes and resources for the selected semester."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button className="btn-primary whitespace-nowrap" onClick={() => setPickerOpen(true)}>
              <Plus className="w-4 h-4" /> Allocate Subject
            </button>
            <button className="btn-secondary whitespace-nowrap" onClick={() => setHistoryOpen(true)}>
              <History className="w-4 h-4" /> Allocation History
            </button>
          </div>
        }
      />

      {!embedded && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {SEMESTERS.map((sem) => (
            <button
              key={sem}
              onClick={() => { setSemester(sem); setSectionFilter('all'); }}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                semester === sem ? 'bg-slate-900 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {semShort(sem)}
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 mb-5">
        <div className="flex flex-col lg:flex-row lg:items-end gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Search subject, code, or faculty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {!embedded && (
              <label className="block">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Section</span>
                <select className="input mt-0.5" value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
                  <option value="all">All Sections</option>
                  {classOptions.map((c) => (
                    <option key={c.section} value={c.section}>{c.label}</option>
                  ))}
                </select>
              </label>
            )}
            <label className="block">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Subject Type</span>
              <select className="input mt-0.5" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="all">All Types</option>
                {(['theory', 'laboratory', 'seminar', 'special'] as const).map((t) => (
                  <option key={t} value={t}>{subjectTypeLabel(t)}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Allocation Status</span>
              <select className="input mt-0.5" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="allocated">Allocated</option>
                <option value="partially-allocated">Partially Allocated</option>
                <option value="pending">Pending</option>
                <option value="conflict">Conflict</option>
                <option value="draft">Draft</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <StatCard label="Total Subjects" value={stats.total} icon={<BookOpen className="w-5 h-5" />} accent="blue" />
        <StatCard label="Fully Allocated" value={stats.allocated} icon={<CheckCircle2 className="w-5 h-5" />} accent="emerald" />
        <StatCard label="Partially Allocated" value={stats.partial} icon={<ClipboardList className="w-5 h-5" />} accent="amber" />
        <StatCard label="Pending" value={stats.pending} icon={<Clock className="w-5 h-5" />} accent="slate" />
        <StatCard label="Faculty Assigned" value={stats.facultyCount} icon={<UserCheck className="w-5 h-5" />} accent="indigo" />
        <StatCard label="Conflicts" value={stats.conflicts} icon={<ShieldAlert className="w-5 h-5" />} accent={stats.conflicts > 0 ? 'rose' : 'emerald'} />
      </div>

      {/* Main table */}
      <AllocationTable
        rows={filteredRows}
        data={data}
        semester={semester}
        onAssign={(subject) => {
          const alloc = allocFor(subject.id);
          setDrawer({ subject, allocation: alloc, opening: alloc ? 'edit' : 'assign' });
        }}
        onResourceClick={(subject, e) => setResourcePopover({ subject, allocation: allocFor(subject.id), x: e.clientX, y: e.clientY })}
      />

      {/* New allocation picker */}
      <Modal open={pickerOpen} onClose={() => setPickerOpen(false)} title="Allocate Subject" subtitle={`Select a subject in ${semLabel(semester)}`} size="lg">
        <div className="space-y-2">
          {deptSubjects.length === 0 && <p className="text-sm text-slate-400 text-center py-8">No subjects found for this semester.</p>}
          {deptSubjects.map((subject) => {
            const alloc = allocFor(subject.id);
            const status = alloc?.status ?? 'pending';
            return (
              <button
                key={subject.id}
                className="w-full flex items-center justify-between gap-3 card p-3.5 card-hover text-left"
                onClick={() => { setPickerOpen(false); setDrawer({ subject, allocation: alloc, opening: alloc ? 'edit' : 'assign' }); }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{subject.name}</p>
                    <p className="text-xs text-slate-500">{subject.code} · {subjectTypeLabel(subject.type)} · {subject.credits} credits</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={status} />
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </button>
            );
          })}
        </div>
      </Modal>

      {/* Allocation drawer */}
      {drawer && (
        <AllocationDrawer
          key={drawer.subject.id}
          subject={drawer.subject}
          allocation={drawer.allocation}
          mode={drawer.opening}
          semester={semester}
          deptId={deptId}
          onClose={() => setDrawer(null)}
          onSaveDraft={(form) => saveDraftAllocation(drawer.subject, form, drawer.allocation)}
          onConfirm={(form) => requestConfirm(drawer.subject, form)}
        />
      )}

      {/* Confirm / override / timetable impact modal */}
      {confirmState && (
        <ConfirmAllocationModal
          state={confirmState}
          onWorkloadOverride={(v) => setConfirmState({ ...confirmState, workloadOverride: v })}
          onCapacityOverride={(id, v) =>
            setConfirmState({
              ...confirmState,
              capacityOverrides: v ? [...confirmState.capacityOverrides, id] : confirmState.capacityOverrides.filter((x) => x !== id),
            })
          }
          onCancel={() => setConfirmState(null)}
          onConfirm={performConfirmed}
        />
      )}

      {/* Resource list popover */}
      {resourcePopover && <ResourcePopover popover={resourcePopover} onClose={() => setResourcePopover(null)} />}

      {/* Allocation history */}
      <AllocationHistoryModal open={historyOpen} onClose={() => setHistoryOpen(false)} deptId={deptId} />

      {/* Toasts */}
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </div>
  );
}

/* ================= Main allocation table ================= */

function AllocationTable({
  rows,
  data,
  semester,
  onAssign,
  onResourceClick,
}: {
  rows: Subject[];
  data: AppData;
  semester: number;
  onAssign: (subject: Subject) => void;
  onResourceClick: (subject: Subject, e: React.MouseEvent) => void;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Subject', 'Code', 'Type', 'Credits', 'Classes', 'Assigned Faculty', 'Resources', 'Status', 'Action'].map((h) => (
                <th key={h} className={`px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider ${h === 'Credits' ? 'text-right' : ''} ${h === 'Action' ? 'text-right' : ''}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-4"><Search className="w-6 h-6 text-slate-400" /></div>
                  <p className="text-sm font-medium text-slate-900">No subjects match your filters</p>
                  <p className="text-xs text-slate-500 mt-1">Try changing the semester or clearing the search.</p>
                </td>
              </tr>
            )}
            {rows.map((subject) => {
              const alloc = data.subjectAllocations.find((a) => a.subjectId === subject.id && a.departmentId === subject.departmentId && a.semester === semester);
              const status = alloc?.status ?? 'pending';
              const hasResources = alloc && alloc.resourceIds.length > 0;
              return (
                <tr key={subject.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">{subject.name}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">{subject.code}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${subject.type === 'laboratory' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                      {subjectTypeLabel(subject.type)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 text-right tabular-nums">{subject.credits}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {alloc && alloc.classIds.length > 0
                      ? alloc.classIds.map((c) => classLabel(semester, c)).join(', ')
                      : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {alloc && alloc.facultyId ? <span className="font-medium">{staffName(data, alloc.facultyId)}</span> : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {hasResources ? (
                      <button
                        className="inline-flex items-center gap-1 text-sm text-blue-700 hover:text-blue-900 hover:underline font-medium"
                        onClick={(e) => { e.stopPropagation(); onResourceClick(subject, e); }}
                        title="View complete resource list"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        {resourceShortLabel(data, alloc.resourceIds)}
                      </button>
                    ) : (
                      <span className="text-slate-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={status} /></td>
                  <td className="px-4 py-3 text-right">
                    <button
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        alloc ? 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-50' : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                      onClick={(e) => { e.stopPropagation(); onAssign(subject); }}
                    >
                      {alloc ? <><RefreshCw className="w-3.5 h-3.5" /> Edit</> : <><Plus className="w-3.5 h-3.5" /> Assign</>}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= Resource popover ================= */

function ResourcePopover({ popover, onClose }: { popover: { subject: Subject; allocation: SubjectAllocation | null; x: number; y: number }; onClose: () => void }) {
  const { data } = useStore();
  const resources =
    popover.allocation?.resourceIds
      .map((id) => data.resources.find((r) => r.id === id))
      .filter((r): r is NonNullable<typeof r> => !!r) ?? [];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 w-80 card p-4 shadow-xl"
        style={{ top: Math.min(popover.y, window.innerHeight - 320), left: Math.min(popover.x, window.innerWidth - 340) }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">{popover.subject.name}</p>
            <p className="text-xs text-slate-500">{popover.subject.code} · Assigned Resources</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"><X className="w-4 h-4" /></button>
        </div>
        {resources.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No resources assigned yet.</p>
        ) : (
          <div className="space-y-2">
            {resources.map((r) => (
              <div key={r.id} className="flex items-start justify-between gap-2 p-2.5 rounded-lg bg-slate-50">
                <div>
                  <p className="text-sm font-medium text-slate-900">{r.name}</p>
                  <p className="text-xs text-slate-500">{categoryLabel(r.category)} · {r.location}</p>
                  {r.capacity ? <p className="text-xs text-slate-500 mt-0.5">Capacity: {r.capacity} students</p> : null}
                </div>
                <StatusBadge status={resourceEffectiveStatus(data, r)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ================= Toast stack ================= */

/* ================= Allocation history ================= */

function AllocationHistoryModal({ open, onClose, deptId }: { open: boolean; onClose: () => void; deptId: string }) {
  const { data } = useStore();
  const subjectIds = new Set(data.subjects.filter((s) => s.departmentId === deptId).map((s) => s.id));
  const rows = data.allocationHistory.filter((h) => subjectIds.has(h.subjectId)).sort((a, b) => b.date.localeCompare(a.date));

  const changeColors: Record<string, string> = {
    created: 'bg-emerald-100 text-emerald-700',
    confirmed: 'bg-blue-100 text-blue-700',
    'draft-saved': 'bg-slate-100 text-slate-600',
    'faculty-changed': 'bg-indigo-100 text-indigo-700',
    'resource-changed': 'bg-violet-100 text-violet-700',
    'class-added': 'bg-emerald-100 text-emerald-700',
    'class-removed': 'bg-rose-100 text-rose-700',
    'resource-added': 'bg-emerald-100 text-emerald-700',
    'resource-removed': 'bg-rose-100 text-rose-700',
    'status-changed': 'bg-amber-100 text-amber-700',
  };

  return (
    <Modal open={open} onClose={onClose} title="Allocation History" subtitle="Audit trail of every faculty, class and resource change" size="xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Date', 'Subject', 'Change', 'Previous', 'New', 'Changed By', 'Reason'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">No allocation changes recorded yet.</td></tr>
            )}
            {rows.map((h) => {
              const subject = data.subjects.find((s) => s.id === h.subjectId);
              return (
                <tr key={h.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">{h.date}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">{subject?.name ?? '—'}</p>
                    <p className="text-xs text-slate-400">{subject?.code}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${changeColors[h.changeType] ?? 'bg-slate-100 text-slate-600'}`}>{h.changeType.replace(/-/g, ' ')}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-rose-600 max-w-[220px]">{h.previous || '—'}</td>
                  <td className="px-4 py-3 text-sm text-emerald-700 max-w-[220px]">{h.current}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">{staffName(data, h.changedBy)}</td>
                  <td className="px-4 py-3 text-sm text-slate-500 max-w-[240px]">{h.reason ?? '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}

/* ================= Toast stack ================= */

function ToastStack({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <AlertTriangle className="w-5 h-5 text-rose-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  };
  const bars = {
    success: 'border-l-emerald-500',
    error: 'border-l-rose-500',
    info: 'border-l-blue-500',
    warning: 'border-l-amber-500',
  };
  return (
    <div className="fixed top-20 right-4 z-[70] space-y-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map((t) => (
        <div key={t.id} className={`card p-3.5 border-l-4 ${bars[t.type]} shadow-lg`}>
          <div className="flex items-start gap-2.5">
            <div className="flex-shrink-0 mt-0.5">{icons[t.type]}</div>
            <p className="text-sm text-slate-700 flex-1">{t.message}</p>
            <button onClick={() => onDismiss(t.id)} className="text-slate-300 hover:text-slate-500"><X className="w-4 h-4" /></button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================= Allocation drawer (shell) ================= */

function AllocationDrawer({
  subject,
  allocation,
  mode,
  semester,
  deptId,
  onClose,
  onSaveDraft,
  onConfirm,
}: {
  subject: Subject;
  allocation: SubjectAllocation | null;
  mode: 'assign' | 'edit';
  semester: number;
  deptId: string;
  onClose: () => void;
  onSaveDraft: (form: DrawerForm) => void;
  onConfirm: (form: DrawerForm) => void;
}) {
  const { data } = useStore();
  const [form, setForm] = useState<DrawerForm>(() => ({
    classIds: allocation?.classIds ?? [],
    facultyId: allocation?.facultyId ?? null,
    resourceIds: allocation?.resourceIds ?? [],
    requiredTypes: allocation?.requiredTypes ?? DEFAULT_REQUIRED_BY_TYPE[subject.type] ?? [],
  }));

  const conflicts = useMemo(
    () =>
      allocationConflicts(data, {
        id: allocation?.id ?? 'drawer',
        subjectId: subject.id,
        departmentId: deptId,
        semester,
        classIds: form.classIds,
        facultyId: form.facultyId,
        resourceIds: form.resourceIds,
        weeklyHours: subject.weeklyHrs,
        requiredTypes: form.requiredTypes,
      }),
    [data, subject, semester, form, allocation, deptId]
  );
  const errors = conflicts.filter((c) => c.severity === 'error');
  const warnings = conflicts.filter((c) => c.severity === 'warning');

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-full max-w-3xl bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4 bg-white">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{mode === 'edit' ? 'Edit Allocation' : 'Subject Allocation'}</h2>
              {allocation && <StatusBadge status={allocation.status} />}
            </div>
            <div className="mt-2 card p-3.5 bg-slate-50 rounded-xl border-slate-200">
              <p className="text-base font-semibold text-slate-900">{subject.name}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-slate-500">
                <span>Code: {subject.code}</span>
                <span>Semester: {semLabel(semester)}</span>
                <span>Type: {subjectTypeLabel(subject.type)}</span>
                <span>Credits: {subject.credits}</span>
                <span>Hours: {subject.weeklyHrs}/wk</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <DrawerClasses subject={subject} semester={semester} deptId={deptId} form={form} setForm={setForm} />
          <Separator />
          <FacultySection subject={subject} semester={semester} deptId={deptId} allocationId={allocation?.id} form={form} setForm={setForm} />
          <Separator />
          <ResourceSection subject={subject} semester={semester} deptId={deptId} form={form} setForm={setForm} />
          <Separator />
          <ReviewSection subject={subject} semester={semester} form={form} errors={errors} warnings={warnings} />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between gap-3">
          <p className="text-xs text-slate-400 hidden sm:block">The allocation is validated automatically on every change.</p>
          <div className="flex items-center gap-2">
            <button className="btn-secondary" onClick={() => onSaveDraft(form)}><Save className="w-4 h-4" /> Save Draft</button>
            <button className="btn-primary" onClick={() => onConfirm(form)}><CheckSquare className="w-4 h-4" /> Confirm Allocation</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Separator() {
  return <div className="border-t border-dashed border-slate-200" />;
}

/* -------- Drawer: Faculty Assignment -------- */

function FacultySection({
  subject,
  semester,
  deptId,
  allocationId,
  form,
  setForm,
}: {
  subject: Subject;
  semester: number;
  deptId: string;
  allocationId?: string;
  form: DrawerForm;
  setForm: React.Dispatch<React.SetStateAction<DrawerForm>>;
}) {
  const { data } = useStore();
  const [search, setSearch] = useState('');
  void semester;
  void deptId;

  const options = useMemo(() => facultyOptions(data, subject, form.classIds, allocationId), [data, subject, form.classIds, allocationId]);
  const q = search.trim().toLowerCase();
  const visible = q
    ? options.filter((o) =>
        o.faculty.name.toLowerCase().includes(q) ||
        o.faculty.designation.toLowerCase().includes(q) ||
        o.faculty.subjects.some((s) => s.toLowerCase().includes(q))
      )
    : options;

  const selected = options.find((o) => o.faculty.id === form.facultyId) ?? null;
  const workload = selected ? facultyWorkload(data, selected.faculty.id, subject.weeklyHrs, allocationId) : null;
  const wlPct = workload ? Math.min(100, Math.round((workload.projected / MAX_ALLOWED_HRS) * 100)) : 0;

  const compatLabel = (score: number) => (score >= 70 ? 'High' : score >= 40 ? 'Medium' : 'Low');
  const compatCls = (score: number) => (score >= 70 ? 'bg-emerald-100 text-emerald-700' : score >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700');

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center"><GraduationCap className="w-4 h-4" /></div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Faculty Assignment</h3>
          <p className="text-xs text-slate-500">Select Faculty — the system recommends suitable faculty, you decide.</p>
        </div>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          className="input pl-9"
          placeholder="Search faculty by name, designation, expertise..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {selected && workload && (
        <div className="card p-4 mb-3 border-indigo-200 bg-indigo-50/40">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">{selected.faculty.name} — Workload</p>
              <p className="text-xs text-slate-500">Current {workload.current} hrs/week → This Subject {workload.subjectHours} hrs → Projected {workload.projected} hrs/week</p>
            </div>
            <span className={`badge ${workload.level === 'ok' ? 'bg-emerald-100 text-emerald-700' : workload.level === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
              {workload.level === 'ok' ? 'Workload OK' : workload.level === 'high' ? 'High Workload' : 'Workload Limit Exceeded'}
            </span>
          </div>
          <div className="h-2 bg-slate-200/70 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${workload.level === 'ok' ? 'bg-emerald-500' : workload.level === 'high' ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${wlPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>0</span>
            <span>Recommended {MAX_RECOMMENDED_HRS}h</span>
            <span>Max {MAX_ALLOWED_HRS}h</span>
          </div>
          {workload.level === 'exceeded' && (
            <p className="text-xs text-rose-600 font-medium mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Assigning this subject will increase the workload from {workload.current} to {workload.projected} hrs/week — confirmation with override is required.
            </p>
          )}
        </div>
      )}

      {/* Faculty cards */}
      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {visible.length === 0 && (
          <div className="card p-6 text-center">
            <p className="text-sm font-medium text-slate-900">No matching faculty</p>
            <p className="text-xs text-slate-500 mt-1">Try a different search term.</p>
          </div>
        )}
        {visible.map((o) => {
          const isSelected = form.facultyId === o.faculty.id;
          const unavailable = o.faculty.status !== 'active';
          return (
            <button
              key={o.faculty.id}
              disabled={unavailable && !isSelected}
              onClick={() => setForm((f) => ({ ...f, facultyId: isSelected ? null : o.faculty.id }))}
              className={`w-full text-left p-4 rounded-xl border transition-colors ${
                isSelected ? 'border-indigo-400 bg-indigo-50/60 ring-1 ring-indigo-200' : 'border-slate-200 hover:bg-slate-50'
              } ${unavailable && !isSelected ? 'opacity-70' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-600 to-blue-700 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {o.faculty.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-900">{o.faculty.name}</p>
                      {o.level === 'recommended' && (
                        <span className="badge bg-emerald-100 text-emerald-700"><Star className="w-3 h-3 mr-0.5" /> Recommended</span>
                      )}
                      {unavailable && <span className="badge bg-rose-100 text-rose-700">Unavailable</span>}
                    </div>
                    <p className="text-xs text-slate-500">{o.faculty.designation}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Expertise: {o.faculty.subjects.length > 0 ? o.faculty.subjects.join(', ') : 'General'}</p>
                  </div>
                </div>
                <span className={`badge flex-shrink-0 ${compatCls(o.score)}`}>Compatibility: {compatLabel(o.score)}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-center">
                <div className="bg-white rounded-lg border border-slate-100 p-2">
                  <p className="text-sm font-bold text-slate-900">{o.currentLoad}<span className="text-xs font-normal text-slate-400">/{MAX_RECOMMENDED_HRS}h</span></p>
                  <p className="text-[10px] text-slate-500 uppercase">Current Load</p>
                </div>
                <div className="bg-white rounded-lg border border-slate-100 p-2">
                  <p className="text-sm font-bold text-slate-900">{subject.weeklyHrs} hrs</p>
                  <p className="text-[10px] text-slate-500 uppercase">This Subject</p>
                </div>
                <div className={`rounded-lg border p-2 ${o.projectedLoad > MAX_ALLOWED_HRS ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-100'}`}>
                  <p className={`text-sm font-bold ${o.projectedLoad > MAX_ALLOWED_HRS ? 'text-rose-600' : 'text-slate-900'}`}>{o.projectedLoad}<span className="text-xs font-normal text-slate-400">/{MAX_RECOMMENDED_HRS}h</span></p>
                  <p className="text-[10px] text-slate-500 uppercase">After Allocation</p>
                </div>
                <div className="bg-white rounded-lg border border-slate-100 p-2">
                  <p className="text-sm font-bold text-emerald-600">{o.matchedExpertise ? 'Expert' : 'Eligible'}</p>
                  <p className="text-[10px] text-slate-500 uppercase">Expertise</p>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {o.reasons.slice(0, 4).map((r, i) => (
                  <span key={i} className="text-[10px] text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">{r}</span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function DrawerClasses({
  subject,
  semester,
  deptId,
  form,
  setForm,
}: {
  subject: Subject;
  semester: number;
  deptId: string;
  form: DrawerForm;
  setForm: React.Dispatch<React.SetStateAction<DrawerForm>>;
}) {
  const { data } = useStore();
  const classOptions = getClassSections(data, deptId, semester);
  void subject;

  const toggle = (sec: string) =>
    setForm((f) => ({ ...f, classIds: f.classIds.includes(sec) ? f.classIds.filter((c) => c !== sec) : [...f.classIds, sec] }));

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center"><Users className="w-4 h-4" /></div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Classes & Sections</h3>
          <p className="text-xs text-slate-500">Select which classes this subject applies to.</p>
        </div>
      </div>
      <div className="space-y-2">
        {classOptions.length === 0 && (
          <div className="card p-6 text-center">
            <p className="text-sm font-medium text-slate-900">No active students in this semester</p>
            <p className="text-xs text-slate-500 mt-1">Add students to a section to enable class allocation.</p>
          </div>
        )}
        {classOptions.map((c) => {
          const selected = form.classIds.includes(c.section);
          return (
            <button
              key={c.section}
              onClick={() => toggle(c.section)}
              className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl border transition-colors text-left ${
                selected ? 'border-blue-400 bg-blue-50/60 ring-1 ring-blue-200' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs ${selected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'}`}>
                  {selected && <CheckSquare className="w-3.5 h-3.5" />}
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-900">{c.label}</p>
                  <p className="text-xs text-slate-500">
                    {c.studentCount} students · Capacity {c.capacity}
                    {c.subjectNames.length > 0 ? ` · Already: ${c.subjectNames.join(', ')}` : ' · No subjects allocated yet'}
                  </p>
                </div>
              </div>
              <span className={`badge ${selected ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>{selected ? 'Selected' : 'Select'}</span>
            </button>
          );
        })}
      </div>
      <p className="text-xs font-medium text-blue-700 mt-2.5">Selected Classes: {form.classIds.length}</p>
      {form.classIds.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-2 mt-2">
          {classOptions.filter((c) => form.classIds.includes(c.section)).map((c) => (
            <div key={c.section} className="card p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-slate-900">{c.label}</p>
                <Users className="w-4 h-4 text-slate-400" />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div><p className="text-lg font-bold text-slate-900">{c.studentCount}</p><p className="text-[10px] text-slate-500 uppercase">Students</p></div>
                <div><p className="text-lg font-bold text-slate-900">{c.capacity}</p><p className="text-[10px] text-slate-500 uppercase">Capacity</p></div>
                <div><p className="text-lg font-bold text-slate-900">{c.subjectNames.length}</p><p className="text-[10px] text-slate-500 uppercase">Subjects</p></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
/* -------- Drawer: Required Resources -------- */

const ALL_RESOURCE_CATEGORIES: ResourceCategory[] = ['classroom', 'projector', 'smart-board', 'computer', 'furniture', 'teaching-equipment', 'book', 'other-equipment'];

function ResourceSection({
  subject,
  semester,
  deptId,
  form,
  setForm,
}: {
  subject: Subject;
  semester: number;
  deptId: string;
  form: DrawerForm;
  setForm: React.Dispatch<React.SetStateAction<DrawerForm>>;
}) {
  const { data } = useStore();
  const [search, setSearch] = useState('');

  const options = useMemo(() => resourceOptions(data, subject, form.classIds, form.requiredTypes), [data, subject, form.classIds, form.requiredTypes]);
  const q = search.trim().toLowerCase();
  const visible = q ? options.filter((o) => o.resource.name.toLowerCase().includes(q) || o.resource.location.toLowerCase().includes(q)) : options;

  const style = subject.type === 'theory'
    ? 'Classroom + Projector'
    : subject.type === 'laboratory'
    ? 'Laboratory + Computers + Projector'
    : subject.type === 'seminar'
    ? 'Seminar Hall + Projector + Audio System'
    : 'Classroom + Projector';

  const maintenance = (r: { equipment?: { status: string }[] }) =>
    r.equipment?.some((e) => e.status === 'under-repair') ? 'Needs Attention' : 'Good';

  const toggle = (rid: string) =>
    setForm((f) => ({ ...f, resourceIds: f.resourceIds.includes(rid) ? f.resourceIds.filter((r) => r !== rid) : [...f.resourceIds, rid] }));

  const addRequirement = (cat: ResourceCategory) =>
    setForm((f) => ({ ...f, requiredTypes: f.requiredTypes.includes(cat) ? f.requiredTypes : [...f.requiredTypes, cat] }));

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center"><Wrench className="w-4 h-4" /></div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Required Resources</h3>
          <p className="text-xs text-slate-500">Resources are assigned together with the subject — no separate allocation needed.</p>
        </div>
      </div>

      {/* Resource requirements */}
      <div className="card p-3.5 mb-3">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Resource Requirements</p>
        <p className="text-xs text-slate-500 mb-2">
          Suggested for a {subjectTypeLabel(subject.type).toLowerCase()} subject: <span className="font-medium text-slate-700">{style}</span>. You can modify.
        </p>
        <div className="flex flex-wrap gap-1.5 items-center">
          {form.requiredTypes.map((cat) => (
            <span key={cat} className="badge bg-slate-900 text-white pl-2.5 pr-1.5 py-1">
              {categoryLabel(cat)}
              <button className="ml-1.5 text-slate-300 hover:text-white" onClick={() => setForm((f) => ({ ...f, requiredTypes: f.requiredTypes.filter((c) => c !== cat) }))}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <select
            className="input !w-auto !py-1 !px-2 text-xs"
            value=""
            onChange={(e) => { if (e.target.value) addRequirement(e.target.value as ResourceCategory); }}
          >
            <option value="">+ Add requirement</option>
            {ALL_RESOURCE_CATEGORIES.filter((c) => !form.requiredTypes.includes(c)).map((c) => (
              <option key={c} value={c}>{categoryLabel(c)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          className="input pl-9"
          placeholder="Search resources by name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Select Resources</p>
      <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
        {visible.length === 0 && (
          <div className="card p-6 text-center">
            <p className="text-sm font-medium text-slate-900">No resources match your search</p>
            <p className="text-xs text-slate-500 mt-1">Try a different term.</p>
          </div>
        )}
{visible.map((o) => {
          const isSelected = form.resourceIds.includes(o.resource.id);
          const disabled = o.status === 'under-maintenance' || o.status === 'damaged' || o.status === 'retired';
          const capacityConflict = o.resource.capacity ? o.resource.capacity < o.maxClassStrength : false;
          return (
            <div key={o.resource.id} className={`card p-3.5 transition-colors ${isSelected ? 'border-amber-400 ring-1 ring-amber-200' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-900">{o.resource.name}</p>
                    {o.level === 'recommended' && (
                      <span className="badge bg-emerald-100 text-emerald-700"><Star className="w-3 h-3 mr-0.5" /> Recommended</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 flex-wrap">
                    <Layers className="w-3 h-3" /> {categoryLabel(o.resource.category)} · <MapPin className="w-3 h-3" /> {o.resource.location}
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500 mt-1">
                    {o.resource.capacity ? <span>Capacity: {o.resource.capacity}</span> : null}
                    <span>Maintenance: {maintenance(o.resource)}</span>
                    {capacityConflict ? (
                      <span className="text-rose-600 font-medium">Capacity Conflict</span>
                    ) : (
                      o.resource.capacity ? <span className="text-emerald-600">Meets class strength ({o.maxClassStrength})</span> : null
                    )}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {o.reasons.slice(0, 3).map((r, i) => (
                      <span key={i} className="text-[10px] text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">{r}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <StatusBadge status={o.status} />
                  <button
                    disabled={disabled && !isSelected}
                    onClick={() => toggle(o.resource.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      isSelected
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : disabled
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {isSelected ? 'Selected' : disabled ? 'Unavailable' : 'Select'}
                  </button>
                </div>
              </div>
              {isSelected && capacityConflict && (
                <p className="text-xs text-rose-600 font-medium mt-2 flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-lg p-2">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  This {categoryLabel(o.resource.category).toLowerCase()} can accommodate only {o.resource.capacity} students, but the selected section(s) contain {o.maxClassStrength} students.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
/* -------- Drawer: Combined allocation review -------- */

function ReviewSection({
  subject,
  semester,
  form,
  errors,
  warnings,
}: {
  subject: Subject;
  semester: number;
  form: DrawerForm;
  errors: ReturnType<typeof allocationConflicts>;
  warnings: ReturnType<typeof allocationConflicts>;
}) {
  const { data } = useStore();
  const faculty = form.facultyId ? data.staff.find((s) => s.id === form.facultyId) : undefined;
  const workload = faculty ? facultyWorkload(data, faculty.id, subject.weeklyHrs) : null;
  const classLabels = form.classIds.map((c) => classLabel(semester, c)).join(', ') || '—';
  const resNames = form.resourceIds.map((id) => data.resources.find((r) => r.id === id)?.name ?? '—');

  const strength = Math.max(
    ...form.classIds.map((s) => data.students.filter((x) => x.departmentId === subject.departmentId && x.semester === semester && x.section === s && x.status === 'active').length),
    0
  );
  const capacityOk = form.resourceIds.every((rid) => {
    const r = data.resources.find((x) => x.id === rid);
    return !r?.capacity || r.capacity >= strength;
  });

  const row = (label: string, value: React.ReactNode, ok: 'ok' | 'warn' | 'error') => (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="flex items-center gap-1.5">
        {ok === 'ok' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
        {ok === 'warn' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
        {ok === 'error' && <AlertTriangle className="w-4 h-4 text-rose-500" />}
        <span className={`text-sm font-medium ${ok === 'error' ? 'text-rose-600' : ok === 'warn' ? 'text-amber-600' : 'text-emerald-700'}`}>{value}</span>
      </span>
    </div>
  );

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center"><FileText className="w-4 h-4" /></div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Combined Allocation Review</h3>
          <p className="text-xs text-slate-500">Everything in one place before you confirm.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="card p-4">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Allocation</p>
          <div className="space-y-1.5 text-sm">
            <p className="flex justify-between"><span className="text-slate-500">Subject</span><span className="font-medium text-slate-900 text-right">{subject.name}</span></p>
            <p className="flex justify-between"><span className="text-slate-500">Code</span><span className="font-medium text-slate-900">{subject.code}</span></p>
            <p className="flex justify-between"><span className="text-slate-500">Classes</span><span className="font-medium text-slate-900 text-right">{classLabels}</span></p>
            <p className="flex justify-between"><span className="text-slate-500">Faculty</span><span className="font-medium text-slate-900 text-right">{faculty ? faculty.name : 'Not assigned'}</span></p>
            <p className="flex justify-between"><span className="text-slate-500">Workload</span><span className="font-medium text-slate-900">{workload ? `${workload.current} → ${workload.projected} hrs/week` : '—'}</span></p>
            <p className="flex justify-between"><span className="text-slate-500">Resources</span><span className="font-medium text-slate-900 text-right">{resNames.length ? resNames.join(', ') : '—'}</span></p>
          </div>
        </div>

        <div className="card p-4">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Validation</p>
          {row('Faculty', faculty ? (faculty.status === 'active' ? 'Available' : faculty.status) : 'Not assigned', faculty ? (faculty.status === 'active' ? 'ok' : 'error') : 'warn')}
          {row('Workload', workload ? (workload.level === 'ok' ? 'Within recommended limit' : workload.level === 'high' ? 'High Workload' : 'Workload Limit Exceeded') : '—', workload ? (workload.level === 'ok' ? 'ok' : workload.level === 'high' ? 'warn' : 'error') : 'warn')}
          {row('Resources', resNames.length ? 'Assigned' : 'Not assigned', resNames.length ? 'ok' : 'warn')}
          {row('Capacity', capacityOk ? 'Sufficient' : 'Capacity Conflict', capacityOk ? 'ok' : 'error')}
          {row('Conflicts', errors.length === 0 ? (warnings.length === 0 ? 'None' : `${warnings.length} warning(s)`) : `${errors.length} error(s)`, errors.length === 0 ? (warnings.length === 0 ? 'ok' : 'warn') : 'error')}
        </div>
      </div>

      {(errors.length > 0 || warnings.length > 0) && (
        <div className="mt-3 space-y-2">
          {[...errors.map((e) => ({ ...e, severity: 'error' })), ...warnings.map((w) => ({ ...w, severity: 'warning' }))].map((c) => (
            <div key={c.id} className={`flex items-start gap-2.5 p-3 rounded-lg border ${c.severity === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
              {c.severity === 'error' ? <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
              <div className="min-w-0">
                <p className="text-xs font-medium">{c.type}: {c.message}</p>
                <p className="text-[11px] opacity-80 mt-0.5">{c.suggestion}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
/* ================= Confirm / override / timetable impact modal ================= */

function ConfirmAllocationModal({
  state,
  onWorkloadOverride,
  onCapacityOverride,
  onCancel,
  onConfirm,
}: {
  state: NonNullable<ReturnType<typeof useState<null | {
    subject: Subject;
    form: DrawerForm;
    existing: SubjectAllocation | null;
    mode: 'assign' | 'edit';
    items: { id: string; type: string; message: string; overrideable: boolean }[];
    impacted: import('../../data/types').TimetableEntry[];
    workloadOverride: boolean;
    capacityOverrides: string[];
  }>>[0]>;
  onWorkloadOverride: (v: boolean) => void;
  onCapacityOverride: (id: string, v: boolean) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { data } = useStore();
  const overrideable = state.items.filter((i) => i.overrideable);
  const workloadItem = overrideable.find((i) => i.type === 'Workload');
  const capacityItems = overrideable.filter((i) => i.type === 'Capacity');
  const allOverrideProvided = (!workloadItem || state.workloadOverride) && capacityItems.every((ci) => state.capacityOverrides.includes(ci.id));

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Confirm Allocation</h2>
            <p className="text-sm text-slate-500 mt-0.5">{state.subject.name} ({state.subject.code}) — {semLabel(state.subject.semester)}</p>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto px-6 py-4 space-y-4">
          {state.impacted.length > 0 && (
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-orange-800">Timetable Impact Warning</p>
                  <p className="text-xs text-orange-700 mt-1">
                    This change affects {state.impacted.length} published timetable entr{state.impacted.length === 1 ? 'y' : 'ies'} for this subject. Review before confirming.
                  </p>
                  <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                    {state.impacted.map((t) => (
                      <div key={t.id} className="flex items-center gap-2 text-xs bg-white/70 rounded-lg px-2.5 py-1.5">
                        <Clock className="w-3.5 h-3.5 text-orange-500" />
                        <span className="font-medium text-orange-900">{t.day}</span>
                        <span className="text-orange-700">{t.slot}</span>
                        <span className="text-orange-500">· Section {t.section}</span>
                        <span className="text-orange-500">· {t.room}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
{overrideable.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-amber-800">Validation Issues — Override Required</p>
                  <div className="mt-2 space-y-2">
                    {workloadItem && (
                      <label className="flex items-start gap-2.5 bg-white/80 rounded-lg p-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={state.workloadOverride}
                          onChange={(e) => onWorkloadOverride(e.target.checked)}
                          className="mt-0.5"
                        />
                        <span className="text-xs text-amber-800">
                          <span className="font-semibold block">Workload Limit Exceeded</span>
                          {workloadItem.message} · Explicit HOD override is required by institution policy.
                        </span>
                      </label>
                    )}
                    {capacityItems.map((ci) => (
                      <label key={ci.id} className="flex items-start gap-2.5 bg-white/80 rounded-lg p-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={state.capacityOverrides.includes(ci.id)}
                          onChange={(e) => onCapacityOverride(ci.id, e.target.checked)}
                          className="mt-0.5"
                        />
                        <span className="text-xs text-amber-800">
                          <span className="font-semibold block">Capacity Conflict</span>
                          {ci.message}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
            On confirmation the faculty dashboard updates, the assigned faculty is notified, and the allocation becomes the source of truth for the timetable and resource status.
          </p>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-primary" onClick={onConfirm} disabled={overrideable.length > 0 && !allOverrideProvided}>
            <CheckCircle2 className="w-4 h-4" /> Confirm Allocation
          </button>
        </div>
      </div>
    </div>
  );
}
/* ================= Faculty synchronization & audit helpers ================= */

function synchronizeFaculty(
  data: AppData,
  opts: {
    oldFacultyId: string | null;
    newFacultyId: string | null;
    subject: Subject;
    alloc: SubjectAllocation;
    deptId: string;
    semester: number;
    updateStaff: (id: string, patch: Partial<Staff>) => void;
    addNotification: (n: Notification) => void;
    overrides: { workloadOverride?: boolean; capacityOverrideIds?: string[] };
  }
) {
  const { oldFacultyId, newFacultyId, subject, alloc, deptId, semester, updateStaff, addNotification } = opts;
  const deptCode = data.departments.find((d) => d.id === deptId)?.code ?? 'DEPT';
  const classNames = alloc.classIds.map((sec) => `${deptCode}-${sec} Sem-${semester}`);
  const resourceNames = alloc.resourceIds.map((rid) => data.resources.find((r) => r.id === rid)?.name ?? '').filter(Boolean);
  const today = new Date().toISOString().slice(0, 10);

  const computeLoad = (facId: string) => {
    const base = data.subjectAllocations
      .filter((a) => a.facultyId === facId && a.status !== 'draft' && a.id !== alloc.id)
      .reduce((sum, a) => sum + (a.weeklyHours ?? 0), 0);
    return base + (facId === alloc.facultyId && alloc.status !== 'draft' ? alloc.weeklyHours : 0);
  };

  if (oldFacultyId && oldFacultyId !== newFacultyId) {
    const oldFac = data.staff.find((s) => s.id === oldFacultyId);
    if (oldFac) {
      updateStaff(oldFacultyId, {
        subjects: oldFac.subjects.filter((s) => s !== subject.name),
        classes: oldFac.classes.filter((c) => !classNames.includes(c)),
        weeklyHours: computeLoad(oldFacultyId),
      });
    }
    addNotification({
      id: `n${Date.now()}a`,
      title: 'Teaching allocation updated',
      message: `You are no longer assigned to ${subject.name} (${subject.code}) for ${semLabel(semester)}, Sections ${classNames.join(', ')}.`,
      date: today,
      audience: [oldFac?.role ?? 'professor'],
      targetUserIds: [oldFacultyId],
      read: false,
    });
  }

  if (newFacultyId) {
    const fac = data.staff.find((s) => s.id === newFacultyId);
    if (fac) {
      updateStaff(newFacultyId, {
        subjects: fac.subjects.includes(subject.name) ? fac.subjects : [...fac.subjects, subject.name],
        classes: Array.from(new Set([...fac.classes, ...classNames])),
        weeklyHours: computeLoad(newFacultyId),
      });
    }
    addNotification({
      id: `n${Date.now()}b`,
      title: 'New Teaching Allocation',
      message: `You have been assigned ${subject.name} (${subject.code}) for ${semLabel(semester)}, Sections ${classNames.join(', ')}. Resources: ${resourceNames.join(', ') || '—'}. Your timetable will be available after timetable publication.`,
      date: today,
      audience: [fac?.role ?? 'professor'],
      targetUserIds: [newFacultyId],
      read: false,
    });
  }
}
function buildHistory(
  data: AppData,
  subject: Subject,
  existing: SubjectAllocation | null,
  updated: SubjectAllocation,
  semester: number,
  changedBy: string
): AllocationHistory[] {
  const now = new Date().toISOString().slice(0, 10);
  const resName = (id: string) => data.resources.find((r) => r.id === id)?.name ?? '—';
  const classStr = (ids: string[]) => ids.map((c) => classLabel(semester, c)).join(', ') || '—';
  const history: AllocationHistory[] = [];

  if (!existing) {
    history.push({
      id: `ah${Date.now()}-c`, allocationId: updated.id, subjectId: subject.id, date: now, changeType: 'created',
      previous: '',
      current: `Faculty: ${allocationFacultyName(data, updated)} · Classes: ${classStr(updated.classIds)} · Resources: ${updated.resourceIds.map(resName).join(', ') || '—'}`,
      changedBy,
    });
    history.push({
      id: `ah${Date.now()}-k`, allocationId: updated.id, subjectId: subject.id, date: now, changeType: 'confirmed',
      previous: '—', current: updated.status, changedBy, reason: 'Allocation reviewed and confirmed by HOD',
    });
    return history;
  }

  if (existing.facultyId !== updated.facultyId) {
    history.push({
      id: `ah${Date.now()}-f`, allocationId: updated.id, subjectId: subject.id, date: now, changeType: 'faculty-changed',
      previous: allocationFacultyName(data, existing), current: allocationFacultyName(data, updated) || 'Unassigned',
      changedBy,
    });
  }
  const addedRes = updated.resourceIds.filter((r) => !existing.resourceIds.includes(r));
  const removedRes = existing.resourceIds.filter((r) => !updated.resourceIds.includes(r));
  if (addedRes.length > 0) {
    history.push({
      id: `ah${Date.now()}-ra`, allocationId: updated.id, subjectId: subject.id, date: now, changeType: 'resource-added',
      previous: '—', current: addedRes.map(resName).join(', '), changedBy,
    });
  }
  if (removedRes.length > 0) {
    history.push({
      id: `ah${Date.now()}-rr`, allocationId: updated.id, subjectId: subject.id, date: now, changeType: 'resource-removed',
      previous: removedRes.map(resName).join(', '), current: '—', changedBy,
    });
  }
  const addedClass = updated.classIds.filter((c) => !existing.classIds.includes(c));
  const removedClass = existing.classIds.filter((c) => !updated.classIds.includes(c));
  if (addedClass.length > 0) {
    history.push({
      id: `ah${Date.now()}-ca`, allocationId: updated.id, subjectId: subject.id, date: now, changeType: 'class-added',
      previous: classStr(existing.classIds), current: classStr(updated.classIds), changedBy,
    });
  }
  if (removedClass.length > 0) {
    history.push({
      id: `ah${Date.now()}-cr`, allocationId: updated.id, subjectId: subject.id, date: now, changeType: 'class-removed',
      previous: classStr(existing.classIds), current: classStr(updated.classIds), changedBy,
    });
  }
  if (history.length === 0) {
    history.push({
      id: `ah${Date.now()}-s`, allocationId: updated.id, subjectId: subject.id, date: now, changeType: 'status-changed',
      previous: existing.status, current: updated.status, changedBy, reason: 'Allocation details confirmed without structural changes',
    });
  }
  return history;
}