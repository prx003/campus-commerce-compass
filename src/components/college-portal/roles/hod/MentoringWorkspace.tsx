import { useMemo, useState, type ReactNode } from 'react';
import {
  AlertTriangle, ArrowRightLeft, Building2, CalendarDays, CheckCircle2, ChevronDown,
  ChevronRight, Eye, GraduationCap, History, Info, ListChecks, MoreVertical, Search,
  Sparkles, TrendingUp, UserCheck, UserSquare2, Users, Wand2, X,
} from 'lucide-react';
import { useStore, deptCode, deptName, staffName } from '../../store/StoreContext';
import { PageHeader } from '../../components/PageHeader';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/DataTable';
import { StudentDetailModal } from '../../components/DetailModals';
import type { MentorAllocation, Student } from '../../data/types';
import { ACADEMIC_YEAR, semLabel, semShort } from './subjectAllocationLogic';
import {
  ACTIVE_ACADEMIC_YEAR, type AllocationMethod, type MentorLoad,
  computeAllocationPlan, formatDate, getAllocationForStudent, getMentorLoad, getMentorPool,
  getMentoringSections, getMentoringSemesters, getMentoringStudents, getUnallocatedStudents,
  initials, mentoringClassLabel, todayISO, uid,
} from './mentoringLogic';

/* ============================================================
 * Mentoring Management — HOD workspace
 * Auto-allocation is the primary workflow; manual reassignment is
 * the exception/control mechanism. Department and academic year are
 * derived from the logged-in HOD's context (never selectable here).
 * Faculty dashboards read the same central mentor–mentee records.
 * ============================================================ */

const LOAD_META: Record<string, { label: string; badge: string; bar: string }> = {
  balanced: { label: 'Balanced', badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500' },
  'near-capacity': { label: 'Near Capacity', badge: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500' },
  full: { label: 'Full', badge: 'bg-orange-100 text-orange-700', bar: 'bg-orange-500' },
  overloaded: { label: 'Overloaded', badge: 'bg-rose-100 text-rose-700', bar: 'bg-rose-500' },
};

const AVAILABILITY_META: Record<string, { label: string; badge: string; bar: string }> = {
  available: { label: 'Available', badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500' },
  'near-capacity': { label: 'Near Capacity', badge: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500' },
  full: { label: 'Full', badge: 'bg-rose-100 text-rose-700', bar: 'bg-rose-500' },
  unavailable: { label: 'Unavailable', badge: 'bg-slate-100 text-slate-500', bar: 'bg-slate-300' },
};

const ACTION_META: Record<string, { label: string; badge: string }> = {
  allocated: { label: 'Allocated', badge: 'bg-blue-100 text-blue-700' },
  'auto-allocated': { label: 'Auto Allocated', badge: 'bg-indigo-100 text-indigo-700' },
  reassigned: { label: 'Reassigned', badge: 'bg-amber-100 text-amber-700' },
  deactivated: { label: 'Deactivated', badge: 'bg-rose-100 text-rose-700' },
};

const cardAccent: Record<string, string> = {
  slate: 'bg-slate-50 text-slate-700',
  blue: 'bg-blue-50 text-blue-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  rose: 'bg-rose-50 text-rose-700',
  indigo: 'bg-indigo-50 text-indigo-700',
};

function OverviewCard({ label, value, description, icon, accent = 'slate' }: {
  label: string; value: string | number; description: string; icon: ReactNode; accent?: keyof typeof cardAccent;
}) {
  return (
    <div className="card card-hover p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          <p className="text-xs text-slate-400 mt-1.5">{description}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${cardAccent[accent]}`}>{icon}</div>
      </div>
    </div>
  );
}

function CapacityBar({ count, capacity, barCls }: { count: number; capacity: number; barCls: string }) {
  const pct = capacity ? Math.min(100, Math.round((count / capacity) * 100)) : 0;
  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-xs font-semibold text-slate-700 tabular-nums">{count} / {capacity}</span>
      <span className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden inline-block">
        <span className={`block h-full rounded-full ${barCls}`} style={{ width: `${pct}%` }} />
      </span>
    </span>
  );
}

function MenuBtn({ icon: Icon, label, onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
    >
      <Icon className="w-4 h-4 text-slate-400" /> {label}
    </button>
  );
}

const thCls = 'text-left px-4 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wider';
const tdCls = 'px-4 py-3 text-sm text-slate-700';

/* ==== MAIN WORKSPACE ==== */

export function MentoringWorkspace({ deptId }: { deptId: string }) {
  const { data, currentUser, saveMentorAllocation, addMentoringHistory } = useStore();
  const dCode = deptCode(data, deptId);

  /* Filters — no Department / Academic Year filters: both come from the HOD context */
  const [semFilter, setSemFilter] = useState<string>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [mentorFilter, setMentorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'unallocated'>('all');
  const [search, setSearch] = useState('');

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [rowMenu, setRowMenu] = useState<string | null>(null);

  const [autoOpen, setAutoOpen] = useState(false);
  const [unallocatedOpen, setUnallocatedOpen] = useState(false);
  const [deptHistoryOpen, setDeptHistoryOpen] = useState(false);
  const [reassign, setReassign] = useState<{ student: Student; allocation: MentorAllocation | null } | null>(null);
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [viewMentorId, setViewMentorId] = useState<string | null>(null);
  const [historyStudent, setHistoryStudent] = useState<Student | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'warning'; text: string } | null>(null);

  const deptStudents = useMemo(() => getMentoringStudents(data, deptId), [data, deptId]);
  const pool = useMemo(() => getMentorPool(data, deptId), [data, deptId]);
  const unallocated = useMemo(() => getUnallocatedStudents(data, deptId), [data, deptId]);
  const allocatedCount = deptStudents.length - unallocated.length;
  const avgPerMentor = pool.length ? (allocatedCount / pool.length).toFixed(1) : '0';

  const filterSemesters = useMemo(() => getMentoringSemesters(data, deptId), [data, deptId]);
  const filterSections = useMemo(
    () => getMentoringSections(data, deptId, semFilter === 'all' ? undefined : Number(semFilter)),
    [data, deptId, semFilter]
  );

  const matchesFilters = (s: Student) => {
    if (semFilter !== 'all' && s.semester !== Number(semFilter)) return false;
    if (sectionFilter !== 'all' && s.section !== sectionFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      if (!s.name.toLowerCase().includes(q) && !s.rollNo.toLowerCase().includes(q)) return false;
    }
    return true;
  };

  const unallocatedRows = useMemo(() => unallocated.filter(matchesFilters), [unallocated, semFilter, sectionFilter, search]);

  const visibleGroups = useMemo(() => {
    if (statusFilter === 'unallocated') return [];
    return pool
      .filter((m) => mentorFilter === 'all' || m.mentor.id === mentorFilter)
      .map((m) => ({ load: m, rows: m.mentees.filter(matchesFilters) }))
      .filter((g) => g.rows.length > 0 || (mentorFilter !== 'all' && g.load.mentor.id === mentorFilter));
  }, [pool, mentorFilter, statusFilter, semFilter, sectionFilter, search]);

  /* ---------- Actions ---------- */

  const confirmReassign = (mentorId: string) => {
    if (!reassign || !currentUser) return;
    const { student, allocation } = reassign;
    const today = todayISO();
    if (allocation) {
      saveMentorAllocation({
        ...allocation,
        previousMentorId: allocation.mentorId,
        mentorId,
        date: today,
        allocatedBy: currentUser.id,
      });
      addMentoringHistory({
        id: uid('mhs'),
        allocationId: allocation.id,
        studentId: student.id,
        date: today,
        action: 'reassigned',
        previousMentorId: allocation.mentorId,
        newMentorId: mentorId,
        performedBy: currentUser.id,
        note: `Manual reassignment by HOD · ${staffName(data, allocation.mentorId)} → ${staffName(data, mentorId)}`,
      });
      setNotice({ type: 'success', text: `${student.name} (${student.rollNo}) reassigned to ${staffName(data, mentorId)}. The previous and new mentor dashboards are updated automatically.` });
    } else {
      const alloc: MentorAllocation = {
        id: uid('mal'),
        studentId: student.id,
        mentorId,
        previousMentorId: null,
        departmentId: student.departmentId,
        semester: student.semester,
        section: student.section,
        academicYear: ACTIVE_ACADEMIC_YEAR,
        allocatedBy: currentUser.id,
        date: today,
        status: 'active',
      };
      saveMentorAllocation(alloc);
      addMentoringHistory({
        id: uid('mhs'),
        allocationId: alloc.id,
        studentId: student.id,
        date: today,
        action: 'allocated',
        previousMentorId: null,
        newMentorId: mentorId,
        performedBy: currentUser.id,
        note: `Manual allocation by HOD · ${semShort(student.semester)} · ${mentoringClassLabel(dCode, student.section)} · AY ${ACADEMIC_YEAR}`,
      });
      setNotice({ type: 'success', text: `${student.name} (${student.rollNo}) allocated to ${staffName(data, mentorId)}. The faculty dashboard is updated automatically.` });
    }
    setReassign(null);
  };

  const handleAutoDone = (result: { allocated: number; mentors: number; leftover: number; context: string }) => {
    setAutoOpen(false);
    setNotice(
      result.leftover > 0
        ? { type: 'warning', text: `${result.allocated} students auto-allocated across ${result.mentors} mentors for ${result.context}. ${result.leftover} student${result.leftover !== 1 ? 's' : ''} remain unallocated — available mentor capacity has been reached. Reassign manually or free up capacity.` }
        : { type: 'success', text: `${result.allocated} students auto-allocated across ${result.mentors} mentors for ${result.context}. Faculty dashboards are updated automatically.` }
    );
  };

  /* ==== RENDER ==== */

  return (
    <div>
      <PageHeader
        title="Mentoring Management"
        description="Manage mentor–mentee allocations, monitor mentoring capacity, and ensure balanced student distribution."
        action={
          <button type="button" className="btn-primary" onClick={() => setAutoOpen(true)}>
            <Sparkles className="w-4 h-4" /> Auto Allocate Mentees
          </button>
        }
      />

      {/* Department context — derived from the logged-in HOD, not editable */}
      <div className="flex flex-wrap items-center gap-2 -mt-4 mb-6">
        <span className="badge bg-slate-100 text-slate-700">
          <Building2 className="w-3.5 h-3.5 mr-1" /> {dCode} Department
        </span>
        <span className="text-xs text-slate-400">{deptName(data, deptId)}</span>
        <span className="badge bg-white text-slate-500 border border-slate-200">
          <CalendarDays className="w-3.5 h-3.5 mr-1" /> AY {ACADEMIC_YEAR} · system-set
        </span>
      </div>

      {notice && (
        <div className={`mb-6 flex items-start justify-between gap-3 rounded-xl border p-4 ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
          <div className="flex items-start gap-2.5">
            {notice.type === 'success'
              ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
              : <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />}
            <p className={`text-sm ${notice.type === 'success' ? 'text-emerald-800' : 'text-amber-800'}`}>{notice.text}</p>
          </div>
          <button type="button" onClick={() => setNotice(null)} className="p-1 rounded-lg hover:bg-white/70 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <OverviewCard label="Total Mentors" value={pool.length} description="Faculty in the mentoring pool" icon={<Users className="w-5 h-5" />} accent="blue" />
        <OverviewCard label="Total Mentees" value={deptStudents.length} description="Students eligible for mentoring" icon={<GraduationCap className="w-5 h-5" />} accent="indigo" />
        <OverviewCard label="Allocated" value={allocatedCount} description="Assigned to a mentor" icon={<UserCheck className="w-5 h-5" />} accent="emerald" />
        <OverviewCard label="Unallocated" value={unallocated.length} description="Awaiting mentor assignment" icon={<AlertTriangle className="w-5 h-5" />} accent={unallocated.length ? 'rose' : 'slate'} />
        <OverviewCard label="Avg Mentees / Mentor" value={avgPerMentor} description="Across the mentoring pool" icon={<TrendingUp className="w-5 h-5" />} accent="slate" />
      </div>

      {/* Unallocated students alert */}
      {unallocated.length > 0 && (
        <div className="card p-4 sm:p-5 mb-6 border-amber-200 bg-amber-50/60">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Unallocated Students · {unallocated.length} student{unallocated.length !== 1 ? 's' : ''}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  These students could not be automatically allocated because available mentor capacity has been reached, or no allocation has been run for their class yet.
                </p>
              </div>
            </div>
            <button type="button" className="btn-secondary shrink-0" onClick={() => setUnallocatedOpen(true)}>
              <ListChecks className="w-4 h-4" /> View Unallocated Students
            </button>
          </div>
        </div>
      )}

      {/* ==== ALLOCATION CARD ==== */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 px-5 pt-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Mentor–Mentee Allocation</h2>
            <p className="text-xs text-slate-500 mt-0.5">Grouped by mentor · expand a mentor to view and manage their mentees</p>
          </div>
          <button type="button" className="btn-secondary shrink-0" onClick={() => { setHistoryStudent(null); setDeptHistoryOpen(true); }}>
            <History className="w-4 h-4" /> Allocation History
          </button>
        </div>

        {/* Filters: Semester | Class/Section | Mentor | Status | Search */}
        <div className="flex flex-wrap items-center gap-2.5 px-5 py-4">
          <select
            className="input w-auto min-w-[9.5rem]"
            value={semFilter}
            onChange={(e) => { setSemFilter(e.target.value); setSectionFilter('all'); }}
          >
            <option value="all">All Semesters</option>
            {filterSemesters.map((s) => <option key={s} value={s}>{semLabel(s)}</option>)}
          </select>
          <select className="input w-auto min-w-[8.5rem]" value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
            <option value="all">All Classes</option>
            {filterSections.map((sec) => <option key={sec} value={sec}>{mentoringClassLabel(dCode, sec)}</option>)}
          </select>
          <select className="input w-auto min-w-[11rem]" value={mentorFilter} onChange={(e) => setMentorFilter(e.target.value)}>
            <option value="all">All Mentors</option>
            {pool.map((m) => <option key={m.mentor.id} value={m.mentor.id}>{m.mentor.name}</option>)}
          </select>
          <select
            className="input w-auto min-w-[8.5rem]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'unallocated')}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="unallocated">Unallocated</option>
          </select>
          <div className="relative ml-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9 w-full sm:w-56"
              placeholder="Search student / roll no."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* ==== UNALLOCATED BODY ==== */}
        {statusFilter === 'unallocated' ? (
          <div className="border-t border-slate-100 px-5 py-4">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border border-slate-200 rounded-lg">
                  <th className={thCls}>Student</th>
                  <th className={thCls}>Roll No.</th>
                  <th className={thCls}>Semester</th>
                  <th className={thCls}>Class</th>
                  <th className={thCls}>Status</th>
                  <th className={`${thCls} text-right`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {unallocatedRows.map((s) => (
                  <tr key={s.id} className="table-row">
                    <td className={`${tdCls} font-medium text-slate-900`}>{s.name}</td>
                    <td className={tdCls}>{s.rollNo}</td>
                    <td className={tdCls}>{semShort(s.semester)}</td>
                    <td className={tdCls}>{mentoringClassLabel(dCode, s.section)}</td>
                    <td className={tdCls}><span className="badge bg-rose-100 text-rose-700">Unallocated</span></td>
                    <td className={`${tdCls} text-right`}>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setReassign({ student: s, allocation: null })}
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Assign Mentor
                      </button>
                    </td>
                  </tr>
                ))}
                {unallocatedRows.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">No unallocated students match the current filters</td></tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* ==== GROUPS BODY ==== */
          <div className="divide-y divide-slate-100 border-t border-slate-100">
            {visibleGroups.length === 0 && (
              <div className="px-5 py-12 text-center text-sm text-slate-400">No allocations match the current filters</div>
            )}
            {visibleGroups.map(({ load, rows }) => {
              const open = !collapsed[load.mentor.id];
              const meta = LOAD_META[load.loadState];
              return (
                <div key={load.mentor.id}>
                  <button
                    type="button"
                    onClick={() => setCollapsed((p) => ({ ...p, [load.mentor.id]: open }))}
                    className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50/70 transition-colors"
                  >
                    {open ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
                    <span className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                      {initials(load.mentor.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-slate-900 truncate">{load.mentor.name}</span>
                      <span className="block text-xs text-slate-500 mt-0.5">
                        {load.mentor.designation} · <span className="font-medium text-slate-600">{load.count} / {load.capacity} mentees</span> · {load.pct}% capacity
                        {load.mentor.status !== 'active' && <span className="ml-2 text-slate-400">(on leave)</span>}
                      </span>
                    </span>
                    <span className="hidden sm:flex items-center gap-3 shrink-0">
                      <CapacityBar count={load.count} capacity={load.capacity} barCls={meta.bar} />
                      <span className={`badge ${meta.badge}`}>{meta.label}</span>
                    </span>
                  </button>

                  {open && (
                    <div className="px-5 pb-5">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50 border border-slate-200 rounded-lg">
                            <th className={thCls}>Mentee</th>
                            <th className={thCls}>Roll No.</th>
                            <th className={thCls}>Semester</th>
                            <th className={thCls}>Class</th>
                            <th className={thCls}>Allocation Date</th>
                            <th className={thCls}>Status</th>
                            <th className={`${thCls} text-right`}>Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {rows.map((s) => {
                            const allocation = getAllocationForStudent(data, s.id);
                            const menuKey = `${load.mentor.id}-${s.id}`;
                            return (
                              <tr key={s.id} className="table-row">
                                <td className={`${tdCls} font-medium text-slate-900`}>{s.name}</td>
                                <td className={tdCls}>{s.rollNo}</td>
                                <td className={tdCls}>{semShort(s.semester)}</td>
                                <td className={tdCls}>{mentoringClassLabel(dCode, s.section)}</td>
                                <td className={tdCls}>{formatDate(allocation?.date)}</td>
                                <td className={tdCls}><span className="badge bg-emerald-100 text-emerald-700">Active</span></td>
                                <td className={`${tdCls} text-right`}>
                                  <span className="relative inline-block">
                                    <button
                                      type="button"
                                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                                      onClick={(e) => { e.stopPropagation(); setRowMenu(rowMenu === menuKey ? null : menuKey); }}
                                      aria-label="Mentee actions"
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </button>
                                    {rowMenu === menuKey && (
                                      <>
                                        <span className="fixed inset-0 z-10 cursor-default" onClick={() => setRowMenu(null)} />
                                        <span className="absolute right-0 top-9 z-20 w-52 rounded-xl border border-slate-200 bg-white shadow-lg py-1.5 text-left block">
                                          <MenuBtn icon={Eye} label="View Student" onClick={() => { setRowMenu(null); setViewStudent(s); }} />
                                          <MenuBtn icon={UserSquare2} label="View Mentor" onClick={() => { setRowMenu(null); setViewMentorId(load.mentor.id); }} />
                                          <MenuBtn icon={ArrowRightLeft} label="Reassign Mentor" onClick={() => { setRowMenu(null); setReassign({ student: s, allocation: allocation ?? null }); }} />
                                          <span className="block my-1 border-t border-slate-100" />
                                          <MenuBtn icon={History} label="Allocation History" onClick={() => { setRowMenu(null); setHistoryStudent(s); setDeptHistoryOpen(true); }} />
                                        </span>
                                      </>
                                    )}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                          {rows.length === 0 && (
                            <tr><td colSpan={7} className="px-4 py-6 text-center text-xs text-slate-400">No mentees allocated yet</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ==== MODAL WIRING ==== */}
      {autoOpen && (
        <AutoAllocateModal deptId={deptId} onClose={() => setAutoOpen(false)} onDone={handleAutoDone} />
      )}
      {unallocatedOpen && (
        <UnallocatedModal
          deptId={deptId}
          onClose={() => setUnallocatedOpen(false)}
          onAssign={(s) => { setUnallocatedOpen(false); setReassign({ student: s, allocation: null }); }}
        />
      )}
      {reassign && (
        <ReassignModal ctx={reassign} onClose={() => setReassign(null)} onConfirm={confirmReassign} />
      )}
      {(deptHistoryOpen || historyStudent) && (
        <HistoryModal
          deptId={deptId}
          student={historyStudent}
          onClose={() => { setDeptHistoryOpen(false); setHistoryStudent(null); }}
        />
      )}
      {viewMentorId && (
        <MentorInfoModal mentorId={viewMentorId} onClose={() => setViewMentorId(null)} />
      )}
      <StudentDetailModal student={viewStudent} open={!!viewStudent} onClose={() => setViewStudent(null)} />
    </div>
  );
}

/* ==== MODALS ==== */

const lbl = 'block mb-1 text-xs font-medium text-slate-600';
const secLbl = 'block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2';

function AutoAllocateModal({ deptId, onClose, onDone }: {
  deptId: string;
  onClose: () => void;
  onDone: (r: { allocated: number; mentors: number; leftover: number; context: string }) => void;
}) {
  const { data, currentUser, saveMentorAllocation, addMentoringHistory } = useStore();
  const dCode = deptCode(data, deptId);

  const semesters = useMemo(() => getMentoringSemesters(data, deptId), [data, deptId]);
  const [semester, setSemester] = useState<number>(semesters[0] ?? 1);
  const sections = useMemo(() => getMentoringSections(data, deptId, semester), [data, deptId, semester]);
  const [sectionPick, setSectionPick] = useState<string>('');
  const section = sections.includes(sectionPick) ? sectionPick : (sections[0] ?? '');
  const [method, setMethod] = useState<AllocationMethod>('balanced');

  const pool = useMemo(() => getMentorPool(data, deptId), [data, deptId]);
  const candidates = useMemo(
    () => getUnallocatedStudents(data, deptId).filter((s) => s.semester === semester && (!section || s.section === section)),
    [data, deptId, semester, section]
  );
  const plan = useMemo(() => computeAllocationPlan(candidates, pool, method), [candidates, pool, method]);

  const confirm = () => {
    if (!currentUser) return;
    const today = todayISO();
    plan.assignments.forEach((a) => {
      a.studentIds.forEach((studentId) => {
        const student = data.students.find((s) => s.id === studentId);
        const alloc: MentorAllocation = {
          id: uid('mal'),
          studentId,
          mentorId: a.mentorId,
          previousMentorId: null,
          departmentId: deptId,
          semester,
          section: student?.section ?? section,
          academicYear: ACTIVE_ACADEMIC_YEAR,
          allocatedBy: currentUser.id,
          date: today,
          status: 'active',
        };
        saveMentorAllocation(alloc);
        addMentoringHistory({
          id: uid('mhs'),
          allocationId: alloc.id,
          studentId,
          date: today,
          action: 'auto-allocated',
          previousMentorId: null,
          newMentorId: a.mentorId,
          performedBy: currentUser.id,
          note: `Auto allocation (${method === 'balanced' ? 'Balanced' : 'Class-wise'} distribution) · ${semShort(semester)} · ${mentoringClassLabel(dCode, alloc.section)} · AY ${ACADEMIC_YEAR}`,
        });
      });
    });
    onDone({
      allocated: plan.allocatable,
      mentors: plan.assignments.length,
      leftover: plan.leftover.length,
      context: `${semShort(semester)} · ${mentoringClassLabel(dCode, section)}`,
    });
  };

  return (
    <Modal open onClose={onClose} title="Auto Allocate Mentees" subtitle="Unallocated students are distributed across eligible mentors · department and academic year are applied automatically" size="lg">
      <div className="space-y-5">
        {/* ==== SETUP + CONTEXT ==== */}
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className={lbl}>Semester</span>
            <select className="input" value={semester} onChange={(e) => setSemester(Number(e.target.value))}>
              {semesters.map((s) => <option key={s} value={s}>{semLabel(s)}</option>)}
            </select>
          </label>
          <label className="block">
            <span className={lbl}>Class / Section</span>
            <select className="input" value={section} onChange={(e) => setSectionPick(e.target.value)} disabled={sections.length === 0}>
              {sections.length === 0
                ? <option value="">No classes with students</option>
                : sections.map((sec) => <option key={sec} value={sec}>{mentoringClassLabel(dCode, sec)}</option>)}
            </select>
          </label>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <b className="text-slate-900">{candidates.length}</b> unallocated student{candidates.length !== 1 ? 's' : ''} found for this class
          </span>
          <span>Department: <b className="text-slate-900">{deptName(data, deptId)}</b> <span className="text-slate-400">(from your profile)</span></span>
          <span>Academic Year: <b className="text-slate-900">{ACADEMIC_YEAR}</b> <span className="text-slate-400">(system-set)</span></span>
        </div>

        {/* ==== MENTOR POOL ==== */}
        <div>
          <p className={secLbl}>Eligible Mentor Pool</p>
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className={thCls}>Mentor</th>
                  <th className={`${thCls} text-right`}>Current Mentees</th>
                  <th className={`${thCls} text-right`}>Capacity</th>
                  <th className={`${thCls} text-right`}>Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pool.map((m) => {
                  const meta = AVAILABILITY_META[m.availability];
                  return (
                    <tr key={m.mentor.id} className={m.availability === 'unavailable' ? 'opacity-60' : ''}>
                      <td className={tdCls}>
                        <p className="font-medium text-slate-900">{m.mentor.name}</p>
                        <p className="text-xs text-slate-500">{m.mentor.designation}</p>
                      </td>
                      <td className={`${tdCls} text-right tabular-nums`}>{m.count}</td>
                      <td className={`${tdCls} text-right`}><CapacityBar count={m.count} capacity={m.capacity} barCls={meta.bar} /></td>
                      <td className={`${tdCls} text-right`}><span className={`badge ${meta.badge}`}>{meta.label}</span></td>
                    </tr>
                  );
                })}
                {pool.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-400">No eligible mentors in your department</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 mt-2">Only eligible and available mentors participate in automatic allocation · mentor capacity is never exceeded.</p>
        </div>



        {/* ==== METHOD + PREVIEW ==== */}
        <div>
          <p className={secLbl}>Allocation Method</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {(['balanced', 'class-wise'] as AllocationMethod[]).map((m) => {
              const selected = method === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`text-left rounded-xl border p-4 transition-all ${selected ? 'border-slate-900 ring-1 ring-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? 'border-slate-900' : 'border-slate-300'}`}>
                      {selected && <span className="w-2 h-2 rounded-full bg-slate-900" />}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {m === 'balanced' ? 'Balanced Distribution' : 'Class-wise Distribution'}
                    </span>
                    {m === 'balanced' && <span className="badge bg-slate-900 text-white ml-auto">Default</span>}
                  </span>
                  <span className="block text-xs text-slate-500 mt-2">
                    {m === 'balanced'
                      ? 'Distribute eligible students as evenly as possible among available mentors while respecting mentor capacity.'
                      : 'Keep students from the same class/section together where possible while maintaining balanced mentor workload.'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className={secLbl}>Allocation Preview</p>
          {candidates.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              All students in the selected class are already allocated to mentors.
            </div>
          ) : plan.assignments.length === 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              No mentor capacity is currently available for automatic allocation. Free up capacity by reassigning mentees, then try again.
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-600 mb-3">
                <b className="text-slate-900">{candidates.length}</b> unallocated students will be distributed among <b className="text-slate-900">{plan.assignments.length}</b> mentor{plan.assignments.length !== 1 ? 's' : ''}.
              </p>
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className={thCls}>Mentor</th>
                      <th className={`${thCls} text-right`}>Students to Allocate</th>
                      <th className={`${thCls} text-right`}>New Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {plan.rows.map((r) => (
                      <tr key={r.mentorId}>
                        <td className={`${tdCls} font-medium text-slate-900`}>{r.mentorName}</td>
                        <td className={`${tdCls} text-right font-semibold tabular-nums`}>{r.toAllocate}</td>
                        <td className={`${tdCls} text-right`}>
                          <span className={`tabular-nums font-medium ${r.exceeds ? 'text-rose-600' : 'text-slate-700'}`}>
                            {r.newTotal} <span className="text-slate-400 font-normal">/ {r.capacity}</span>
                          </span>
                          {r.exceeds && <span className="badge bg-rose-100 text-rose-700 ml-2">Exceeds capacity</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {plan.leftover.length === 0 ? (
                <p className="mt-3 flex items-start gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  All {candidates.length} students can be allocated within the available mentor capacity.
                </p>
              ) : (
                <p className="mt-3 flex items-start gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  {plan.leftover.length} student{plan.leftover.length !== 1 ? 's' : ''} cannot be allocated because available mentor capacity has been reached. They will remain unallocated and can be assigned manually.
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn-primary" disabled={plan.allocatable === 0} onClick={confirm}>
            <Wand2 className="w-4 h-4" /> Auto Allocate
          </button>
        </div>

      </div>
    </Modal>
  );
}

/* ==== MODALS PART 2 ==== */

function ReassignModal({ ctx, onClose, onConfirm }: {
  ctx: { student: Student; allocation: MentorAllocation | null };
  onClose: () => void;
  onConfirm: (mentorId: string) => void;
}) {
  const { data } = useStore();
  const pool = getMentorPool(data, ctx.student.departmentId);
  const [mentorId, setMentorId] = useState('');
  const currentId = ctx.allocation?.mentorId ?? null;
  const target = pool.find((m) => m.mentor.id === mentorId);
  const wouldExceed = !!target && target.count + 1 > target.capacity;

  return (
    <Modal
      open
      onClose={onClose}
      title={currentId ? 'Reassign Mentee' : 'Allocate Mentor'}
      subtitle={`${ctx.student.name} — ${ctx.student.rollNo}`}
      size="sm"
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 grid sm:grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Student</p>
            <p className="text-sm font-medium text-slate-900 mt-0.5">{ctx.student.name} — {ctx.student.rollNo}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Current Mentor</p>
            <p className="text-sm font-medium text-slate-900 mt-0.5">{currentId ? staffName(data, currentId) : 'Not allocated'}</p>
          </div>
        </div>

        <label className="block">
          <span className={lbl}>New Mentor</span>
          <select className="input" value={mentorId} onChange={(e) => setMentorId(e.target.value)}>
            <option value="">Select mentor…</option>
            {pool.filter((m) => m.mentor.id !== currentId).map((m) => (
              <option key={m.mentor.id} value={m.mentor.id}>
                {m.mentor.name} — {m.count} / {m.capacity} ({LOAD_META[m.loadState].label})
              </option>
            ))}
          </select>
          <span className="block text-xs text-slate-400 mt-1.5">Each option shows the mentor's current mentee load and capacity.</span>
        </label>

        {wouldExceed && target && (
          <p className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            This will exceed {target.mentor.name}'s configured capacity ({target.count + 1} / {target.capacity}). Manual reassignment may overload a mentor — automatic allocation will skip them until capacity frees up.
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn-primary" disabled={!mentorId} onClick={() => onConfirm(mentorId)}>
            <ArrowRightLeft className="w-4 h-4" /> {currentId ? 'Confirm Reassignment' : 'Confirm Allocation'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function UnallocatedModal({ deptId, onClose, onAssign }: {
  deptId: string;
  onClose: () => void;
  onAssign: (s: Student) => void;
}) {
  const { data } = useStore();
  const dCode = deptCode(data, deptId);
  const students = getUnallocatedStudents(data, deptId);

  return (
    <Modal
      open
      onClose={onClose}
      title="Unallocated Students"
      subtitle={`${students.length} student${students.length !== 1 ? 's' : ''} awaiting mentor assignment · AY ${ACADEMIC_YEAR}`}
      size="lg"
    >
      <p className="text-sm text-slate-500 mb-4">
        These students could not be automatically allocated because available mentor capacity has been reached, or no allocation has been run for their class yet. Assign a mentor manually below, or run Auto Allocate once capacity frees up.
      </p>
      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className={thCls}>Student</th>
              <th className={thCls}>Roll No.</th>
              <th className={thCls}>Semester</th>
              <th className={thCls}>Class</th>
              <th className={thCls}>Status</th>
              <th className={`${thCls} text-right`}>Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((s) => (
              <tr key={s.id} className="table-row">
                <td className={`${tdCls} font-medium text-slate-900`}>{s.name}</td>
                <td className={tdCls}>{s.rollNo}</td>
                <td className={tdCls}>{semShort(s.semester)}</td>
                <td className={tdCls}>{mentoringClassLabel(dCode, s.section)}</td>
                <td className={tdCls}><span className="badge bg-rose-100 text-rose-700">Unallocated</span></td>
                <td className={`${tdCls} text-right`}>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => onAssign(s)}
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Assign Mentor
                  </button>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">All students are allocated</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}

/* ==== MODALS PART 3 ==== */

function HistoryModal({ deptId, student, onClose }: {
  deptId: string;
  student: Student | null;
  onClose: () => void;
}) {
  const { data } = useStore();
  const deptStudentIds = useMemo(() => new Set(getMentoringStudents(data, deptId).map((s) => s.id)), [data, deptId]);
  const rows = useMemo(() => {
    const list = student
      ? data.mentoringHistory.filter((h) => h.studentId === student.id)
      : data.mentoringHistory.filter((h) => deptStudentIds.has(h.studentId));
    return [...list].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 50);
  }, [data.mentoringHistory, student, deptStudentIds]);

  return (
    <Modal
      open
      onClose={onClose}
      title="Allocation History"
      subtitle={student ? `${student.name} — ${student.rollNo}` : `Recent allocation activity in your department · AY ${ACADEMIC_YEAR}`}
      size="lg"
    >
      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className={thCls}>Date</th>
              <th className={thCls}>Student</th>
              <th className={thCls}>Action</th>
              <th className={thCls}>Previous Mentor</th>
              <th className={thCls}>New Mentor</th>
              <th className={thCls}>Allocated By</th>
              <th className={thCls}>Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((h) => {
              const meta = ACTION_META[h.action] ?? { label: h.action, badge: 'bg-slate-100 text-slate-700' };
              return (
                <tr key={h.id}>
                  <td className={`${tdCls} whitespace-nowrap`}>{formatDate(h.date)}</td>
                  <td className={`${tdCls} font-medium text-slate-900`}>
                    {data.students.find((s) => s.id === h.studentId)?.name ?? h.studentId}
                  </td>
                  <td className={tdCls}><span className={`badge ${meta.badge}`}>{meta.label}</span></td>
                  <td className={tdCls}>{h.previousMentorId ? staffName(data, h.previousMentorId) : <span className="text-slate-400">—</span>}</td>
                  <td className={tdCls}>{staffName(data, h.newMentorId)}</td>
                  <td className={tdCls}>{staffName(data, h.performedBy)}</td>
                  <td className={`${tdCls} text-xs text-slate-500`}>{h.note}</td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">No allocation history recorded yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}

function MentorInfoModal({ mentorId, onClose }: { mentorId: string; onClose: () => void }) {
  const { data } = useStore();
  const mentor = data.staff.find((s) => s.id === mentorId);
  if (!mentor) return null;
  const load = getMentorLoad(data, mentor);
  const meta = LOAD_META[load.loadState];

  return (
    <Modal open onClose={onClose} title={mentor.name} subtitle={`${mentor.designation} · ${deptName(data, mentor.departmentId)}`} size="sm">
      <div className="space-y-5">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center text-lg font-semibold">
            {initials(mentor.name)}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{mentor.designation}</p>
            <p className="text-xs text-slate-500">{mentor.email} · {mentor.phone}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className={`badge ${meta.badge}`}>{meta.label}</span>
              <StatusBadge status={mentor.status} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="card p-3"><p className="text-xs text-slate-500">Mentees</p><p className="text-lg font-bold text-slate-900">{load.count}</p></div>
          <div className="card p-3"><p className="text-xs text-slate-500">Capacity</p><p className="text-lg font-bold text-slate-900">{load.capacity}</p></div>
          <div className="card p-3"><p className="text-xs text-slate-500">Load</p><p className={`text-lg font-bold ${load.pct > 100 ? 'text-rose-600' : 'text-slate-900'}`}>{load.pct}%</p></div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Current Mentees ({load.count})</p>
          {load.mentees.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {load.mentees.map((s) => (
                <span key={s.id} className="badge bg-slate-100 text-slate-700">{s.name} · {s.rollNo}</span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No mentees allocated yet.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}








