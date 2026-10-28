import { useStore, deptName, deptCode, staffName, roleLabels } from '../../store/StoreContext';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { DataTable, StatusBadge } from '../../components/DataTable';
import { StudentsDirectory, StaffDirectory, ApprovalsPanel, GrievancesPanel, SyllabusProgressView, TimetableView, Placeholder, LiaisonView, LeaveManagementView } from '../../components/SharedViews';
import { GraduationCap, Users, BookOpen, CheckSquare, Building2, Users2, Award, TrendingUp, ShieldCheck, FileText, Calendar, ClipboardList, Clock, Bell, ChevronLeft, ChevronRight, Eye, Download, Layers, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import type { Student, Staff, Role } from '../../data/types';
import { StudentDetailModal, StaffDetailModal } from '../../components/DetailModals';
import { Modal } from '../../components/Modal';
import { ExaminationReviewWorkspace } from '../exam/ExamWorkflow';

const TEACHING_ROLES: Role[] = ['professor', 'associate-professor', 'assistant-professor', 'lecturer', 'teaching-assistant'];
const NON_TEACHING_ROLES: Role[] = ['office-superintendent', 'lab-assistant'];

const SLOTS = ['1st Hour', '2nd Hour', '3rd Hour', '4th Hour', '5th Hour', '6th Hour'];
const SLOT_TIMES: Record<string, string> = {
  '1st Hour': '09:00-10:00',
  '2nd Hour': '10:00-11:00',
  '3rd Hour': '11:00-12:00',
  '4th Hour': '13:00-14:00',
  '5th Hour': '14:00-15:00',
  '6th Hour': '15:00-16:00',
};

function syllabusColor(pct: number): { bg: string; text: string; label: string; dot: string } {
  if (pct >= 85) return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'On track/Completed', dot: 'bg-emerald-500' };
  if (pct >= 70) return { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Slightly behind schedule', dot: 'bg-amber-500' };
  return { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Delayed', dot: 'bg-rose-500' };
}

function staffSyllabusAvg(data: ReturnType<typeof useStore>['data'], staffId: string): number {
  const subs = data.subjects.filter((s) => s.facultyId === staffId);
  if (!subs.length) return 0;
  return Math.round(subs.reduce((a, s) => a + s.syllabusCompletion, 0) / subs.length);
}

export function PrincipalDashboard({ activeMenu }: { activeMenu: string }) {
switch (activeMenu) {
    case 'p-apply-leave': return <LeaveManagementView />;
    case 'p-exam-approvals': return <ExaminationReviewWorkspace reviewer="principal" />;
    case 'p-curriculum': return <CurriculumOverview />;
    case 'p-subject-alloc': return <SubjectAllocation />;
    case 'p-calendar': return <AcademicCalendar />;
    case 'p-tt-approval': return <TimetableApprovalView />;
    case 'p-teaching': return <StaffDirectory roles={TEACHING_ROLES} title="Teaching Staff" />;
    case 'p-nonteaching': return <StaffDirectory roles={NON_TEACHING_ROLES} title="Non-Teaching Staff" />;
    case 'p-performance': return <FacultyPerformance />;
    case 'p-workload': return <WorkloadView />;
    case 'p-daily-ops': return <DailyOperations />;
    case 'p-students': return <StudentsDirectory classFilter courseFilter showAttendanceStats />;
    case 'p-attendance': return <AttendanceReport />;
    case 'p-academic': return <AcademicPerformance />;
    case 'p-discipline': return <DisciplineCases />;
    case 'p-approvals': return <ApprovalsPanel canAct />;
    case 'p-council': return <CommitteeView type="council" title="College Council" />;
    case 'p-admission': return <CommitteeView type="admission" title="Admission Committee" />;
    case 'p-grievance-c': return <GrievancesPanel />;
    case 'p-iqac': return <CommitteeView type="iqac" title="IQAC Committee" />;
    case 'p-university': return <LiaisonView category="university" title="University Communication" />;
    case 'p-govt': return <LiaisonView category="government" title="Government Compliance" />;
    case 'p-naac': return <LiaisonView category="accreditation" title="Accreditation (NAAC/NBA)" />;
    case 'p-parent': return <LiaisonView category="parent" title="Parent Communication" />;
    default: return <PrincipalHome />;
  }
}

function PrincipalHome() {
  const { data } = useStore();
  const teaching = data.staff.filter((s) => TEACHING_ROLES.includes(s.role));
  const actionableApprovals = data.approvals.filter((a) =>
    a.status !== 'approved' &&
    a.status !== 'rejected' &&
    (a.type === 'recruitment' || a.type === 'promotion' ? a.status === 'dean-recommended' : true)
  );
  const pendingApprovals = actionableApprovals.length;
  const lowAtt = data.students.filter((s) => s.attendancePct < 75).length;
  return (
    <div>
      <PageHeader title="Principal Dashboard" description="Institutional oversight across all departments" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Departments" value={data.departments.length} icon={<Building2 className="w-5 h-5" />} accent="slate" />
        <StatCard label="Teaching Staff" value={teaching.length} icon={<Users className="w-5 h-5" />} accent="blue" />
        <StatCard label="Students" value={data.students.length} icon={<GraduationCap className="w-5 h-5" />} accent="indigo" />
        <StatCard label="Pending Approvals" value={pendingApprovals} icon={<CheckSquare className="w-5 h-5" />} accent="amber" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Subjects Offered" value={data.subjects.length} icon={<BookOpen className="w-5 h-5" />} accent="emerald" />
        <StatCard label="Low Attendance" value={lowAtt} icon={<TrendingUp className="w-5 h-5" />} accent="rose" />
        <StatCard label="Open Grievances" value={data.grievances.filter((g) => g.status !== 'closed').length} icon={<ShieldCheck className="w-5 h-5" />} accent="amber" />
        <StatCard label="Research Projects" value={data.researchProjects.length} icon={<Award className="w-5 h-5" />} accent="indigo" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Department Snapshot</h3>
          <div className="space-y-3">
            {data.departments.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <div>
                  <p className="text-sm font-medium text-slate-900">{d.name}</p>
                  <p className="text-xs text-slate-500">{data.staff.filter((s) => s.departmentId === d.id && s.role !== 'principal' && s.role !== 'dean').length} faculty · {data.students.filter((s) => s.departmentId === d.id).length} students</p>
                </div>
                <span className="badge bg-slate-200 text-slate-700">{d.code}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Recent Approval Requests</h3>
          <div className="space-y-3">
            {actionableApprovals.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <div>
                  <p className="text-sm font-medium text-slate-900">{a.title}</p>
                  <p className="text-xs text-slate-500">{a.submittedBy} · {a.date}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CurriculumOverview() {
  const { data } = useStore();
  const [deptId, setDeptId] = useState<string>('all');
  const [showAcademicCalendar, setShowAcademicCalendar] = useState(false);
  const subs = deptId === 'all' ? data.subjects : data.subjects.filter((s) => s.departmentId === deptId);
  const avg = subs.length ? Math.round(subs.reduce((a, s) => a + s.syllabusCompletion, 0) / subs.length) : 0;

  if (showAcademicCalendar) {
    return <AcademicCalendar onBack={() => setShowAcademicCalendar(false)} />;
  }

  return (
    <div>
      <PageHeader title="Curriculum Overview" description="Ensure university-prescribed curriculum is carried out effectively" action={
        <div className="flex items-center gap-2">
          <select className="input w-auto" value={deptId} onChange={(e) => setDeptId(e.target.value)}>
            <option value="all">All Departments</option>
            {data.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <button
            type="button"
            onClick={() => setShowAcademicCalendar(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            title="Academic Calendar"
            aria-label="Open academic calendar"
          >
            <Calendar className="h-4 w-4" />
          </button>
        </div>
      } />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Subjects" value={subs.length} icon={<BookOpen className="w-5 h-5" />} accent="blue" />
        <StatCard label="Avg Completion" value={`${avg}%`} icon={<TrendingUp className="w-5 h-5" />} accent={avg < 70 ? 'rose' : avg < 85 ? 'amber' : 'emerald'} />
        <StatCard label="On Track (85%+)" value={subs.filter((s) => s.syllabusCompletion >= 85).length} icon={<CheckSquare className="w-5 h-5" />} accent="emerald" />
        <StatCard label="Delayed (<70%)" value={subs.filter((s) => s.syllabusCompletion < 70).length} icon={<ShieldCheck className="w-5 h-5" />} accent="rose" />
      </div>
      <DataTable
        rows={subs}
        columns={[
          { key: 'name', header: 'Subject', render: (s) => <span className="font-medium text-slate-900">{s.name}</span> },
          { key: 'code', header: 'Code' },
          { key: 'departmentId', header: 'Dept', render: (s) => deptCode(data, s.departmentId) },
          { key: 'semester', header: 'Sem' },
          { key: 'facultyId', header: 'Faculty', render: (s) => staffName(data, s.facultyId) },
          { key: 'syllabusCompletion', header: 'Progress', render: (s) => {
            const c = syllabusColor(s.syllabusCompletion);
            return <div className="flex items-center gap-2"><div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${c.dot}`} style={{ width: `${s.syllabusCompletion}%` }} /></div><span className={`text-xs ${c.text}`}>{s.syllabusCompletion}%</span></div>;
          } },
        ]}
      />
    </div>
  );
}

function SubjectAllocation({ onBack }: { onBack?: () => void }) {
  const { data } = useStore();
  return (
    <div>
      <PageHeader title="Subject Allocation" description="Review faculty-subject assignments across departments" action={onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          title="Back"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      )} />
      <DataTable
        rows={data.subjects}
        columns={[
          { key: 'name', header: 'Subject', render: (s) => <span className="font-medium text-slate-900">{s.name}</span> },
          { key: 'code', header: 'Code' },
          { key: 'departmentId', header: 'Dept', render: (s) => deptCode(data, s.departmentId) },
          { key: 'semester', header: 'Sem' },
          { key: 'facultyId', header: 'Faculty', render: (s) => staffName(data, s.facultyId) },
          { key: 'classes', header: 'Classes', render: (s) => s.classes.join(', ') },
        ]}
      />
    </div>
  );
}

function AcademicCalendar({ onBack }: { onBack?: () => void }) {
  const { data } = useStore();
  const [showSubjectAllocation, setShowSubjectAllocation] = useState(false);
  const [view, setView] = useState<'month' | 'timeline'>('month');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterSem, setFilterSem] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<{ id: string; date: string; event: string; type: string; dept: string; semester: string; description: string } | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 7, 1));

  const events = [
    { id: 'e1', date: '2026-08-01', event: 'Semester Start (Odd Sem)', type: 'Academic', dept: 'all', semester: 'all', description: 'Commencement of the odd semester for all departments. Classes begin from this date.' },
    { id: 'e2', date: '2026-08-15', event: 'Independence Day', type: 'Holiday', dept: 'all', semester: 'all', description: 'National holiday. College remains closed.' },
    { id: 'e3', date: '2026-09-05', event: 'Teachers Day', type: 'Event', dept: 'all', semester: 'all', description: 'Teachers Day celebration in the main auditorium.' },
    { id: 'e4', date: '2026-09-15', event: 'Internal Assessment - I', type: 'Exam', dept: 'all', semester: 'all', description: 'First internal assessment examinations across all departments.' },
    { id: 'e5', date: '2026-10-02', event: 'Gandhi Jayanti', type: 'Holiday', dept: 'all', semester: 'all', description: 'National holiday. College remains closed.' },
    { id: 'e6', date: '2026-10-15', event: 'Mid-Semester Break', type: 'Holiday', dept: 'all', semester: 'all', description: 'Mid-semester break for all students and faculty.' },
    { id: 'e7', date: '2026-11-01', event: 'Internal Assessment - II', type: 'Exam', dept: 'all', semester: 'all', description: 'Second internal assessment examinations.' },
    { id: 'e8', date: '2026-11-15', event: 'Tech Fest - Innovate 2026', type: 'Event', dept: 'd1', semester: 'all', description: 'Annual technical festival organized by BCA department.' },
    { id: 'e9', date: '2026-12-01', event: 'Project Review - Phase I', type: 'Academic', dept: 'all', semester: '6', description: 'First phase project review for final-year students.' },
    { id: 'e10', date: '2026-12-15', event: 'Semester End Examinations', type: 'Exam', dept: 'all', semester: 'all', description: 'End-semester examinations commence.' },
    { id: 'e11', date: '2027-01-05', event: 'Semester Break', type: 'Holiday', dept: 'all', semester: 'all', description: 'Winter semester break begins.' },
    { id: 'e12', date: '2027-01-15', event: 'Result Publication', type: 'Academic', dept: 'all', semester: 'all', description: 'Publication of semester-end examination results.' },
    { id: 'e13', date: '2027-02-01', event: 'Semester Start (Even Sem)', type: 'Academic', dept: 'all', semester: 'all', description: 'Commencement of the even semester.' },
    { id: 'e14', date: '2027-03-15', event: 'Sports Day', type: 'Event', dept: 'all', semester: 'all', description: 'Annual college sports day.' },
    { id: 'e15', date: '2027-04-15', event: 'Internal Assessment - I (Even)', type: 'Exam', dept: 'all', semester: 'all', description: 'First internal assessment for even semester.' },
  ];

  const typeColors: Record<string, { bg: string; border: string; text: string; dot: string; chip: string }> = {
    'Academic': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500', chip: 'bg-blue-100 text-blue-700' },
    'Exam': { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500', chip: 'bg-rose-100 text-rose-700' },
    'Holiday': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', chip: 'bg-emerald-100 text-emerald-700' },
    'Event': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500', chip: 'bg-amber-100 text-amber-700' },
  };

  const filteredEvents = events.filter((e) =>
    (filterType === 'all' || e.type === filterType) &&
    (filterDept === 'all' || e.dept === 'all' || e.dept === filterDept) &&
    (filterSem === 'all' || e.semester === 'all' || e.semester === filterSem)
  );

  const totalEvents = filteredEvents.length;
  const examCount = filteredEvents.filter((e) => e.type === 'Exam').length;
  const holidayCount = filteredEvents.filter((e) => e.type === 'Holiday').length;
  const upcomingEvents = filteredEvents.filter((e) => new Date(e.date) >= new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nextEvent = upcomingEvents[0];
  const daysUntilNext = nextEvent ? Math.ceil((new Date(nextEvent.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const yr = currentMonth.getFullYear();
  const mo = currentMonth.getMonth();
  const firstDay = new Date(yr, mo, 1).getDay();
  const daysInMonth = new Date(yr, mo + 1, 0).getDate();
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const eventsOnDay = (day: number) => filteredEvents.filter((e) => {
    const ed = new Date(e.date);
    return ed.getFullYear() === yr && ed.getMonth() === mo && ed.getDate() === day;
  });

  const prevMonth = () => setCurrentMonth(new Date(yr, mo - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(yr, mo + 1, 1));

  const todayDate = new Date().toISOString().slice(0, 10);

  if (showSubjectAllocation) {
    return <SubjectAllocation onBack={() => setShowSubjectAllocation(false)} />;
  }

  return (
    <div>
      <PageHeader title="Academic Calendar" description="Institution-wide academic schedule with events, exams, and holidays" action={
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              title="Back"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div className="flex rounded-lg border border-slate-300 overflow-hidden">
            <button className={`px-3 py-2 text-sm font-medium ${view === 'month' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700'}`} onClick={() => setView('month')}>Month</button>
            <button className={`px-3 py-2 text-sm font-medium ${view === 'timeline' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700'}`} onClick={() => setView('timeline')}>Timeline</button>
          </div>
          <button className="btn-secondary" onClick={() => window.print()}><Download className="w-4 h-4" /> Export / Print</button>
        </div>
      } />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Total Events" value={totalEvents} icon={<Calendar className="w-5 h-5" />} accent="blue" />
        <StatCard label="Examinations" value={examCount} icon={<FileText className="w-5 h-5" />} accent="rose" />
        <StatCard label="Holidays" value={holidayCount} icon={<ShieldCheck className="w-5 h-5" />} accent="emerald" />
        <StatCard label="Upcoming" value={upcomingEvents.length} icon={<TrendingUp className="w-5 h-5" />} accent="amber" />
        <div className="card p-4 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <div className="flex items-center gap-2 mb-1"><Clock className="w-4 h-4" /><p className="text-xs text-blue-100">Next Event</p></div>
          {nextEvent ? (
            <div>
              <p className="text-lg font-bold">{daysUntilNext} day{daysUntilNext !== 1 ? 's' : ''}</p>
              <p className="text-xs text-blue-100 truncate">{nextEvent.event}</p>
              <p className="text-xs text-blue-200">{nextEvent.date}</p>
            </div>
          ) : <p className="text-sm text-blue-100">No upcoming events</p>}
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="card p-5 mb-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold text-slate-500 uppercase">Filters:</span>
              <select className="input w-auto text-sm" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">All Types</option>
                <option value="Academic">Academic</option>
                <option value="Exam">Exam</option>
                <option value="Holiday">Holiday</option>
                <option value="Event">Event</option>
              </select>
              <select className="input w-auto text-sm" value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
                <option value="all">All Departments</option>
                {data.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <select className="input w-auto text-sm" value={filterSem} onChange={(e) => setFilterSem(e.target.value)}>
                <option value="all">All Semesters</option>
                {[1, 2, 3, 4, 5, 6].map((s) => <option key={s} value={String(s)}>Sem {s}</option>)}
              </select>
              <button
                type="button"
                onClick={() => setShowSubjectAllocation(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                title="Subject Allocation"
                aria-label="Open subject allocation"
              >
                <Layers className="h-4 w-4" />
              </button>
              {(filterType !== 'all' || filterDept !== 'all' || filterSem !== 'all') && (
                <button className="text-xs text-blue-600 hover:underline" onClick={() => { setFilterType('all'); setFilterDept('all'); setFilterSem('all'); }}>Clear filters</button>
              )}
            </div>
          </div>

          {view === 'month' ? (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-slate-100 transition-colors"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
                <h3 className="text-lg font-semibold text-slate-900">{monthNames[mo]} {yr}</h3>
                <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-slate-100 transition-colors"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((d) => <div key={d} className="text-center text-xs font-semibold text-slate-500 py-2">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarCells.map((day, i) => {
                  if (day === null) return <div key={i} />;
                  const dayEvents = eventsOnDay(day);
                  const isToday = `${yr}-${String(mo + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` === todayDate;
                  return (
                    <div key={i} className={`min-h-[72px] p-1.5 rounded-lg border transition-all hover:shadow-sm ${dayEvents.length > 0 ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50/50'} ${isToday ? 'ring-2 ring-blue-500' : ''}`}>
                      <p className={`text-xs font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>{day}</p>
                      {dayEvents.slice(0, 2).map((e) => {
                        const c = typeColors[e.type];
                        return (
                          <button key={e.id} onClick={() => setSelectedEvent(e)} className={`block w-full text-left text-[10px] leading-tight px-1.5 py-1 rounded mb-0.5 truncate ${c.bg} ${c.text} hover:opacity-80 transition-opacity`}>
                            {e.event}
                          </button>
                        );
                      })}
                      {dayEvents.length > 2 && <p className="text-[10px] text-slate-400 px-1.5">+{dayEvents.length - 2} more</p>}
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                {Object.entries(typeColors).map(([type, c]) => (
                  <div key={type} className="flex items-center gap-1.5">
                    <span className={`w-3 h-3 rounded-full ${c.dot}`} />
                    <span className="text-xs text-slate-600">{type}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Event Timeline</h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
                <div className="space-y-4">
                  {filteredEvents.map((e) => {
                    const c = typeColors[e.type];
                    return (
                      <div key={e.id} className="relative pl-12">
                        <div className={`absolute left-2 top-1 w-5 h-5 rounded-full ${c.dot} border-4 border-white shadow`} />
                        <button onClick={() => setSelectedEvent(e)} className={`card w-full p-3 text-left hover:shadow-md transition-shadow ${c.border} border-l-4`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-slate-900">{e.event}</p>
                              <p className="text-xs text-slate-500">{e.date}</p>
                            </div>
                            <span className={`badge ${c.chip}`}>{e.type}</span>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2"><Bell className="w-4 h-4 text-blue-600" /> Notifications</h3>
            <div className="space-y-2">
              {upcomingEvents.slice(0, 5).map((e) => {
                const c = typeColors[e.type];
                const days = Math.ceil((new Date(e.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={e.id} className={`p-3 rounded-lg ${c.bg} border ${c.border}`}>
                    <p className="text-sm font-medium text-slate-900">{e.event}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{e.date} · {days > 0 ? `in ${days} day${days !== 1 ? 's' : ''}` : 'Today'}</p>
                  </div>
                );
              })}
              {upcomingEvents.length === 0 && <p className="text-sm text-slate-400">No upcoming events.</p>}
            </div>
          </div>
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Principal Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-sm text-slate-700 flex items-center gap-2"><Eye className="w-4 h-4 text-slate-500" /> View Institution-wide Schedule</button>
              <button className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-sm text-slate-700 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-slate-500" /> Monitor Academic Progress</button>
              <button className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-sm text-slate-700 flex items-center gap-2"><CheckSquare className="w-4 h-4 text-slate-500" /> Approve Calendar Updates</button>
              <button className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-sm text-slate-700 flex items-center gap-2"><Download className="w-4 h-4 text-slate-500" /> Export Calendar (PDF)</button>
            </div>
          </div>
        </div>
      </div>

      <Modal open={!!selectedEvent} onClose={() => setSelectedEvent(null)} title={selectedEvent?.event ?? ''} subtitle={selectedEvent?.date} size="md">
        {selectedEvent && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className={`badge ${typeColors[selectedEvent.type].chip}`}>{selectedEvent.type}</span>
              {selectedEvent.dept !== 'all' && <span className="badge bg-slate-100 text-slate-700">{data.departments.find((d) => d.id === selectedEvent.dept)?.name ?? 'Dept'}</span>}
              {selectedEvent.semester !== 'all' && <span className="badge bg-slate-100 text-slate-700">Sem {selectedEvent.semester}</span>}
            </div>
            <p className="text-sm text-slate-700">{selectedEvent.description}</p>
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              <div><dt className="text-xs text-slate-500 uppercase">Date</dt><dd className="text-sm text-slate-900 mt-0.5">{selectedEvent.date}</dd></div>
              <div><dt className="text-xs text-slate-500 uppercase">Type</dt><dd className="text-sm text-slate-900 mt-0.5">{selectedEvent.type}</dd></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function TimetableApprovalView() {
  const { data, updateApproval, addNotification } = useStore();
  const [selected, setSelected] = useState<typeof data.approvals[0] | null>(null);
  const [remarks, setRemarks] = useState('');
  const ttApprovals = data.approvals.filter((a) => a.type === 'timetable' && a.status !== 'approved' && a.status !== 'rejected');

  const act = (status: 'approved' | 'rejected') => {
    if (!selected) return;
    updateApproval(selected.id, { status, principalRemarks: remarks });
    addNotification({ id: `n${Date.now()}`, title: `Timetable ${status}`, message: `${selected.title} has been ${status} by Principal`, date: new Date().toISOString().slice(0, 10), audience: ['hod'], read: false });
    setSelected({ ...selected, status, principalRemarks: remarks });
    setRemarks('');
  };

  return (
    <div>
      <PageHeader title="Timetable Approval" description="Review and approve department timetables submitted by HODs" />
      <DataTable
        rows={ttApprovals}
        columns={[
          { key: 'title', header: 'Timetable', render: (a) => <span className="font-medium text-slate-900">{a.title}</span> },
          { key: 'submittedBy', header: 'Submitted By' },
          { key: 'submittedByRole', header: 'Designation', render: (a) => <span className="badge bg-slate-100 text-slate-700">{roleLabels[a.submittedByRole]}</span> },
          { key: 'date', header: 'Date' },
          { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.status} /> },
        ]}
        onRowClick={(a) => { setSelected(a); setRemarks(a.principalRemarks ?? ''); }}
      />
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.title ?? ''} subtitle={selected ? `${selected.submittedBy} · ${roleLabels[selected.submittedByRole]}` : ''} size="md">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><dt className="text-xs text-slate-500 uppercase">Submitted By</dt><dd className="text-sm text-slate-900 mt-0.5">{selected.submittedBy}</dd></div>
              <div><dt className="text-xs text-slate-500 uppercase">Designation</dt><dd className="text-sm text-slate-900 mt-0.5">{roleLabels[selected.submittedByRole]}</dd></div>
              <div><dt className="text-xs text-slate-500 uppercase">Date</dt><dd className="text-sm text-slate-900 mt-0.5">{selected.date}</dd></div>
              <div><dt className="text-xs text-slate-500 uppercase">Status</dt><dd className="mt-0.5"><StatusBadge status={selected.status} /></dd></div>
            </div>
            {selected.timetableEntries && selected.timetableEntries.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 uppercase mb-2">Timetable Entries</p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {selected.timetableEntries.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs">
                      <span className="font-medium">{t.day} · {t.slot}</span>
                      <span>{t.subject} · {t.section} Sem {t.semester}</span>
                      <span className="text-slate-700 font-medium">{staffName(data, t.facultyId)}</span>
                      <span className="text-slate-500">{t.room}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <textarea className="input" rows={3} placeholder="Remarks..." value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            <div className="flex gap-2">
              <button className="btn-primary" onClick={() => act('approved')}><CheckSquare className="w-4 h-4" /> Approve</button>
              <button className="btn-danger" onClick={() => act('rejected')}>Reject</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function FacultyPerformance() {
  const { data } = useStore();
  const [deptId, setDeptId] = useState<string>('all');
  const [selected, setSelected] = useState<Staff | null>(null);

  const staff = data.staff.filter((s) => TEACHING_ROLES.includes(s.role) && (deptId === 'all' || s.departmentId === deptId));

  return (
    <div>
      <PageHeader title="Faculty Performance" description="Monitor teaching quality and work progress across faculty" action={
        <select className="input w-auto" value={deptId} onChange={(e) => setDeptId(e.target.value)}>
          <option value="all">All Departments</option>
          {data.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      } />
      <DataTable
        rows={staff}
        columns={[
          { key: 'name', header: 'Name', render: (s) => <span className="font-medium text-slate-900">{s.name}</span> },
          { key: 'designation', header: 'Designation' },
          { key: 'departmentId', header: 'Department', render: (s) => {
            const avg = staffSyllabusAvg(data, s.id);
            const c = syllabusColor(avg);
            return <button onClick={() => setSelected(s)} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${c.bg} ${c.text} hover:opacity-80 transition-opacity`}><span className={`w-2 h-2 rounded-full ${c.dot}`} />{deptName(data, s.departmentId)}</button>;
          } },
          { key: 'attendancePct', header: 'Attendance', render: (s) => `${s.attendancePct}%` },
          { key: 'feedbackScore', header: 'Feedback', render: (s) => s.feedbackScore ? `${s.feedbackScore}/5` : '—' },
          { key: 'performanceRating', header: 'Rating', render: (s) => s.performanceRating ? `${s.performanceRating}/5` : '—' },
          { key: 'pendingWork', header: 'Pending', render: (s) => <span className={s.pendingWork > 1 ? 'text-amber-600 font-semibold' : ''}>{s.pendingWork}</span> },
        ]}
        onRowDoubleClick={(s) => setSelected(s)}
      />
      <p className="text-xs text-slate-400 mt-3">Click a department or designation button, or double-click a row, to view full profile and performance.</p>
      <StaffDetailModal staff={selected} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function WorkloadView() {
  const { data } = useStore();
  const teaching = data.staff.filter((s) => TEACHING_ROLES.includes(s.role));
  return (
    <div>
      <PageHeader title="Workload Distribution" description="Equitable distribution of teaching work across faculty" />
      <DataTable
        rows={teaching}
        columns={[
          { key: 'name', header: 'Name', render: (s) => <span className="font-medium text-slate-900">{s.name}</span> },
          { key: 'departmentId', header: 'Dept', render: (s) => deptCode(data, s.departmentId) },
          { key: 'subjects', header: 'Subjects', render: (s) => s.subjects.length },
          { key: 'classes', header: 'Classes', render: (s) => s.classes.length },
          { key: 'weeklyHours', header: 'Weekly Hours', render: (s) => <span className={s.weeklyHours > 42 ? 'text-rose-600 font-semibold' : s.weeklyHours < 34 ? 'text-amber-600' : ''}>{s.weeklyHours}</span> },
        ]}
      />
    </div>
  );
}

function AttendanceReport() {
  const { data } = useStore();
  const [selected, setSelected] = useState<Student | null>(null);
  return (
    <div>
      <PageHeader title="Attendance Report" description="College-wide attendance monitoring" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="College Average" value={`${Math.round(data.students.reduce((a, s) => a + s.attendancePct, 0) / data.students.length)}%`} icon={<TrendingUp className="w-5 h-5" />} accent="blue" />
        <StatCard label="Above 75%" value={data.students.filter((s) => s.attendancePct >= 75).length} icon={<CheckSquare className="w-5 h-5" />} accent="emerald" />
        <StatCard label="Below 75%" value={data.students.filter((s) => s.attendancePct < 75).length} icon={<ShieldCheck className="w-5 h-5" />} accent="rose" />
        <StatCard label="Below 70%" value={data.students.filter((s) => s.attendancePct < 70).length} icon={<ShieldCheck className="w-5 h-5" />} accent="amber" />
      </div>
      <DataTable
        rows={[...data.students].sort((a, b) => a.attendancePct - b.attendancePct)}
        columns={[
          { key: 'name', header: 'Name', render: (s) => <span className="font-medium text-slate-900">{s.name}</span> },
          { key: 'rollNo', header: 'Roll No' },
          { key: 'departmentId', header: 'Dept', render: (s) => deptCode(data, s.departmentId) },
          { key: 'semester', header: 'Sem' },
          { key: 'attendancePct', header: 'Attendance', render: (s) => <span className={s.attendancePct < 75 ? 'text-rose-600 font-semibold' : ''}>{s.attendancePct}%</span> },
        ]}
        onRowDoubleClick={(s) => setSelected(s)}
      />
      <StudentDetailModal student={selected} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function AcademicPerformance() {
  const { data } = useStore();
  const [selected, setSelected] = useState<Student | null>(null);
  const passed = data.students.filter((s) => s.backlogs === 0).length;
  const top = [...data.students].sort((a, b) => b.cgpa - a.cgpa).slice(0, 5);
  return (
    <div>
      <PageHeader title="Academic Performance" description="Pass/fail statistics, top performers, and students at risk" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Pass Rate" value={`${Math.round((passed / data.students.length) * 100)}%`} icon={<CheckSquare className="w-5 h-5" />} accent="emerald" />
        <StatCard label="With Backlogs" value={data.students.filter((s) => s.backlogs > 0).length} icon={<ShieldCheck className="w-5 h-5" />} accent="rose" />
        <StatCard label="Top GPA" value={Math.max(...data.students.map((s) => s.gpa)).toFixed(1)} icon={<Award className="w-5 h-5" />} accent="indigo" />
        <StatCard label="At Risk" value={data.students.filter((s) => s.cgpa < 7).length} icon={<TrendingUp className="w-5 h-5" />} accent="amber" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Top Performers</h3>
          <DataTable rows={top} columns={[
            { key: 'name', header: 'Name', render: (s) => <span className="font-medium">{s.name}</span> },
            { key: 'cgpa', header: 'CGPA' },
            { key: 'departmentId', header: 'Dept', render: (s) => deptCode(data, s.departmentId) },
          ]} onRowDoubleClick={(s) => setSelected(s)} />
        </div>
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Students at Academic Risk</h3>
          <DataTable rows={data.students.filter((s) => s.cgpa < 7.5)} columns={[
            { key: 'name', header: 'Name', render: (s) => <span className="font-medium">{s.name}</span> },
            { key: 'cgpa', header: 'CGPA', render: (s) => <span className="text-rose-600 font-semibold">{s.cgpa}</span> },
            { key: 'backlogs', header: 'Backlogs' },
          ]} onRowDoubleClick={(s) => setSelected(s)} />
        </div>
      </div>
      <StudentDetailModal student={selected} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function DisciplineCases() {
  const { data, updateComplaint } = useStore();
  const complaints = data.complaints;
  const studentCases = data.students.filter((s) => s.discipline.length > 0);
  return (
    <div>
      <PageHeader title="Discipline Cases" description="Complaints registered by staff and disciplinary incidents" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Complaints" value={complaints.length} icon={<ShieldCheck className="w-5 h-5" />} accent="slate" />
        <StatCard label="Open" value={complaints.filter((c) => c.status === 'open').length} icon={<FileText className="w-5 h-5" />} accent="rose" />
        <StatCard label="Investigating" value={complaints.filter((c) => c.status === 'investigating').length} icon={<ClipboardList className="w-5 h-5" />} accent="amber" />
        <StatCard label="Resolved" value={complaints.filter((c) => c.status === 'resolved' || c.status === 'closed').length} icon={<CheckSquare className="w-5 h-5" />} accent="emerald" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900 mb-3">Staff Complaints</h3>
      <div className="space-y-3 mb-6">
        {complaints.length === 0 ? <p className="text-sm text-slate-400">No complaints registered.</p> :
          complaints.map((c) => (
            <div key={c.id} className="card p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-slate-900">{c.title}</p>
                  <p className="text-xs text-slate-500">Filed by {c.filedBy} ({roleLabels[c.filedByRole]}) · {c.date} · {deptCode(data, c.departmentId)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={c.status} />
                  <select className="input w-auto text-xs py-1" value={c.status} onChange={(e) => updateComplaint(c.id, { status: e.target.value as typeof c.status })}>
                    <option value="open">Open</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
              <p className="text-sm text-slate-700 mb-1">{c.description}</p>
              {c.against && <p className="text-xs text-slate-500">Against: {c.against}</p>}
              {c.resolution && <div className="mt-2 p-2 rounded-lg bg-emerald-50"><p className="text-xs text-emerald-700"><strong>Resolution:</strong> {c.resolution}</p></div>}
            </div>
          ))
        }
      </div>
      {studentCases.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Student Discipline Records</h3>
          <div className="space-y-3">
            {studentCases.map((s) => s.discipline.map((d) => (
              <div key={d.id} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{d.incident}</p>
                  <p className="text-xs text-slate-500">{s.name} ({s.rollNo}) · {d.date} · {d.action}</p>
                </div>
                <StatusBadge status={d.status} />
              </div>
            )))}
          </div>
        </>
      )}
    </div>
  );
}

function DailyOperations() {
  const { data } = useStore();
  const [tab, setTab] = useState<'teaching' | 'nonteaching'>('teaching');
  const [deptId, setDeptId] = useState<string>('all');
  const today = new Date().toISOString().slice(0, 10);
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const teachingStaff = data.staff.filter((s) => TEACHING_ROLES.includes(s.role) && (deptId === 'all' || s.departmentId === deptId));
  const nonTeachingStaff = data.staff.filter((s) => NON_TEACHING_ROLES.includes(s.role));

  const sampleStatus: Record<string, Record<string, 'teaching' | 'free' | 'leave' | 'meeting'>> = {
    s4: { '1st Hour': 'teaching', '2nd Hour': 'teaching', '3rd Hour': 'teaching', '4th Hour': 'free', '5th Hour': 'meeting', '6th Hour': 'free' },
    s5: { '1st Hour': 'teaching', '2nd Hour': 'teaching', '3rd Hour': 'free', '4th Hour': 'teaching', '5th Hour': 'teaching', '6th Hour': 'free' },
    s6: { '1st Hour': 'free', '2nd Hour': 'teaching', '3rd Hour': 'teaching', '4th Hour': 'free', '5th Hour': 'free', '6th Hour': 'meeting' },
    s7: { '1st Hour': 'meeting', '2nd Hour': 'meeting', '3rd Hour': 'free', '4th Hour': 'teaching', '5th Hour': 'teaching', '6th Hour': 'teaching' },
    s8: { '1st Hour': 'teaching', '2nd Hour': 'free', '3rd Hour': 'teaching', '4th Hour': 'teaching', '5th Hour': 'free', '6th Hour': 'free' },
    s9: { '1st Hour': 'free', '2nd Hour': 'free', '3rd Hour': 'meeting', '4th Hour': 'meeting', '5th Hour': 'teaching', '6th Hour': 'teaching' },
    s15: { '1st Hour': 'teaching', '2nd Hour': 'teaching', '3rd Hour': 'teaching', '4th Hour': 'free', '5th Hour': 'free', '6th Hour': 'meeting' },
    s16: { '1st Hour': 'free', '2nd Hour': 'teaching', '3rd Hour': 'teaching', '4th Hour': 'teaching', '5th Hour': 'teaching', '6th Hour': 'free' },
    s3: { '1st Hour': 'meeting', '2nd Hour': 'teaching', '3rd Hour': 'teaching', '4th Hour': 'free', '5th Hour': 'meeting', '6th Hour': 'free' },
    s14: { '1st Hour': 'teaching', '2nd Hour': 'teaching', '3rd Hour': 'free', '4th Hour': 'teaching', '5th Hour': 'free', '6th Hour': 'meeting' },
  };

  const facultyHourlyStatus = (staffId: string, slot: string): 'teaching' | 'free' | 'leave' | 'meeting' => {
    const staff = data.staff.find((s) => s.id === staffId);
    if (staff?.status === 'on-leave') return 'leave';
    if (sampleStatus[staffId]?.[slot]) return sampleStatus[staffId][slot];
    const entry = data.timetable.find((t) => t.facultyId === staffId && t.day === todayName && t.slot === slot && t.published);
    if (entry) return 'teaching';
    return 'free';
  };

  const statusColor: Record<string, string> = {
    teaching: 'text-emerald-600',
    free: 'text-amber-600',
    leave: 'text-rose-600',
    meeting: 'text-blue-600',
  };
  const statusLabel: Record<string, string> = {
    teaching: 'Teaching',
    free: 'Available',
    leave: 'On Leave',
    meeting: 'Meeting',
  };

  const taskStatusLabel: Record<string, string> = {
    completed: 'Completed',
    'in-progress': 'In Progress',
    pending: 'Pending',
  };
  const taskStatusColor: Record<string, string> = {
    completed: 'text-emerald-600',
    'in-progress': 'text-amber-600',
    pending: 'text-rose-600',
  };

  const teachingCount = teachingStaff.filter((s) => SLOTS.some((slot) => facultyHourlyStatus(s.id, slot) === 'teaching')).length;
  const meetingCount = teachingStaff.filter((s) => SLOTS.some((slot) => facultyHourlyStatus(s.id, slot) === 'meeting')).length;
  const availableCount = teachingStaff.filter((s) => SLOTS.every((slot) => facultyHourlyStatus(s.id, slot) === 'free')).length;
  const onLeaveCount = teachingStaff.filter((s) => s.status === 'on-leave').length;
  const tasks = data.nonTeachingTasks;

  return (
    <div>
      <PageHeader title="Daily Operations" description={`Live daily activities · ${todayName}, ${today}`} action={
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-slate-300 overflow-hidden">
            <button className={`px-3 py-2 text-sm font-medium ${tab === 'teaching' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700'}`} onClick={() => setTab('teaching')}>Teaching Staff</button>
            <button className={`px-3 py-2 text-sm font-medium ${tab === 'nonteaching' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700'}`} onClick={() => setTab('nonteaching')}>Non-Teaching Staff</button>
          </div>
          {tab === 'teaching' && (
            <select className="input w-auto" value={deptId} onChange={(e) => setDeptId(e.target.value)}>
              <option value="all">All Departments</option>
              {data.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          )}
        </div>
      } />

      {tab === 'teaching' ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <StatCard label="Teaching Now" value={teachingCount} icon={<Users className="w-5 h-5" />} accent="emerald" />
            <StatCard label="In Meeting" value={meetingCount} icon={<Users2 className="w-5 h-5" />} accent="blue" />
            <StatCard label="Available" value={availableCount} icon={<CheckSquare className="w-5 h-5" />} accent="amber" />
            <StatCard label="On Leave" value={onLeaveCount} icon={<ShieldCheck className="w-5 h-5" />} accent="rose" />
            <StatCard label="Total Staff" value={teachingStaff.length} icon={<Users2 className="w-5 h-5" />} accent="slate" />
          </div>
          <div className="card p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 font-semibold text-slate-700">Faculty</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-700">Department</th>
                    {SLOTS.map((s) => <th key={s} className="text-center py-2 px-3 font-semibold text-slate-700 whitespace-nowrap">{s}</th>)}
                    <th className="text-center py-2 px-3 font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {teachingStaff.map((s) => {
                    const statuses = SLOTS.map((slot) => facultyHourlyStatus(s.id, slot));
                    const overall = statuses.includes('teaching') ? 'teaching' : statuses.includes('leave') ? 'leave' : statuses.includes('meeting') ? 'meeting' : 'free';
                    return (
                      <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-2 px-3 font-medium text-slate-900">{s.name}</td>
                        <td className="py-2 px-3 text-slate-600">{deptName(data, s.departmentId)}</td>
                        {statuses.map((st, i) => (
                          <td key={i} className="text-center py-2 px-3">
                            {st === 'teaching' && <span className="text-emerald-600" title="Teaching">&#10003;</span>}
                            {st === 'free' && <span className="text-amber-600 text-xs" title="Available">free</span>}
                            {st === 'leave' && <span className="text-rose-600 text-xs" title="On Leave">leave</span>}
                            {st === 'meeting' && <span className="text-blue-600 text-xs" title="Meeting">mtg</span>}
                          </td>
                        ))}
                        <td className={`text-center py-2 px-3 font-semibold ${statusColor[overall]}`}>{statusLabel[overall]}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">Faculty update the status of each class (completed, cancelled, substitute) in their dashboard. The dashboard refreshes throughout the day. At 12:00 AM, data resets for the new day and yesterday's data is archived.</p>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Tasks" value={tasks.length} icon={<ClipboardList className="w-5 h-5" />} accent="slate" />
            <StatCard label="Completed" value={tasks.filter((t) => t.status === 'completed').length} icon={<CheckSquare className="w-5 h-5" />} accent="emerald" />
            <StatCard label="In Progress" value={tasks.filter((t) => t.status === 'in-progress').length} icon={<FileText className="w-5 h-5" />} accent="amber" />
            <StatCard label="Pending" value={tasks.filter((t) => t.status === 'pending').length} icon={<ShieldCheck className="w-5 h-5" />} accent="rose" />
          </div>
          <div className="card p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 font-semibold text-slate-700">Staff</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-700">Designation</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-700">Assigned Task</th>
                  <th className="text-center py-2 px-3 font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {nonTeachingStaff.map((s) => {
                  const staffTasks = tasks.filter((t) => t.staffId === s.id);
                  if (staffTasks.length === 0) {
                    return (
                      <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-2 px-3 font-medium text-slate-900">{s.name}</td>
                        <td className="py-2 px-3 text-slate-600">{s.designation}</td>
                        <td className="py-2 px-3 text-slate-400">No tasks assigned</td>
                        <td className="text-center py-2 px-3 text-slate-400">—</td>
                      </tr>
                    );
                  }
                  return staffTasks.map((t) => (
                    <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2 px-3 font-medium text-slate-900">{s.name}</td>
                      <td className="py-2 px-3 text-slate-600">{s.designation}</td>
                      <td className="py-2 px-3 text-slate-700">{t.task}</td>
                      <td className={`text-center py-2 px-3 font-semibold ${taskStatusColor[t.status]}`}>{taskStatusLabel[t.status]}</td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 mt-3">Non-teaching staff update or receive their assigned tasks and status in their dashboard. The dashboard refreshes throughout the day.</p>
        </>
      )}
    </div>
  );
}

function CommitteeView({ type, title }: { type: 'council' | 'admission' | 'grievance' | 'iqac'; title: string }) {
  const { data } = useStore();
  const committee = data.committees.find((c) => c.type === type);
  if (!committee) return <Placeholder title={title} description="No committee configured." />;
  return (
    <div>
      <PageHeader title={title} description={`Next meeting: ${committee.meetingDate}`} />
      <div className="card p-5 mb-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">Agenda</h3>
        <p className="text-sm text-slate-700">{committee.agenda}</p>
      </div>
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Members</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {committee.members.map((m) => (
            <div key={m} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <div className="w-9 h-9 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-semibold">{m.split(' ').map((n) => n[0]).slice(0, 2).join('')}</div>
              <span className="text-sm font-medium text-slate-900">{m}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
