import { useState, type ReactNode } from 'react';
import { useStore, deptName, deptCode, staffName, roleLabels } from '../store/StoreContext';
import { DataTable, StatusBadge } from './DataTable';
import { PageHeader, SectionTitle } from './PageHeader';
import { StatCard } from './StatCard';
import { StudentDetailModal, StaffDetailModal } from './DetailModals';
import { Search, Users, GraduationCap, CheckSquare, XCircle, RotateCcw, MessageSquare, FileText, Download, Mail, ShieldCheck, Send, Calendar, AlertCircle, BookOpen, Clock, TrendingUp } from 'lucide-react';
import type { Student, Staff, ApprovalRequest, Message, Role, Complaint } from '../data/types';

export function StudentsDirectory({ scopeDept, editable, showStats = true, classFilter = false, courseFilter = false, showAttendanceStats = false, extraStats }: { scopeDept?: string; editable?: boolean; showStats?: boolean; classFilter?: boolean; courseFilter?: boolean; showAttendanceStats?: boolean; extraStats?: ReactNode }) {
  const { data, updateStudent } = useStore();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Student | null>(null);
  const [filterSem, setFilterSem] = useState<string>('all');
  const [filterSec, setFilterSec] = useState<string>('all');
  const [filterCourse, setFilterCourse] = useState<string>('all');

  const semesters = [...new Set(data.students.filter((s) => !scopeDept || s.departmentId === scopeDept).map((s) => s.semester))].sort((a, b) => a - b);
  const sections = [...new Set(data.students.filter((s) => !scopeDept || s.departmentId === scopeDept).map((s) => s.section))].sort();
  const courses = [...new Set(data.students.filter((s) => !scopeDept || s.departmentId === scopeDept).map((s) => s.program))].sort();

  let rows = data.students.filter((s) => (!scopeDept || s.departmentId === scopeDept) && s.name.toLowerCase().includes(query.toLowerCase()));
  if (classFilter) {
    rows = rows.filter((s) => (filterSem === 'all' || s.semester === Number(filterSem)) && (filterSec === 'all' || s.section === filterSec));
  }
  if (courseFilter) {
    rows = rows.filter((s) => (filterSem === 'all' || s.semester === Number(filterSem)) && (filterSec === 'all' || s.section === filterSec) && (filterCourse === 'all' || s.program === filterCourse));
  }

  return (
    <div>
      <PageHeader title="Student Directory" description={scopeDept ? `${deptName(data, scopeDept)} students` : 'All college students'} action={
        <div className="flex flex-wrap items-center gap-2">
          {classFilter && (
            <>
              {courseFilter && (
                <select className="input w-auto" value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}>
                  <option value="all">All Courses</option>
                  {courses.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
              <select className="input w-auto" value={filterSem} onChange={(e) => setFilterSem(e.target.value)}>
                <option value="all">All Semesters</option>
                {semesters.map((s) => <option key={s} value={s}>Sem {s}</option>)}
              </select>
              <select className="input w-auto" value={filterSec} onChange={(e) => setFilterSec(e.target.value)}>
                <option value="all">All Sections</option>
                {sections.map((s) => <option key={s} value={s}>Sec {s}</option>)}
              </select>
            </>
          )}
          <div className="flex items-center bg-white border border-slate-300 rounded-lg px-3 py-2 w-56">
            <Search className="w-4 h-4 text-slate-400" />
            <input className="bg-transparent border-0 outline-0 text-sm ml-2 flex-1" placeholder="Search by name..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
      } />
      {showStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Students" value={rows.length} icon={<GraduationCap className="w-5 h-5" />} accent="blue" />
          <StatCard label="Active" value={rows.filter((s) => s.status === 'active').length} icon={<Users className="w-5 h-5" />} accent="emerald" />
          <StatCard label="Low Attendance" value={rows.filter((s) => s.attendancePct < 75).length} icon={<XCircle className="w-5 h-5" />} accent="rose" />
          <StatCard label="With Backlogs" value={rows.filter((s) => s.backlogs > 0).length} icon={<RotateCcw className="w-5 h-5" />} accent="amber" />
        </div>
      )}
      {showAttendanceStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard label="College Average" value={`${Math.round(data.students.reduce((a, s) => a + s.attendancePct, 0) / data.students.length)}%`} icon={<TrendingUp className="w-5 h-5" />} accent="blue" />
          <StatCard label="Above 75%" value={data.students.filter((s) => s.attendancePct >= 75).length} icon={<CheckSquare className="w-5 h-5" />} accent="emerald" />
          <StatCard label="Below 75%" value={data.students.filter((s) => s.attendancePct < 75).length} icon={<ShieldCheck className="w-5 h-5" />} accent="rose" />
          <StatCard label="Below 70%" value={data.students.filter((s) => s.attendancePct < 70).length} icon={<ShieldCheck className="w-5 h-5" />} accent="amber" />
        </div>
      )}
      {extraStats}
      <DataTable
        rows={rows}
        columns={[
          { key: 'rollNo', header: 'Roll No' },
          { key: 'name', header: 'Name', render: (s) => <span className="font-medium text-slate-900">{s.name}</span> },
          { key: 'program', header: 'Program' },
          { key: 'semester', header: 'Sem', render: (s) => `Sem ${s.semester}` },
          { key: 'section', header: 'Sec' },
          { key: 'attendancePct', header: 'Attendance', render: (s) => <span className={s.attendancePct < 75 ? 'text-rose-600 font-semibold' : ''}>{s.attendancePct}%</span> },
          { key: 'gpa', header: 'GPA', render: (s) => s.gpa },
          { key: 'status', header: 'Status', render: (s) => <StatusBadge status={s.status} /> },
        ]}
        onRowDoubleClick={(s) => setSelected(s)}
      />
      <p className="text-xs text-slate-400 mt-3">Double-click a row to view full profile.</p>
      <StudentDetailModal student={selected} open={!!selected} onClose={() => setSelected(null)} editable={editable} onSave={(patch) => { if (selected) { updateStudent(selected.id, patch); setSelected({ ...selected, ...patch }); } }} />
    </div>
  );
}

export function StaffDirectory({ scopeDept, roles, editable, title = 'Staff Directory', extraAction, showAttendance = false }: { scopeDept?: string; roles?: string[]; editable?: boolean; title?: string; extraAction?: ReactNode; showAttendance?: boolean }) {
  const { data, updateStaff } = useStore();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Staff | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [designationFilter, setDesignationFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | Staff['status']>('all');

  const allDesignations = Array.from(new Set(data.staff.map((s) => s.designation))).sort();

  const rows = data.staff.filter((s) =>
    (!scopeDept || s.departmentId === scopeDept) &&
    (!roles || roles.includes(s.role)) &&
    s.name.toLowerCase().includes(query.toLowerCase()) &&
    (designationFilter === 'all' || s.designation === designationFilter) &&
    (statusFilter === 'all' || s.status === statusFilter)
  );

  const avgAttendance = rows.length ? Math.round(rows.reduce((sum, s) => sum + s.attendancePct, 0) / rows.length) : 0;
  const avgEffectiveness = rows.length ? Math.round(rows.reduce((sum, s) => sum + Math.min(100, Math.round((s.performanceRating / 5) * 100)), 0) / rows.length) : 0;
  const totalPending = rows.reduce((sum, s) => sum + s.pendingWork, 0);
  const teachingFaculty = rows.filter((s) => s.subjects.length > 0).length;

  const getSyllabusAverage = (staffMember: Staff) => {
    const staffSubjects = data.subjects.filter((subject) => subject.facultyId === staffMember.id);
    if (!staffSubjects.length) return 0;
    return Math.round(staffSubjects.reduce((sum, subject) => sum + subject.syllabusCompletion, 0) / staffSubjects.length);
  };

  const metricStyles = {
    low: 'bg-rose-50 text-rose-700 border border-rose-100',
    medium: 'bg-amber-50 text-amber-700 border border-amber-100',
    healthy: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  const cardHeader = title === 'Faculty List' || title === 'Department Faculty' ? 'Faculty List' : title;
  const cardDescription = title === 'Faculty List' || title === 'Department Faculty'
    ? 'View faculty details, attendance and performance.'
    : scopeDept ? `${deptName(data, scopeDept)}` : 'All staff';

  return (
    <div className="space-y-6">
      <PageHeader title={cardHeader} description={cardDescription} action={
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 w-64 shadow-sm">
            <Search className="w-4 h-4 text-slate-400" />
            <input className="bg-transparent border-0 outline-0 text-sm ml-2 flex-1 placeholder:text-slate-400" placeholder="Search faculty..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <select className="input w-auto" value={designationFilter} onChange={(e) => setDesignationFilter(e.target.value)}>
            <option value="all">All Designations</option>
            {allDesignations.map((designation) => (
              <option key={designation} value={designation}>{designation}</option>
            ))}
          </select>
          <select className="input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | Staff['status'])}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="on-leave">On Leave</option>
            <option value="inactive">Inactive</option>
          </select>
          {extraAction}
        </div>
      } />

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-2">
        <div className="card px-4 py-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Total Faculty</span>
            <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Users className="w-4 h-4" /></span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{rows.length}</p>
        </div>
        <div className="card px-4 py-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Teaching Faculty</span>
            <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><BookOpen className="w-4 h-4" /></span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{teachingFaculty}</p>
        </div>
        <div className="card px-4 py-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Avg. Attendance</span>
            <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><CheckSquare className="w-4 h-4" /></span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{avgAttendance}%</p>
        </div>
        <div className="card px-4 py-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Avg. Teaching Effectiveness</span>
            <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><TrendingUp className="w-4 h-4" /></span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{avgEffectiveness}%</p>
        </div>
        <div className="card px-4 py-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Pending Work</span>
            <span className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center"><Clock className="w-4 h-4" /></span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{totalPending}</p>
        </div>
      </div>

      <div className="space-y-3">
        {rows.length === 0 ? (
          <div className="card p-4 text-center">
            <p className="text-sm text-slate-500">No faculty matches the current search or filter.</p>
          </div>
        ) : rows.map((staffMember) => {
          const effectiveness = Math.min(100, Math.round((staffMember.performanceRating / 5) * 100));
          const syllabusAverage = getSyllabusAverage(staffMember);
          const attendanceTone = staffMember.attendancePct >= 85 ? metricStyles.healthy : staffMember.attendancePct >= 75 ? metricStyles.medium : metricStyles.low;
          const effectivenessTone = effectiveness >= 80 ? metricStyles.healthy : effectiveness >= 70 ? metricStyles.medium : metricStyles.low;
          const ratingTone = staffMember.feedbackScore >= 4.2 ? metricStyles.healthy : staffMember.feedbackScore >= 3.5 ? metricStyles.medium : metricStyles.low;
          const pendingTone = staffMember.pendingWork <= 2 ? metricStyles.healthy : staffMember.pendingWork <= 6 ? metricStyles.medium : metricStyles.low;
          const expanded = expandedId === staffMember.id;

          return (
            <div key={staffMember.id} className={`card overflow-hidden transition-all duration-200 ${expanded ? 'shadow-md border-slate-200' : 'shadow-sm border-slate-200'}`}>
              <div className="flex flex-col xl:flex-row xl:items-center gap-4 p-4">
                <div className="flex items-center gap-3 min-w-0 xl:flex-1">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-700 flex items-center justify-center font-semibold text-base shadow-sm">
                    {staffMember.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-slate-900 truncate">{staffMember.name}</p>
                    <p className="text-sm text-slate-500">{staffMember.designation}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 flex-1">
                  <div className="rounded-xl bg-slate-50 border border-slate-200 px-1 py-2">
                    <div className="flex items-center justify-between gap-1 mb-1 min-w-0">
                      <span className="min-w-0 truncate text-[11px] text-slate-500 uppercase tracking-wide">Attendance</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${
                        staffMember.attendancePct >= 85 
                        ? 'bg-emerald-500' 
                        : staffMember.attendancePct >= 75 
                        ? 'bg-amber-500' 
                        : 'bg-rose-500'
                        }`} 
                        style={{ width: `${staffMember.attendancePct}%` }} 
                      />
                    </div>
                    <span className={`inline-flex mt-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${attendanceTone}`}>
                      {staffMember.attendancePct}%
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-50 border border-slate-200 px-1 py-2">
                    <div className="flex items-center justify-between mb-1 min-w-0">
                      <span className="min-w-0 truncate text-[11px] text-slate-500 uppercase tracking-wide">Effectiveness</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${effectiveness >= 80 ? 'bg-emerald-500' : effectiveness >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${effectiveness}%` }} />
                    </div>
                    <span className={`inline-flex mt-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${effectivenessTone}`}>{effectiveness}%</span>
                  </div>

                  <div className="rounded-xl bg-slate-50 border border-slate-200 px-1 py-2">
                    <span className="text-[11px] text-slate-500 uppercase tracking-wide">Rating</span>
                    <span className={`inline-flex mt-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${ratingTone}`}>★</span>
                    <p className="mt-1.5 flex items-center justify-between text-sm font-semibold text-slate-900">
                      {staffMember.feedbackScore.toFixed(1)}
                      
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 border border-slate-200 px-1 py-2">
                    <span className="text-[11px] text-slate-500 uppercase tracking-wide">Pending Work</span>
                    <span>       </span>
                    <span className={`mt-1.5 text-sm font-semibold ${staffMember.pendingWork > 5 ? 'text-amber-700' : 'text-slate-900'}`}>{staffMember.pendingWork}</span>
                  </div>

                  <div className="rounded-xl bg-slate-50 border border-slate-200 px-1 py-2">
                    <span className="text-[11px] text-slate-500 uppercase tracking-wide">Avg. Syllabus</span>
                    <p className="mt-1.5 text-sm font-semibold text-slate-900">{syllabusAverage}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 xl:justify-end">
                  <button className="btn-secondary text-xs" onClick={() => setSelected(staffMember)}>View profile</button>
                  <button
                    type="button"
                    aria-label={expanded ? 'Collapse faculty details' : 'Expand faculty details'}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                    onClick={() => setExpandedId(expanded ? null : staffMember.id)}
                  >
                    <svg className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              {expanded && (
                <div className="border-t border-slate-200 bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ID</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Subject Name</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Class</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Syllabus Progress</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.subjects.filter((s) => s.facultyId === staffMember.id).length > 0 ? (
                          data.subjects.filter((s) => s.facultyId === staffMember.id).map((subject) => (
                            <tr key={subject.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3 font-medium text-slate-900">{subject.code}</td>
                              <td className="px-4 py-3 text-slate-700">{subject.name}</td>
                              <td className="px-4 py-3 text-slate-700">{subject.classes.join(', ')}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden max-w-xs">
                                    <div className={`h-full rounded-full ${subject.syllabusCompletion >= 80 ? 'bg-emerald-500' : subject.syllabusCompletion >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${subject.syllabusCompletion}%` }} />
                                  </div>
                                  <span className={`text-xs font-medium min-w-max ${subject.syllabusCompletion >= 80 ? 'text-emerald-700' : subject.syllabusCompletion >= 70 ? 'text-amber-700' : 'text-rose-700'}`}>{subject.syllabusCompletion}%</span>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500">
                              No subjects assigned
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <StaffDetailModal staff={selected} open={!!selected} onClose={() => setSelected(null)} editable={editable} onSave={(patch) => { if (selected) { updateStaff(selected.id, patch); setSelected({ ...selected, ...patch }); } }} />
    </div>
  );
}

export function ApprovalsPanel({ filter, canAct }: { filter?: ApprovalRequest['type'][]; canAct?: boolean }) {
  const { data, updateApproval, updateCandidate, addNotification } = useStore();
  const [selected, setSelected] = useState<ApprovalRequest | null>(null);
  const [remarks, setRemarks] = useState('');

const rows = data.approvals.filter((a) =>
    (!filter || filter.includes(a.type)) &&
    a.status !== 'approved' &&
    a.status !== 'rejected' &&
    a.type !== 'budget' &&
    a.type !== 'purchase' &&
    a.type !== 'timetable' &&
    (a.type !== 'recruitment' && a.type !== 'promotion' ? true : a.status === 'dean-recommended') &&
    // Leave requests are handled in the Leave Management module; Principal only sees Dean-submitted leaves
    (a.type !== 'leave' || a.submittedByRole === 'dean')
  );

  const shortlistedCandidates = selected?.shortlistedCandidateIds?.length
    ? data.candidates.filter((c) => selected.shortlistedCandidateIds?.includes(c.id))
    : [];

  const act = (status: ApprovalRequest['status']) => {
    if (!selected) return;
    const remarksText = remarks.trim();

    if (selected.type === 'recruitment' && selected.shortlistedCandidateIds?.length) {
      selected.shortlistedCandidateIds.forEach((candidateId) => {
        updateCandidate(candidateId, { status: status === 'approved' ? 'selected' : 'rejected' });
      });
    }

    updateApproval(selected.id, { status, principalRemarks: remarksText });
    const title = selected.title;
    const decision = status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'sent back for revision';
    const audience: Role[] = selected.type === 'result' && status === 'approved' ? ['office-superintendent'] : [selected.submittedByRole];
    const message = selected.type === 'result'
      ? status === 'approved'
        ? `Result publication for ${title} has been approved by the Principal. The administration office can proceed with publishing.`
        : `${title} was ${decision} by the Principal${remarksText ? ` with remarks: ${remarksText}` : ''}.`
      : `${title} has been ${decision} by Principal${remarksText ? ` with remarks: ${remarksText}` : ''}`;
    const notificationTitle = selected.type === 'result' && status === 'approved' ? 'Result publication approved' : `Approval ${decision}`;
    addNotification({ id: `n${Date.now()}`, title: notificationTitle, message, date: new Date().toISOString().slice(0, 10), audience, read: false });
    setSelected({ ...selected, status, principalRemarks: remarksText });
    setRemarks('');
  };

  return (
    <div>
      <PageHeader title="Pending Approvals" description="Review and act on requests submitted by HODs, Faculty, and Accounts" />
      <div className="mb-6 w-full max-w-xs">
        <StatCard label="Pending" value={rows.length} icon={<CheckSquare className="w-4 h-4 sm:w-5 sm:h-5" />} accent="amber" compact />
      </div>
      <DataTable
        rows={rows}
        columns={[
          { key: 'title', header: 'Title', render: (a) => <span className="font-medium text-slate-900">{a.title}</span> },
          { key: 'type', header: 'Type', render: (a) => <span className="badge bg-slate-100 text-slate-700 capitalize">{a.type}</span> },
          { key: 'submittedBy', header: 'Submitted By' },
          { key: 'date', header: 'Date' },
          { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.status} /> },
        ]}
        onRowClick={(a) => { setSelected(a); setRemarks(a.principalRemarks ?? ''); }}
      />
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative max-w-2xl w-full bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-slate-900">{selected.title}</h2>
              <p className="text-sm text-slate-500 capitalize">{selected.type} · {selected.submittedBy} · {selected.date}</p>
            </div>
            <div className="px-6 py-5 space-y-3">
              <div className="card p-3"><p className="text-xs text-slate-500">Purpose</p><p className="text-sm text-slate-900">{selected.purpose}</p></div>
              {selected.amount && <div className="card p-3"><p className="text-xs text-slate-500">Amount</p><p className="text-sm text-slate-900 font-semibold">₹{selected.amount.toLocaleString('en-IN')}</p></div>}
              <div className="card p-3"><p className="text-xs text-slate-500 mb-1">Details</p><dl className="grid grid-cols-2 gap-2">{Object.entries(selected.details).map(([k, v]) => <div key={k}><dt className="text-xs text-slate-400 capitalize">{k}</dt><dd className="text-sm text-slate-900">{v}</dd></div>)}</dl></div>

              {selected.type === 'syllabus' && (
                <div className="card p-3 bg-blue-50/50">
                  <p className="text-xs text-slate-500">Syllabus Approval Flow</p>
                  <p className="text-sm text-slate-900">The HOD submits the revised syllabus for approval. Approve to release it, reject to return it, or send it back for revision with remarks.</p>
                </div>
              )}
              {selected.type === 'result' && (
                <div className="card p-3 bg-amber-50/60">
                  <p className="text-xs text-slate-500">Result Publication Flow</p>
                  <p className="text-sm text-slate-900">If approved, the administration office receives a publication notification. If rejected or sent back, the result request returns to the HOD with remarks.</p>
                </div>
              )}

              {selected.type === 'recruitment' && (
                <div className="card p-3 bg-slate-50">
                  <p className="text-xs text-slate-500">Shortlisted Candidates</p>
                  {shortlistedCandidates.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
                      {shortlistedCandidates.map((candidate) => (
                        <li key={candidate.id}>{candidate.name} — {candidate.qualification}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-400">No candidates have been shortlisted for this recruitment request yet.</p>
                  )}
                </div>
              )}
              {selected.timetableEntries && selected.timetableEntries.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">Submitted Timetable</p>
                  <div className="card overflow-hidden">
                    <table className="w-full">
                      <thead><tr className="bg-slate-50 border-b border-slate-200"><th className="text-left px-3 py-2 text-xs font-semibold text-slate-600">Day</th><th className="text-left px-3 py-2 text-xs font-semibold text-slate-600">Time</th><th className="text-left px-3 py-2 text-xs font-semibold text-slate-600">Subject</th><th className="text-left px-3 py-2 text-xs font-semibold text-slate-600">Faculty</th><th className="text-left px-3 py-2 text-xs font-semibold text-slate-600">Room</th></tr></thead>
                      <tbody className="divide-y divide-slate-100">
                        {selected.timetableEntries.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50"><td className="px-3 py-2 text-sm text-slate-700">{t.day}</td><td className="px-3 py-2 text-sm text-slate-700">{t.slot}</td><td className="px-3 py-2 text-sm font-medium text-slate-900">{t.subject}</td><td className="px-3 py-2 text-sm text-slate-700">{staffName(data, t.facultyId)}</td><td className="px-3 py-2 text-sm text-slate-700">{t.room}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selected.documents && selected.documents.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">Submitted Documents</p>
                  <div className="space-y-2">
                    {selected.documents.map((doc) => (
                      <div key={doc.id} className="card p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3"><FileText className="w-5 h-5 text-slate-400" /><div><p className="text-sm font-medium text-slate-900">{doc.name}</p><p className="text-xs text-slate-500">{doc.type} · {doc.size} · {doc.uploaded}</p></div></div>
                        <button className="btn-secondary text-xs"><Download className="w-3.5 h-3.5" /> View</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selected.deanRemarks && <div className="card p-3 bg-blue-50/50"><p className="text-xs text-slate-500">Dean's Remarks</p><p className="text-sm text-slate-900">{selected.deanRemarks}</p></div>}
              {canAct && (
                <>
                  <textarea className="input" rows={3} placeholder="Add remarks..." value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                  <div className="flex gap-2">
                    <button className="btn-success flex-1" onClick={() => act('approved')}><CheckSquare className="w-4 h-4" /> Approve</button>
                    <button className="btn-danger flex-1" onClick={() => act('rejected')}><XCircle className="w-4 h-4" /> Reject</button>
                    <button className="btn-warning flex-1" onClick={() => act('revision')}><RotateCcw className="w-4 h-4" /> Send Back</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function GrievancesPanel({ scopeDept, canAssign, semesterFilter = false }: { scopeDept?: string; canAssign?: boolean; semesterFilter?: boolean }) {
  const { data, updateGrievance } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [assignTo, setAssignTo] = useState('');
  const [resolution, setResolution] = useState('');
  const [filterSem, setFilterSem] = useState('all');

  const scopedStudents = data.students.filter((s) => !scopeDept || s.departmentId === scopeDept);
  const semesters = [...new Set(scopedStudents.map((s) => s.semester))].sort((a, b) => a - b);
  const rows = data.grievances.filter((g) => {
    if (scopeDept && g.departmentId !== scopeDept) return false;
    if (!semesterFilter || filterSem === 'all') return true;
    return data.students.find((s) => s.id === g.studentId)?.semester === Number(filterSem);
  });
  const selected = rows.find((g) => g.id === selectedId);
  const faculty = data.staff.filter((s) => (!scopeDept || s.departmentId === scopeDept) && ['professor', 'associate-professor', 'assistant-professor', 'lecturer', 'hod'].includes(s.role));

  return (
    <div>
      <PageHeader title="Student Grievances" description="Review, assign, and resolve student grievances" action={semesterFilter ? (
        <select className="input w-auto" value={filterSem} onChange={(e) => setFilterSem(e.target.value)}>
          <option value="all">All Semesters</option>
          {semesters.map((semester) => <option key={semester} value={semester}>Sem {semester}</option>)}
        </select>
      ) : undefined} />
      <DataTable
        rows={rows}
        columns={[
          { key: 'title', header: 'Title', render: (g) => <span className="font-medium text-slate-900">{g.title}</span> },
          { key: 'studentId', header: 'Student', render: (g) => data.students.find((s) => s.id === g.studentId)?.name ?? '—' },
          { key: 'date', header: 'Date' },
          { key: 'assignedTo', header: 'Assigned To' },
          { key: 'status', header: 'Status', render: (g) => <StatusBadge status={g.status} /> },
        ]}
        onRowClick={(g) => { setSelectedId(g.id); setAssignTo(g.assignedTo); setResolution(g.resolution); }}
      />
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedId(null)} />
          <div className="relative max-w-lg w-full bg-white rounded-2xl shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{selected.title}</h2>
              <StatusBadge status={selected.status} />
            </div>
            <div className="px-6 py-5 space-y-3">
              <div className="card p-3"><p className="text-xs text-slate-500">Student</p><p className="text-sm text-slate-900">{data.students.find((s) => s.id === selected.studentId)?.name}</p></div>
              <div className="card p-3"><p className="text-xs text-slate-500">Description</p><p className="text-sm text-slate-900">{selected.description}</p></div>
              <div>
                <p className="text-xs text-slate-500 mb-2">History</p>
                <div className="space-y-2">{selected.history.map((h, i) => <div key={i} className="text-sm text-slate-700 border-l-2 border-slate-200 pl-3"><span className="text-xs text-slate-400">{h.date}</span> · {h.action} <span className="text-xs text-slate-400">by {h.by}</span></div>)}</div>
              </div>
              {canAssign && (
                <>
                  <select className="input" value={assignTo} onChange={(e) => setAssignTo(e.target.value)}>
                    <option value="">Assign to faculty...</option>
                    {faculty.map((f) => <option key={f.id} value={f.name}>{f.name} ({f.designation})</option>)}
                  </select>
                  <textarea className="input" rows={2} placeholder="Resolution notes..." value={resolution} onChange={(e) => setResolution(e.target.value)} />
                  <div className="flex gap-2">
                    <button className="btn-primary flex-1" onClick={() => { updateGrievance(selected.id, { assignedTo: assignTo, status: 'assigned' }); setSelectedId(null); }}><MessageSquare className="w-4 h-4" /> Assign</button>
                    <button className="btn-success flex-1" onClick={() => { updateGrievance(selected.id, { resolution, status: 'resolved' }); setSelectedId(null); }}><CheckSquare className="w-4 h-4" /> Resolve</button>
                    <button className="btn-secondary flex-1" onClick={() => { updateGrievance(selected.id, { resolution, status: 'closed' }); setSelectedId(null); }}>Close</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SyllabusProgressView({ scopeDept, quickActions, onNavigate }: { scopeDept?: string; quickActions?: { id: string; label: string; icon: ReactNode }[]; onNavigate?: (id: string) => void }) {
  const { data } = useStore();
  const rows = data.subjects.filter((s) => !scopeDept || s.departmentId === scopeDept);
  return (
    <div>
      <PageHeader title="Syllabus Progress" description="Subject-wise syllabus completion tracking" />
      {quickActions && quickActions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {quickActions.map((a) => (
            <button
              key={a.id}
              title={a.label}
              onClick={() => onNavigate?.(a.id)}
              className="flex flex-col items-center gap-1.5 w-24 px-2 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 transition"
            >
              {a.icon}
              <span className="text-[11px] font-medium leading-tight text-center">{a.label}</span>
            </button>
          ))}
        </div>
      )}
      <DataTable
        rows={rows}
        columns={[
          { key: 'name', header: 'Subject', render: (s) => <span className="font-medium text-slate-900">{s.name}</span> },
          { key: 'code', header: 'Code' },
          { key: 'departmentId', header: 'Dept', render: (s) => deptCode(data, s.departmentId) },
          { key: 'semester', header: 'Sem' },
          { key: 'facultyId', header: 'Faculty', render: (s) => staffName(data, s.facultyId) },
          { key: 'unitsCompleted', header: 'Units', render: (s) => `${s.unitsCompleted}/${s.unitsTotal}` },
          { key: 'syllabusCompletion', header: 'Completion', render: (s) => (
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${s.syllabusCompletion < 70 ? 'bg-rose-500' : s.syllabusCompletion < 85 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${s.syllabusCompletion}%` }} /></div>
              <span className="text-xs font-medium text-slate-700">{s.syllabusCompletion}%</span>
            </div>
          ) },
        ]}
      />
    </div>
  );
}

export function TimetableView({ scopeDept, showStatus = false }: { scopeDept?: string; showStatus?: boolean }) {
  const { data } = useStore();
  const rows = data.timetable.filter((t) => !scopeDept || t.departmentId === scopeDept);
  const cols: { key: string; header: string; render?: (row: typeof rows[0]) => ReactNode }[] = [
    { key: 'day', header: 'Day' },
    { key: 'slot', header: 'Time' },
    { key: 'subject', header: 'Subject' },
    { key: 'facultyId', header: 'Faculty', render: (t) => staffName(data, t.facultyId) },
    { key: 'room', header: 'Room' },
    { key: 'section', header: 'Section', render: (t) => `${t.section} · Sem ${t.semester}` },
  ];
  if (showStatus) cols.push({ key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} /> });
  return (
    <div>
      <PageHeader title="Timetable" description={scopeDept ? `${deptName(data, scopeDept)}` : 'All department timetables'} />
      <DataTable rows={rows} columns={cols} />
    </div>
  );
}

export function Placeholder({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <div className="card p-12 text-center">
        <div className="w-14 h-14 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-4">
          <MessageSquare className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-sm text-slate-500 max-w-md mx-auto">This module is configured per the SOP. Sample data and read-only views are available in connected modules. Full operational data-entry workflows are scoped to authorized roles.</p>
      </div>
    </div>
  );
}

export { SectionTitle };

export function InboxView({ recipientRole, recipientName }: { recipientRole: Role; recipientName: string }) {
  const { data, markMessageRead } = useStore();
  const [selected, setSelected] = useState<Message | null>(null);
  const rows = data.messages.filter((m) => m.toRole === recipientRole);

  return (
    <div>
      <PageHeader title="Inbox" description={`Messages received by ${recipientName}`} />
      <DataTable
        rows={rows}
        columns={[
          { key: 'fromName', header: 'From', render: (m) => <span className="font-medium text-slate-900">{m.fromName}</span> },
          { key: 'fromRole', header: 'Role', render: (m) => <span className="badge bg-slate-100 text-slate-700">{roleLabels[m.fromRole]}</span> },
          { key: 'subject', header: 'Subject' },
          { key: 'date', header: 'Date' },
          { key: 'read', header: 'Status', render: (m) => m.read ? <span className="text-xs text-slate-400">Read</span> : <span className="badge bg-blue-100 text-blue-700">New</span> },
        ]}
        onRowClick={(m) => { setSelected(m); if (!m.read) markMessageRead(m.id); }}
      />
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative max-w-lg w-full bg-white rounded-2xl shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">{selected.subject}</h2>
              <p className="text-sm text-slate-500">From: {selected.fromName} ({roleLabels[selected.fromRole]}) · {selected.date}</p>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{selected.body}</p>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
              <button className="btn-secondary" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function LiaisonView({ category, title }: { category: 'university' | 'government' | 'accreditation' | 'parent'; title: string }) {
  const { data } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const rows = data.liaison.filter((l) => l.category === category);
  const selected = rows.find((l) => l.id === selectedId);

  return (
    <div>
      <PageHeader title={title} description="Communication and compliance with external bodies" />
      <DataTable
        rows={rows}
        columns={[
          { key: 'title', header: 'Title', render: (l) => <span className="font-medium text-slate-900">{l.title}</span> },
          { key: 'from', header: 'From' },
          { key: 'type', header: 'Type', render: (l) => <span className="badge bg-slate-100 text-slate-700">{l.type}</span> },
          { key: 'date', header: 'Date' },
          { key: 'deadline', header: 'Deadline', render: (l) => l.deadline ?? '—' },
          { key: 'status', header: 'Status', render: (l) => <StatusBadge status={l.status} /> },
        ]}
        onRowClick={(l) => setSelectedId(l.id)}
      />
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedId(null)} />
          <div className="relative max-w-xl w-full bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-slate-900">{selected.title}</h2>
              <p className="text-sm text-slate-500">{selected.from} · {selected.date} · {selected.type}</p>
            </div>
            <div className="px-6 py-5 space-y-3">
              <div className="card p-3"><p className="text-xs text-slate-500">Description</p><p className="text-sm text-slate-900">{selected.description}</p></div>
              {selected.deadline && <div className="card p-3"><p className="text-xs text-slate-500">Deadline</p><p className="text-sm text-slate-900 font-semibold">{selected.deadline}</p></div>}
              {selected.assignedTo && <div className="card p-3"><p className="text-xs text-slate-500">Assigned To</p><p className="text-sm text-slate-900">{selected.assignedTo}</p></div>}
              <div className="flex items-center gap-2"><StatusBadge status={selected.status} /></div>
              {selected.criteria && selected.criteria.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">Criteria Progress</p>
                  <div className="space-y-3">
                    {selected.criteria.map((c) => (
                      <div key={c.name}>
                        <div className="flex justify-between text-sm mb-1"><span className="font-medium text-slate-900">{c.name}</span><span className="text-slate-600">{c.progress}%</span></div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${c.progress < 75 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${c.progress}%` }} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
              <button className="btn-secondary flex-1" onClick={() => setSelectedId(null)}>Close</button>
              {selected.status === 'pending' && <button className="btn-primary flex-1" onClick={() => setSelectedId(null)}>Acknowledge</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function RegisterComplaintView() {
  const { currentUser, data, addComplaint } = useStore();
  const [form, setForm] = useState({ title: '', description: '', category: 'student-discipline' as Complaint['category'], against: '' });
  if (!currentUser) return null;
  const myComplaints = data.complaints.filter((c) => c.filedById === currentUser.id);

  const submit = () => {
    if (!form.title || !form.description) return;
    addComplaint({
      id: `cmp${Date.now()}`,
      title: form.title,
      description: form.description,
      filedBy: currentUser.name,
      filedById: currentUser.id,
      filedByRole: currentUser.role,
      departmentId: currentUser.departmentId,
      date: new Date().toISOString().slice(0, 10),
      status: 'open',
      category: form.category,
      against: form.against || undefined,
    });
    setForm({ title: '', description: '', category: 'student-discipline', against: '' });
  };

  return (
    <div>
      <PageHeader title="Register Complaint" description="File a complaint or disciplinary incident for Principal review" />
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">New Complaint</h3>
          <div className="space-y-3">
            <input className="input" placeholder="Complaint title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <select className="input w-auto" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Complaint['category'] })}>
              <option value="student-discipline">Student Discipline</option>
              <option value="staff-incident">Staff Incident</option>
              <option value="facility">Facility / Equipment</option>
              <option value="academic">Academic</option>
              <option value="other">Other</option>
            </select>
            <input className="input" placeholder="Against (optional)" value={form.against} onChange={(e) => setForm({ ...form, against: e.target.value })} />
            <textarea className="input" rows={5} placeholder="Describe the incident..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <button className="btn-primary" onClick={submit}><Send className="w-4 h-4" /> Submit Complaint</button>
          </div>
        </div>
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">My Filed Complaints</h3>
{myComplaints.length === 0 ? <p className="text-sm text-slate-400">No complaints filed yet.</p> :
          <div className="space-y-2">
            {myComplaints.map((c) => (
              <div key={c.id} className="p-3 rounded-lg bg-slate-50">
                <div className="flex justify-between"><p className="text-sm font-medium text-slate-900">{c.title}</p><StatusBadge status={c.status} /></div>
                <p className="text-xs text-slate-500">{c.date} · {c.category}</p>
              </div>
            ))}
          </div>}
        </div>
      </div>
    </div>
  );
}

const TEACHING_LEAVE_ROLES: Role[] = ['professor', 'associate-professor', 'assistant-professor', 'lecturer', 'teaching-assistant', 'office-superintendent', 'lab-assistant'];

function leaveForwardTargets(role: Role): { audience: Role[]; label: string } {
  switch (role) {
    case 'hod':
      return { audience: ['dean'], label: 'Dean' };
    case 'dean':
      return { audience: ['principal'], label: 'Principal' };
    case 'principal':
      return { audience: [], label: 'Higher Authority' };
    default:
      return { audience: ['hod', 'dean'], label: 'HOD & Dean' };
  }
}

export function LeaveManagementView() {
  const { data, currentUser, addApproval, updateApproval, addNotification } = useStore();
  const [form, setForm] = useState({ type: 'Casual', from: '', to: '', reason: '' });
  const [submitted, setSubmitted] = useState(false);
  const [selected, setSelected] = useState<ApprovalRequest | null>(null);
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  if (!currentUser) return null;
  const role: Role = currentUser.role;
  const targets = leaveForwardTargets(role);

  const myRequests = data.approvals
    .filter((a) => a.type === 'leave' && a.submittedBy === currentUser.name)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Faculty / non-teaching / HOD requests go to HOD first (or Dean for HOD), then Dean / Principal
  const isFaculty = TEACHING_LEAVE_ROLES.includes(role);
  const isHod = role === 'hod';

  // Requests awaiting this user's review
  const reviewRows = data.approvals.filter((a) => {
    if (role === 'hod') {
      // HOD reviews faculty leave requests from their dept
      return a.type === 'leave' && TEACHING_LEAVE_ROLES.includes(a.submittedByRole) && a.departmentId === currentUser.departmentId && a.hodStatus === 'pending';
    }
    if (role === 'dean') {
      // Dean reviews faculty requests after HOD decision + HOD requests
      return a.type === 'leave' && (
        (TEACHING_LEAVE_ROLES.includes(a.submittedByRole) && a.hodStatus === 'recommended') ||
        (a.submittedByRole === 'hod')
      );
    }
    if (role === 'principal') {
      // Principal reviews Dean requests
      return a.type === 'leave' && a.submittedByRole === 'dean';
    }
    return false;
  });

  const days = (() => {
    if (!form.from || !form.to) return 0;
    const f = new Date(form.from);
    const t = new Date(form.to);
    if (t < f) return 0;
    return Math.round((t.getTime() - f.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  })();

  const submit = () => {
    setError('');
    if (!form.from || !form.to || !form.reason.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (days <= 0) {
      setError('The end date must be on or after the start date.');
      return;
    }
    const id = `a${Date.now()}`;
    const title = `Leave request - ${currentUser.name}`;
    addApproval({
      id,
      type: 'leave',
      title,
      submittedBy: currentUser.name,
      submittedByRole: role,
      departmentId: currentUser.departmentId,
      date: new Date().toISOString().slice(0, 10),
      purpose: `${form.type} leave for ${days} day(s)`,
      status: 'pending',
      deanStatus: 'pending',
      hodStatus: isHod ? undefined : 'pending',
      details: { from: form.from, to: form.to, days: String(days), type: form.type, reason: form.reason, balance: '10 days' },
      documents: [],
    });
    addNotification({
      id: `n${Date.now()}`,
      title: 'New leave request',
      message: `${currentUser.name} applied for ${form.type} leave (${form.from} to ${form.to}).`,
      date: new Date().toISOString().slice(0, 10),
      audience: role === 'principal' ? ['dean'] : targets.audience,
      read: false,
    });
    setForm({ type: 'Casual', from: '', to: '', reason: '' });
    setSubmitted(true);
  };

  const actOnReview = (approved: boolean) => {
    if (!selected) return;
    const remark = remarks.trim();
    if (!remark) {
      setError('Remarks are mandatory before recording a decision.');
      return;
    }
    const patch: Partial<ApprovalRequest> = {};
    const decisionMsg = approved ? 'approved' : 'rejected';
    let audience: Role[] = [];
    let title = '';
    if (role === 'hod') {
      patch.hodStatus = approved ? 'recommended' : 'rejected';
      patch.hodRemarks = remark;
      if (approved) {
        patch.status = 'pending';
        audience = ['dean'];
        title = 'Leave request forwarded to Dean';
      } else {
        patch.status = 'rejected';
        audience = [selected.submittedByRole];
        title = 'Leave request rejected by HOD';
      }
    } else if (role === 'dean') {
      patch.deanStatus = approved ? 'recommended' : 'rejected';
      patch.deanRemarks = remark;
      if (selected.submittedByRole === 'hod') {
        patch.status = approved ? 'approved' : 'rejected';
        audience = approved ? ['hod'] : ['hod'];
        title = approved ? 'Leave approved by Dean' : 'Leave rejected by Dean';
      } else {
        // Faculty request - Dean makes final decision
        patch.status = approved ? 'approved' : 'rejected';
        audience = [selected.submittedByRole];
        title = approved ? 'Leave approved by Dean' : 'Leave rejected by Dean';
      }
    } else if (role === 'principal') {
      patch.status = approved ? 'approved' : 'rejected';
      patch.principalRemarks = remark;
      audience = ['dean'];
      title = approved ? 'Leave approved by Principal' : 'Leave rejected by Principal';
    }
    updateApproval(selected.id, patch);
    addNotification({
      id: `n${Date.now()}`,
      title,
      message: `${selected.title} has been ${decisionMsg}${remark ? ` with remarks: ${remark}` : ''}.`,
      date: new Date().toISOString().slice(0, 10),
      audience,
      read: false,
    });
    setSelected(null);
    setRemarks('');
    setError('');
  };

  const selectedRequest = selected;

  return (
    <div>
      <PageHeader title="Apply for Leave" description="Submit and track leave requests based on the college approval workflow" />

      <div className={`grid gap-6 mb-6 ${role === 'principal' ? 'lg:grid-cols-1' : 'lg:grid-cols-3'}`}>
        <div className={`card p-5 ${role === 'principal' ? '' : 'lg:col-span-2'}`}>
          <h3 className="text-sm font-semibold text-slate-900 mb-3">{role === 'principal' ? 'Leave Request' : 'New Leave Request'}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Leave Type</label>
              <select className="input w-full" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option>Casual</option>
                <option>Medical</option>
                <option>Earned</option>
                <option>Maternity</option>
                <option>Paternity</option>
                <option>Unpaid</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">From Date</label>
                <input className="input w-full" type="date" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">To Date</label>
                <input className="input w-full" type="date" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <span className="font-semibold">Total Days:</span>
              <span className="badge bg-blue-100 text-blue-700">{days}</span>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Reason for Leave</label>
              <textarea className="input w-full" rows={3} placeholder="Provide a brief reason..." value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            </div>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <button className="btn-primary" onClick={submit}><Send className="w-4 h-4" /> Submit Leave Request</button>
            {submitted && <span className="text-sm text-emerald-700 ml-2">Leave request submitted successfully.</span>}
          </div>
        </div>
        {role !== 'principal' && (
          <div className="card p-5 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Approval Workflow</h3>
            <p className="text-sm text-slate-600 mb-4">Your leave request will be forwarded to:</p>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge bg-indigo-100 text-indigo-700">{roleLabels[currentUser.role]}</span>
              <span className="text-slate-400">→</span>
              <span className="badge bg-blue-100 text-blue-700">{targets.label}</span>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              {isHod
                ? 'HOD leave requests are reviewed and decided by the Dean.'
                : isFaculty
                ? 'Faculty leave is first reviewed by the HOD, then forwarded to the Dean for the final decision.'
                : 'The Principal reviews leave requests submitted by the Dean.'}
            </p>
          </div>
        )}
      </div>

      {reviewRows.length > 0 && (
        <div className="card p-5 mb-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            {role === 'hod' ? 'Leave Requests Awaiting Your Review' : role === 'dean' ? 'Leave Requests Pending Final Decision' : 'Leave Requests Awaiting Your Decision'}
          </h3>
          <DataTable
            rows={reviewRows}
            columns={[
              { key: 'title', header: 'Request', render: (a) => <span className="font-medium">{a.title}</span> },
              { key: 'submittedByRole', header: 'Applicant', render: (a) => <span className="badge bg-slate-100 text-slate-700">{roleLabels[a.submittedByRole]}</span> },
              { key: 'date', header: 'Date' },
              { key: 'detail', header: 'Period', render: (a) => `${a.details.from} → ${a.details.to}` },
              { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.status} /> },
            ]}
            onRowClick={(a) => { setSelected(a); setRemarks(role === 'dean' ? a.hodRemarks ?? '' : role === 'principal' ? a.deanRemarks ?? '' : ''); setError(''); }}
          />
        </div>
      )}

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative max-w-lg w-full bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">{selectedRequest.title}</h2>
              <p className="text-sm text-slate-500">{roleLabels[selectedRequest.submittedByRole]} · {selectedRequest.date}</p>
            </div>
            <div className="px-6 py-5 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="card p-3"><p className="text-xs text-slate-500">From</p><p className="text-sm text-slate-900 mt-0.5">{selectedRequest.details.from}</p></div>
                <div className="card p-3"><p className="text-xs text-slate-500">To</p><p className="text-sm text-slate-900 mt-0.5">{selectedRequest.details.to}</p></div>
                <div className="card p-3"><p className="text-xs text-slate-500">Days</p><p className="text-sm text-slate-900 mt-0.5">{selectedRequest.details.days}</p></div>
                <div className="card p-3"><p className="text-xs text-slate-500">Type</p><p className="text-sm text-slate-900 mt-0.5">{selectedRequest.details.type}</p></div>
              </div>
              <div className="card p-3"><p className="text-xs text-slate-500">Reason</p><p className="text-sm text-slate-900 mt-0.5">{selectedRequest.details.reason}</p></div>

              {role === 'dean' && selectedRequest.hodStatus && (
                <div className="card p-3 bg-blue-50/60">
                  <p className="text-xs text-slate-500">HOD's Decision &amp; Remarks</p>
                  <div className="flex items-center gap-2 mt-1"><StatusBadge status={selectedRequest.hodStatus === 'recommended' ? 'recommended' : 'rejected'} /></div>
                  <p className="text-sm text-slate-900 mt-1">{selectedRequest.hodRemarks || 'No remarks provided.'}</p>
                </div>
              )}
              {role === 'principal' && (
                <div className="card p-3 bg-blue-50/60">
                  <p className="text-xs text-slate-500">Dean's Decision &amp; Remarks</p>
                  <div className="flex items-center gap-2 mt-1"><StatusBadge status={selectedRequest.deanStatus === 'recommended' ? 'recommended' : 'rejected'} /></div>
                  <p className="text-sm text-slate-900 mt-1">{selectedRequest.deanRemarks || 'No remarks provided.'}</p>
                </div>
              )}

              <textarea className="input" rows={3} placeholder={
                role === 'hod' ? 'Remarks are mandatory. Record your decision...' :
                role === 'dean' ? 'Record your final decision with remarks...' :
                'Record your decision with remarks...'
              } value={remarks} onChange={(e) => setRemarks(e.target.value)} />
              {error && <p className="text-sm text-rose-600">{error}</p>}
              <div className="flex gap-2">
                <button className="btn-success flex-1" onClick={() => actOnReview(true)}><CheckSquare className="w-4 h-4" /> {role === 'hod' ? 'Approve & Forward to Dean' : 'Approve'}</button>
                <button className="btn-danger flex-1" onClick={() => actOnReview(false)}><XCircle className="w-4 h-4" /> Reject</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">My Leave Requests</h3>
        <DataTable
          rows={myRequests}
          columns={[
            { key: 'title', header: 'Request', render: (a) => <span className="font-medium">{a.title}</span> },
            { key: 'date', header: 'Date' },
            { key: 'detail', header: 'Period', render: (a) => `${a.details.from} → ${a.details.to}` },
            { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.status} /> },
          ]}
          emptyMessage="You have not submitted any leave requests yet."
        />
      </div>
    </div>
  );
}
