import { useStore, deptName, deptCode, staffName } from '../../store/StoreContext';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { DataTable, StatusBadge } from '../../components/DataTable';
import { StudentsDirectory, StaffDirectory, GrievancesPanel, SyllabusProgressView, Placeholder, LeaveManagementView } from '../../components/SharedViews';
import { ResourceManagement } from '../../components/ResourceViews';
import { AcademicSetupWorkspace } from './AcademicSetupWorkspace';
import { MentoringWorkspace } from './MentoringWorkspace';
import { WorkloadWorkspace } from './WorkloadWorkspace';
import { AssessmentMarksWorkspace, ExaminationManagementWorkspace } from '../exam/ExamWorkflow';
import { Building2, Users, Beaker, Wrench, GraduationCap, ClipboardCheck, TrendingUp, FileText, Calendar, CalendarDays, BarChart3, Award, AlertTriangle, Clock, CheckSquare, Send, Plus, XCircle, ArrowLeft, RotateCcw, ListChecks, Search, UserRoundCheck, BookOpen, Briefcase, Mail, Phone, MapPin, Eye, ArrowRightLeft, History } from 'lucide-react';
import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Student, Staff, TimetableEntry, Candidate, ApprovalRequest, AssignedTask, MentorAllocation } from '../../data/types';
import { StudentDetailModal } from '../../components/DetailModals';
import { Modal } from '../../components/Modal';
import { FacultyPerformanceModal } from './FacultyPerformanceModal';
import { facultyTeachingEffectiveness, teTrend } from './teachingEffectiveness';
import { addDays, computeFacultyDailyWorkload, dayName, formatDayLabel, formatFullDate, formatIso, isoDate, TASK_PRIORITY_STYLES, WORK_CATEGORY_LABELS } from './workloadLogic';
import { ACTIVE_ACADEMIC_YEAR, MENTOR_CAPACITY, getAllocationForStudent, getMenteesOfMentor, getMentorPool, loadStateFor, mentoringClassLabel, todayISO, uid } from './mentoringLogic';
import { HodHiringRequestPanel } from './FacultyHiringRequest';

const TEACHING_ROLES = ['professor', 'associate-professor', 'assistant-professor', 'lecturer', 'teaching-assistant'];
const LUNCH_SLOTS = ['13:00-14:00'];
const MAX_WEEKLY_HOURS = 44;
const MAX_CONTINUOUS = 4;

function ChartTooltip({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div role="tooltip" className={`hod-chart-tooltip ${className}`}>
      <p className="text-xs font-semibold text-slate-900">{title}</p>
      {children}
    </div>
  );
}

/* ======= Today's Timetable (compact dashboard preview) ======= */
type TodayClassPeriod = { type: 'class'; slot: string; entries: TimetableEntry[]; start: string; end: string };
type TodayBreakPeriod = { type: 'break'; start: string; end: string; label: string };
type TodayPeriod = TodayClassPeriod | TodayBreakPeriod;

/**
 * Compact class rows for a single timetable slot. Mirrors the existing
 * timetable row interaction (section · subject · faculty · room) using the
 * same slate/blue typography as the rest of the dashboard.
 */
function TimetableClassList({ entries, staff, blue = false }: { entries: TimetableEntry[]; staff: Staff[]; blue?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px]">
        <thead>
          <tr className={`text-[10px] uppercase tracking-[0.06em] ${blue ? 'text-blue-700' : 'text-slate-400'}`}>
            <th className="px-2.5 py-1 text-left font-semibold">Section</th>
            <th className="px-2.5 py-1 text-left font-semibold">Subject</th>
            <th className="px-2.5 py-1 text-left font-semibold">Faculty</th>
            <th className="hidden px-2.5 py-1 text-left font-semibold sm:table-cell">Room</th>
          </tr>
        </thead>
        <tbody className={`divide-y ${blue ? 'divide-blue-100' : 'divide-slate-100'}`}>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td className="whitespace-nowrap px-2.5 py-1 font-medium text-slate-900">{entry.section} · Sem {entry.semester}</td>
              <td className="px-2.5 py-1 text-slate-700">{entry.subject}</td>
              <td className="px-2.5 py-1 text-slate-700">{staff.find((member) => member.id === entry.facultyId)?.name ?? 'Faculty'}</td>
              <td className="hidden whitespace-nowrap px-2.5 py-1 text-slate-700 sm:table-cell">{entry.room}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Small "View → / Hide" toggle used for upcoming timetable slots. */
function ViewSlotButton({ expanded, onClick }: { expanded: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium transition-colors ${
        expanded ? 'border-slate-200 bg-slate-100 text-slate-600' : 'border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100'
      }`}
    >
      {expanded ? 'Hide' : 'View'}
      <span aria-hidden="true">{expanded ? '↑' : '→'}</span>
    </button>
  );
}

export function HodDashboard({ activeMenu, onNavigate }: { activeMenu: string; onNavigate?: (id: string) => void }) {
  const { currentUser, data } = useStore();
  // Resolve the department from the HOD mapping as a fallback. This keeps the
  // dashboard renderable even when an older/stale user record has no departmentId.
  const deptId = currentUser?.departmentId
    || data.departments.find((department) => department.hodId === currentUser?.id)?.id
    || '';

switch (activeMenu) {
    case 'h-dashboard':
      return <HodHome deptId={deptId} onNavigate={onNavigate} />;
    case 'h-academic-management':
    case 'h-tt-create':
    case 'h-tt-lab':
    case 'h-tt-conflict':
    case 'h-tt-publish':
    case 'h-examination-management':
    case 'h-assessment-marks':
    case 'h-results':
      return <AcademicManagement deptId={deptId} />;
    case 'h-apply-leave': return <LeaveManagementView />;
    case 'h-dept-mgmt': return <DepartmentManagement deptId={deptId} />;
    case 'h-faculty-mgmt': return <FacultyManagement deptId={deptId} onNavigate={onNavigate} />;
    case 'h-faculty':
    case 'h-subject-alloc': return <FacultyWorkspace deptId={deptId} />;
    case 'h-student-mgmt': return <StudentManagement deptId={deptId} />;
    case 'h-resource-management': return <ResourceManagementWorkspace deptId={deptId} />;
    case 'h-syllabus': return <SyllabusTracking deptId={deptId} />;
    case 'h-extra': return <ExtraClasses deptId={deptId} />;
    default: return <HodHome deptId={deptId} onNavigate={onNavigate} />;
  }
}

const ACADEMIC_TABS = [
  { id: 'examination', label: 'Examination Management', icon: CalendarDays },
  { id: 'results', label: 'Result Analysis', icon: BarChart3 },
] as const;

const RESOURCE_TABS = [
  { id: 'resources', label: 'Resource Management', icon: Wrench },
  { id: 'labs', label: 'Lab Management', icon: Beaker },
] as const;

function ResourceManagementWorkspace({ deptId }: { deptId: string }) {
  const [tab, setTab] = useState<(typeof RESOURCE_TABS)[number]['id']>('resources');

  return (
    <div>
      <PageHeader title="Resource Management" description="Coordinate department resources and laboratory operations." />
      <div className="border-b border-slate-200 mb-6 flex gap-1 overflow-x-auto" role="tablist" aria-label="Resource Management">
        {RESOURCE_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${tab === id ? 'border-blue-600 text-blue-700 font-medium' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
      {tab === 'resources' && <ResourceManagement deptId={deptId} />}
      {tab === 'labs' && <LabMgmt deptId={deptId} />}
    </div>
  );
}

function AcademicManagement({ deptId }: { deptId: string }) {
  const [tab, setTab] = useState<(typeof ACADEMIC_TABS)[number]['id']>('examination');

  return (
    <div>
      <PageHeader title="Examination" description="Coordinate examinations and department results." />
      <div className="border-b border-slate-200 mb-6 flex gap-1 overflow-x-auto" role="tablist" aria-label="Examination">
        {ACADEMIC_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${tab === id ? 'border-blue-600 text-blue-700 font-medium' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
      {tab === 'examination' && (
        <>
          <ExaminationManagementWorkspace deptId={deptId} />
          <div className="mt-8 border-t border-slate-200 pt-6">
            <AssessmentMarksWorkspace deptId={deptId} />
          </div>
        </>
      )}
      {tab === 'results' && <ResultAnalysis deptId={deptId} />}
    </div>
  );
}

function HodHome({ deptId, onNavigate }: { deptId: string; onNavigate?: (id: string) => void }) {
  const { data } = useStore();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [now, setNow] = useState(new Date());
  const [expandedSlot, setExpandedSlot] = useState<string | null>(null);
  const [showFullTimetable, setShowFullTimetable] = useState(false);


  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(interval);
  }, []);

  const dept = data.departments.find((d) => d.id === deptId);
  const faculty = data.staff.filter((s) => s.departmentId === deptId && TEACHING_ROLES.includes(s.role));
  const students = data.students.filter((s) => s.departmentId === deptId);
  const subjects = data.subjects.filter((s) => s.departmentId === deptId);
  const exams = data.exams.filter((e) => e.departmentId === deptId);
  const timetable = data.timetable.filter((entry) => entry.departmentId === deptId);

  const totalStudents = students.length;
  const facultyStrength = faculty.length;
  const studentAttendance = students.length ? Math.round(students.reduce((sum, student) => sum + student.attendancePct, 0) / students.length) : 0;
  const facultyAttendance = faculty.length ? Math.round(faculty.reduce((sum, member) => sum + member.attendancePct, 0) / faculty.length) : 0;
  const averageSyllabus = subjects.length ? Math.round(subjects.reduce((sum, subject) => sum + subject.syllabusCompletion, 0) / subjects.length) : 0;
  const currentPass = 91;
  const previousPass = 86;
  const improvement = currentPass - previousPass;

  const academicChart = [
    { semester: 'Semester I', pass: 88, avgMarks: 76, distinction: 32, failure: 7, backlogs: 12 },
    { semester: 'Semester II', pass: 90, avgMarks: 77, distinction: 36, failure: 6, backlogs: 10 },
    { semester: 'Semester III', pass: 85, avgMarks: 74, distinction: 30, failure: 9, backlogs: 16 },
    { semester: 'Semester IV', pass: 92, avgMarks: 79, distinction: 41, failure: 5, backlogs: 9 },
    { semester: 'Semester V', pass: 91, avgMarks: 78, distinction: 42, failure: 8, backlogs: 15 },
    { semester: 'Semester VI', pass: 94, avgMarks: 81, distinction: 46, failure: 4, backlogs: 8 },
  ];

  const syllabusProgress = [
    { semester: 'Semester I', completion: 82, subjects: { 'Data Structures': 85, 'Algorithms': 80, 'Maths': 78, 'DBMS': 82 } },
    { semester: 'Semester II', completion: 87, subjects: { 'Python': 91, 'OS': 86, 'Networks': 82, 'Web': 89 } },
    { semester: 'Semester III', completion: 76, subjects: { 'OOP': 80, 'Compiler': 76, 'DLD': 73, 'Discrete': 74 } },
    { semester: 'Semester IV', completion: 91, subjects: { 'DBMS': 95, 'Cloud': 89, 'Java': 90, 'AI': 87 } },
    { semester: 'Semester V', completion: 68, subjects: { 'DBMS': 82, 'Machine Learning': 74, 'Mathematics': 65, 'Python': 81, 'Computer Networks': 39 } },
    { semester: 'Semester IV', completion: 85, subjects: { 'Mathematics for Computer Applications': 90, 'Software Engineering': 84, 'Web Technologies': 88, 'Computer Networks': 80 } },
  ];

  const facultyPerformance = faculty.slice(0, 5).map((member, index) => ({
    name: member.name,
    performance: [92, 88, 84, 76, 65][index] ?? 72,
    attendance: member.attendancePct,
    feedback: member.feedbackScore,
  }));

  const upcomingExams = exams
    .filter((exam) => new Date(exam.date).getTime() >= new Date(new Date().setHours(0, 0, 0, 0)).getTime())
    .slice(0, 3)
    .map((exam) => ({
      id: exam.id,
      date: new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      examName: exam.examName,
      subject: exam.subject,
      semester: exam.semester,
    }));

  const atRiskStudents = students
    .filter((student) => student.attendancePct < 75 || student.gpa < 6 || student.backlogs > 1)
    .slice(0, 4)
    .map((student) => ({
      id: student.id,
      name: student.name,
      section: `${student.program} ${student.semester}`,
      riskLevel: student.attendancePct < 70 || student.backlogs > 2 ? 'High' : 'Medium',
      indicators: [
        student.attendancePct < 75 ? `Low Attendance — ${student.attendancePct}%` : null,
        student.gpa < 6 ? `Poor Academic Performance — ${student.gpa}` : null,
        student.backlogs > 1 ? `Multiple Backlogs — ${student.backlogs}` : null,
      ].filter(Boolean) as string[],
    }));

  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
  const todayTimetable = timetable.filter((entry) => entry.day === currentDay).sort((a, b) => a.slot.localeCompare(b.slot));

  const currentSlotActive = (slot: string) => {
    const match = slot.match(/^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/);
    if (!match) return false;
    const [, startHour, startMinute, endHour, endMinute] = match;
    const startMinutes = Number(startHour) * 60 + Number(startMinute);
    const endMinutes = Number(endHour) * 60 + Number(endMinute);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  };

  /* ---- Today's Timetable: parse time, group slots and resolve live/next states ---- */
  const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const formatSlot = (slot: string) => {
    const [start, end] = slot.split('-');
    return `${start} – ${end}`;
  };
  const formatRange = (start: string, end: string) => `${start} – ${end}`;

  // Group today's entries per time slot (chronological, classes only)
  const todaySlotGroups = todayTimetable
    .reduce<TodayClassPeriod[]>((groups, entry) => {
      const existing = groups.find((group) => group.slot === entry.slot);
      if (existing) existing.entries.push(entry);
      else {
        const [start, end] = entry.slot.split('-');
        groups.push({ type: 'class', slot: entry.slot, entries: [entry], start, end });
      }
      return groups;
    }, [])
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

  // Merge classes with detected breaks (e.g. the lunch-time gap between slots)
  const dayTimeline = todaySlotGroups.reduce<TodayPeriod[]>((timeline, group) => {
    if (timeline.length > 0) {
      const previous = timeline[timeline.length - 1];
      const gapStart = toMinutes(previous.end);
      const gapEnd = toMinutes(group.start);
      if (gapEnd > gapStart) {
        const gapLength = gapEnd - gapStart;
        timeline.push({
          type: 'break',
          start: previous.end,
          end: group.start,
          label: gapLength >= 30 && gapStart >= 11 * 60 + 30 && gapEnd <= 14 * 60 + 30 ? 'Lunch Break' : 'Break',
        });
      }
    }
    timeline.push(group);
    return timeline;
  }, []);

  const livePeriod = dayTimeline.find((period) =>
    currentSlotActive(period.type === 'class' ? period.slot : `${period.start}-${period.end}`)
  );
  const upNextPeriod = todaySlotGroups.find((period) => toMinutes(period.start) > nowMinutes);
  const dayEnded = todaySlotGroups.length > 0 && todaySlotGroups.every((period) => toMinutes(period.end) <= nowMinutes);
  const dayNotStarted = todaySlotGroups.length > 0 && toMinutes(todaySlotGroups[0].start) > nowMinutes;

  // Bounded preview of upcoming periods (max 2 more class slots, breaks included)
  const upNextIndex = upNextPeriod ? dayTimeline.findIndex((period) => period === upNextPeriod) : -1;
  const upcomingPeriods: TodayPeriod[] = [];
  if (upNextIndex >= 0) {
    let shownClasses = 0;
    for (const period of dayTimeline.slice(upNextIndex + 1)) {
      if (period.type === 'class' && shownClasses >= 2) break;
      if (period.type === 'class') shownClasses += 1;
      upcomingPeriods.push(period);
    }
  }


  const getSyllabusTone = (value: number) => {
    if (value >= 85) return 'bg-emerald-500';
    if (value >= 70) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div>
      <PageHeader title="HOD Dashboard" description="Academic Year: 2026–27 • Odd Semester" />

      <div className="grid grid-cols-2 xl:grid-cols-7 gap-3 mb-5">
        <StatCard label="Total Students" value={totalStudents} icon={<GraduationCap className="w-4 h-4" />} accent="indigo" compact />
        <StatCard label="Faculty Strength" value={facultyStrength} icon={<Users className="w-4 h-4" />} accent="blue" compact />
        <StatCard
          label="Average Attendance"
          value={
            <div className="text-[11px] font-semibold text-slate-700 leading-4">
              <div>Students: {studentAttendance}%</div>
              <div>Faculty: {facultyAttendance}%</div>
            </div>
          }
          icon={<UserRoundCheck className="w-4 h-4" />}
          accent="emerald"
          compact
        />
        <StatCard label="Syllabus Completion" value={`${averageSyllabus}%`} icon={<BookOpen className="w-4 h-4" />} accent={averageSyllabus >= 75 ? 'emerald' : 'amber'} compact />
        <StatCard label="Pass Percentage" value={`${currentPass}%`} icon={<TrendingUp className="w-4 h-4" />} accent="blue" compact />
        <StatCard label="At-Risk Students" value={atRiskStudents.length} icon={<AlertTriangle className="w-4 h-4" />} accent={atRiskStudents.length ? 'amber' : 'slate'} compact />
        <StatCard label="Upcoming Exams" value={upcomingExams.length} icon={<CalendarDays className="w-4 h-4" />} accent="slate" compact />
      </div>

      <div className="grid xl:grid-cols-2 gap-4 mb-4">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Academic Performance</h3>
            <span className="text-[11px] uppercase tracking-[0.08em] text-slate-400">Semesters</span>
          </div>

          <div className="group/chart flex items-end gap-2 h-28">
            {academicChart.map((entry) => (
              <div key={entry.semester} className="group/bar relative flex-1 flex flex-col items-center gap-1.5">
                <ChartTooltip title={entry.semester} className={`bottom-full left-1/2 mb-2 -translate-x-1/2 ${entry.semester === 'Semester I' ? 'left-0 translate-x-0' : entry.semester === 'Semester VI' ? 'left-auto right-0 translate-x-0' : ''}`}>
                  <div className="mt-1 border-b border-slate-100 pb-1.5 text-sm font-semibold text-slate-900">{entry.pass}% <span className="text-[10px] font-medium text-slate-500">Pass Percentage</span></div>
                  <dl className="mt-1.5 grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 text-[10px] text-slate-600">
                    <dt>Average Marks</dt><dd className="font-medium text-slate-800">{entry.avgMarks}%</dd>
                    <dt>Distinction Students</dt><dd className="font-medium text-slate-800">{entry.distinction}</dd>
                    <dt>Failure Students</dt><dd className="font-medium text-slate-800">{entry.failure}</dd>
                    <dt>Backlog Students</dt><dd className="font-medium text-slate-800">{entry.backlogs}</dd>
                  </dl>
                </ChartTooltip>
                <div className="w-full flex justify-center items-end h-20">
                  <div
                    className={`w-full rounded-t-md transition-[opacity,filter] duration-150 group-hover/chart:opacity-60 group-hover/bar:opacity-100 group-hover/bar:brightness-105 group-hover/bar:ring-1 group-hover/bar:ring-slate-300 ${entry.pass >= 90 ? 'bg-emerald-500' : entry.pass >= 80 ? 'bg-blue-500' : 'bg-amber-500'}`}
                    style={{ height: `${Math.max(18, entry.pass)}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500">{entry.semester.split(' ')[1]}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <span>Current Pass: <strong className="text-slate-900">{currentPass}%</strong></span>
            <span>Previous: <strong className="text-slate-900">{previousPass}%</strong></span>
            <span className={improvement >= 0 ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
              {improvement >= 0 ? '+' : ''}{improvement}%
            </span>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Syllabus Completion</h3>
            <span className="text-[11px] uppercase tracking-[0.08em] text-slate-400">Progress</span>
          </div>
          <div className="group/chart space-y-2.5">
            {syllabusProgress.map((entry) => (
              <div key={entry.semester} className="group/bar relative">
                <ChartTooltip title={entry.semester} className="bottom-full right-0 mb-2 w-52">
                  <div className="mt-1 border-b border-slate-100 pb-1.5 text-sm font-semibold text-slate-900">{entry.completion}% <span className="text-[10px] font-medium text-slate-500">Overall Completion</span></div>
                  <dl className="mt-1.5 grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 text-[10px] text-slate-600">
                    {Object.entries(entry.subjects).map(([subject, value]) => (
                      <Fragment key={subject}>
                        <dt>{subject}</dt><dd className={value < 50 ? 'font-semibold text-rose-600' : 'font-medium text-slate-800'}>{value}%</dd>
                      </Fragment>
                    ))}
                  </dl>
                </ChartTooltip>
                <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                  <span>{entry.semester}</span>
                  <span className="font-medium text-slate-700">{entry.completion}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full transition-[opacity,filter] duration-150 group-hover/chart:opacity-60 group-hover/bar:opacity-100 group-hover/bar:brightness-105 ${getSyllabusTone(entry.completion)}`} style={{ width: `${entry.completion}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-2 gap-4 mb-4">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Faculty Performance</h3>
            <button
              type="button"
              onClick={() => onNavigate?.('h-faculty')}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              View Faculty Performance <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="group/chart space-y-2.5">
            {facultyPerformance.map((facultyMember) => (
              <div key={facultyMember.name} className="group/bar relative">
                <ChartTooltip title={facultyMember.name} className="bottom-full right-0 mb-2 w-48">
                  <div className="mt-1 border-b border-slate-100 pb-1.5 text-sm font-semibold text-slate-900">{facultyMember.performance}% <span className="text-[10px] font-medium text-slate-500">Overall Performance</span></div>
                  <dl className="mt-1.5 grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 text-[10px] text-slate-600">
                    <dt>Attendance</dt><dd className="font-medium text-slate-800">{facultyMember.attendance}%</dd>
                    <dt>Feedback Score</dt><dd className="font-medium text-slate-800">{facultyMember.feedback}/5</dd>
                  </dl>
                </ChartTooltip>
                <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                  <span className="truncate pr-2">{facultyMember.name}</span>
                  <span className="font-medium text-slate-700">{facultyMember.performance}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500 transition-[opacity,filter] duration-150 group-hover/chart:opacity-60 group-hover/bar:opacity-100 group-hover/bar:brightness-105" style={{ width: `${facultyMember.performance}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Examination Overview</h3>
            <span className="text-[11px] uppercase tracking-[0.08em] text-slate-400">Status</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
              <p className="text-[10px] uppercase tracking-[0.08em] text-slate-500">Upcoming Exams</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{upcomingExams.length}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
              <p className="text-[10px] uppercase tracking-[0.08em] text-slate-500">Completed</p>
              <p className="mt-1 text-base font-semibold text-slate-900">12</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
              <p className="text-[10px] uppercase tracking-[0.08em] text-slate-500">Marks Pending</p>
              <p className="mt-1 text-base font-semibold text-slate-900">4</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
              <p className="text-[10px] uppercase tracking-[0.08em] text-slate-500">Attendance Pending</p>
              <p className="mt-1 text-base font-semibold text-slate-900">1</p>
            </div>
          </div>

          <div className="space-y-2">
            {upcomingExams.map((exam) => (
              <button
                key={exam.id}
                type="button"
                className="w-full text-left rounded-md border border-slate-200 bg-white px-2.5 py-2 transition hover:border-blue-200 hover:bg-blue-50"
                onClick={() => onNavigate?.('h-academic-management')}
              >
                <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
                  <span>{exam.date}</span>
                  <span className="font-medium text-slate-700">Sem {exam.semester}</span>
                </div>
                <div className="mt-1 text-sm font-medium text-slate-900">{exam.examName}</div>
                <div className="mt-0.5 text-[11px] text-slate-500">{exam.subject}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-2 gap-4 mb-4">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">At-Risk Students</h3>
            <span className="text-[11px] uppercase tracking-[0.08em] text-slate-400">Attention</span>
          </div>
          <div className="space-y-2">
            {atRiskStudents.map((student) => (
              <button
                key={student.id}
                type="button"
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 text-left transition hover:border-amber-200 hover:bg-amber-50"
                title={student.indicators.map((indicator) => `${indicator}`).join('\n')}
                onDoubleClick={() => setSelectedStudent(students.find((entry) => entry.id === student.id) ?? null)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-slate-900">{student.name}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${student.riskLevel === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                    {student.riskLevel}
                  </span>
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500">{student.section}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Today&apos;s Timetable</h3>
            <span className="text-[11px] uppercase tracking-[0.08em] text-slate-400">{currentDay}</span>
          </div>

          <div className="space-y-2">
            {todayTimetable.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">No classes scheduled for today.</div>
            ) : (
              <div className="space-y-2">
                {/* LIVE NOW — the currently active slot, rendered inline (no separate card) */}
                {livePeriod?.type === 'class' && (
                  <div className="overflow-hidden rounded-md border border-blue-200 bg-blue-50">
                    <div className="flex items-center justify-between gap-2 px-2.5 pt-1.5 pb-1">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-blue-800">
                        <span className="relative flex h-1.5 w-1.5 shrink-0">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-60" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-600" />
                        </span>
                        LIVE NOW
                      </span>
                      <span className="text-[11px] font-bold text-blue-900">{formatSlot(livePeriod.slot)}</span>
                    </div>
                    <TimetableClassList entries={livePeriod.entries} staff={data.staff} blue />
                  </div>
                )}

                {/* Before the first class of the day */}
                {!livePeriod && dayNotStarted && (
                  <div className="inline-flex items-center gap-1.5 rounded-md border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-500">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    Today&apos;s timetable begins at {formatSlot(todaySlotGroups[0].slot)}
                  </div>
                )}

                {/* Break currently in progress (e.g. lunch) — next class becomes up next */}
                {livePeriod?.type === 'break' && (
                  <div className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px]">
                    <span className="font-medium text-amber-800">{formatRange(livePeriod.start, livePeriod.end)}</span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="font-semibold text-amber-800">{livePeriod.label ?? 'Break'}</span>
                      <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em] text-amber-700">in progress</span>
                    </span>
                  </div>
                )}

                {/* All of today's classes have finished */}
                {!livePeriod && dayEnded && (
                  <div className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700">
                    <CheckSquare className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    Today&apos;s timetable completed
                  </div>
                )}

                {/* UP NEXT — the slot immediately following the live slot */}
                {upNextPeriod && (
                  <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
                    <div className="flex items-center justify-between gap-2 px-2.5 pt-1.5 pb-1">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-slate-700">
                        <History className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                        UP NEXT
                      </span>
                      <span className="text-[11px] font-bold text-slate-700">{formatSlot(upNextPeriod.slot)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-2.5 pb-1">
                      <span className="text-[11px] text-slate-600">
                        <strong className="font-semibold text-slate-800">{upNextPeriod.entries.length}</strong>
                        {' '}
                        {upNextPeriod.entries.length === 1 ? 'class' : 'classes'} scheduled
                      </span>
                      <ViewSlotButton
                        expanded={expandedSlot === upNextPeriod.slot}
                        onClick={() => setExpandedSlot(expandedSlot === upNextPeriod.slot ? null : upNextPeriod.slot)}
                      />
                    </div>
                    {expandedSlot === upNextPeriod.slot && (
                      <div className="border-t border-slate-100">
                        <TimetableClassList entries={upNextPeriod.entries} staff={data.staff} />
                      </div>
                    )}
                  </div>
                )}
                {/* Remaining upcoming periods — limited preview to keep the card compact */}
                {upcomingPeriods.map((period) =>
                  period.type === 'class' ? (
                    <div key={period.slot} className="overflow-hidden rounded-md border border-slate-100 bg-white">
                      <div className="flex items-center justify-between gap-2 px-2.5 py-1.5">
                        <span className="text-[11px] font-medium text-slate-600">{formatSlot(period.slot)}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500">{period.entries.length} {period.entries.length === 1 ? 'class' : 'classes'} scheduled</span>
                          <ViewSlotButton expanded={expandedSlot === period.slot} onClick={() => setExpandedSlot(expandedSlot === period.slot ? null : period.slot)} />
                        </div>
                      </div>
                      {expandedSlot === period.slot && (
                        <div className="border-t border-slate-100">
                          <TimetableClassList entries={period.entries} staff={data.staff} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div key={`${period.start}-${period.end}`} className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-2.5 py-1.5">
                      <span className="text-[11px] font-medium text-slate-500">{formatRange(period.start, period.end)}</span>
                      <span className="text-[11px] text-slate-600">{period.label ?? 'Break'}</span>
                    </div>
                  )
                )}

                {/* Full timetable — bottom-right action */}
                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={() => setShowFullTimetable(true)}
                    className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-blue-700 transition-colors hover:bg-blue-50 hover:text-blue-800"
                  >
                    View Full Timetable
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showFullTimetable && (
        <Modal
          open={showFullTimetable}
          onClose={() => setShowFullTimetable(false)}
          title="Full Timetable"
          subtitle={`${dept?.name ?? 'Department'} · Weekly schedule`}
          size="lg"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Day</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Time</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Subject</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Faculty</th>
                  <th className="hidden px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 sm:table-cell">Room</th>
                  <th className="hidden px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 sm:table-cell">Section</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {timetable.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-700">{entry.day}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-700">{entry.slot}</td>
                    <td className="px-3 py-2 text-sm font-medium text-slate-900">{entry.subject}</td>
                    <td className="px-3 py-2 text-sm text-slate-700">{data.staff.find((member) => member.id === entry.facultyId)?.name ?? 'Faculty'}</td>
                    <td className="hidden px-3 py-2 whitespace-nowrap text-sm text-slate-700 sm:table-cell">{entry.room}</td>
                    <td className="hidden px-3 py-2 text-sm text-slate-700 sm:table-cell">{entry.section} · Sem {entry.semester}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}

      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          open={Boolean(selectedStudent)}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}

/* Department Management — main menu hosting the sub-pages as tabs */
const DEPT_TABS: TabDef[] = [
  { id: 'dept-info', label: 'Department Information' },
  { id: 'faculty-list', label: 'Faculty List' },
];

function DepartmentManagement({ deptId }: { deptId: string }) {
  const [tab, setTab] = useState('dept-info');
  return (
    <div>
      <Tabs tabs={DEPT_TABS} active={tab} onChange={setTab} />
      {tab === 'dept-info' && <DeptInfo deptId={deptId} />}
      {tab === 'faculty-list' && <StaffDirectory scopeDept={deptId} roles={TEACHING_ROLES} title="Faculty List" />}
    </div>
  );
}

function DeptInfo({ deptId }: { deptId: string }) {
  const { data } = useStore();
  const dept = data.departments.find((d) => d.id === deptId);
  const hod = data.staff.find((s) => s.id === dept?.hodId);
  const faculty = data.staff.filter((s) => s.departmentId === deptId && TEACHING_ROLES.includes(s.role));
  const students = data.students.filter((s) => s.departmentId === deptId);
  return (
    <div>
      <PageHeader title="Department Information" description={dept?.name} />
      <div className="card p-6 mb-6">
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div><dt className="text-xs text-slate-500 uppercase">Name</dt><dd className="text-sm text-slate-900 mt-0.5">{dept?.name}</dd></div>
          <div><dt className="text-xs text-slate-500 uppercase">Code</dt><dd className="text-sm text-slate-900 mt-0.5">{dept?.code}</dd></div>
          <div><dt className="text-xs text-slate-500 uppercase">HOD</dt><dd className="text-sm text-slate-900 mt-0.5">{hod?.name}</dd></div>
          <div><dt className="text-xs text-slate-500 uppercase">Email</dt><dd className="text-sm text-slate-900 mt-0.5">{dept?.email}</dd></div>
          <div><dt className="text-xs text-slate-500 uppercase">Contact</dt><dd className="text-sm text-slate-900 mt-0.5">{dept?.contact}</dd></div>
        </dl>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Faculty" value={faculty.length} icon={<Users className="w-5 h-5" />} accent="blue" />
        <StatCard label="Students" value={students.length} icon={<GraduationCap className="w-5 h-5" />} accent="indigo" />
        <StatCard label="Labs" value={dept?.labCount ?? 0} icon={<Beaker className="w-5 h-5" />} accent="emerald" />
        <StatCard label="Classrooms" value={dept?.classroomCount ?? 0} icon={<Building2 className="w-5 h-5" />} accent="slate" />
      </div>
    </div>
  );
}

function LabMgmt({ deptId }: { deptId: string }) {
  const { data } = useStore();
  const labs = data.labs.filter((l) => l.departmentId === deptId);
  return (
    <div>
      <PageHeader title="Laboratory Management" description="Department laboratory infrastructure" />
      <DataTable
        rows={labs}
        columns={[
          { key: 'name', header: 'Lab', render: (l) => <span className="font-medium">{l.name}</span> },
          { key: 'capacity', header: 'Capacity' },
          {
            key: 'inChargeId',
            header: 'In-Charge',
            render: (l) => {
              const incharge = data.staff.find((s) => s.id === l.inChargeId);
              if (!incharge) return <span className="text-slate-400">—</span>;
              return (
                <div className="max-w-[200px]" title={`${incharge.name} — ${incharge.designation}`}>
                  <p className="text-sm font-medium text-slate-900 truncate">{incharge.name}</p>
                  <p className="text-xs text-slate-500 truncate">{incharge.designation}</p>
                </div>
              );
            },
          },
          { key: 'subjects', header: 'Subjects', render: (l) => l.subjects.join(', ') },
          { key: 'systems', header: 'Systems' },
          { key: 'maintenanceStatus', header: 'Maintenance', render: (l) => <StatusBadge status={l.maintenanceStatus} /> },
        ]}
      />
    </div>
  );
}

function RecruitmentShortlist({ deptId }: { deptId: string }) {
  const { data, updateApproval, addNotification } = useStore();
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [candidateNotes, setCandidateNotes] = useState<Record<string, string>>({});
  const [noteCandidate, setNoteCandidate] = useState<Candidate | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  const requests = data.approvals.filter(
    (a) => a.type === 'recruitment' && a.submittedByRole === 'dean' && a.departmentId === deptId && a.status === 'pending'
  );
  const candidates = data.candidates.filter((c) => c.departmentId === deptId);

  const toggleCandidate = (id: string) => {
    if (selectedCandidates.includes(id)) {
      setSelectedCandidates((prev) => prev.filter((cid) => cid !== id));
      setCandidateNotes((prev) => { const next = { ...prev }; delete next[id]; return next; });
      return;
    }
    const candidate = candidates.find((item) => item.id === id);
    if (candidate) {
      setNoteCandidate(candidate);
      setNoteDraft(candidateNotes[id] ?? '');
    }
  };

  const saveCandidateNote = () => {
    if (!noteCandidate || !noteDraft.trim()) return;
    setSelectedCandidates((prev) => prev.includes(noteCandidate.id) ? prev : [...prev, noteCandidate.id]);
    setCandidateNotes((prev) => ({ ...prev, [noteCandidate.id]: noteDraft.trim() }));
    setNoteCandidate(null);
    setNoteDraft('');
  };

  const submitShortlist = () => {
    if (!selectedRequest) return;
    updateApproval(selectedRequest.id, { shortlistedCandidateIds: selectedCandidates, shortlistedCandidateNotes: candidateNotes });
    addNotification({
      id: `n${Date.now()}`,
      title: 'Candidate shortlist submitted',
      message: `${selectedCandidates.length} candidate${selectedCandidates.length !== 1 ? 's' : ''} shortlisted for ${selectedRequest.title} and forwarded to the Dean for recommendation.`,
      date: new Date().toISOString().slice(0, 10),
      audience: ['dean'],
      read: false,
    });
    setSelectedRequest(null);
    setSelectedCandidates([]);
  };

  return (
    <div>
      <PageHeader title="Shortlist Candidates" description="Review candidates for faculty recruitment requests" />
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="card p-5 lg:col-span-1">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Recruitment Requests</h3>
          <div className="space-y-3">
            {requests.length === 0 && <p className="text-sm text-slate-400">No active recruitment requests from the Dean for your department.</p>}
            {requests.map((request) => (
              <button
                key={request.id}
                type="button"
                onClick={() => {
                  setSelectedRequest(request);
                  setSelectedCandidates(request.shortlistedCandidateIds ?? []);
                  setCandidateNotes(request.shortlistedCandidateNotes ?? {});
                }}
                className={`w-full text-left p-3 rounded-xl border ${selectedRequest?.id === request.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'} hover:border-blue-400 transition`}
              >
                <p className="font-medium text-slate-900">{request.title}</p>
                <p className="text-xs text-slate-500">{request.date}</p>
                <div className="mt-2 text-xs text-slate-600">{request.shortlistedCandidateIds?.length ?? 0} shortlisted</div>
              </button>
            ))}
          </div>
        </div>
        <div className="card p-5 lg:col-span-2">
          {selectedRequest ? (
            <>
              <div className="mb-4">
                <h3 className="text-base font-semibold text-slate-900">{selectedRequest.title}</h3>
                <p className="text-sm text-slate-500">{selectedRequest.purpose}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="card p-3 bg-slate-50">
                  <p className="text-xs text-slate-500">Required Qualification</p>
                  <p className="text-sm text-slate-900 mt-1">{selectedRequest.details.qualification}</p>
                </div>
                <div className="card p-3 bg-slate-50">
                  <p className="text-xs text-slate-500">Justification</p>
                  <p className="text-sm text-slate-900 mt-1">{selectedRequest.details.justification}</p>
                </div>
              </div>
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Candidates</h4>
                <div className="space-y-2">
                  {candidates.map((candidate) => (
                    <label key={candidate.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-400 transition">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.includes(candidate.id)}
                        onChange={() => toggleCandidate(candidate.id)}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{candidate.name}</p>
                        <p className="text-xs text-slate-500">{candidate.qualification} · {candidate.experience}</p>
                      </div>
                    </label>
                  ))}
                  {candidates.length === 0 && <p className="text-sm text-slate-400">No candidates available for your department.</p>}
                </div>
              </div>
              <button className="btn-primary" onClick={submitShortlist} disabled={!selectedCandidates.length || selectedCandidates.some((id) => !candidateNotes[id]?.trim())}>
                Forward shortlist to Dean
              </button>
            </>
          ) : (
            <div className="text-sm text-slate-500">Select a recruitment request to shortlist candidates and forward the selected profiles to the Dean.</div>
          )}
        </div>
      {noteCandidate && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setNoteCandidate(null)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="text-base font-semibold text-slate-900">Add shortlist note</h3>
              <p className="mt-1 text-sm text-slate-500">Why are you shortlisting {noteCandidate.name}?</p>
            </div>
            <div className="p-5"><textarea className="input w-full" rows={4} autoFocus value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder="Enter the reason for recommending this candidate..." /></div>
            <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">
              <button type="button" className="btn-secondary" onClick={() => setNoteCandidate(null)}>Cancel</button>
              <button type="button" className="btn-primary" onClick={saveCandidateNote} disabled={!noteDraft.trim()}>Save note</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

function Workload({ deptId }: { deptId: string }) {
  /* Redesigned daily workload page — date navigation, automatic aggregation of
     Teaching + Lab + Mentoring + Additional work, workload indicators, faculty
     breakdown drawer and HOD task assignment (see WorkloadWorkspace.tsx). */
  return <WorkloadWorkspace deptId={deptId} />;
}

function Mentoring({ deptId }: { deptId: string }) {
  /* Redesigned HOD mentoring workspace — auto-allocation, capacity monitoring,
     unallocated students and manual reassignment (see MentoringWorkspace.tsx). */
  return <MentoringWorkspace deptId={deptId} />;
}

function FacultyWorkspace({ deptId }: { deptId: string }) {
  const { data } = useStore();
  const [tab, setTab] = useState<'overview' | 'academic-setup'>('overview');
  const [query, setQuery] = useState('');
  const [designation, setDesignation] = useState<string>('all');
  const [selectedFaculty, setSelectedFaculty] = useState<Staff | null>(null);
  const [panel, setPanel] = useState<'details' | 'syllabus' | 'workload' | 'performance' | 'mentoring' | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAssignTask, setShowAssignTask] = useState(false);
  const [showShortlistPanel, setShowShortlistPanel] = useState(false);
  const [showHiringRequest, setShowHiringRequest] = useState(false);

  const faculty = data.staff.filter((s) => s.departmentId === deptId && TEACHING_ROLES.includes(s.role));
  const designations = Array.from(new Set(faculty.map((f) => f.designation))).sort();

  const filteredFaculty = faculty.filter((member) => {
    const matchesQuery = member.name.toLowerCase().includes(query.trim().toLowerCase());
    const matchesDesignation = designation === 'all' || member.designation === designation;
    return matchesQuery && matchesDesignation;
  }).sort((a, b) => {
    const designationOrder = designationPriority(a.designation) - designationPriority(b.designation);
    if (designationOrder !== 0) return designationOrder;

    const aEffectiveness = facultyTeachingEffectiveness(data, a);
    const bEffectiveness = facultyTeachingEffectiveness(data, b);
    const aPerformance = aEffectiveness?.current ?? Math.min(100, Math.round((a.performanceRating / 5) * 100));
    const bPerformance = bEffectiveness?.current ?? Math.min(100, Math.round((b.performanceRating / 5) * 100));
    if (aPerformance !== bPerformance) return aPerformance - bPerformance;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty"
        description="Monitor faculty academics, workload, performance and mentoring"
        action={tab === 'overview' ? (
          <div className="flex max-w-full items-center gap-2 overflow-x-auto whitespace-nowrap">
            <div className="flex w-40 shrink-0 items-center rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                className="bg-transparent border-0 outline-0 text-sm ml-2 flex-1 placeholder:text-slate-400"
                placeholder="Search faculty..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select className="input w-40 shrink-0" value={designation} onChange={(e) => setDesignation(e.target.value)}>
              <option value="all">All Designations</option>
              {designations.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <div className="flex shrink-0 items-center gap-2">
              <button type="button" className="btn-primary" onClick={() => setShowShortlistPanel(true)}>
                <UserRoundCheck className="w-4 h-4" />
                Shortlisted Candidates
              </button>
              <button type="button" className="btn-primary" onClick={() => setShowHiringRequest(true)}>
                <Send className="w-4 h-4" />
                Send Hiring Request
              </button>
            </div>
          </div>
        ) : undefined}
      />

      <div className="border-b border-slate-200 flex gap-1 overflow-x-auto" role="tablist" aria-label="Faculty">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'overview'}
          onClick={() => setTab('overview')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${tab === 'overview' ? 'border-blue-600 text-blue-700 font-medium' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <Users className="w-4 h-4" />
          Faculty Overview
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'academic-setup'}
          onClick={() => setTab('academic-setup')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${tab === 'academic-setup' ? 'border-blue-600 text-blue-700 font-medium' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <Calendar className="w-4 h-4" />
          Academic Setup
        </button>
      </div>

      {tab === 'academic-setup' && <AcademicSetupWorkspace deptId={deptId} />}
      {tab === 'overview' && (
        <>

      <div className="card overflow-hidden border border-slate-200 shadow-sm">
        <div className="hidden lg:grid lg:grid-cols-[2.1fr_1.2fr_1fr_1.2fr_1fr] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          <span>Faculty</span>
          <span>Syllabus Completion</span>
          <span>Workload</span>
          <span>Performance Monitoring</span>
          <span>Mentoring</span>
        </div>

        <div className="divide-y divide-slate-200">
          {filteredFaculty.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">No faculty matches the current search or filter.</div>
          ) : (
            filteredFaculty.map((member) => {
              const syllabusAverage = getFacultySyllabusAverage(data, member.id);
              const workload = computeFacultyDailyWorkload(data, member, new Date());
              const te = facultyTeachingEffectiveness(data, member);
              const mentees = getMenteesOfMentor(data, member.id);
              const performancePct = Math.min(100, Math.round((member.performanceRating / 5) * 100));

              return (
                <div key={member.id} className="grid gap-3 px-4 py-4 lg:grid-cols-[2.1fr_1.2fr_1fr_1.2fr_1fr] lg:items-center">
                  <div className="flex items-center gap-3 min-w-0">
                    <FacultyAvatar member={member} />
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFaculty(member);
                          setPanel('details');
                        }}
                        className="block text-left text-base font-semibold text-slate-900 hover:text-blue-700 transition-colors truncate"
                      >
                        {member.name}
                      </button>
                      <p className="text-sm text-slate-500 truncate">{member.designation}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onDoubleClick={() => {
                      setSelectedFaculty(member);
                      setPanel('syllabus');
                    }}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-left transition-colors hover:border-blue-200 hover:bg-blue-50"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Avg</span>
                      <span className={`text-xs font-semibold ${getProgressText(syllabusAverage)}`}>{syllabusAverage}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${getProgressColor(syllabusAverage)}`} style={{ width: `${syllabusAverage}%` }} />
                    </div>
                  </button>

                  <button
                    type="button"
                    onDoubleClick={() => {
                      setSelectedFaculty(member);
                      setPanel('workload');
                    }}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-left transition-colors hover:border-indigo-200 hover:bg-indigo-50"
                  >
                    <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Workload</div>
                    <div className="mt-1 text-lg font-bold text-slate-900">{workload.total} hrs</div>
                  </button>

                  <button
                    type="button"
                    onDoubleClick={() => {
                      setSelectedFaculty(member);
                      setPanel('performance');
                    }}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-left transition-colors hover:border-amber-200 hover:bg-amber-50"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Teaching</span>
                      <span className="text-xs font-semibold text-slate-800">{te ? `${te.current}%` : `${performancePct}%`}</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${te ? getProgressColor(te.current) : getProgressColor(performancePct)}`} style={{ width: `${te ? te.current : performancePct}%` }} />
                    </div>
                  </button>

                  <button
                    type="button"
                    onDoubleClick={() => {
                      setSelectedFaculty(member);
                      setPanel('mentoring');
                    }}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-left transition-colors hover:border-emerald-200 hover:bg-emerald-50 cursor-pointer"
                    title="Double-click to view mentees and reassign mentors"
                  >
                    <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Mentees</div>
                    <div className="mt-1 text-lg font-bold text-slate-900">{mentees.length} Mentees</div>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {selectedFaculty && panel && (
        <FacultyDrawer
          staff={selectedFaculty}
          panel={panel}
          date={selectedDate}
          onDateChange={setSelectedDate}
          onAssignTask={() => setShowAssignTask(true)}
          onClose={() => {
            setSelectedFaculty(null);
            setPanel(null);
            setShowAssignTask(false);
          }}
        />
      )}

      {selectedFaculty && panel === 'workload' && showAssignTask && (
        <FacultyAssignTaskModal
          faculty={selectedFaculty}
          deptId={deptId}
          defaultDate={isoDate(selectedDate)}
          onClose={() => setShowAssignTask(false)}
        />
      )}
      {showShortlistPanel && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-slate-900/30" onClick={() => setShowShortlistPanel(false)} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-3xl overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div><h2 className="text-lg font-semibold text-slate-900">Shortlisted Candidates</h2><p className="text-sm text-slate-500">Review recruitment candidates and forward recommendations to the Dean.</p></div>
              <button type="button" className="btn-secondary" onClick={() => setShowShortlistPanel(false)}><XCircle className="w-4 h-4" /> Close</button>
            </div>
            <RecruitmentShortlist deptId={deptId} />
          </aside>
        </div>
      )}
      {showHiringRequest && <HodHiringRequestPanel deptId={deptId} onClose={() => setShowHiringRequest(false)} />}
        </>
      )}
    </div>
  );
}

function FacultyAvatar({ member }: { member: Staff }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = member.name.split(' ').map((part) => part[0]).slice(0, 2).join('');

  if (!member.profileImage || imageFailed) {
    return <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-gradient-to-br from-indigo-100 to-blue-100 text-sm font-semibold text-indigo-700 shadow-sm">{initials}</div>;
  }

  return <img src={member.profileImage} alt="" className="h-11 w-11 rounded-full border border-slate-200 object-cover shadow-sm" onError={() => setImageFailed(true)} />;
}

function FacultyDrawer({ staff, panel, date, onDateChange, onAssignTask, onClose }: {
  staff: Staff;
  panel: 'details' | 'syllabus' | 'workload' | 'performance' | 'mentoring';
  date: Date;
  onDateChange: (d: Date) => void;
  onAssignTask: () => void;
  onClose: () => void;
}) {
  const { data } = useStore();
  const titleMap = {
    details: 'Faculty Details',
    syllabus: `Syllabus Completion — ${staff.name}`,
    workload: `Workload — ${staff.name}`,
    performance: `Performance Monitoring — ${staff.name}`,
    mentoring: `Mentoring — ${staff.name}`,
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/20" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl transition-transform duration-200">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Faculty</p>
            <h3 className="text-xl font-semibold text-slate-900">{titleMap[panel]}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50" aria-label="Close faculty panel">
            <XCircle className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {panel === 'details' && <FacultyDetailContent staff={staff} />}
          {panel === 'syllabus' && <FacultySyllabusContent staff={staff} />}
          {panel === 'workload' && (
            <FacultyWorkloadDetailPanel
              staff={staff}
              date={date}
              onDateChange={onDateChange}
              onAssignTask={onAssignTask}
              onClose={onClose}
            />
          )}
          {panel === 'performance' && <FacultyPerformanceContent staff={staff} />}
          {panel === 'mentoring' && <FacultyMentoringContent staff={staff} onClose={onClose} />}
        </div>
      </aside>
    </>
  );
}

function FacultyWorkloadDetailPanel({ staff, date, onDateChange, onAssignTask, onClose }: {
  staff: Staff;
  date: Date;
  onDateChange: (d: Date) => void;
  onAssignTask: () => void;
  onClose: () => void;
}) {
  const { data } = useStore();
  const w = computeFacultyDailyWorkload(data, staff, date);
  const today = new Date();

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-sm font-semibold text-white">
              {staff.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}
            </div>
            <div className="min-w-0">
              <h4 className="truncate text-base font-semibold text-slate-900">{staff.name}</h4>
              <p className="truncate text-sm text-slate-500">{staff.designation}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
            aria-label="Close workload panel"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Workload for</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <button type="button" onClick={() => onDateChange(addDays(date, -1))} className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50" aria-label="Previous date">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => onDateChange(addDays(date, 1))} className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50" aria-label="Next date">
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <button type="button" onClick={() => onDateChange(new Date())} className={`rounded-lg px-2.5 py-1.5 font-medium ${isoDate(date) === isoDate(today) ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                Today
              </button>
              <span className="rounded-lg bg-blue-600 px-3 py-1.5 font-semibold text-white">{formatDayLabel(date)}</span>
            </div>
          </div>
          <p className="mt-3 text-base font-semibold text-slate-900">{formatFullDate(date)}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">Total Workload</p>
        <div className="mt-2 flex items-end justify-between gap-3">
          <div>
            <span className="text-3xl font-bold">{w.total}</span>
            <span className="ml-2 text-base text-slate-300">hrs</span>
          </div>
          <div className="rounded-full border border-white/15 bg-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-slate-200">Day view</div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-2"><span className="block text-[10px] uppercase tracking-[0.12em] text-slate-300">Teaching</span><span className="mt-1 block font-semibold">{w.teachingHours} hrs</span></div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-2"><span className="block text-[10px] uppercase tracking-[0.12em] text-slate-300">Lab</span><span className="mt-1 block font-semibold">{w.labHours} hrs</span></div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-2"><span className="block text-[10px] uppercase tracking-[0.12em] text-slate-300">Mentoring</span><span className="mt-1 block font-semibold">{w.mentoringHours} hrs</span></div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-2"><span className="block text-[10px] uppercase tracking-[0.12em] text-slate-300">Additional</span><span className="mt-1 block font-semibold">{w.additionalHours} hrs</span></div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700"><BookOpen className="h-4 w-4" /></span>
            <p className="text-sm font-semibold text-slate-900">Teaching Hours</p>
          </div>
          <span className="text-sm font-bold text-slate-900">{w.teachingHours} hrs</span>
        </div>

        {w.teachingLines.length === 0 ? (
          <p className="text-sm text-slate-500">No teaching scheduled for this day.</p>
        ) : (
          <div className="space-y-2">
            {w.teachingLines.map((line) => (
              <div key={line.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{line.label}</p>
                    <p className="text-xs text-slate-500">{line.subject}</p>
                  </div>
                  <span className="text-sm font-bold text-blue-700">{line.hours} hr</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700"><Beaker className="h-4 w-4" /></span>
            <p className="text-sm font-semibold text-slate-900">Lab Hours</p>
          </div>
          <span className="text-sm font-bold text-slate-900">{w.labHours} hrs</span>
        </div>

        {w.labLines.length === 0 ? (
          <p className="text-sm text-slate-500">No laboratory session scheduled for this day.</p>
        ) : (
          <div className="space-y-2">
            {w.labLines.map((line) => (
              <div key={line.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{line.label}</p>
                    <p className="text-xs text-slate-500">{line.subject}</p>
                  </div>
                  <span className="text-sm font-bold text-indigo-700">{line.hours} hr</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700"><UserRoundCheck className="h-4 w-4" /></span>
            <p className="text-sm font-semibold text-slate-900">Mentoring Management</p>
          </div>
          <span className="text-sm font-bold text-slate-900">{w.mentoringHours} hrs</span>
        </div>

        <div className="mb-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
          <span className="text-xs uppercase tracking-[0.14em] text-slate-500">Assigned Mentees</span>
          <span className="text-sm font-semibold text-slate-900">{w.menteeCount} Students</span>
        </div>

        {w.menteeCount === 0 ? (
          <div className="space-y-2 text-sm text-slate-500">
            <p>No mentees assigned</p>
            <p>Mentoring Workload: 0 hrs</p>
          </div>
        ) : (
          <div className="space-y-2 text-sm text-slate-600">
            <p className="font-medium text-slate-900">Mentoring Workload: {w.mentoringHours} hrs</p>
            <p>{w.menteeCount} students assigned → {w.mentoringHours} hrs based on the configured mentoring rule.</p>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700"><Briefcase className="h-4 w-4" /></span>
            <p className="text-sm font-semibold text-slate-900">Additional Assigned Work</p>
          </div>
          <span className="text-sm font-bold text-slate-900">{w.additionalHours} hrs</span>
        </div>

        {w.additionalTasks.length === 0 ? (
          <p className="text-sm text-slate-500">No additional work assigned for this date</p>
        ) : (
          <div className="space-y-2">
            {w.additionalTasks.map((task) => (
              <div key={task.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                    <p className="text-xs text-slate-500">{WORK_CATEGORY_LABELS[task.category] ?? task.category}</p>
                  </div>
                  <span className="text-sm font-bold text-amber-700">{task.allocatedHours} hrs</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                  <span className={`rounded-full px-2 py-0.5 font-medium ${TASK_PRIORITY_STYLES[task.priority] ?? 'bg-slate-100 text-slate-600'}`}>{task.priority}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">Status: {task.status}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">Deadline: {formatIso(task.deadline)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button type="button" onClick={onAssignTask} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800">
        <Plus className="h-4 w-4" />
        Assign Additional Task
      </button>
    </div>
  );
}

function FacultyAssignTaskModal({ faculty, deptId, defaultDate, onClose }: {
  faculty: Staff;
  deptId: string;
  defaultDate: string;
  onClose: () => void;
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
    if (!canSave) {
      setError('Task name, date and allocated hours are required.');
      return;
    }
    if (!currentUser) return;

    const task = {
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
      status: 'pending' as const,
      assignedBy: currentUser.id,
      assignedDate: isoDate(new Date()),
      remarks: remarks.trim() || undefined,
    };

    addAssignedTask(task);
    addNotification({
      id: `n${Date.now()}`,
      title: 'Task assigned',
      message: `${task.title} (${task.allocatedHours} hrs) assigned to ${faculty.name}.`,
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
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Assign Task</p>
            <h3 className="text-lg font-semibold text-slate-900">Assign Additional Task</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50" aria-label="Close assignment panel">
            <XCircle className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-5">
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-semibold text-white">
              {faculty.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Assigned to</p>
              <p className="text-sm font-semibold text-slate-900">{faculty.name} · {faculty.designation}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2 block text-sm text-slate-700">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Task Name</span>
              <input className="input w-full" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Examination Documentation" />
            </label>

            <label className="sm:col-span-2 block text-sm text-slate-700">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Description</span>
              <textarea className="input w-full" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Task details" />
            </label>

            <label className="block text-sm text-slate-700">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Work Category</span>
              <select className="input w-full" value={category} onChange={(e) => setCategory(e.target.value as AssignedTask['category'])}>
                {(Object.keys(WORK_CATEGORY_LABELS) as AssignedTask['category'][]).map((key) => (
                  <option key={key} value={key}>{WORK_CATEGORY_LABELS[key]}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm text-slate-700">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Date</span>
              <input type="date" className="input w-full" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>

            <label className="block text-sm text-slate-700">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Allocated Hours</span>
              <input type="number" min={0.5} step={0.5} className="input w-full" value={allocatedHours} onChange={(e) => setAllocatedHours(Number(e.target.value))} />
            </label>

            <label className="block text-sm text-slate-700">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Priority</span>
              <select className="input w-full" value={priority} onChange={(e) => setPriority(e.target.value as AssignedTask['priority'])}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>

            <label className="block text-sm text-slate-700">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Deadline</span>
              <input type="date" className="input w-full" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </label>

            <label className="sm:col-span-2 block text-sm text-slate-700">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Remarks</span>
              <textarea className="input w-full" rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional remarks" />
            </label>
          </div>

          {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="button" onClick={save} className="btn-primary" disabled={!canSave}>Assign Task</button>
        </div>
      </div>
    </div>
  );
}

function FacultyDetailContent({ staff }: { staff: Staff }) {
  const { data } = useStore();
  const dept = data.departments.find((d) => d.id === staff.departmentId);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center text-lg font-semibold">
          {staff.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}
        </div>
        <div>
          <h4 className="text-lg font-semibold text-slate-900">{staff.name}</h4>
          <p className="text-sm text-slate-500">{staff.designation} · {dept?.name}</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Employment Information</p>
          <dl className="grid grid-cols-2 gap-3">
            <Field label="Emp. ID" value={staff.id.toUpperCase()} />
            <Field label="Role" value={staff.role} />
            <Field label="Employment" value={staff.employmentType} />
            <Field label="Joined On" value={staff.joinedOn} />
            <Field label="Weekly Hours" value={`${staff.weeklyHours} hrs`} />
            <Field label="Status" value={staff.status} />
          </dl>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Contact & Qualification</p>
          <dl className="grid grid-cols-2 gap-3">
            <Field label="Email" value={staff.email} />
            <Field label="Phone" value={staff.phone} />
            <Field label="Qualification" value={staff.qualifications} />
          </dl>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Personal Information</p>
          <dl className="grid grid-cols-2 gap-3">
            <Field label="Gender" value={staff.gender} />
            <Field label="Date of Birth" value={staff.dob} />
            <Field label="Blood Group" value={staff.bloodGroup} />
            <Field label="Address" value={staff.address} />
          </dl>
        </div>
      </div>
    </div>
  );
}

function FacultySyllabusContent({ staff }: { staff: Staff }) {
  const { data } = useStore();
  const subjects = data.subjects.filter((subject) => subject.facultyId === staff.id);
  const grouped = new Map<string, typeof subjects>();

  subjects.forEach((subject) => {
    const classKey = subject.classes.length ? subject.classes.join(', ') : 'General';
    const arr = grouped.get(classKey) ?? [];
    arr.push(subject);
    grouped.set(classKey, arr);
  });

  return (
    <div className="space-y-5">
      {Array.from(grouped.entries()).map(([className, classSubjects]) => (
        <div key={className} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="mb-3 text-sm font-semibold text-slate-900">{className}</p>
          <div className="space-y-2">
            {classSubjects.map((subject) => {
              const actual = subject.syllabusCompletion;
              const expected = getExpectedCompletion(actual);
              const status = getSyllabusStatus(actual);
              return (
                <div key={subject.id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{subject.name}</p>
                      <p className="text-xs text-slate-500">{subject.code}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.badge}`}>{status.label}</span>
                    </div>
                  </div>
                  <div className="mb-2 grid grid-cols-[1.3fr_1fr] gap-3 text-xs text-slate-600">
                    <span>{subject.unitsCompleted} / {subject.unitsTotal} Units</span>
                    <span className="text-right font-semibold text-slate-900">Actual: {actual}% | Expected: {expected}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${status.bar}`} style={{ width: `${actual}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {subjects.length === 0 && <div className="card p-4 text-sm text-slate-500">No syllabus subjects are currently assigned to this faculty.</div>}
    </div>
  );
}

function FacultyWorkloadContent({ staff }: { staff: Staff }) {
  const { data } = useStore();
  const workload = computeFacultyDailyWorkload(data, staff, new Date());

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <MetricTile label="Teaching Hours" value={`${workload.teachingHours} hrs`} tone="blue" />
        <MetricTile label="Lab Hours" value={`${workload.labHours} hrs`} tone="violet" />
        <MetricTile label="Mentoring Management" value={`${workload.mentoringHours} hrs`} tone="emerald" />
        <MetricTile label="Other Assigned Work" value={`${workload.additionalHours} hrs`} tone="amber" />
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Total Workload</span>
          <span className="text-xl font-bold text-slate-900">{workload.total} hrs</span>
        </div>
      </div>
      <div className="space-y-3">
        {workload.teachingLines.length > 0 && (
          <div className="rounded-xl border border-slate-200 p-3">
            <p className="mb-2 text-sm font-semibold text-slate-900">Teaching Hours</p>
            {workload.teachingLines.map((line) => (
              <div key={line.id} className="flex items-center justify-between text-sm text-slate-700">
                <span>{line.subject}</span>
                <span>{line.hours} hrs</span>
              </div>
            ))}
          </div>
        )}
        {workload.labLines.length > 0 && (
          <div className="rounded-xl border border-slate-200 p-3">
            <p className="mb-2 text-sm font-semibold text-slate-900">Lab Hours</p>
            {workload.labLines.map((line) => (
              <div key={line.id} className="flex items-center justify-between text-sm text-slate-700">
                <span>{line.subject}</span>
                <span>{line.hours} hrs</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FacultyPerformanceContent({ staff }: { staff: Staff }) {
  const { data } = useStore();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const dept = data.departments.find((department) => department.id === staff.departmentId);
  const effectiveness = facultyTeachingEffectiveness(data, staff);
  const selectedSubject = effectiveness?.subjects.find((subject) => subject.subjectId === selectedSubjectId);
  const trend = effectiveness ? teTrend(effectiveness.change) : null;

  if (selectedSubject) {
    return <FacultySubjectEffectivenessDetail result={selectedSubject} onBack={() => setSelectedSubjectId(null)} />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-sm font-semibold text-white">
          {staff.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}
        </div>
        <div className="min-w-0">
          <h4 className="truncate text-base font-semibold text-slate-900">{staff.name}</h4>
          <p className="truncate text-sm text-slate-500">{staff.designation} · {dept?.name}</p>
          <div className="mt-1"><span className="badge bg-emerald-100 text-emerald-700">{staff.status === 'active' ? 'Active' : staff.status}</span></div>
        </div>
      </div>

      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Performance Overview</p>
        <div className="grid grid-cols-2 gap-3">
          <MetricTile label="Attendance" value={`${staff.attendancePct}%`} tone={staff.attendancePct >= 85 ? 'emerald' : staff.attendancePct >= 70 ? 'amber' : 'rose'} />
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
            <p className="text-xs text-slate-500">Teaching Effectiveness</p>
            <p className={`text-lg font-bold ${effectiveness?.status.text ?? 'text-slate-400'}`}>{effectiveness ? `${effectiveness.current}%` : '—'}</p>
            {effectiveness && trend && <p className={`text-xs font-medium ${trend.cls}`}>{trend.arrow} {Math.abs(effectiveness.change)}% {effectiveness.change === 0 ? '' : 'vs Previous Semester'}</p>}
          </div>
          <MetricTile label="Rating" value={`${staff.performanceRating || '—'} / 5`} tone="blue" />
          <MetricTile label="Pending Work" value={staff.pendingWork} tone={staff.pendingWork > 0 ? 'amber' : 'emerald'} />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Teaching Effectiveness</p>
          {effectiveness && <span className={`badge ${effectiveness.status.badge}`}>{effectiveness.status.label}</span>}
        </div>
        {effectiveness ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-end justify-between gap-3">
              <div><p className="text-3xl font-bold text-slate-900">{effectiveness.current}%</p><p className={`text-xs font-semibold ${trend?.cls}`}>{trend?.arrow} {Math.abs(effectiveness.change)}% compared with Previous Semester</p></div>
              <span className={`badge ${effectiveness.status.badge}`}>Status: {effectiveness.status.label}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"><div className={`h-full rounded-full ${effectiveness.status.bar}`} style={{ width: `${effectiveness.current}%` }} /></div>
            <p className="mt-3 text-xs leading-5 text-slate-600">Overall teaching effectiveness is generated from academic performance data across the classes and subjects handled by this faculty.</p>
          </div>
        ) : <div className="card p-4 text-sm text-slate-500">No academic data is available for this faculty's assigned subjects yet.</div>}
      </section>

      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Teaching Effectiveness by Class & Subject</p>
        {effectiveness ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {effectiveness.subjects.map((subject) => {
              const subjectTrend = teTrend(subject.change);
              return (
                <button key={subject.subjectId} type="button" onClick={() => setSelectedSubjectId(subject.subjectId)} className="rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50/30">
                  <div className="flex items-start justify-between gap-2"><div><p className="text-sm font-semibold text-slate-900">{subject.classHeading}{subject.classSections ? ` · ${subject.classSections}` : ''}</p><p className="mt-1 text-sm text-slate-700">{subject.subjectName}</p><p className="text-xs text-slate-500">{subject.subjectCode}</p></div><span className={`badge shrink-0 ${subject.status.badge}`}>{subject.status.label}</span></div>
                  <div className="mt-3 flex items-baseline justify-between gap-2"><span className="text-2xl font-bold text-slate-900">{subject.current}%</span><span className={`text-xs font-semibold ${subjectTrend.cls}`}>{subjectTrend.arrow} {Math.abs(subject.change)}% vs Previous Semester</span></div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${subject.status.bar}`} style={{ width: `${subject.current}%` }} /></div>
                  <p className="mt-2 text-xs font-medium text-blue-600">View Details →</p>
                </button>
              );
            })}
          </div>
        ) : <p className="text-sm text-slate-500">No class or subject academic results are available.</p>}
      </section>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">Teaching effectiveness uses academic assessment and outcome data only. No student feedback or opinion scores are included.</div>
    </div>
  );
}

function FacultySubjectEffectivenessDetail({ result, onBack }: { result: NonNullable<ReturnType<typeof facultyTeachingEffectiveness>>['subjects'][number]; onBack: () => void }) {
  const trend = teTrend(result.change);
  return (
    <div className="space-y-5">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"><ArrowLeft className="h-3.5 w-3.5" /> Back to class & subject results</button>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start justify-between gap-3"><div><h4 className="text-base font-semibold text-slate-900">{result.subjectName}</h4><p className="text-sm text-slate-500">{result.classHeading}{result.classSections ? ` · ${result.classSections}` : ''} · {result.subjectCode}</p></div><span className={`badge ${result.status.badge}`}>{result.status.label}</span></div>
        <div className="mt-4 flex items-baseline gap-2"><span className="text-3xl font-bold text-slate-900">{result.current}%</span><span className={`text-xs font-semibold ${trend.cls}`}>{trend.arrow} {Math.abs(result.change)}% vs Previous Semester</span></div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"><div className={`h-full rounded-full ${result.status.bar}`} style={{ width: `${result.current}%` }} /></div>
        <p className="mt-2 text-xs text-slate-500">Previous period: {result.previous}% · {result.studentCount} students tracked</p>
      </div>
      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Detailed Academic Indicators</p>
        <div className="space-y-2">
          {result.indicators.map((indicator) => {
            const indicatorTrend = teTrend(indicator.change);
            return <div key={indicator.key} className="rounded-xl border border-slate-200 bg-white p-3"><div className="flex items-center justify-between gap-2"><p className="text-sm font-medium text-slate-800">{indicator.label}</p><span className={`badge ${indicator.status.badge}`}>{indicator.status.label}</span></div><div className="mt-2 flex items-baseline justify-between gap-2"><span className="text-lg font-bold text-slate-900">{indicator.current}%</span><span className={`text-xs font-semibold ${indicatorTrend.cls}`}>{indicatorTrend.arrow} {Math.abs(indicator.change)}% vs Previous Semester</span></div><p className="mt-1 text-xs text-slate-500">Previous: {indicator.previous}%</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${indicator.status.bar}`} style={{ width: `${indicator.current}%` }} /></div></div>;
          })}
        </div>
      </section>
    </div>
  );
}

type FacultyMentoringContentProps = { staff: Staff; onClose: () => void };

function FacultyMentoringContent({ staff, onClose }: FacultyMentoringContentProps) {
  const { data, currentUser, saveMentorAllocation, addMentoringHistory } = useStore();
  const [search, setSearch] = useState('');
  const [actionStudent, setActionStudent] = useState<string | null>(null);
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [reassignStudent, setReassignStudent] = useState<Student | null>(null);
  const [newMentorId, setNewMentorId] = useState('');
  const mentees = getMenteesOfMentor(data, staff.id);
  const load = getMentorPool(data, staff.departmentId, MENTOR_CAPACITY).find((item) => item.mentor.id === staff.id);
  const mentorLoad = load ?? { count: mentees.length, capacity: MENTOR_CAPACITY, pct: Math.round((mentees.length / MENTOR_CAPACITY) * 100), loadState: loadStateFor(mentees.length, MENTOR_CAPACITY) };
  const dept = data.departments.find((item) => item.id === staff.departmentId);
  const filteredMentees = mentees.filter((student) => {
    const q = search.trim().toLowerCase();
    return !q || student.name.toLowerCase().includes(q) || student.rollNo.toLowerCase().includes(q);
  });
  const mentorOptions = getMentorPool(data, staff.departmentId, MENTOR_CAPACITY).filter((item) => item.mentor.id !== staff.id && item.mentor.status === 'active');
  const mentorThCls = 'px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500';
  const mentorTdCls = 'px-3 py-2 text-xs text-slate-700';
  const loadMeta = mentorLoad.loadState === 'full' ? { label: 'Full', badge: 'bg-rose-100 text-rose-700', bar: 'bg-rose-500' } : mentorLoad.loadState === 'near-capacity' ? { label: 'Near Capacity', badge: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500' } : { label: 'Balanced', badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500' };

  const openReassign = (student: Student) => {
    setActionStudent(null);
    setReassignStudent(student);
    setNewMentorId('');
  };

  const confirmReassign = () => {
    if (!reassignStudent || !newMentorId || !currentUser) return;
    const allocation = getAllocationForStudent(data, reassignStudent.id);
    if (!allocation) return;
    saveMentorAllocation({ ...allocation, previousMentorId: allocation.mentorId, mentorId: newMentorId, date: todayISO(), allocatedBy: currentUser.id });
    addMentoringHistory({
      id: uid('mhs'),
      allocationId: allocation.id,
      studentId: reassignStudent.id,
      date: todayISO(),
      action: 'reassigned',
      previousMentorId: allocation.mentorId,
      newMentorId,
      performedBy: currentUser.id,
      note: `Manual reassignment by HOD · ${staff.name} → ${data.staff.find((item) => item.id === newMentorId)?.name ?? newMentorId}`,
    });
    setReassignStudent(null);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-sm font-semibold text-white">{staff.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div>
            <div className="min-w-0"><h4 className="truncate text-base font-semibold text-slate-900">{staff.name}</h4><p className="truncate text-sm text-slate-500">{staff.designation} · {dept?.name}</p><div className="mt-1 flex flex-wrap gap-1.5"><span className="badge bg-blue-100 text-blue-700">{mentorLoad.count} Mentees</span><span className={`badge ${loadMeta.badge}`}>{loadMeta.label}</span></div></div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50" aria-label="Close mentee panel"><XCircle className="h-4 w-4" /></button>
        </div>
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Current Mentoring Load</p><p className="mt-1 text-2xl font-bold text-slate-900">{mentorLoad.count} <span className="text-sm font-medium text-slate-500">/ {mentorLoad.capacity}</span></p></div><span className="text-sm font-semibold text-slate-700">{mentorLoad.pct}% utilized</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${loadMeta.bar}`} style={{ width: `${Math.min(100, mentorLoad.pct)}%` }} /></div><p className="mt-2 text-xs text-slate-500">{Math.max(0, mentorLoad.capacity - mentorLoad.count)} mentoring slots available</p></div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between gap-2"><p className="text-sm font-semibold text-slate-900">Mentees <span className="font-normal text-slate-500">({mentees.length})</span></p><span className="text-xs text-slate-500">Active allocations</span></div>
        <div className="mb-3 flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2"><Search className="h-4 w-4 text-slate-400" /><input className="ml-2 w-full border-0 bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Search mentee or roll number" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
        {mentees.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"><Users className="mx-auto h-7 w-7 text-slate-400" /><p className="mt-2 text-sm font-semibold text-slate-900">No Mentees Assigned</p><p className="mt-1 text-xs text-slate-500">This mentor currently has no active mentees.</p></div> : <div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[600px]"><thead className="bg-slate-50"><tr><th className={mentorThCls}>Mentee</th><th className={mentorThCls}>Roll No.</th><th className={mentorThCls}>Semester</th><th className={mentorThCls}>Class</th><th className={mentorThCls}>Allocation Date</th><th className={mentorThCls}>Status</th><th className={`${mentorThCls} text-right`}>Action</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredMentees.map((student) => { const allocation = getAllocationForStudent(data, student.id); return <tr key={student.id} className="hover:bg-slate-50"><td className={`${mentorTdCls} font-medium text-slate-900`}>{student.name}</td><td className={mentorTdCls}>{student.rollNo}</td><td className={mentorTdCls}>{student.semester}</td><td className={mentorTdCls}>{mentoringClassLabel(dept?.code ?? '', student.section)}</td><td className={mentorTdCls}>{allocation?.date ?? '—'}</td><td className={mentorTdCls}><span className="badge bg-emerald-100 text-emerald-700">Active</span></td><td className={`${mentorTdCls} text-right`}><span className="relative inline-block"><button type="button" onClick={() => setActionStudent(actionStudent === student.id ? null : student.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label={`Actions for ${student.name}`}><span className="text-lg leading-none">⋮</span></button>{actionStudent === student.id && <span className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-slate-200 bg-white py-1.5 text-left shadow-lg"><MentorActionButton icon={Eye} label="View Student" onClick={() => { setActionStudent(null); setViewStudent(student); }} /><MentorActionButton icon={ArrowRightLeft} label="Reassign Mentor" onClick={() => openReassign(student)} /></span>}</span></td></tr>; })}</tbody></table>{filteredMentees.length === 0 && <p className="p-5 text-center text-sm text-slate-500">No mentees match this search.</p>}</div>}
      </section>

      {viewStudent && <StudentDetailModal student={viewStudent} open={!!viewStudent} onClose={() => setViewStudent(null)} />}
      {reassignStudent && <MentorReassignDialog student={reassignStudent} currentMentor={staff} mentors={mentorOptions} selectedMentorId={newMentorId} onSelect={setNewMentorId} onCancel={() => setReassignStudent(null)} onConfirm={confirmReassign} />}
    </div>
  );
}

function MentorActionButton({ icon: Icon, label, onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"><Icon className="h-4 w-4 text-slate-400" />{label}</button>;
}

function MentorReassignDialog({ student, currentMentor, mentors, selectedMentorId, onSelect, onCancel, onConfirm }: { student: Student; currentMentor: Staff; mentors: ReturnType<typeof getMentorPool>; selectedMentorId: string; onSelect: (id: string) => void; onCancel: () => void; onConfirm: () => void }) {
  return <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"><div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onCancel} /><div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Mentor Allocation</p><h3 className="text-lg font-semibold text-slate-900">Reassign Mentee</h3></div><button type="button" onClick={onCancel} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="Close reassignment dialog"><XCircle className="h-4 w-4" /></button></div><div className="space-y-4 p-5"><div className="rounded-xl bg-slate-50 p-3"><p className="text-sm font-semibold text-slate-900">{student.name}</p><p className="text-xs text-slate-500">Roll No: {student.rollNo} · Semester {student.semester} · {student.section}</p></div><div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Current Mentor</p><p className="text-sm text-slate-900">{currentMentor.name}</p></div><label className="block"><span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Reassign To</span><select className="input w-full" value={selectedMentorId} onChange={(event) => onSelect(event.target.value)}><option value="">Select eligible mentor</option>{mentors.map((mentor) => { const full = mentor.count >= mentor.capacity; const near = mentor.count / mentor.capacity >= 0.8; return <option key={mentor.mentor.id} value={mentor.mentor.id} disabled={full}>{mentor.mentor.name} — {mentor.count} / {mentor.capacity}{near ? ' · Near Capacity' : ''}{full ? ' · Full' : ''}</option>; })}</select></label><div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Reassignment Summary</p><p>From: <span className="font-semibold text-slate-900">{currentMentor.name}</span></p><p>To: <span className="font-semibold text-slate-900">{mentors.find((mentor) => mentor.mentor.id === selectedMentorId)?.mentor.name ?? '—'}</span></p><p>Mentee: <span className="font-semibold text-slate-900">{student.name} · {student.rollNo}</span></p></div></div><div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4"><button type="button" onClick={onCancel} className="btn-secondary">Cancel</button><button type="button" onClick={onConfirm} className="btn-primary" disabled={!selectedMentorId}>Confirm Reassignment</button></div></div></div>;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{value || '—'}</dd>
    </div>
  );
}

function MetricTile({ label, value, tone }: { label: string; value: string | number; tone: 'blue' | 'violet' | 'emerald' | 'amber' | 'rose' | 'slate' }) {
  const toneStyles = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    violet: 'bg-violet-50 text-violet-700 border-violet-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className={`rounded-xl border p-3 ${toneStyles[tone]}`}>
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function TrendChart({ values }: { values: number[] }) {
  const width = 300;
  const height = 90;
  const padding = 12;
  const max = Math.max(100, ...values);
  const min = Math.min(0, ...values);
  const normalized = values.map((value, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(values.length - 1, 1);
    const y = height - padding - ((value - min) / Math.max(max - min || 1, 1)) * (height - padding * 2);
    return { x, y, value };
  });
  const line = normalized.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-20 w-full">
      <path d={line} fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
      {normalized.map((point, index) => (
        <circle key={`${point.x}-${index}`} cx={point.x} cy={point.y} r="3" fill="#2563eb" />
      ))}
    </svg>
  );
}

function getFacultySyllabusAverage(data: any, facultyId: string): number {
  const subjects = data.subjects.filter((subject: any) => subject.facultyId === facultyId);
  if (!subjects.length) return 0;
  return Math.round(subjects.reduce((sum: number, subject: any) => sum + subject.syllabusCompletion, 0) / subjects.length);
}

function getProgressColor(pct: number) {
  if (pct > 80) return 'bg-emerald-500';
  if (pct >= 70) return 'bg-amber-500';
  return 'bg-rose-500';
}

function getProgressText(pct: number) {
  if (pct > 80) return 'text-emerald-600';
  if (pct >= 70) return 'text-amber-600';
  return 'text-rose-600';
}

function designationPriority(designation: string): number {
  const normalized = designation.trim().toLowerCase().replace(/\s+/g, ' ');
  if (normalized === 'professor') return 0;
  if (normalized === 'associate professor') return 1;
  if (normalized === 'assistant professor') return 2;
  if (normalized === 'lecturer' || normalized === 'teaching assistant') return 3;
  return 4;
}

function getSyllabusStatus(pct: number) {
  if (pct >= 85) return { label: 'Completed', badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500' };
  if (pct >= 70) return { label: 'On Track', badge: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500' };
  return { label: 'Behind Schedule', badge: 'bg-rose-100 text-rose-700', bar: 'bg-rose-500' };
}

function getExpectedCompletion(pct: number) {
  if (pct >= 80) return 85;
  if (pct >= 70) return 80;
  return 75;
}

/* Faculty Management — main menu hosting the sub-pages as tabs */
const FACULTY_TABS: TabDef[] = [
  { id: 'faculty-perf', label: 'Faculty Performance' },
  { id: 'workload', label: 'Workload' },
  { id: 'mentoring', label: 'Mentoring Management' },
  { id: 'academic-setup', label: 'Academic Setup' },
];

function FacultyManagement({ deptId, onNavigate }: { deptId: string; onNavigate?: (id: string) => void }) {
  const [tab, setTab] = useState('faculty-perf');
  const [showHiringRequest, setShowHiringRequest] = useState(false);
  return (
    <div>
      <PageHeader title="Faculty Management" description="Manage department faculty, workload, performance, and academic responsibilities." action={<div className="flex flex-wrap gap-2"><button type="button" className="btn-secondary" onClick={() => onNavigate?.('h-faculty')}><Users className="w-4 h-4" /> Shortlisted Candidates</button><button type="button" className="btn-primary" onClick={() => setShowHiringRequest(true)}><Send className="w-4 h-4" /> Send Hiring Request</button></div>} />
      <Tabs tabs={FACULTY_TABS} active={tab} onChange={setTab} />
      {tab === 'faculty-perf' && <FacultyPerf deptId={deptId} onNavigate={onNavigate} />}
      {tab === 'workload' && <Workload deptId={deptId} />}
      {tab === 'mentoring' && <Mentoring deptId={deptId} />}
      {tab === 'academic-setup' && <AcademicSetupWorkspace deptId={deptId} />}
      {showHiringRequest && <HodHiringRequestPanel deptId={deptId} onClose={() => setShowHiringRequest(false)} />}
    </div>
  );
}

function FacultyPerf({ deptId, onNavigate }: { deptId: string; onNavigate?: (id: string) => void }) {
  const { data } = useStore();
  const [selected, setSelected] = useState<Staff | null>(null);
  const faculty = data.staff.filter((s) => s.departmentId === deptId && TEACHING_ROLES.includes(s.role));

  const facultyMetrics = faculty.map((member) => {
    const te = facultyTeachingEffectiveness(data, member);
    return {
      member,
      te,
      statusKey: te?.status.key ?? null,
    };
  });

  const teachingData = facultyMetrics.filter((item) => item.te);
  const totalFaculty = faculty.length;
  const avgTeachingEffectiveness = teachingData.length
    ? Math.round(teachingData.reduce((sum, item) => sum + (item.te?.current ?? 0), 0) / teachingData.length)
    : 0;
  const goodPerformance = teachingData.filter((item) => item.statusKey === 'good').length;
  const needsAttention = teachingData.filter((item) => item.statusKey && item.statusKey !== 'good').length;
  const departmentPrevious = teachingData.length
    ? Math.round(teachingData.reduce((sum, item) => sum + (item.te?.previous ?? 0), 0) / teachingData.length)
    : 0;
  const departmentCurrent = avgTeachingEffectiveness;
  const departmentChange = departmentCurrent - departmentPrevious;
  const trendArrow = departmentChange > 0 ? '↑' : departmentChange < 0 ? '↓' : '—';
  const trendText = departmentChange > 0
    ? `${Math.abs(departmentChange)}% improvement`
    : departmentChange < 0
      ? `${Math.abs(departmentChange)}% decline`
      : 'No change';

  return (
    <div>
      <PageHeader title="Faculty Performance" description="Multiple performance indicators" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Faculty" value={totalFaculty} icon={<Users className="w-5 h-5" />} accent="blue" />
        <StatCard label="Average Teaching Effectiveness" value={`${avgTeachingEffectiveness}%`} icon={<TrendingUp className="w-5 h-5" />} accent="indigo" />
        <StatCard label="Good Performance" value={goodPerformance} icon={<CheckSquare className="w-5 h-5" />} accent="emerald" />
        <StatCard label="Needs Attention" value={needsAttention} icon={<AlertTriangle className="w-5 h-5" />} accent="amber" />
      </div>
      <DataTable
        rows={faculty}
        columns={[
          { key: 'name', header: 'Faculty', render: (s) => <span className="font-medium">{s.name}</span> },
          {
            key: 'attendancePct',
            header: 'Attendance',
            render: (s) => <span>{s.attendancePct}%</span>,
          },
          {
            key: 'teachingEffectiveness',
            header: 'Teaching Effectiveness',
            render: (s) => {
              const te = facultyTeachingEffectiveness(data, s);
              if (!te) return <span className="text-slate-400">- No Data</span>;
              const t = teTrend(te.change);
              return (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-900">{te.current}%</span>
                  <span className={`text-xs font-medium ${t.cls}`} title={`Previous: ${te.previous}%`}>{t.arrow} {Math.abs(te.change)}%</span>
                  <span className={`badge ${te.status.badge}`}>{te.status.label}</span>
                </div>
              );
            },
          },
          { key: 'performanceRating', header: 'Rating', render: (s) => s.performanceRating || '—' },
          { key: 'pendingWork', header: 'Pending', render: (s) => s.pendingWork },
        ]}
        onRowDoubleClick={(s) => setSelected(s)}
      />
      <div className="card p-5 mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Department Performance Trend</p>
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-700">Teaching Effectiveness</p>
          <p className="mt-2 text-sm text-slate-600">
            Previous Semester: <span className="font-semibold text-slate-900">{departmentPrevious}%</span> → Current Semester: <span className="font-semibold text-slate-900">{departmentCurrent}%</span>
          </p>
          <p className={`mt-3 text-base font-semibold ${departmentChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trendArrow} {trendText}
          </p>
        </div>
      </div>
      <FacultyPerformanceModal staff={selected} open={!!selected} onClose={() => setSelected(null)} onNavigate={onNavigate} />
    </div>
  );
}

function SubjectAlloc({ deptId, onBack }: { deptId: string; onBack?: () => void }) {
  const { data } = useStore();
  const subs = data.subjects.filter((s) => s.departmentId === deptId);
  return (
    <div>
      <PageHeader title="Subject Allocation" description="Assign faculty to subjects each semester" action={onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          title="Back"
          aria-label="Back to Faculty Performance"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      )} />
      <DataTable
        rows={subs}
        columns={[
          { key: 'name', header: 'Subject', render: (s) => <span className="font-medium">{s.name}</span> },
          { key: 'code', header: 'Code' },
          { key: 'semester', header: 'Sem' },
          { key: 'facultyId', header: 'Assigned Faculty', render: (s) => staffName(data, s.facultyId) },
          { key: 'classes', header: 'Classes', render: (s) => s.classes.join(', ') },
        ]}
      />
    </div>
  );
}

/* Student Management — main menu hosting the sub-pages as tabs */
const STUDENT_TABS: TabDef[] = [
  { id: 'students', label: 'Student List' },
  { id: 'academic', label: 'Academic Performance' },
  { id: 'projects', label: 'Project / Assignment' },
  { id: 'grievances', label: 'Student Grievances' },
];

function StudentManagement({ deptId }: { deptId: string }) {
  const [tab, setTab] = useState('students');
  return (
    <div>
      <Tabs tabs={STUDENT_TABS} active={tab} onChange={setTab} />
      {tab === 'students' && <StudentsWithAttendance deptId={deptId} />}
      {tab === 'academic' && <AcademicPerfView deptId={deptId} />}
      {tab === 'projects' && <ProjectProgress deptId={deptId} />}
      {tab === 'grievances' && <GrievancesPanel scopeDept={deptId} canAssign semesterFilter />}
    </div>
  );
}

function StudentsWithAttendance({ deptId }: { deptId: string }) {
  const { data } = useStore();
  const students = data.students.filter((s) => s.departmentId === deptId);
  return (
    <div>
      <StudentsDirectory
        scopeDept={deptId}
        editable
        classFilter
        extraStats={
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCard label="Dept Average" value={`${Math.round(students.reduce((a, s) => a + s.attendancePct, 0) / students.length)}%`} icon={<TrendingUp className="w-5 h-5" />} accent="blue" />
            <StatCard label="Above 75%" value={students.filter((s) => s.attendancePct >= 75).length} icon={<CheckSquare className="w-5 h-5" />} accent="emerald" />
            <StatCard label="Below 75%" value={students.filter((s) => s.attendancePct < 75).length} icon={<AlertTriangle className="w-5 h-5" />} accent="rose" />
            <StatCard label="Below 70%" value={students.filter((s) => s.attendancePct < 70).length} icon={<AlertTriangle className="w-5 h-5" />} accent="amber" />
          </div>
        }
      />
    </div>
  );
}

function AcademicPerfView({ deptId }: { deptId: string }) {
  const { data } = useStore();
  const [selected, setSelected] = useState<Student | null>(null);
  const [filterSem, setFilterSem] = useState('all');
  const deptStudents = data.students.filter((s) => s.departmentId === deptId);
  const semesters = [...new Set(deptStudents.map((s) => s.semester))].sort((a, b) => a - b);
  const students = deptStudents.filter((s) => filterSem === 'all' || s.semester === Number(filterSem));
  return (
    <div>
      <PageHeader title="Academic Performance" description="View-only — internal marks, GPA/CGPA, backlogs, and trends" action={
        <select className="input w-auto" value={filterSem} onChange={(e) => setFilterSem(e.target.value)}>
          <option value="all">All Semesters</option>
          {semesters.map((semester) => <option key={semester} value={semester}>Sem {semester}</option>)}
        </select>
      } />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Avg GPA" value={students.length ? (students.reduce((a, s) => a + s.gpa, 0) / students.length).toFixed(2) : '—'} icon={<TrendingUp className="w-5 h-5" />} accent="blue" />
        <StatCard label="Avg CGPA" value={students.length ? (students.reduce((a, s) => a + s.cgpa, 0) / students.length).toFixed(2) : '—'} icon={<TrendingUp className="w-5 h-5" />} accent="indigo" />
        <StatCard label="With Backlogs" value={students.filter((s) => s.backlogs > 0).length} icon={<AlertTriangle className="w-5 h-5" />} accent="rose" />
        <StatCard label="Top GPA" value={students.length ? Math.max(...students.map((s) => s.gpa)).toFixed(1) : '—'} icon={<Award className="w-5 h-5" />} accent="emerald" />
      </div>
      <DataTable
        rows={students}
        columns={[
          { key: 'name', header: 'Student', render: (s) => <span className="font-medium">{s.name}</span> },
          { key: 'rollNo', header: 'Roll No' },
          { key: 'semester', header: 'Sem' },
          { key: 'internalMarks', header: 'Internal Marks', render: (s) => <InternalMarksGrid marks={s.internalMarks} /> },
          { key: 'gpa', header: 'GPA', render: (s) => s.gpa },
          { key: 'cgpa', header: 'CGPA', render: (s) => s.cgpa },
          { key: 'backlogs', header: 'Backlogs', render: (s) => <span className={s.backlogs > 0 ? 'text-rose-600 font-semibold' : ''}>{s.backlogs}</span> },
        ]}
        onRowDoubleClick={(s) => setSelected(s)}
      />
      <p className="text-xs text-slate-400 mt-3">This is a view-only module. To update student information, use the Student List menu.</p>
      <StudentDetailModal student={selected} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function InternalMarksGrid({ marks }: { marks: { subject: string; marks: number; max: number }[] }) {
  const subjectLabel = (subject: string) => {
    if (subject === 'Database Management Systems') return 'DBMS';
    if (subject === 'Mathematics for Computer Applications') return 'Mathematics';
    return subject;
  };

  const scoreTone = (marks: number, max: number) => {
    const percentage = max > 0 ? (marks / max) * 100 : 0;
    if (percentage >= 80) return 'bg-emerald-50 text-emerald-700';
    if (percentage >= 60) return 'bg-amber-50 text-amber-700';
    return 'bg-rose-50 text-rose-700';
  };

  if (marks.length === 0) return <span className="text-xs text-slate-400">—</span>;

  return (
    <div className="grid w-full max-w-[260px] grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 text-xs leading-4">
      {marks.map((mark) => (
        <Fragment key={`${mark.subject}-${mark.max}`}>
          <span className="min-w-0 break-words text-left text-slate-600">{subjectLabel(mark.subject)}</span>
          <span className={`justify-self-end whitespace-nowrap rounded px-1.5 py-0.5 font-semibold ${scoreTone(mark.marks, mark.max)}`}>
            {mark.marks}/{mark.max}
          </span>
        </Fragment>
      ))}
    </div>
  );
}

function ProjectProgress({ deptId }: { deptId: string }) {
  const { data } = useStore();
  const [filterSem, setFilterSem] = useState('all');
  const deptStudents = data.students.filter((s) => s.departmentId === deptId);
  const semesters = [...new Set(deptStudents.map((s) => s.semester))].sort((a, b) => a - b);
  const students = deptStudents.filter((s) => s.projectTitle && (filterSem === 'all' || s.semester === Number(filterSem)));
  return (
    <div>
      <PageHeader title="Project / Assignment Progress" description="Student project tracking with guide and review status" action={
        <select className="input w-auto" value={filterSem} onChange={(e) => setFilterSem(e.target.value)}>
          <option value="all">All Semesters</option>
          {semesters.map((semester) => <option key={semester} value={semester}>Sem {semester}</option>)}
        </select>
      } />
      <div className="grid lg:grid-cols-2 gap-4">
        {students.map((s) => (
          <div key={s.id} className="card p-5">
            <div className="flex justify-between mb-2">
              <div><p className="text-sm font-semibold text-slate-900">{s.name}</p><p className="text-xs text-slate-500">{s.rollNo}</p></div>
              <span className="text-sm font-semibold text-slate-900">{s.projectProgress}%</span>
            </div>
            <p className="text-sm text-slate-700 mb-1">{s.projectTitle}</p>
            <p className="text-xs text-slate-500 mb-1">{s.projectType ?? 'Project'} · {s.projectSubject ?? '—'} · Guide: {s.projectGuide}</p>
            <p className="text-xs text-slate-500 mb-3">Status: {s.projectStatus ?? 'In Progress'} · Due: {s.projectDeadline ?? '—'} · Marks: {s.projectMarks ?? '—'} ({s.projectGrade ?? '—'})</p>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600 rounded-full" style={{ width: `${s.projectProgress}%` }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const SLOTS = ['09:00-10:00', '10:00-11:00', '11:30-12:30', '13:00-14:00', '14:00-15:00', '15:00-16:00'];

function TimetableEditor({ deptId }: { deptId: string }) {
  const { data, addTimetableEntry, updateTimetableEntry, addNotification } = useStore();
  const entries = data.timetable.filter((t) => t.departmentId === deptId);
  const deptSubs = data.subjects.filter((s) => s.departmentId === deptId);
  const deptFaculty = data.staff.filter((s) => s.departmentId === deptId && TEACHING_ROLES.includes(s.role));
  const deptRooms = data.rooms.filter((r) => r.departmentId === deptId);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ section: 'A', semester: 6, day: 'Monday', slot: '09:00-10:00', subject: '', facultyId: '', room: '', isLab: false });

  const addEntry = () => {
    if (!form.subject || !form.facultyId || !form.room) return;
    const entry: TimetableEntry = { id: `t${Date.now()}`, departmentId: deptId, section: form.section, semester: Number(form.semester), day: form.day, slot: form.slot, subject: form.subject, facultyId: form.facultyId, room: form.room, isLab: form.isLab, published: false, status: 'draft' };
    addTimetableEntry(entry);
    setShowForm(false);
    setForm({ section: 'A', semester: 6, day: 'Monday', slot: '09:00-10:00', subject: '', facultyId: '', room: '', isLab: false });
  };

  const submitForApproval = () => {
    entries.filter((e) => e.status === 'draft').forEach((e) => updateTimetableEntry(e.id, { status: 'pending-principal' }));
    addNotification({ id: `n${Date.now()}`, title: 'Timetable submitted for approval', message: `${deptName(data, deptId)} timetable submitted to Principal for approval`, date: new Date().toISOString().slice(0, 10), audience: ['principal'], read: false });
    addNotification({ id: `n${Date.now() + 1}`, title: 'Timetable submitted', message: `Your department timetable has been submitted to the Principal for approval. You will be notified of the decision.`, date: new Date().toISOString().slice(0, 10), audience: ['hod'], read: false });
    alert('Timetable submitted to Principal for approval. You will be notified of the decision.');
  };

  const hasDrafts = entries.some((e) => e.status === 'draft');

  return (
    <div>
      <PageHeader title="Create Timetable" description="Create and submit department timetable for Principal approval" action={
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4" /> Add Entry</button>
          {hasDrafts && <button className="btn-primary" onClick={submitForApproval}><Send className="w-4 h-4" /> Submit for Approval</button>}
        </div>
      } />
      {showForm && (
        <div className="card p-5 mb-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">New Timetable Entry</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <select className="input" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}><option value="A">Section A</option><option value="B">Section B</option></select>
            <select className="input" value={form.semester} onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}>{[1,2,3,4,5,6].map((s) => <option key={s} value={s}>Sem {s}</option>)}</select>
            <select className="input" value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>{DAYS.map((d) => <option key={d} value={d}>{d}</option>)}</select>
            <select className="input" value={form.slot} onChange={(e) => setForm({ ...form, slot: e.target.value })}>{SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}</select>
            <select className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}><option value="">Select subject...</option>{deptSubs.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}</select>
            <select className="input" value={form.facultyId} onChange={(e) => setForm({ ...form, facultyId: e.target.value })}><option value="">Select faculty...</option>{deptFaculty.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select>
            <select className="input" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })}><option value="">Select room...</option>{deptRooms.map((r) => <option key={r.id} value={r.name}>{r.name} (cap {r.capacity})</option>)}</select>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isLab} onChange={(e) => setForm({ ...form, isLab: e.target.checked })} /> Lab session</label>
          </div>
          <button className="btn-primary mt-3" onClick={addEntry}>Add to Timetable</button>
        </div>
      )}
      <DataTable
        rows={entries}
        columns={[
          { key: 'day', header: 'Day' },
          { key: 'slot', header: 'Time' },
          { key: 'subject', header: 'Subject', render: (t) => <span className="font-medium">{t.subject}</span> },
          { key: 'facultyId', header: 'Faculty', render: (t) => staffName(data, t.facultyId) },
          { key: 'room', header: 'Room' },
          { key: 'section', header: 'Section', render: (t) => `${t.section} · Sem ${t.semester}` },
          { key: 'isLab', header: 'Type', render: (t) => t.isLab ? <span className="badge bg-blue-100 text-blue-700">Lab</span> : <span className="badge bg-slate-100 text-slate-600">Theory</span> },
          { key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} /> },
        ]}
      />
    </div>
  );
}

function LabScheduling({ deptId }: { deptId: string }) {
  const { data, addTimetableEntry } = useStore();
  const labs = data.labs.filter((l) => l.departmentId === deptId);
  const deptSubs = data.subjects.filter((s) => s.departmentId === deptId);
  const labEntries = data.timetable.filter((t) => t.departmentId === deptId && t.isLab);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ section: 'A', semester: 6, day: 'Monday', slot: '09:00-10:00', subject: '', facultyId: '', lab: '' });

  const schedule = () => {
    if (!form.subject || !form.facultyId || !form.lab) return;
    addTimetableEntry({ id: `t${Date.now()}`, departmentId: deptId, section: form.section, semester: Number(form.semester), day: form.day, slot: form.slot, subject: form.subject, facultyId: form.facultyId, room: form.lab, isLab: true, published: false, status: 'draft' });
    setShowForm(false);
  };

  return (
    <div>
      <PageHeader title="Laboratory Scheduling" description="Schedule practical sessions in available laboratories without conflicts" action={<button className="btn-secondary" onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4" /> Schedule Lab Session</button>} />
      {showForm && (
        <div className="card p-5 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <select className="input" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}><option value="A">Section A</option><option value="B">Section B</option></select>
            <select className="input" value={form.semester} onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}>{[1,2,3,4,5,6].map((s) => <option key={s} value={s}>Sem {s}</option>)}</select>
            <select className="input" value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>{DAYS.map((d) => <option key={d} value={d}>{d}</option>)}</select>
            <select className="input" value={form.slot} onChange={(e) => setForm({ ...form, slot: e.target.value })}>{SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}</select>
            <select className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}><option value="">Select subject...</option>{deptSubs.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}</select>
            <select className="input" value={form.facultyId} onChange={(e) => setForm({ ...form, facultyId: e.target.value })}><option value="">Select faculty...</option>{data.staff.filter((s) => s.departmentId === deptId && TEACHING_ROLES.includes(s.role)).map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select>
            <select className="input" value={form.lab} onChange={(e) => setForm({ ...form, lab: e.target.value })}><option value="">Select lab...</option>{labs.map((l) => <option key={l.id} value={l.name}>{l.name} (cap {l.capacity})</option>)}</select>
          </div>
          <button className="btn-primary mt-3" onClick={schedule}>Schedule Session</button>
        </div>
      )}
      <DataTable
        rows={labEntries}
        columns={[
          { key: 'day', header: 'Day' },
          { key: 'slot', header: 'Time' },
          { key: 'subject', header: 'Subject', render: (t) => <span className="font-medium">{t.subject}</span> },
          { key: 'facultyId', header: 'Faculty', render: (t) => staffName(data, t.facultyId) },
          { key: 'room', header: 'Lab' },
          { key: 'section', header: 'Section', render: (t) => `${t.section} · Sem ${t.semester}` },
        ]}
      />
    </div>
  );
}

interface Conflict {
  id: string;
  severity: 'error' | 'warning';
  message: string;
  entries: string[];
}

function detectConflicts(entries: TimetableEntry[], rooms: { name: string; capacity: number }[], students: { id: string; semester: number; section: string; departmentId: string }[], facultyHours: Record<string, number>, staffLookup: (id: string) => string): Conflict[] {
  const conflicts: Conflict[] = [];
  const seen = new Set<string>();

  // Group by day+slot
  const bySlot: Record<string, TimetableEntry[]> = {};
  entries.forEach((e) => { const k = `${e.day}|${e.slot}`; (bySlot[k] ??= []).push(e); });

  Object.entries(bySlot).forEach(([key, group]) => {
    // 1. Faculty double-booking
    const byFaculty: Record<string, TimetableEntry[]> = {};
    group.forEach((e) => (byFaculty[e.facultyId] ??= []).push(e));
    Object.entries(byFaculty).forEach(([fid, items]) => {
      if (items.length > 1) {
        const cid = `faculty-${fid}-${key}`;
        if (!seen.has(cid)) { seen.add(cid); conflicts.push({ id: cid, severity: 'error', message: `Faculty ${staffLookup(fid)} is assigned to ${items.length} classes on ${items[0].day} at ${items[0].slot} (one faculty cannot teach two classes at the same time)`, entries: items.map((i) => i.id) }); }
      }
    });

    // 2. Room double-booking
    const byRoom: Record<string, TimetableEntry[]> = {};
    group.forEach((e) => (byRoom[e.room] ??= []).push(e));
    Object.entries(byRoom).forEach(([room, items]) => {
      if (items.length > 1) {
        const cid = `room-${room}-${key}`;
        if (!seen.has(cid)) { seen.add(cid); conflicts.push({ id: cid, severity: 'error', message: `Room ${room} has ${items.length} classes scheduled on ${items[0].day} at ${items[0].slot} (one classroom cannot have two classes at the same time)`, entries: items.map((i) => i.id) }); }
      }
    });

    // 3. Student batch conflict (same dept+sem+section, two subjects)
    const byBatch: Record<string, TimetableEntry[]> = {};
    group.forEach((e) => { const k = `${e.departmentId}|${e.semester}|${e.section}`; (byBatch[k] ??= []).push(e); });
    Object.entries(byBatch).forEach(([batch, items]) => {
      if (items.length > 1) {
        const cid = `batch-${batch}-${key}`;
        if (!seen.has(cid)) { seen.add(cid); conflicts.push({ id: cid, severity: 'error', message: `Student batch ${batch} has ${items.length} subjects on ${items[0].day} at ${items[0].slot} (a student batch cannot attend two subjects simultaneously)`, entries: items.map((i) => i.id) }); }
      }
    });

    // 4. Lab conflict (lab room used by 2 classes)
    const labs = group.filter((e) => e.isLab);
    const byLab: Record<string, TimetableEntry[]> = {};
    labs.forEach((e) => (byLab[e.room] ??= []).push(e));
    Object.entries(byLab).forEach(([lab, items]) => {
      if (items.length > 1) {
        const cid = `lab-${lab}-${key}`;
        if (!seen.has(cid)) { seen.add(cid); conflicts.push({ id: cid, severity: 'error', message: `Laboratory ${lab} is booked by ${items.length} classes on ${items[0].day} at ${items[0].slot} (a laboratory can only be used by one class at a time)`, entries: items.map((i) => i.id) }); }
      }
    });

    // 6. Lunch break
    if (group.length > 0 && LUNCH_SLOTS.includes(group[0].slot)) {
      const cid = `lunch-${key}`;
      if (!seen.has(cid)) { seen.add(cid); conflicts.push({ id: cid, severity: 'warning', message: `Classes scheduled during official lunch break (${group[0].slot}) on ${group[0].day} (no class should be scheduled during the lunch break)`, entries: group.map((i) => i.id) }); }
    }
  });

  // 5. Faculty exceeds allowed teaching hours
  Object.entries(facultyHours).forEach(([fid, hours]) => {
    if (hours > MAX_WEEKLY_HOURS) {
      const cid = `hours-${fid}`;
      if (!seen.has(cid)) { seen.add(cid); conflicts.push({ id: cid, severity: 'warning', message: `Faculty ${staffLookup(fid)} has ${hours} weekly teaching hours (exceeds allowed maximum of ${MAX_WEEKLY_HOURS} hours)`, entries: [] }); }
    }
  });

  // 7. Too many continuous classes (faculty)
  const byFacultyDay: Record<string, TimetableEntry[]> = {};
  entries.forEach((e) => { const k = `${e.facultyId}|${e.day}`; (byFacultyDay[k] ??= []).push(e); });
  Object.entries(byFacultyDay).forEach(([key, items]) => {
    const slotIndex = items.map((i) => SLOTS.indexOf(i.slot)).sort((a, b) => a - b);
    let continuous = 1, maxCont = 1;
    for (let i = 1; i < slotIndex.length; i++) { if (slotIndex[i] === slotIndex[i-1] + 1) { continuous++; maxCont = Math.max(maxCont, continuous); } else continuous = 1; }
    if (maxCont > MAX_CONTINUOUS) {
      const cid = `cont-${key}`;
      if (!seen.has(cid)) { seen.add(cid); conflicts.push({ id: cid, severity: 'warning', message: `Faculty has ${maxCont} continuous classes on ${items[0].day} (should not exceed ${MAX_CONTINUOUS} continuous classes)`, entries: items.map((i) => i.id) }); }
    }
  });

  // 8. Room capacity vs class strength
  entries.forEach((e) => {
    const room = rooms.find((r) => r.name === e.room);
    if (room) {
      const classStrength = students.filter((s) => s.departmentId === e.departmentId && s.semester === e.semester && s.section === e.section).length;
      if (classStrength > room.capacity) {
        const cid = `cap-${e.id}`;
        if (!seen.has(cid)) { seen.add(cid); conflicts.push({ id: cid, severity: 'warning', message: `Room ${e.room} (capacity ${room.capacity}) is too small for ${classStrength} students in ${e.section} Sem ${e.semester} on ${e.day} ${e.slot} (room capacity must be >= class strength)`, entries: [e.id] }); }
      }
    }
  });

  // 9. Same subject twice for same class in same slot
  const byClassSubj: Record<string, TimetableEntry[]> = {};
  entries.forEach((e) => { const k = `${e.departmentId}|${e.semester}|${e.section}|${e.subject}|${e.day}|${e.slot}`; (byClassSubj[k] ??= []).push(e); });
  Object.entries(byClassSubj).forEach(([key, items]) => {
    if (items.length > 1) {
      const cid = `dupsubj-${key}`;
      if (!seen.has(cid)) { seen.add(cid); conflicts.push({ id: cid, severity: 'warning', message: `Subject "${items[0].subject}" is scheduled ${items.length} times for ${items[0].section} Sem ${items[0].semester} on ${items[0].day} at ${items[0].slot} (same subject should not be scheduled twice in the same slot)`, entries: items.map((i) => i.id) }); }
    }
  });

  return conflicts;
}

function ConflictDetection({ deptId }: { deptId: string }) {
  const { data } = useStore();
  const entries = data.timetable.filter((t) => t.departmentId === deptId);
  const deptRooms = data.rooms.filter((r) => r.departmentId === deptId).map((r) => ({ name: r.name, capacity: r.capacity }));
  const deptStudents = data.students.filter((s) => s.departmentId === deptId);

  // Compute faculty weekly hours from entries
  const facultyHours: Record<string, number> = {};
  entries.forEach((e) => { facultyHours[e.facultyId] = (facultyHours[e.facultyId] ?? 0) + 1; });

  const conflicts = detectConflicts(entries, deptRooms, deptStudents, facultyHours, (id) => staffName(data, id));
  const errors = conflicts.filter((c) => c.severity === 'error');
  const warnings = conflicts.filter((c) => c.severity === 'warning');

  return (
    <div>
      <PageHeader title="Timetable Conflict Detection" description="Automatic checking of all scheduling constraints" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Entries" value={entries.length} icon={<Calendar className="w-5 h-5" />} accent="blue" />
        <StatCard label="Errors" value={errors.length} icon={<XCircle className="w-5 h-5" />} accent={errors.length > 0 ? 'rose' : 'emerald'} />
        <StatCard label="Warnings" value={warnings.length} icon={<AlertTriangle className="w-5 h-5" />} accent={warnings.length > 0 ? 'amber' : 'emerald'} />
        <StatCard label="Status" value={conflicts.length === 0 ? 'Clean' : 'Issues'} icon={<CheckSquare className="w-5 h-5" />} accent={conflicts.length === 0 ? 'emerald' : 'rose'} />
      </div>

      {conflicts.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 mx-auto flex items-center justify-center mb-4"><CheckSquare className="w-7 h-7 text-emerald-600" /></div>
          <p className="text-sm font-medium text-slate-900">No conflicts detected</p>
          <p className="text-xs text-slate-500 mt-1">All scheduling constraints are satisfied. The timetable is clean.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {conflicts.map((c) => (
            <div key={c.id} className={`card p-4 border-l-4 ${c.severity === 'error' ? 'border-l-rose-500' : 'border-l-amber-500'}`}>
              <div className="flex items-start gap-3">
                {c.severity === 'error' ? <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />}
                <div>
                  <p className="text-sm font-medium text-slate-900">{c.severity === 'error' ? 'Conflict' : 'Warning'}</p>
                  <p className="text-sm text-slate-700 mt-0.5">{c.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Checked Constraints</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {[
            'One faculty + same day + same time = not allowed',
            'One classroom cannot have two classes at the same time',
            'A student batch cannot attend two subjects simultaneously',
            'A laboratory can only be used by one class at a time',
            'A faculty should not exceed allowed teaching hours',
            'No class should be scheduled during the official lunch break',
            'A faculty or student should not have too many continuous classes',
            'Room capacity must be >= class strength',
            'Same subject should not be scheduled twice for same class in same slot',
          ].map((rule) => (
            <div key={rule} className="flex items-center gap-2 text-sm text-slate-700 p-2 rounded-lg bg-slate-50"><CheckSquare className="w-4 h-4 text-slate-400 flex-shrink-0" /> {rule}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PublishTimetable({ deptId }: { deptId: string }) {
  const { data, publishTimetable, addNotification } = useStore();
  const entries = data.timetable.filter((t) => t.departmentId === deptId);
  const approved = entries.filter((t) => t.status === 'approved' && !t.published);
  const published = entries.filter((t) => t.published);
  const pending = entries.filter((t) => t.status === 'pending-principal');
  const rejected = entries.filter((t) => t.status === 'rejected');

  const publish = (section: string, semester: number) => {
    publishTimetable(deptId, section, semester);
    const facultyIds = [...new Set(entries.filter((t) => t.section === section && t.semester === semester).map((t) => t.facultyId))];
    facultyIds.forEach((fid) => {
      addNotification({ id: `n${Date.now()}-${fid}`, title: 'Timetable published', message: `Your timetable for Sec ${section} Sem ${semester} has been published. Check My Timetable.`, date: new Date().toISOString().slice(0, 10), audience: [data.staff.find((s) => s.id === fid)?.role ?? 'professor'], read: false });
    });
    alert(`Timetable for Section ${section} Sem ${semester} published. Teaching staff will see it in My Timetable.`);
  };

  const approvedGroups = [...new Set(approved.map((t) => `${t.section}|${t.semester}`))];

  return (
    <div>
      <PageHeader title="Publish Timetable" description="Publish approved timetables to the department" />
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Approved — Ready to Publish</h3>
          {approvedGroups.length === 0 ? <p className="text-sm text-slate-400">No approved timetables ready for publishing.</p> :
            <div className="space-y-3">
              {approvedGroups.map((g) => { const [sec, sem] = g.split('|'); return (
                <div key={g} className="flex items-center justify-between p-3 rounded-lg bg-emerald-50">
                  <div><p className="text-sm font-medium text-slate-900">Section {sec} · Sem {sem}</p><p className="text-xs text-slate-500">{approved.filter((t) => t.section === sec && t.semester === Number(sem)).length} entries approved</p></div>
                  <button className="btn-success" onClick={() => publish(sec, Number(sem))}><Send className="w-4 h-4" /> Publish</button>
                </div>
              ); })}
            </div>}
        </div>
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Status Summary</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50"><span className="text-sm text-slate-700">Pending Principal Approval</span><StatusBadge status="pending-principal" /></div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50"><span className="text-sm text-slate-700">Approved (unpublished)</span><span className="text-sm font-semibold">{approved.length}</span></div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50"><span className="text-sm text-slate-700">Published</span><span className="text-sm font-semibold">{published.length}</span></div>
            {rejected.length > 0 && <div className="flex items-center justify-between p-3 rounded-lg bg-rose-50"><span className="text-sm text-slate-700">Rejected</span><span className="text-sm font-semibold text-rose-600">{rejected.length}</span></div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function ExamSched({ deptId }: { deptId: string }) {
  const { data } = useStore();
  const exams = data.exams.filter((e) => e.departmentId === deptId);
  return (
    <div>
      <PageHeader title="Examination Schedule" description="Department examination timetable" />
      <DataTable
        rows={exams}
        columns={[
          { key: 'examName', header: 'Exam' },
          { key: 'subject', header: 'Subject' },
          { key: 'date', header: 'Date' },
          { key: 'timing', header: 'Time' },
          { key: 'duration', header: 'Duration' },
          { key: 'hall', header: 'Hall' },
          { key: 'invigilatorId', header: 'Invigilator', render: (e) => staffName(data, e.invigilatorId) },
        ]}
      />
    </div>
  );
}

function InternalAssess({ deptId }: { deptId: string }) {
  const { data } = useStore();
  const students = data.students.filter((s) => s.departmentId === deptId);
  return (
    <div>
      <PageHeader title="Internal Assessment Management" description="Monitor internal assessments for policy compliance" />
      <DataTable
        rows={students}
        columns={[
          { key: 'name', header: 'Student', render: (s) => <span className="font-medium">{s.name}</span> },
          { key: 'rollNo', header: 'Roll No' },
          { key: 'internalMarks', header: 'Marks Summary', render: (s) => s.internalMarks.map((m) => `${m.subject}: ${m.marks}/${m.max}`).join(' · ') },
        ]}
      />
    </div>
  );
}

function Invigilator({ deptId }: { deptId: string }) {
  const { data } = useStore();
  const exams = data.exams.filter((e) => e.departmentId === deptId);
  return (
    <div>
      <PageHeader title="Invigilator Allocation" description="Faculty invigilation duties" />
      <DataTable
        rows={exams}
        columns={[
          { key: 'examName', header: 'Exam' },
          { key: 'date', header: 'Date' },
          { key: 'timing', header: 'Time' },
          { key: 'hall', header: 'Hall' },
          { key: 'invigilatorId', header: 'Invigilator', render: (e) => staffName(data, e.invigilatorId) },
        ]}
      />
    </div>
  );
}

function MarksMonitor({ deptId }: { deptId: string }) {
  const { data } = useStore();
  const students = data.students.filter((s) => s.departmentId === deptId);
  return (
    <div>
      <PageHeader title="Marks Entry Monitoring" description="Ensure marks are entered accurately and on time" />
      <DataTable
        rows={students}
        columns={[
          { key: 'name', header: 'Student', render: (s) => <span className="font-medium">{s.name}</span> },
          { key: 'rollNo', header: 'Roll No' },
          { key: 'internalMarks', header: 'Subjects Entered', render: (s) => s.internalMarks.length },
          { key: 'status', header: 'Status', render: () => <StatusBadge status="completed" /> },
        ]}
      />
    </div>
  );
}

function ExamAttendanceView({ deptId }: { deptId: string }) {
  const { data } = useStore();
  const exams = data.exams.filter((e) => e.departmentId === deptId);
  const deptStudents = data.students.filter((s) => s.departmentId === deptId);
  const records = data.examAttendance.filter((r) => exams.some((e) => e.id === r.examId));

  const stats = {
    present: records.filter((r) => r.status === 'present').length,
    absent: records.filter((r) => r.status === 'absent').length,
    medical: records.filter((r) => r.status === 'medical-leave').length,
    malpractice: records.filter((r) => r.status === 'malpractice').length,
  };

  return (
    <div>
      <PageHeader title="Student Examination Attendance" description="View students present, absent, medical leave, and malpractice cases" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Present" value={stats.present} icon={<CheckSquare className="w-5 h-5" />} accent="emerald" />
        <StatCard label="Absent" value={stats.absent} icon={<XCircle className="w-5 h-5" />} accent="rose" />
        <StatCard label="Medical Leave" value={stats.medical} icon={<ClipboardCheck className="w-5 h-5" />} accent="amber" />
        <StatCard label="Malpractice" value={stats.malpractice} icon={<AlertTriangle className="w-5 h-5" />} accent="rose" />
      </div>
      <DataTable
        rows={records.map((r) => {
          const exam = exams.find((e) => e.id === r.examId);
          const student = deptStudents.find((s) => s.id === r.studentId) ?? data.students.find((s) => s.id === r.studentId);
          return { id: r.id, examName: exam?.examName ?? '—', subject: exam?.subject ?? '—', date: exam?.date ?? '—', studentName: student?.name ?? '—', rollNo: student?.rollNo ?? '—', status: r.status, remarks: r.remarks };
        })}
        columns={[
          { key: 'examName', header: 'Exam' },
          { key: 'subject', header: 'Subject' },
          { key: 'date', header: 'Date' },
          { key: 'studentName', header: 'Student', render: (r) => <span className="font-medium">{r.studentName}</span> },
          { key: 'rollNo', header: 'Roll No' },
          { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          { key: 'remarks', header: 'Remarks', render: (r) => r.remarks || '—' },
        ]}
      />
    </div>
  );
}

/* Syllabus Tracking — main menu hosting the sub-pages as tabs */
const SYLLABUS_TABS: TabDef[] = [
  { id: 'overview', label: 'Syllabus Overview' },
  { id: 'fac-progress', label: 'Faculty-wise Progress' },
  { id: 'unit', label: 'Unit / Topic Tracking' },
  { id: 'delayed', label: 'Delayed Subjects' },
];

function SyllabusTracking({ deptId }: { deptId: string }) {
  const [tab, setTab] = useState('overview');
  return (
    <div>
      <Tabs tabs={SYLLABUS_TABS} active={tab} onChange={setTab} />
      {tab === 'overview' && <SyllabusProgressView scopeDept={deptId} />}
      {tab === 'fac-progress' && <FacultySyllabusProgress deptId={deptId} />}
      {tab === 'unit' && <UnitTracking deptId={deptId} />}
      {tab === 'delayed' && <DelayedSubjects deptId={deptId} />}
    </div>
  );
}

function FacultySyllabusProgress({ deptId }: { deptId: string }) {
  const { data } = useStore();
  const faculty = data.staff.filter((s) => s.departmentId === deptId && TEACHING_ROLES.includes(s.role));
  return (
    <div>
      <PageHeader title="Faculty-wise Syllabus Progress" description="Completion by faculty member" />
      <DataTable
        rows={faculty.map((f) => {
          const subs = data.subjects.filter((s) => s.facultyId === f.id);
          const avg = subs.length ? Math.round(subs.reduce((a, s) => a + s.syllabusCompletion, 0) / subs.length) : 0;
          return { id: f.id, name: f.name, subjects: subs.length, avg, pending: subs.filter((s) => s.syllabusCompletion < 100).length };
        })}
        columns={[
          { key: 'name', header: 'Faculty', render: (f) => <span className="font-medium">{f.name}</span> },
          { key: 'subjects', header: 'Subjects' },
          { key: 'avg', header: 'Avg Completion', render: (f) => `${f.avg}%` },
          { key: 'pending', header: 'Pending Topics', render: (f) => f.pending },
        ]}
      />
    </div>
  );
}

function UnitTracking({ deptId }: { deptId: string }) {
  const { data } = useStore();
  const subs = data.subjects.filter((s) => s.departmentId === deptId);
  return (
    <div>
      <PageHeader title="Unit / Topic Tracking" description="Unit-level completion status" />
      <DataTable
        rows={subs}
        columns={[
          { key: 'name', header: 'Subject', render: (s) => <span className="font-medium">{s.name}</span> },
          { key: 'facultyId', header: 'Faculty', render: (s) => staffName(data, s.facultyId) },
          { key: 'unitsCompleted', header: 'Units Completed', render: (s) => `${s.unitsCompleted}/${s.unitsTotal}` },
          { key: 'syllabusCompletion', header: 'Completion', render: (s) => `${s.syllabusCompletion}%` },
        ]}
      />
    </div>
  );
}

function DelayedSubjects({ deptId }: { deptId: string }) {
  const { data } = useStore();
  const delayed = data.subjects.filter((s) => s.departmentId === deptId && s.syllabusCompletion < 75);
  return (
    <div>
      <PageHeader title="Delayed Subjects" description="Subjects behind planned schedule" />
      {delayed.length === 0 ? <div className="card p-8 text-center text-sm text-slate-400">No delayed subjects.</div> :
        <DataTable
          rows={delayed}
          columns={[
            { key: 'name', header: 'Subject', render: (s) => <span className="font-medium">{s.name}</span> },
            { key: 'facultyId', header: 'Faculty', render: (s) => staffName(data, s.facultyId) },
            { key: 'syllabusCompletion', header: 'Completion', render: (s) => <span className="text-rose-600 font-semibold">{s.syllabusCompletion}%</span> },
          ]}
        />}
    </div>
  );
}

function ExtraClasses({ deptId }: { deptId: string }) {
  const { data } = useStore();
  const delayed = data.subjects.filter((s) => s.departmentId === deptId && s.syllabusCompletion < 75);
  return (
    <div>
      <PageHeader title="Extra / Remedial Classes" description="Request extra classes for delayed subjects" action={<button className="btn-primary"><Send className="w-4 h-4" /> Request Extra Class</button>} />
      <DataTable
        rows={delayed}
        columns={[
          { key: 'name', header: 'Subject', render: (s) => <span className="font-medium">{s.name}</span> },
          { key: 'facultyId', header: 'Faculty', render: (s) => staffName(data, s.facultyId) },
          { key: 'syllabusCompletion', header: 'Completion', render: (s) => <span className="text-rose-600 font-semibold">{s.syllabusCompletion}%</span> },
          { key: 'action', header: 'Action', render: () => <span className="badge bg-amber-100 text-amber-700">Eligible</span> },
        ]}
      />
    </div>
  );
}

/* Result Analysis — main menu hosting the sub-pages as tabs */
interface TabDef {
  id: string;
  label: string;
}

function Tabs({ tabs, active, onChange }: { tabs: TabDef[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="border-b border-slate-200 mb-6 flex items-center justify-between gap-3">
      <div className="flex gap-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${
              active === t.id ? 'border-blue-600 text-blue-700 font-medium' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const RESULT_TABS: TabDef[] = [
  { id: 'sub-result', label: 'Subject-wise Analysis' },
  { id: 'student-perf', label: 'Student Performance' },
  { id: 'top', label: 'Top Performers' },
  { id: 'failure', label: 'Failure & Backlog' },
];

function ResultAnalysis({ deptId }: { deptId: string }) {
  const [tab, setTab] = useState('sub-result');
  return (
    <div>
      <Tabs tabs={RESULT_TABS} active={tab} onChange={setTab} />
      {tab === 'sub-result' && <SubjectResult deptId={deptId} />}
      {tab === 'student-perf' && <StudentPerf deptId={deptId} />}
      {tab === 'top' && <TopPerformers deptId={deptId} />}
      {tab === 'failure' && <FailureAnalysis deptId={deptId} />}
    </div>
  );
}

function SubjectResult({ deptId }: { deptId: string }) {
  const { data } = useStore();
  const subs = data.subjects.filter((s) => s.departmentId === deptId);
  return (
    <div>
      <PageHeader title="Subject-wise Result Analysis" description="Performance of each subject" />
      <DataTable
        rows={subs.map((sub) => {
          const studs = data.students.filter((s) => s.departmentId === deptId && s.subjects.includes(sub.name));
          const avg = studs.length ? (studs.reduce((a, s) => a + s.gpa, 0) / studs.length).toFixed(2) : '—';
          return { id: sub.id, name: sub.name, code: sub.code, students: studs.length, avgGpa: avg };
        })}
        columns={[
          { key: 'name', header: 'Subject', render: (s) => <span className="font-medium">{s.name}</span> },
          { key: 'code', header: 'Code' },
          { key: 'students', header: 'Students' },
          { key: 'avgGpa', header: 'Avg GPA' },
        ]}
      />
    </div>
  );
}

function StudentPerf({ deptId }: { deptId: string }) {
  const { data } = useStore();
  const [selected, setSelected] = useState<Student | null>(null);
  const students = data.students.filter((s) => s.departmentId === deptId);
  return (
    <div>
      <PageHeader title="Student Performance" description="Individual performance review" />
      <DataTable
        rows={students}
        columns={[
          { key: 'name', header: 'Student', render: (s) => <span className="font-medium">{s.name}</span> },
          { key: 'rollNo', header: 'Roll No' },
          { key: 'gpa', header: 'GPA' },
          { key: 'cgpa', header: 'CGPA' },
          { key: 'backlogs', header: 'Backlogs' },
        ]}
        onRowDoubleClick={(s) => setSelected(s)}
      />
      <StudentDetailModal student={selected} open={!!selected} onClose={() => setSelected(null)} editable onSave={() => setSelected(null)} />
    </div>
  );
}

function TopPerformers({ deptId }: { deptId: string }) {
  const { data } = useStore();
  const [selected, setSelected] = useState<Student | null>(null);
  const top = [...data.students.filter((s) => s.departmentId === deptId)].sort((a, b) => b.cgpa - a.cgpa).slice(0, 5).map((s, i) => ({ ...s, rank: i + 1 }));
  return (
    <div>
      <PageHeader title="Top Performers" description="Highest-performing students for awards/scholarships" />
      <DataTable
        rows={top}
        columns={[
          { key: 'rank', header: 'Rank', render: (s) => <span className="font-bold text-amber-600">#{s.rank}</span> },
          { key: 'name', header: 'Student', render: (s) => <span className="font-medium">{s.name}</span> },
          { key: 'rollNo', header: 'Roll No' },
          { key: 'cgpa', header: 'CGPA', render: (s) => <span className="font-semibold text-emerald-600">{s.cgpa}</span> },
        ]}
        onRowDoubleClick={(s) => setSelected(s)}
      />
      <StudentDetailModal student={selected} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function FailureAnalysis({ deptId }: { deptId: string }) {
  const { data } = useStore();
  const [selected, setSelected] = useState<Student | null>(null);
  const atRisk = data.students.filter((s) => s.departmentId === deptId && (s.backlogs > 0 || s.cgpa < 7));
  return (
    <div>
      <PageHeader title="Failure & Backlog Analysis" description="Students and subjects with poor performance" />
      <DataTable
        rows={atRisk}
        columns={[
          { key: 'name', header: 'Student', render: (s) => <span className="font-medium">{s.name}</span> },
          { key: 'rollNo', header: 'Roll No' },
          { key: 'cgpa', header: 'CGPA', render: (s) => <span className="text-rose-600 font-semibold">{s.cgpa}</span> },
          { key: 'backlogs', header: 'Backlogs', render: (s) => <span className="text-rose-600 font-semibold">{s.backlogs}</span> },
        ]}
        onRowDoubleClick={(s) => setSelected(s)}
      />
      <StudentDetailModal student={selected} open={!!selected} onClose={() => setSelected(null)} editable onSave={() => setSelected(null)} />
    </div>
  );
}
