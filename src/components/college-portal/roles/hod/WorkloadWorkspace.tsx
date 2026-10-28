import { useMemo, useState } from 'react';
import {
  Users, BarChart3, Gauge, CalendarDays, X, ChevronLeft, ChevronRight, Plus, Settings,
  BookOpen, Beaker, UserSquare2, Briefcase, Calendar,
} from 'lucide-react';
import { useStore } from '../../store/StoreContext';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { DataTable } from '../../components/DataTable';
import type { AssignedTask, Staff } from '../../data/types';
import {
  addDays,
  computeDeptWorkload,
  computeFacultyDailyWorkload,
  dayName,
  formatDayLabel,
  formatFullDate,
  formatIso,
  isoDate,
  WORK_CATEGORY_LABELS,
  TASK_PRIORITY_STYLES,
  WORKLOAD_LEVEL_INFO,
} from './workloadLogic';

interface WorkloadCanvasProps {
  deptId: string;
}

/* ============================================================
 * HOD → Workload
 * Monitor → Understand → Assign → Track Faculty Workload for a
 * specific day. All hours are aggregated automatically from the
 * timetable, mentor–mentee allocations and HOD-assigned tasks.
 * ============================================================ */

export function WorkloadWorkspace({ deptId }: WorkloadCanvasProps) {
  const { data } = useStore();
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [selectedFaculty, setSelectedFaculty] = useState<Staff | null>(null);
  const [showAssign, setShowAssign] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const today = useMemo(() => new Date(), []);
  const workload = useMemo(
    () => computeDeptWorkload(data, deptId, selectedDate),
    [data, deptId, selectedDate]
  );
  const settings = data.workloadSettings;
  const dept = data.departments.find((d) => d.id === deptId);
  const capacity = settings?.dailyCapacity ?? 8;

  return (
    <div>
      <PageHeader
        title="Workload"
        description={`Daily workload for ${dept?.name ?? 'department'} · ${formatFullDate(selectedDate)}`}
        action={
          <button className="btn-secondary" onClick={() => setShowSettings(true)}>
            <Settings className="w-4 h-4" /> Institution Settings
          </button>
        }
      />

      {/* Date navigation — Today | ← 30 Aug | 31 Aug | 1 Sep → */}
      <DateNavigator today={today} selectedDate={selectedDate} onSelect={setSelectedDate} />

      {/* Compact summary cards for the selected day */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Faculty" value={workload.summary.totalFaculty} icon={<Users className="w-5 h-5" />} accent="blue" />
        <StatCard label="Average Workload" value={`${workload.summary.average} hrs`} icon={<BarChart3 className="w-5 h-5" />} accent="indigo" />
        <StatCard
          label="Highest Workload"
          value={workload.summary.highest ? `${workload.summary.highest.hours} hrs` : '—'}
          icon={<Gauge className="w-5 h-5" />}
          accent={workload.summary.highest && workload.summary.highest.hours > capacity ? 'rose' : 'amber'}
          trend={workload.summary.highest?.name}
        />
        <StatCard
          label="Available Capacity"
          value={`${workload.summary.availableCapacity} hrs`}
          icon={<CalendarDays className="w-5 h-5" />}
          accent="emerald"
          trend={workload.summary.overloadedCount > 0 ? `${workload.summary.overloadedCount} overloaded` : 'All within capacity'}
          trendUp={workload.summary.overloadedCount === 0}
        />
      </div>

      {/* Workload table hint */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500">Double-click any faculty row to open the detailed daily workload breakdown.</p>
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Low
          <span className="w-2 h-2 rounded-full bg-blue-500 ml-2" /> Moderate
          <span className="w-2 h-2 rounded-full bg-amber-500 ml-2" /> High
          <span className="w-2 h-2 rounded-full bg-rose-600 ml-2" /> Overloaded
          <span className="ml-2 text-slate-400">(daily capacity {capacity}h)</span>
        </span>
      </div>
      <DataTable
        rows={workload.rows}
        onRowDoubleClick={(r) => setSelectedFaculty(r.faculty)}
        onRowClick={(r) => setSelectedFaculty(r.faculty)}
        columns={[
          {
            key: 'faculty',
            header: 'Faculty Name',
            render: (r) => (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {r.faculty.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">{r.faculty.name}</p>
                  <p className="text-xs text-slate-500 truncate">{r.faculty.email}</p>
                </div>
              </div>
            ),
          },
          { key: 'designation', header: 'Designation', render: (r) => <span className="text-slate-700">{r.faculty.designation}</span> },
{
            key: 'subjects',
            header: 'Subjects',
            render: (r) => (
              <div className="flex flex-wrap gap-1 max-w-[11rem]">
                {r.faculty.subjects.length === 0 ? (
                  <span className="text-slate-400">—</span>
                ) : (
                  r.faculty.subjects.slice(0, 3).map((s) => (
                    <span key={s} className="badge bg-slate-100 text-slate-600">{s}</span>
                  ))
                )}
                {r.faculty.subjects.length > 3 && <span className="badge bg-slate-100 text-slate-500">+{r.faculty.subjects.length - 3}</span>}
              </div>
            ),
          },
          {
            key: 'classes',
            header: 'Classes',
            render: (r) => (
              <div className="flex flex-wrap gap-1 max-w-[9rem]">
                {r.faculty.classes.length === 0 ? (
                  <span className="text-slate-400">—</span>
                ) : (
                  r.faculty.classes.slice(0, 2).map((c) => (
                    <span key={c} className="badge bg-blue-100 text-blue-700">{c}</span>
                  ))
                )}
                {r.faculty.classes.length > 2 && <span className="badge bg-blue-100 text-blue-600">+{r.faculty.classes.length - 2}</span>}
              </div>
            ),
          },
          {
            key: 'workloadHours',
            header: 'Workload Hours',
            render: (r) => {
              const info = WORKLOAD_LEVEL_INFO[r.indicator];
              const pct = Math.min(100, Math.round((r.workload.total / r.capacity) * 100));
              return (
                <div className="w-40">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm font-bold ${info.text}`}>{r.workload.total} hrs</span>
                    <span className={`badge ${info.badge}`}>{info.label}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${info.bar}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {r.available >= 0 ? `${r.available}h available` : `${-r.available}h over capacity`} · capacity {r.capacity}h
                  </p>
                </div>
              );
            },
          },
        ]}
      />

      {selectedFaculty && (
        <WorkloadDrawer
          faculty={selectedFaculty}
          date={selectedDate}
          onClose={() => setSelectedFaculty(null)}
          onAssign={() => setShowAssign(true)}
        />
      )}

      {showAssign && selectedFaculty && (
        <AssignTaskModal
          faculty={selectedFaculty}
          deptId={deptId}
          defaultDate={isoDate(selectedDate)}
          onClose={() => setShowAssign(false)}
        />
      )}

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
/* ---------- Date navigation: Today | ← 30 Aug | 31 Aug | 1 Sep → ---------- */
function DateNavigator({ today, selectedDate, onSelect }: {
  today: Date; selectedDate: Date; onSelect: (d: Date) => void;
}) {
  const prev = addDays(selectedDate, -1);
  const next = addDays(selectedDate, 1);
  const isToday = isoDate(selectedDate) === isoDate(today);

  return (
    <div className="card p-3 mb-6 flex flex-wrap items-center justify-center gap-2">
      <button
        onClick={() => onSelect(today)}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isToday ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
      >
        Today
      </button>
      <div className="w-px h-6 bg-slate-200 mx-1" />
      <button
        onClick={() => onSelect(prev)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> {formatDayLabel(prev)}
      </button>
      <button
        className="px-4 py-1.5 rounded-lg text-sm font-bold bg-blue-600 text-white shadow-sm flex items-center gap-2"
      >
        <Calendar className="w-4 h-4" /> {formatDayLabel(selectedDate)}
        <span className="text-[10px] font-medium opacity-90">{dayName(selectedDate)}</span>
      </button>
      <button
        onClick={() => onSelect(next)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
      >
        {formatDayLabel(next)} <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ---------- Reusable section header used inside the drawer ---------- */
function SectionHeader({ icon, title, hours, accent }: {
  icon: React.ReactNode; title: string; hours: number | null; accent: string;
}) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent}`}>{icon}</span>
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      </div>
      {hours !== null && <span className="text-sm font-bold text-slate-900">{hours} hrs</span>}
    </div>
  );
}
/* ============================================================
 * Faculty workload drawer (opened by double-clicking a row)
 * ============================================================ */
function WorkloadDrawer({ faculty, date, onClose, onAssign }: {
  faculty: Staff; date: Date; onClose: () => void; onAssign: () => void;
}) {
  const { data } = useStore();
  const w = computeFacultyDailyWorkload(data, faculty, date);
  const settings = data.workloadSettings;
  const capacity = settings?.dailyCapacity ?? 8;
  const info = WORKLOAD_LEVEL_INFO[
    w.total > (settings?.thresholds?.high ?? 6) ? 'overloaded'
      : w.total > (settings?.thresholds?.moderate ?? 4) ? 'high'
      : w.total > (settings?.thresholds?.low ?? 2) ? 'moderate' : 'low'
  ];
  const pct = Math.min(100, Math.round((w.total / capacity) * 100));

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-3 bg-slate-50/60">
          <div className="min-w-0 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {faculty.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-slate-900 truncate">{faculty.name}</h3>
              <p className="text-xs text-slate-500 truncate">{faculty.designation}</p>
              <p className="text-xs text-blue-600 font-medium mt-0.5">{formatFullDate(date)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-300 font-medium uppercase tracking-wider">Total Workload</p>
                <p className="text-3xl font-bold mt-1">{w.total} <span className="text-base font-semibold text-slate-300">hrs</span></p>
                <p className="text-xs text-slate-300 mt-1">Daily capacity {capacity} hrs · {info.label}</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold">{pct}%</div>
            </div>
            <div className="mt-3 h-2 bg-white/15 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${info.bar}`} style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="bg-white/10 rounded-xl px-3 py-2"><p className="text-[10px] text-slate-300 uppercase">Teaching</p><p className="text-sm font-bold">{w.teachingHours} hrs</p></div>
              <div className="bg-white/10 rounded-xl px-3 py-2"><p className="text-[10px] text-slate-300 uppercase">Lab</p><p className="text-sm font-bold">{w.labHours} hrs</p></div>
              <div className="bg-white/10 rounded-xl px-3 py-2"><p className="text-[10px] text-slate-300 uppercase">Mentoring</p><p className="text-sm font-bold">{w.mentoringHours} hrs</p></div>
              <div className="bg-white/10 rounded-xl px-3 py-2"><p className="text-[10px] text-slate-300 uppercase">Additional Work</p><p className="text-sm font-bold">{w.additionalHours} hrs</p></div>
            </div>
          </div>

          {/* Teaching Hours */}
          <div>
            <SectionHeader icon={<BookOpen className="w-4 h-4 text-blue-700" />} title="Teaching Hours" hours={w.teachingHours} accent="bg-blue-100" />
            {w.teachingLines.length === 0 ? (
              <p className="text-sm text-slate-400">No teaching scheduled for this day.</p>
            ) : (
              <div className="space-y-1.5">
                {w.teachingLines.map((l) => (
                  <div key={l.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800">{l.label}</p>
                      <p className="text-xs text-slate-500">{l.subject} · {l.slot}{l.room ? ` · ${l.room}` : ''}</p>
                    </div>
                    <span className="text-sm font-bold text-blue-700 flex-shrink-0">{l.hours} hr{l.hours > 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lab Hours */}
          <div>
            <SectionHeader icon={<Beaker className="w-4 h-4 text-indigo-700" />} title="Lab Hours" hours={w.labHours} accent="bg-indigo-100" />
            {w.labLines.length === 0 ? (
              <p className="text-sm text-slate-400">No laboratory sessions scheduled for this day.</p>
            ) : (
              <div className="space-y-1.5">
                {w.labLines.map((l) => (
                  <div key={l.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800">{l.label}</p>
                      <p className="text-xs text-slate-500">{l.subject} · {l.slot}{l.room ? ` · ${l.room}` : ''}</p>
                    </div>
                    <span className="text-sm font-bold text-indigo-700 flex-shrink-0">{l.hours} hr{l.hours > 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mentoring Management */}
          <div>
            <SectionHeader icon={<UserSquare2 className="w-4 h-4 text-emerald-700" />} title="Mentoring Management" hours={w.mentoringHours} accent="bg-emerald-100" />
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
                <p className="text-xs text-slate-500">Assigned Mentees</p>
                <p className="text-sm font-bold text-slate-900">{w.menteeCount} students</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
                <p className="text-xs text-slate-500">Calculated Mentoring Workload</p>
                <p className="text-sm font-bold text-slate-900">{w.mentoringHours} hr{w.mentoringHours === 1 ? '' : 's'}</p>
              </div>
            </div>
            {w.mentoringHours > 0 ? (
              <p className="text-xs text-slate-500">
                {w.mentoringDetail.batches} batch(es) of {w.mentoringDetail.studentsPerBatch} students × {w.mentoringDetail.hoursPerBatch} hr, counted on {dayName(date)}s per the configured rule.
              </p>
            ) : w.menteeCount > 0 ? (
              <p className="text-xs text-slate-500">Mentees assigned, but mentoring hours are counted on {dayName(date)}s (configured schedule day).</p>
            ) : (
              <p className="text-xs text-slate-500">No mentees currently assigned.</p>
            )}
          </div>

          {/* Additional Assigned Work */}
          <div>
            <SectionHeader icon={<Briefcase className="w-4 h-4 text-amber-700" />} title="Additional Assigned Work" hours={w.additionalHours} accent="bg-amber-100" />
            {w.additionalTasks.length === 0 ? (
              <p className="text-sm text-slate-400">No additional work assigned for this date.</p>
            ) : (
              <div className="space-y-2">
                {w.additionalTasks.map((t) => (
                  <div key={t.id} className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800">{t.title}</p>
                      <span className="text-sm font-bold text-amber-700 flex-shrink-0">{t.allocatedHours} hr{t.allocatedHours > 1 ? 's' : ''}</span>
                    </div>
                    {t.description && <p className="text-xs text-slate-500 mt-0.5">{t.description}</p>}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className={`badge ${TASK_PRIORITY_STYLES[t.priority] ?? 'bg-slate-100 text-slate-600'} capitalize`}>{t.priority}</span>
                      <span className={`badge capitalize ${t.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : t.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : t.status === 'on-hold' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{t.status.replace('-', ' ')}</span>
                      <span className="badge bg-slate-100 text-slate-600">{WORK_CATEGORY_LABELS[t.category] ?? t.category}</span>
                      {t.deadline && <span className="text-[10px] text-slate-400">Deadline: {formatIso(t.deadline)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60">
          <button className="btn-primary w-full" onClick={onAssign}>
            <Plus className="w-4 h-4" /> Assign Additional Task
          </button>
        </div>
      </aside>
    </div>
  );
}
/* ============================================================
 * Assign Additional Task modal (faculty is pre-selected)
 * ============================================================ */
function AssignTaskModal({ faculty, deptId, defaultDate, onClose }: {
  faculty: Staff; deptId: string; defaultDate: string; onClose: () => void;
}) {
  const { currentUser, addAssignedTask, addNotification } = useStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [allocatedHours, setAllocatedHours] = useState(1);
  const [priority, setPriority] = useState<AssignedTask['priority']>('medium');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState<AssignedTask['category']>('other');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  const canSave = title.trim().length > 0 && date && allocatedHours > 0;

  const save = () => {
    if (!canSave) { setError('Task name, date and allocated hours are required.'); return; }
    if (!currentUser) return;
    const task: AssignedTask = {
      id: `at-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      facultyId: faculty.id,
      departmentId: deptId,
      title: title.trim(),
      description: description.trim(),
      date,
      allocatedHours,
      priority,
      deadline: deadline || date,
      category,
      status: 'pending',
      assignedBy: currentUser.id,
      assignedDate: isoDate(new Date()),
      remarks: remarks.trim() || undefined,
    };
    addAssignedTask(task);
    addNotification({
      id: `n${Date.now()}`,
      title: 'New task assigned',
      message: `${title.trim()} (${allocatedHours} hr${allocatedHours > 1 ? 's' : ''}) has been assigned to you for ${formatIso(date)}. Deadline: ${formatIso(deadline || date)}.`,
      date: isoDate(new Date()),
      audience: [faculty.role],
      targetUserIds: [faculty.id],
      read: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Assign Additional Task</h2>
            <p className="text-sm text-slate-500 mt-0.5">Assigned hours are added to that day's Workload Hours automatically.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">
          <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 mb-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
              {faculty.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Assigned to (auto-selected)</p>
              <p className="text-sm font-semibold text-slate-900">{faculty.name} · {faculty.designation}</p>
            </div>
            <span className="ml-auto badge bg-blue-100 text-blue-700 flex-shrink-0">Faculty</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="sm:col-span-2 block text-sm">
              <span className="text-xs font-medium text-slate-600">Task Name *</span>
              <input className="input mt-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Examination Documentation" />
            </label>
            <label className="sm:col-span-2 block text-sm">
              <span className="text-xs font-medium text-slate-600">Description</span>
              <textarea className="input mt-1" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What needs to be done?" />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-medium text-slate-600">Date *</span>
              <input type="date" className="input mt-1" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-medium text-slate-600">Allocated Hours *</span>
              <input type="number" min={0.5} step={0.5} className="input mt-1" value={allocatedHours} onChange={(e) => setAllocatedHours(Number(e.target.value))} />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-medium text-slate-600">Priority</span>
              <select className="input mt-1" value={priority} onChange={(e) => setPriority(e.target.value as AssignedTask['priority'])}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-xs font-medium text-slate-600">Deadline</span>
              <input type="date" className="input mt-1" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="text-xs font-medium text-slate-600">Work Category</span>
              <select className="input mt-1" value={category} onChange={(e) => setCategory(e.target.value as AssignedTask['category'])}>
                {(Object.keys(WORK_CATEGORY_LABELS) as AssignedTask['category'][]).map((c) => (
                  <option key={c} value={c}>{WORK_CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="text-xs font-medium text-slate-600">Remarks (optional)</span>
              <textarea className="input mt-1" rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Any additional instructions" />
            </label>
          </div>

          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/60">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={!canSave}>
            <Plus className="w-4 h-4" /> Assign Task
          </button>
        </div>
      </div>
    </div>
  );
}
/* ============================================================
 * Institution Workload Settings modal (configurable thresholds)
 * ============================================================ */
function SettingsModal({ onClose }: { onClose: () => void }) {
  const { data, updateWorkloadSettings } = useStore();
  const s = data.workloadSettings;
  const [dailyCapacity, setDailyCapacity] = useState(s?.dailyCapacity ?? 8);
  const [low, setLow] = useState(s?.thresholds?.low ?? 2);
  const [moderate, setModerate] = useState(s?.thresholds?.moderate ?? 4);
  const [high, setHigh] = useState(s?.thresholds?.high ?? 6);
  const [enabled, setEnabled] = useState(s?.mentoringRule?.enabled ?? true);
  const [scheduleDay, setScheduleDay] = useState(s?.mentoringRule?.scheduleDay ?? 'Monday');
  const [studentsPerBatch, setStudentsPerBatch] = useState(s?.mentoringRule?.studentsPerBatch ?? 20);
  const [hoursPerBatch, setHoursPerBatch] = useState(s?.mentoringRule?.hoursPerBatch ?? 1);

  const save = () => {
    updateWorkloadSettings({
      dailyCapacity: Math.max(1, dailyCapacity),
      thresholds: { low: Math.max(0, low), moderate: Math.max(0, moderate), high: Math.max(0, high) },
      mentoringRule: { enabled, scheduleDay, studentsPerBatch: Math.max(1, studentsPerBatch), hoursPerBatch: Math.max(0.5, hoursPerBatch) },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Workload Settings</h2>
            <p className="text-sm text-slate-500 mt-0.5">Institution-configurable workload thresholds & mentoring rule.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5 space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-1.5"><Gauge className="w-4 h-4 text-slate-500" /> Capacity & Levels</h4>
            <p className="text-xs text-slate-500 mb-3">Faculty above the High threshold are marked Overloaded; the daily capacity targets ideal hours per faculty.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <label className="block text-sm">
                <span className="text-xs font-medium text-slate-600">Daily Capacity (hrs)</span>
                <input type="number" min={1} className="input mt-1" value={dailyCapacity} onChange={(e) => setDailyCapacity(Number(e.target.value))} />
              </label>
              <label className="block text-sm">
                <span className="text-xs font-medium text-slate-600">Low ≤</span>
                <input type="number" min={0} className="input mt-1" value={low} onChange={(e) => setLow(Number(e.target.value))} />
              </label>
              <label className="block text-sm">
                <span className="text-xs font-medium text-slate-600">Moderate ≤</span>
                <input type="number" min={0} className="input mt-1" value={moderate} onChange={(e) => setModerate(Number(e.target.value))} />
              </label>
              <label className="block text-sm">
                <span className="text-xs font-medium text-slate-600">High ≤</span>
                <input type="number" min={0} className="input mt-1" value={high} onChange={(e) => setHigh(Number(e.target.value))} />
              </label>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-1.5"><UserSquare2 className="w-4 h-4 text-emerald-600" /> Mentoring Workload Rule</h4>
            <p className="text-xs text-slate-500 mb-3">Mentoring hours = (mentees ÷ students per batch) batches × hours per batch, counted on the configured schedule day.</p>
            <label className="flex items-center gap-2 text-sm mb-3">
              <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="h-4 w-4 text-blue-600" />
              <span className="text-slate-700">Count mentoring workload automatically</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <label className="block text-sm">
                <span className="text-xs font-medium text-slate-600">Schedule Day</span>
                <select className="input mt-1" value={scheduleDay} onChange={(e) => setScheduleDay(e.target.value)}>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </label>
              <label className="block text-sm">
                <span className="text-xs font-medium text-slate-600">Students per Batch</span>
                <input type="number" min={1} className="input mt-1" value={studentsPerBatch} onChange={(e) => setStudentsPerBatch(Number(e.target.value))} />
              </label>
              <label className="block text-sm">
                <span className="text-xs font-medium text-slate-600">Hours per Batch</span>
                <input type="number" min={0.5} step={0.5} className="input mt-1" value={hoursPerBatch} onChange={(e) => setHoursPerBatch(Number(e.target.value))} />
              </label>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/60">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save}>Save Settings</button>
        </div>
      </div>
    </div>
  );
}