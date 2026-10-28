import { useState, type Dispatch, type SetStateAction } from 'react';

/** Generic table row: stable id + arbitrary record fields. */
type Rec = { id: string; [key: string]: any };
import { useStore, deptName, staffName } from '../../store/StoreContext';
import { getMenteesOfMentor } from '../hod/mentoringLogic';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { DataTable, StatusBadge } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import type { Student, Subject, PhdScholar } from '../../data/types';
import {
  BookOpen, Users, GraduationCap, FlaskConical, FileText, Calendar, Award,
  CheckSquare, ClipboardCheck, ClipboardList, ListChecks, TrendingUp, AlertTriangle,
  Clock, Send, Plus, Search, Download, Layers, ShieldCheck, ScrollText, UserCheck,
  CalendarDays, Beaker, DollarSign, Users2, Upload, Eye, Trash2, History, Paperclip,
} from 'lucide-react';

/* ============================================================
   Shared UI helpers
   ============================================================ */

interface TabDef {
  id: string;
  label: string;
}

function Tabs({ tabs, active, onChange, action }: {
  tabs: TabDef[]; active: string; onChange: (id: string) => void; action?: React.ReactNode;
}) {
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
      {action}
    </div>
  );
}

function StatusPill({ value }: { value: number }) {
  const color = value < 60 ? 'bg-rose-500' : value < 80 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-medium text-slate-700">{value}%</span>
    </div>
  );
}

/* Map a subject's class string (e.g. "CSE-A Sem-4") to the students of that class. */
function studentsOfClass(students: Student[], subject: Subject, cls: string) {
  const m = cls.match(/^(.+?)\s*Sem-(\d+)$/);
  if (!m) return [];
  const sec = m[1].replace(/^[A-Z]+-/i, ''); // "CSE-A" -> "A"
  const sem = Number(m[2]);
  return students.filter((s) => s.departmentId === subject.departmentId && s.semester === sem && s.section === sec);
}

/* ============================================================
   TEACHING  (7 tabs)
   ============================================================ */
export function TeachingModule() {
  const [tab, setTab] = useState('subjects');
  const tabs: TabDef[] = [
    { id: 'subjects', label: 'My Subjects' },
    { id: 'lessons', label: 'Lesson Planning' },
    { id: 'syllabus', label: 'Syllabus Progress' },
    { id: 'assessments', label: 'Assessments' },
    { id: 'marks', label: 'Marks Entry' },
    { id: 'performance', label: 'Student Performance' },
    { id: 'mentoring', label: 'Mentoring' },
  ];
  return (
    <div>
      <Tabs tabs={tabs} active={tab} onChange={setTab} />
      {tab === 'subjects' && <SubjectsTab />}
      {tab === 'lessons' && <LessonPlanningTab />}
      {tab === 'syllabus' && <SyllabusProgressTab />}
      {tab === 'assessments' && <AssessmentsTab />}
      {tab === 'marks' && <MarksEntryTab />}
      {tab === 'performance' && <StudentPerformanceTab />}
      {tab === 'mentoring' && <MentoringTab />}
    </div>
  );
}
function SubjectsTab() {
  const { currentUser, data } = useStore();
  const [selected, setSelected] = useState<Subject | null>(null);
  if (!currentUser) return null;
  const subs = data.subjects.filter((s) => s.facultyId === currentUser.id);

  const rosterFor = (s: Subject) => {
    const fromClasses = s.classes.flatMap((c) => studentsOfClass(data.students, s, c));
    if (fromClasses.length) return fromClasses;
    return data.students.filter((st) => st.departmentId === s.departmentId && st.semester === s.semester);
  };
  const assessmentFor = (s: Subject) => {
    const key = s.name === 'Database Management Systems' ? 'DBMS' : s.name;
    return data.exams.some((e) => e.subject === key) ? 'in-progress' : 'pending';
  };

  const rows = subs.map((s) => ({
    id: s.id,
    name: s.name,
    code: s.code,
    departmentId: s.departmentId,
    semester: s.semester,
    academicYear: '2026-27',
    students: rosterFor(s).length,
    syllabusCompletion: s.syllabusCompletion,
    assessmentStatus: assessmentFor(s),
  }));

  const sel = selected;

  return (
    <div>
      <PageHeader title="My Subjects" description="Subjects assigned to you by the department" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Subjects" value={subs.length} icon={<BookOpen className="w-5 h-5" />} accent="blue" />
        <StatCard label="Classes" value={subs.reduce((a, s) => a + s.classes.length, 0)} icon={<Users className="w-5 h-5" />} accent="indigo" />
        <StatCard label="Students" value={subs.reduce((a, s) => a + rosterFor(s).length, 0)} icon={<GraduationCap className="w-5 h-5" />} accent="emerald" />
        <StatCard label="Avg Completion" value={`${subs.length ? Math.round(subs.reduce((a, s) => a + s.syllabusCompletion, 0) / subs.length) : 0}%`} icon={<TrendingUp className="w-5 h-5" />} accent="amber" />
      </div>
      <DataTable
        rows={rows}
        onRowClick={(r) => setSelected(subs.find((x) => x.id === r.id) ?? null)}
        columns={[
          { key: 'name', header: 'Subject', render: (r) => <span className="font-medium text-slate-900">{r.name}</span> },
          { key: 'code', header: 'Code' },
          { key: 'departmentId', header: 'Department', render: (r) => deptName(data, r.departmentId) },
          { key: 'semester', header: 'Sem' },
          { key: 'academicYear', header: 'Academic Year' },
          { key: 'students', header: 'Students' },
          { key: 'syllabusCompletion', header: 'Syllabus', render: (r) => <StatusPill value={r.syllabusCompletion} /> },
          { key: 'assessmentStatus', header: 'Assessment', render: (r) => <StatusBadge status={r.assessmentStatus} /> },
        ]}
      />
      <p className="text-xs text-slate-400 mt-3">Click a row to view its class, students, syllabus and marks.</p>

      <Modal open={!!sel} onClose={() => setSelected(null)} title={sel?.name ?? ''} subtitle={sel ? `${sel.code} · ${deptName(data, sel.departmentId)} · Sem ${sel.semester}` : ''} size="lg">
        {sel && (() => {
          const roster = rosterFor(sel);
          return (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Classes" value={sel.classes.length} icon={<Users className="w-5 h-5" />} accent="indigo" compact />
                <StatCard label="Students" value={roster.length} icon={<GraduationCap className="w-5 h-5" />} accent="emerald" compact />
                <StatCard label="Syllabus" value={`${sel.syllabusCompletion}%`} icon={<TrendingUp className="w-5 h-5" />} accent="amber" compact />
                <StatCard label="Units Done" value={`${sel.unitsCompleted}/${sel.unitsTotal}`} icon={<ListChecks className="w-5 h-5" />} accent="blue" compact />
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Class Information</h4>
                <div className="grid sm:grid-cols-3 gap-3">
                  {sel.classes.map((c) => <div key={c} className="card p-3 text-sm text-slate-700">{c}</div>)}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Students ({roster.length})</h4>
                {roster.length ? (
                  <DataTable
                    rows={roster}
                    columns={[
                      { key: 'rollNo', header: 'Roll No' },
                      { key: 'name', header: 'Student', render: (s) => <span className="font-medium text-slate-900">{s.name}</span> },
                      { key: 'section', header: 'Section' },
                      { key: 'attendancePct', header: 'Attendance', render: (s) => `${s.attendancePct}%` },
                      { key: 'gpa', header: 'GPA' },
                    ]}
                  />
                ) : <p className="text-sm text-slate-400">No students enrolled.</p>}
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
interface LessonPlan {
  id: string;
  subjectId: string;
  unit: string;
  topic: string;
  plannedDate: string;
  classes: number;
  objectives: string;
  method: string;
  status: 'planned' | 'completed' | 'pending';
}
function seedPlans(subs: Subject[]): LessonPlan[] {
  const out: LessonPlan[] = [];
  const rows = [
    { n: '1', unit: 'Unit 1', topic: 'Introduction & Fundamentals', date: '2026-07-02', w: 2, ob: 'Overview of scope, terminology and core concepts.', m: 'Lecture + Discussion', st: 'completed' as const },
    { n: '2', unit: 'Unit 2', topic: 'Core Techniques', date: '2026-07-16', w: 3, ob: 'Key methods, solved examples and applications.', m: 'Lecture + Lab', st: 'completed' as const },
    { n: '3', unit: 'Unit 3', topic: 'Advanced Topics', date: '2026-08-01', w: 3, ob: 'Advanced concepts, comparison and case studies.', m: 'Lecture + Tutorial', st: 'planned' as const },
    { n: '4', unit: 'Unit 4', topic: 'Revision & Practice', date: '2026-08-20', w: 2, ob: 'Problem solving and revision of earlier units.', m: 'Problem Solving', st: 'pending' as const },
    { n: '5', unit: 'Unit 5', topic: 'Wrap-up & Doubt Clearing', date: '2026-09-05', w: 2, ob: 'Consolidate learning and test preparation.', m: 'Doubt Clearing', st: 'pending' as const },
  ];
  subs.forEach((s) => rows.forEach((r) => out.push({
    id: `lp-${s.id}-${r.n}`, subjectId: s.id, unit: r.unit, topic: `${r.topic} — ${s.name}`,
    plannedDate: r.date, classes: r.w, objectives: r.ob, method: r.m, status: r.st,
  })));
  return out;
}

function LessonPlanningTab() {
  const { currentUser, data } = useStore();
  const subs = data.subjects.filter((s) => s.facultyId === currentUser?.id);
  const [subjectId, setSubjectId] = useState(() => subs[0]?.id ?? '');
  const [plans, setPlans] = useState<LessonPlan[]>(() => seedPlans(subs));
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ unit: 'Unit 1', topic: '', plannedDate: '2026-08-10', w: 2, objectives: '', method: 'Lecture' });
  const [draftClassCount, setDraftClassCount] = useState(2);
  const [draftDate, setDraftDate] = useState('2026-08-10');

  if (!currentUser) return null;
  const visible = plans.filter((p) => !subjectId || p.subjectId === subjectId);

  const addPlan = () => {
    if (!subjectId || !draft.topic) return;
    setPlans((prev) => [...prev, { id: `lp-${Date.now()}`, subjectId, unit: draft.unit, topic: draft.topic, plannedDate: draftDate, classes: draftClassCount, objectives: draft.objectives, method: draft.method, status: 'planned' }]);
    setShowForm(false);
    setDraft({ unit: 'Unit 1', topic: '', plannedDate: '2026-08-01', w: 2, objectives: '', method: 'Lecture + Discussion' });
    setDraftDate('2026-08-01');
    setDraftClassCount(2);
  };

  const toggleDone = (id: string) =>
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, status: p.status === 'completed' ? 'planned' : 'completed' } : p)));

  const counts = {
    planned: visible.filter((p) => p.status === 'planned').length,
    completed: visible.filter((p) => p.status === 'completed').length,
    pending: visible.filter((p) => p.status === 'pending').length,
    classes: visible.reduce((a, p) => a + p.classes, 0),
  };

  return (
    <div>
      <PageHeader
        title="Lesson Planning"
        description="Plan, track and mark lessons complete for your subjects"
        action={
          <div className="flex items-center gap-2">
            <select className="input w-auto" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              <option value="">All Subjects</option>
              {subs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <button className="btn-primary" onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Add Lesson</button>
          </div>
        }
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Planned Classes" value={counts.planned} icon={<CalendarDays className="w-5 h-5" />} accent="blue" />
        <StatCard label="Completed" value={counts.completed} icon={<CheckSquare className="w-5 h-5" />} accent="emerald" />
        <StatCard label="Pending" value={counts.pending} icon={<Clock className="w-5 h-5" />} accent="amber" />
        <StatCard label="Total Classes" value={counts.classes} icon={<Layers className="w-5 h-5" />} accent="indigo" />
      </div>

      {visible.length ? (
        <DataTable
          rows={visible}
          columns={[
            { key: 'unit', header: 'Unit' },
            { key: 'topic', header: 'Topic', render: (p) => <span className="font-medium text-slate-900">{p.topic}</span> },
            { key: 'subjectId', header: 'Subject', render: (p) => subs.find((s) => s.id === p.subjectId)?.name ?? '—' },
            { key: 'plannedDate', header: 'Planned Date' },
            { key: 'classes', header: 'Classes' },
            { key: 'objectives', header: 'Learning Objectives', render: (p) => <span className="text-xs text-slate-600">{p.objectives}</span> },
            { key: 'method', header: 'Method' },
            { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} /> },
            { key: 'actions', header: '', render: (p) => (
              <button onClick={() => toggleDone(p.id)} className="text-xs font-medium text-blue-600 hover:text-blue-800">{p.status === 'completed' ? 'Revert' : 'Mark Completed'}</button>
            ) },
          ]}
        />
      ) : <div className="card p-8 text-center"><p className="text-sm text-slate-400">No lesson plans yet. Add your first lesson.</p></div>}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Lesson Plan" subtitle={subs.find((s) => s.id === subjectId)?.name ?? ''} size="md">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Unit</label>
            <select className="input w-full" value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })}>
              {['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5'].map((u) => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Topic</label>
            <input className="input w-full" value={draft.topic} onChange={(e) => setDraft({ ...draft, topic: e.target.value })} placeholder="Lesson topic" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Planned Date</label>
              <input className="input w-full" type="date" value={draftDate} onChange={(e) => setDraftDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">No. of Classes</label>
              <input className="input w-full" type="number" min={1} value={draftClassCount} onChange={(e) => setDraftClassCount(Number(e.target.value))} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Teaching Method</label>
            <select className="input w-full" value={draft.method} onChange={(e) => setDraft({ ...draft, method: e.target.value })}>
              {['Lecture + Discussion', 'Lecture + Lab', 'Tutorial', 'Problem Solving', 'Seminar', 'Group Activity'].map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Learning Objectives</label>
            <textarea className="input w-full" rows={3} value={draft.objectives} onChange={(e) => setDraft({ ...draft, objectives: e.target.value })} placeholder="What students should learn..." />
          </div>
          <button className="btn-primary w-full" onClick={addPlan}><Plus className="w-4 h-4" /> Save Lesson Plan</button>
        </div>
      </Modal>
    </div>
  );
}

function SyllabusProgressTab() {
  const { currentUser, data } = useStore();
  const subs = data.subjects.filter((s) => s.facultyId === currentUser?.id);
  const [subjectId, setSubjectId] = useState('');
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  if (!currentUser) return null;
  const sub = subs.find((s) => s.id === subjectId) ?? subs[0];
  if (!sub) return <PageHeader title="Syllabus Progress" description="No subjects assigned yet" />;

  const topicNames = ['Introduction & Scope', 'Core Techniques', 'Advanced Concepts', 'Applications & Case Studies', 'Review & Integration'];
  const rows = Array.from({ length: sub.unitsTotal }, (_, u) => {
    const unitId = `${sub.id}-u${u + 1}`;
    const def = u < sub.unitsCompleted ? 'completed' : u === sub.unitsCompleted ? 'in-progress' : 'not-started';
    return { id: unitId, unit: `Unit ${u + 1}`, topic: `${topicNames[u % topicNames.length]} — ${sub.name}`, status: overrides[unitId] ?? def };
  });
  const doneCount = rows.filter((r) => (overrides[r.id] ?? r.status) === 'completed').length;
  const inProg = rows.filter((r) => (overrides[r.id] ?? r.status) === 'in-progress').length;
  const notStarted = rows.filter((r) => (overrides[r.id] ?? r.status) === 'not-started').length;
  const pct = rows.length ? Math.round((doneCount / rows.length) * 100) : 0;

  const setStatus = (id: string, status: string) => setOverrides((prev) => ({ ...prev, [id]: status }));

  return (
    <div>
      <PageHeader
        title="Syllabus Progress"
        description="Track unit and topic completion for your subjects"
        action={
          <select className="input w-auto" value={sub.id} onChange={(e) => { setSubjectId(e.target.value); setOverrides({}); }}>
            {subs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        }
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Subject Completion" value={`${pct}%`} icon={<TrendingUp className="w-5 h-5" />} accent={pct < 70 ? 'amber' : 'emerald'} />
        <StatCard label="Completed Topics" value={doneCount} icon={<CheckSquare className="w-5 h-5" />} accent="emerald" />
        <StatCard label="In Progress" value={inProg} icon={<Clock className="w-5 h-5" />} accent="blue" />
        <StatCard label="Pending" value={notStarted} icon={<AlertTriangle className="w-5 h-5" />} accent="amber" />
      </div>
      <div className="rounded-xl bg-slate-50 px-4 py-2.5 mb-5 text-xs text-slate-500">{sub.name} ({sub.code}) · {sub.unitsCompleted}/{sub.unitsTotal} units covered · calculated automatically from topic/class completion.</div>

      <DataTable
        rows={rows}
        columns={[
          { key: 'unit', header: 'Unit' },
          { key: 'topic', header: 'Topic', render: (r) => <span className="font-medium text-slate-900">{r.topic}</span> },
          { key: 'status', header: 'Status', render: (r) => (
            <select
              className="input w-auto"
              value={overrides[r.id] ?? r.status}
              onChange={(e) => setStatus(r.id, e.target.value)}
            >
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          ) },
        ]}
      />
    </div>
  );
}

/* Teaching · Assessments */
function rosterOf(students: Student[], sb: Subject): Student[] {
  const base = sb.classes.length ? sb.classes.flatMap((c) => studentsOfClass(students, sb, c)) : students.filter((st) => st.departmentId === sb.departmentId && st.semester === sb.semester);
  return [...new Map(base.map((s) => [s.id, s])).values()].sort((a, b) => a.rollNo.localeCompare(b.rollNo));
}
type AssessmentType = 'Assignment' | 'Quiz' | 'Internal Assessment' | 'Practical' | 'Seminar' | 'Project';
interface Assessment { id: string; subjectId: string; name: string; type: AssessmentType; dueDate: string; maxMarks?: number }
function seedStudentStatus(i: number, j: number): string {
  const r = (i * 7 + j * 13) % 10;
  return r < 6 ? 'completed' : r < 8 ? 'pending' : r < 9 ? 'not-submitted' : 'not-applicable';
}

function AssessmentsTab() {
  const { currentUser, data } = useStore();
  const subs = data.subjects.filter((s) => s.facultyId === currentUser?.id);
  const [subjectId, setSubjectId] = useState('');
  const [asmts, setAsmts] = useState<Assessment[]>(() =>
    subs.flatMap((s) => [
      { id: `${s.id}-a1`, subjectId: s.id, name: 'Unit Assignment', type: 'Assignment' as const, dueDate: '2026-07-25', maxMarks: 10 },
      { id: `${s.id}-a2`, subjectId: s.id, name: 'Internal Test I', type: 'Internal Assessment' as const, dueDate: '2026-08-12', maxMarks: 20 },
      { id: `${s.id}-a3`, subjectId: s.id, name: 'Topic Seminar', type: 'Seminar' as const, dueDate: '2026-08-29' },
    ]),
  );
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [openAsm, setOpenAsm] = useState<Assessment | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<{ name: string; type: AssessmentType; dueDate: string; maxMarks: string }>({ name: '', type: 'Assignment', dueDate: '2026-09-05', maxMarks: '' });
  if (!currentUser) return null;
  const sub = subs.find((s) => s.id === subjectId) ?? subs[0];
  if (!sub) return <PageHeader title="Assessments" description="No subjects assigned yet" />;
  const roster = rosterOf(data.students, sub);
  const list = asmts.filter((a) => a.subjectId === sub.id);
  const eff = (a: Assessment, st: Student, i: number) => statuses[`${a.id}-${st.id}`] ?? seedStudentStatus(i, a.dueDate.length + a.type.length);
  const statsOf = (a: Assessment) => {
    const vals = roster.map((st, i) => eff(a, st, i));
    const done = vals.filter((v) => v === 'completed').length;
    return { total: vals.length, done, pending: vals.filter((v) => v !== 'completed' && v !== 'not-applicable').length };
  };
  const tot = list.reduce((acc, a) => { const s = statsOf(a); acc.done += s.done; acc.pending += s.pending; acc.count += s.total; return acc; }, { done: 0, pending: 0, count: 0 });
  const pctAll = tot.count ? Math.round((tot.done / tot.count) * 100) : 0;
  const saveAsm = () => {
    if (!draft.name.trim()) return;
    setAsmts((p) => [...p, { id: `${sub.id}-a${Date.now() % 100000}`, subjectId: sub.id, name: draft.name.trim(), type: draft.type, dueDate: draft.dueDate, maxMarks: draft.maxMarks ? Number(draft.maxMarks) : undefined }]);
    setShowForm(false);
    setDraft({ name: '', type: 'Assignment', dueDate: '2026-09-05', maxMarks: '' });
  };
  return (
    <div>
      <PageHeader title="Assessments" description={`Assignments and internals for ${sub.name}`} action={
        <div className="flex items-center gap-2">
          <select className="input w-auto" value={sub.id} onChange={(e) => setSubjectId(e.target.value)}>{subs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
          <button className="btn-primary" onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Add</button>
        </div>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Assessments" value={list.length} icon={<ClipboardList className="w-5 h-5" />} accent="blue" />
        <StatCard label="Completed" value={tot.done} icon={<CheckSquare className="w-5 h-5" />} accent="emerald" />
        <StatCard label="Pending" value={tot.pending} icon={<Clock className="w-5 h-5" />} accent="amber" />
        <StatCard label="Overall Completion" value={`${pctAll}%`} icon={<TrendingUp className="w-5 h-5" />} accent={pctAll < 60 ? 'amber' : 'indigo'} />
      </div>
      <DataTable rows={list.map((a) => { const s = statsOf(a); return { ...a, pct: s.total ? Math.round((s.done / s.total) * 100) : 0 }; })}
        onRowClick={(r) => setOpenAsm(asmts.find((x) => x.id === r.id) ?? null)}
        emptyMessage="No assessments yet"
        columns={[
          { key: 'name', header: 'Assessment', render: (r) => <span className="font-medium text-slate-900">{r.name}</span> },
          { key: 'type', header: 'Type' }, { key: 'dueDate', header: 'Due Date' },
          { key: 'total', header: 'Students' }, { key: 'done', header: 'Completed' }, { key: 'pending', header: 'Pending' },
          { key: 'pct', header: 'Completion', render: (r) => <StatusPill value={r.pct} /> },
        ]} />
      <AssessmentRosterModal asm={openAsm} roster={roster} onStatus={(sid, v) => openAsm && setStatuses((p) => ({ ...p, [`${openAsm.id}-${sid}`]: v }))} statusOf={(sid) => (openAsm && statuses[`${openAsm.id}-${sid}`]) || undefined} />
      <CreateAssessmentModal open={showForm} draft={draft} setDraft={setDraft} onSave={saveAsm} onClose={() => setShowForm(false)} />
    </div>
  );
}

interface AssessmentDraft { name: string; type: AssessmentType; dueDate: string; maxMarks: string }

function AssessmentRosterModal({ asm, roster, onStatus, statusOf }: {
  asm: Assessment | null;
  roster: Student[];
  onStatus: (studentId: string, v: string) => void;
  statusOf: (studentId: string) => string | undefined;
}) {
  return (
    <Modal open={!!asm} onClose={() => {}} title={asm?.name ?? ''} subtitle={asm ? `${asm.type}${asm.maxMarks ? ` · Max ${asm.maxMarks}` : ''} · ${roster.length} students` : ''} size="lg">
      {asm && (
        <DataTable rows={roster} columns={[
          { key: 'rollNo', header: 'Roll No' },
          { key: 'name', header: 'Student', render: (s) => <span className="font-medium text-slate-900">{s.name}</span> },
          { key: 'status', header: 'Status', render: (s) => (
            <select className="input w-auto py-1.5" value={statusOf(s.id) ?? seedStudentStatus(roster.indexOf(s), asm.dueDate.length + asm.type.length)} onChange={(e) => onStatus(s.id, e.target.value)}>
              {['completed', 'pending', 'not-submitted', 'not-applicable'].map((v) => <option key={v} value={v}>{v.replace(/-/g, ' ')}</option>)}
            </select>) },
          { key: 'marks', header: 'Marks', render: () => asm.maxMarks
            ? <input type="number" min={0} className="input w-24 py-1.5" placeholder={`/${asm.maxMarks}`} />
            : <span className="text-xs text-slate-400">N/A</span> },
        ]} />
      )}
    </Modal>
  );
}

function CreateAssessmentModal({ open, onClose, onSave, draft, setDraft }: {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  draft: AssessmentDraft;
  setDraft: Dispatch<SetStateAction<AssessmentDraft>>;
}) {
  const lbl = 'block mb-1 text-xs font-medium text-slate-600';
  return (
    <Modal open={open} onClose={onClose} title="Create Assessment" size="sm">
      <div className="space-y-3">
        <label className="block"><span className={lbl}>Name</span><input className="input w-full" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Quiz 2 — Unit 3" /></label>
        <label className="block"><span className={lbl}>Type</span>
          <select className="input w-full" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as AssessmentType })}>
            {(['Assignment', 'Quiz', 'Internal Assessment', 'Practical', 'Seminar', 'Project'] as AssessmentType[]).map((t) => <option key={t}>{t}</option>)}
          </select></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className={lbl}>Due Date</span><input type="date" className="input w-full" value={draft.dueDate} onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })} /></label>
          <label className="block"><span className={lbl}>Max Marks</span><input type="number" min={0} className="input w-full" value={draft.maxMarks} onChange={(e) => setDraft({ ...draft, maxMarks: e.target.value })} /></label>
        </div>
        <button className="btn-primary w-full" onClick={onSave}><Plus className="w-4 h-4" /> Save Assessment</button>
      </div>
    </Modal>
  );
}

/* Teaching · Marks Entry */
interface ExamPick { id: string; examName: string; date: string; timing: string; hall: string; maxMarks: number }

function MarksEntryTab() {
  const { currentUser, data } = useStore();
  const subs = data.subjects.filter((s) => s.facultyId === currentUser?.id);
  const [subjectId, setSubjectId] = useState('');
  const [examId, setExamId] = useState('');
  const [marks, setMarks] = useState<Record<string, Record<string, string>>>({});
  const [drafts, setDrafts] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [confirming, setConfirming] = useState<ExamPick | null>(null);
  if (!currentUser) return null;
  const sub = subs.find((s) => s.id === subjectId) ?? subs[0];
  if (!sub) return <PageHeader title="Marks Entry" description="No subjects assigned yet" />;
  const roster = rosterOf(data.students, sub);
  const match = data.exams.filter((x) => x.departmentId === sub.departmentId && x.semester === sub.semester && (x.subject === sub.name || x.subject === sub.code));
  const exams: ExamPick[] = match.length
    ? match.map((e) => ({ id: e.id, examName: e.examName, date: e.date, timing: e.timing, hall: e.hall, maxMarks: 50 }))
    : [
      { id: `${sub.id}-mid`, examName: 'Mid-Semester Internal', date: '2026-08-14', timing: '10:00 – 11:30', hall: 'Main Hall', maxMarks: 30 },
      { id: `${sub.id}-end`, examName: 'End-Semester Internal', date: '2026-12-05', timing: '10:00 – 12:00', hall: 'Main Hall', maxMarks: 50 },
    ];
  const exam = exams.find((e) => e.id === examId) ?? exams[0];
  if (!exam) return <PageHeader title="Marks Entry" description="No examinations scheduled yet" />;
  const sheet = marks[exam.id] ?? {};
  const isSub = !!submitted[exam.id];
  const isDraft = !!drafts[exam.id];
  const filled = roster.filter((s) => sheet[s.id] !== undefined && sheet[s.id] !== '').length;
  const badOf = (v?: string) => v !== undefined && v !== '' && (Number(v) > exam.maxMarks || Number(v) < 0);
  const hasBad = roster.some((s) => badOf(sheet[s.id]));
  const avg = filled ? Math.round(roster.reduce((a, s) => a + (Number(sheet[s.id]) || 0), 0) / Math.max(filled, 1)) : 0;
  return (
    <div>
      <PageHeader title="Marks Entry" description={`${sub.name} (${sub.code}) · Sem ${sub.semester} · ${roster.length} students`} action={
        <div className="flex flex-wrap items-center gap-2">
          <select className="input w-auto" value={sub.id} onChange={(e) => { setSubjectId(e.target.value); setExamId(''); }}>{subs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
          <select className="input w-auto" value={exam.id} onChange={(e) => setExamId(e.target.value)}>{exams.map((e) => <option key={e.id} value={e.id}>{e.examName}</option>)}</select>
        </div>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Entered" value={`${filled}/${roster.length}`} icon={<ClipboardList className="w-5 h-5" />} accent="blue" />
        <StatCard label="Class Average" value={avg} icon={<TrendingUp className="w-5 h-5" />} accent="indigo" />
        <StatCard label="Maximum Marks" value={exam.maxMarks} icon={<Award className="w-5 h-5" />} accent="slate" />
        <div className={`card card-hover p-5`}><p className="text-sm font-medium text-slate-500">Submission Status</p><p className="mt-2"><StatusBadge status={isSub ? 'submitted' : isDraft ? 'draft' : 'pending'} /></p><p className="text-xs text-slate-400 mt-2">{exam.examName} · {exam.date}</p></div>
      </div>
      {isSub && <div className="rounded-xl bg-blue-50 text-blue-700 px-4 py-2.5 mb-4 text-xs">Submitted — editing locked. Forwarded through the existing approval workflow.</div>}
      {!isSub && (
        <div className="flex items-center gap-2 mb-4">
          <button className="btn-secondary" disabled={hasBad || !filled} onClick={() => setDrafts({ ...drafts, [exam.id]: true })}>Save Draft</button>
          <button className="btn-primary" disabled={hasBad || !filled} onClick={() => setConfirming(exam)}><Send className="w-4 h-4" /> Submit Marks</button>
          {hasBad && <span className="text-xs text-rose-600">Fix entries exceeding maximum marks.</span>}
        </div>
      )}
      <DataTable rows={roster} columns={[
        { key: 'rollNo', header: 'Student ID' },
        { key: 'name', header: 'Student Name', render: (s) => <span className="font-medium text-slate-900">{s.name}</span> },
        { key: 'marks', header: 'Marks', render: (s) => (
          <input type="number" min={0} readOnly={isSub} className={`input w-24 py-1.5 ${badOf(sheet[s.id]) ? 'border-rose-500' : ''}`}
            value={sheet[s.id] ?? ''}
            onChange={(e) => setMarks((p) => ({ ...p, [exam.id]: { ...(p[exam.id] ?? {}), [s.id]: e.target.value } }))} />) },
        { key: 'max', header: 'Max', render: () => exam.maxMarks },
        { key: 'st', header: 'Status', render: () => <StatusBadge status={isSub ? 'approved' : isDraft ? 'draft' : 'pending'} /> },
      ]} />
      <MarksConfirmModal exam={confirming} total={roster.length} entered={filled} onClose={() => setConfirming(null)} onConfirm={() => { setSubmitted((p) => ({ ...p, [(confirming as ExamPick).id]: true })); setDrafts((p) => ({ ...p, [(confirming as ExamPick).id]: false })); setConfirming(null); }} />
    </div>
  );
}

function MarksConfirmModal({ exam, total, entered, onClose, onConfirm }: {
  exam: ExamPick | null;
  total: number;
  entered: number;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal open={!!exam} onClose={onClose} title="Submit Marks" subtitle="This action is final and forwards the sheet into the approval workflow." size="sm">
      <div className="text-sm text-slate-600 space-y-1 mb-4">
        <p><span className="font-medium text-slate-900">{exam?.examName}</span></p>
        <p>{entered} of {total} student entries will be submitted.</p>
        <p className="text-xs text-slate-400">After submission, editing is restricted as per the institution's approval rules.</p>
      </div>
      <div className="flex justify-end gap-2">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={onConfirm}><Send className="w-4 h-4" /> Confirm Submit</button>
      </div>
    </Modal>
  );
}

/* Teaching · Student Performance */
const PERF_AREAS = ['Internal Test', 'Assignment', 'Seminar'] as const;
function areaScore(ai: number, si: number): number {
  return 58 + ((si * 17 + ai * 29) % 38);
}
export interface PerfRow {
  id: string; name: string; rollNo: string;
  attendance: number; completion: number; avgMarks: number; trend: number;
}
function perfOf(students: Student[], sb: Subject): PerfRow[] {
  return rosterOf(students, sb).map((s, i) => {
    const scores = PERF_AREAS.map((_, ai) => areaScore(ai, i));
    const avgMarks = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const statuses = PERF_AREAS.map((_, ai) => seedStudentStatus(i, ai)).filter((v) => v === 'completed').length;
    const attendance = Math.round(s.attendancePct);
    const trend = ((i * 11) % 7) - 3;
    return { id: s.id, name: s.name, rollNo: s.rollNo, attendance, completion: Math.round((statuses / PERF_AREAS.length) * 100), avgMarks, trend };
  });
}
function perfBadge(r: PerfRow) {
  if (r.avgMarks >= 75 && r.attendance >= 75) return { label: 'Excellent', cls: 'bg-emerald-50 text-emerald-700' };
  if (r.avgMarks >= 60 && r.attendance >= 65) return { label: 'Good', cls: 'bg-blue-50 text-blue-700' };
  if (r.avgMarks >= 45) return { label: 'Average', cls: 'bg-amber-50 text-amber-700' };
  return { label: 'Needs Attention', cls: 'bg-rose-50 text-rose-700' };
}

function StudentPerformanceTab() {
  const { currentUser, data } = useStore();
  const subs = data.subjects.filter((s) => s.facultyId === currentUser?.id);
  const [subjectId, setSubjectId] = useState('');
  const [query, setQuery] = useState('');
  const [band, setBand] = useState('all');
  if (!currentUser) return null;
  const sub = subs.find((s) => s.id === subjectId) ?? subs[0];
  if (!sub) return <PageHeader title="Student Performance" description="No subjects assigned yet" />;
  const rows = perfOf(data.students, sub);
  const attention = rows.filter((r) => r.avgMarks < 45 || r.attendance < 65).length;
  const classAvg = rows.length ? Math.round(rows.reduce((a, r) => a + r.avgMarks, 0) / rows.length) : 0;
  const dist = [
    { label: 'Excellent (75+)', n: rows.filter((r) => r.avgMarks >= 75).length, cls: 'bg-emerald-500' },
    { label: 'Good (60–74)', n: rows.filter((r) => r.avgMarks >= 60 && r.avgMarks < 75).length, cls: 'bg-blue-500' },
    { label: 'Average (45–59)', n: rows.filter((r) => r.avgMarks >= 45 && r.avgMarks < 60).length, cls: 'bg-amber-500' },
    { label: 'Below 45', n: rows.filter((r) => r.avgMarks < 45).length, cls: 'bg-rose-500' },
  ];
  const filtered = rows
    .filter((r) => `${r.name} ${r.rollNo}`.toLowerCase().includes(query.toLowerCase()))
    .filter((r) => band === 'all' || perfBadge(r).label.toLowerCase().startsWith(band));
  const top = [...rows].sort((a, b) => b.avgMarks - a.avgMarks).slice(0, 3);
  return (
    <div>
      <PageHeader title="Student Performance" description={`Derived automatically from marks, assessments and attendance · ${sub.name}`} action={
        <div className="flex flex-wrap items-center gap-2">
          <select className="input w-auto" value={sub.id} onChange={(e) => setSubjectId(e.target.value)}>{subs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
          <select className="input w-auto" value={band} onChange={(e) => setBand(e.target.value)}>
            <option value="all">All performers</option><option value="excellent">Excellent</option>
            <option value="good">Good</option><option value="average">Average</option><option value="needs">Needs Attention</option>
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="input pl-9 w-48" placeholder="Search student…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Students" value={rows.length} icon={<Users className="w-5 h-5" />} accent="blue" />
        <StatCard label="Class Average" value={`${classAvg}%`} icon={<TrendingUp className="w-5 h-5" />} accent="indigo" />
        <StatCard label="Top Performers" value={top[0]?.name.split(' ')[0] ?? '—'} icon={<Award className="w-5 h-5" />} accent="emerald" />
        <StatCard label="Need Attention" value={attention} icon={<AlertTriangle className="w-5 h-5" />} accent={attention ? 'rose' : 'slate'} />
      </div>
      <div className="card p-5 mb-6">
        <p className="text-sm font-semibold text-slate-900 mb-4">Marks distribution</p>
        <div className="space-y-2.5">
          {dist.map((d) => (
            <div key={d.label} className="flex items-center gap-3">
              <span className="w-36 shrink-0 text-xs text-slate-500">{d.label}</span>
              <div className="h-2.5 flex-1 rounded-full bg-slate-100 overflow-hidden"><div className={`h-full rounded-full ${d.cls}`} style={{ width: `${rows.length ? Math.round((d.n / rows.length) * 100) : 0}%` }} /></div>
              <span className="w-8 text-right text-xs font-medium text-slate-600">{d.n}</span>
            </div>
          ))}
        </div>
      </div>
      <DataTable rows={filtered} emptyMessage="No students match the filters"
        columns={[
          { key: 'rollNo', header: 'Roll No' },
          { key: 'name', header: 'Student', render: (r) => <span className="font-medium text-slate-900">{r.name}</span> },
          { key: 'attendance', header: 'Attendance', render: (r) => <span className={r.attendance < 65 ? 'text-rose-600 font-semibold' : ''}>{r.attendance}%</span> },
          { key: 'completion', header: 'Assessments', render: (r) => `${r.completion}%` },
          { key: 'avgMarks', header: 'Avg Marks', render: (r) => r.avgMarks },
          { key: 'trend', header: 'Trend', render: (r) => <span className={r.trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{r.trend >= 0 ? `▲ +${r.trend}` : `▼ ${r.trend}`}</span> },
          { key: 'band', header: 'Status', render: (r) => <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${perfBadge(r).cls}`}>{perfBadge(r).label}</span> },
        ]} />
    </div>
  );
}

/* Teaching · Mentoring */
export interface MentorRecord { id: string; studentId: string; date: string; discussion: string; concern: string; action: string; followUp: string; done: boolean }

function MentoringTab() {
  const { currentUser, data } = useStore();
  const [selectedId, setSelectedId] = useState('');
  const [records, setRecords] = useState<MentorRecord[]>([
    { id: 'mr1', studentId: 'st1', date: '2026-08-06', discussion: 'Struggling with Data Structures unit 3 recursion problems.', concern: 'Low internal test score (14/30)', action: 'Scheduled weekly problem-solving session; shared practice set.', followUp: '2026-09-02', done: false },
    { id: 'mr2', studentId: 'st2', date: '2026-07-28', discussion: 'Discussed internship preparation and resume draft.', concern: '—', action: 'Referred to placement cell; review after resume update.', followUp: '2026-08-25', done: true },
    { id: 'mr3', studentId: 'st4', date: '2026-08-15', discussion: 'Attendance slipping below 75% — counseled on eligibility rules.', concern: 'Attendance at 68%', action: 'Parent informed via diary; monitored fortnightly.', followUp: '2026-08-31', done: false },
  ]);
  const [openForm, setOpenForm] = useState(false);
  if (!currentUser) return null;
  /* Mentees come from the central mentor–mentee allocations created by the HOD
     (single source of truth — no duplicate dataset on the faculty side). */
  const pool = getMenteesOfMentor(data, currentUser.id);
  const sel = pool.find((s) => s.id === selectedId) ?? pool[0];
  if (!sel) return <PageHeader title="Mentoring" description="No mentees allocated yet — mentor allocations are managed by your HOD under Faculty Management → Mentoring Management" />;
  const mine = records.filter((r) => r.studentId === sel.id).sort((a, b) => b.date.localeCompare(a.date));
  const pendingAll = records.filter((r) => !r.done && new Date(r.followUp) <= new Date('2026-09-05'));
  return (
    <div>
      <PageHeader title="Mentoring" description={`${pool.length} mentees assigned by the department`} action={
        <button className="btn-primary" onClick={() => setOpenForm(true)}><Plus className="w-4 h-4" /> Record Interaction</button>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="My Mentees" value={pool.length} icon={<UserCheck className="w-5 h-5" />} accent="blue" />
        <StatCard label="Sessions Logged" value={records.length} icon={<History className="w-5 h-5" />} accent="indigo" />
        <StatCard label="Pending Follow-ups" value={pendingAll.length} icon={<Clock className="w-5 h-5" />} accent={pendingAll.length ? 'amber' : 'slate'} />
        <StatCard label="Avg Attendance" value={`${Math.round(pool.reduce((a, s) => a + s.attendancePct, 0) / Math.max(pool.length, 1))}%`} icon={<TrendingUp className="w-5 h-5" />} accent="emerald" />
      </div>
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <DataTable rows={pool} onRowClick={(s) => setSelectedId(s.id)}
            columns={[
              { key: 'name', header: 'Mentee', render: (s) => (
                <span>
                  <span className={`block font-medium ${s.id === sel.id ? 'text-indigo-600' : 'text-slate-900'}`}>{s.name}</span>
                  <span className="text-xs text-slate-400">{s.rollNo} · Sem {s.semester}</span>
                </span>) },
              { key: 'attendancePct', header: 'Att.', render: (s) => `${s.attendancePct}%` },
              { key: 'gpa', header: 'GPA' },
            ]} />
        </div>
        <div className="lg:col-span-3 space-y-4">
          <div className="card p-5">
            <p className="text-sm font-semibold text-slate-900 mb-1">{sel.name}</p>
            <p className="text-xs text-slate-500 mb-4">Roll No {sel.rollNo} · Section {sel.section} · GPA {sel.gpa} · Attendance {sel.attendancePct}% · Backlogs {sel.backlogs}</p>
            <div className="space-y-2.5">
              {[{ l: 'Attendance', v: Math.round(sel.attendancePct) }, { l: 'Assessment completion', v: perfOf(data.students, data.subjects.find((x) => x.facultyId === currentUser?.id) ?? data.subjects[0]).find((r) => r.id === sel.id)?.completion ?? 0 }].map((m) => (
                <div key={m.l} className="flex items-center gap-3">
                  <span className="w-44 shrink-0 text-xs text-slate-500">{m.l}</span>
                  <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden"><div className={`h-full rounded-full ${m.v >= 75 ? 'bg-emerald-500' : m.v >= 60 ? 'bg-blue-500' : 'bg-rose-500'}`} style={{ width: `${m.v}%` }} /></div>
                  <span className="w-10 text-right text-xs font-medium text-slate-600">{m.v}%</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Mentoring history · click a session to close its follow-up</p>
          {mine.length === 0 && <div className="card p-4 text-sm text-slate-500">No interactions recorded for this mentee yet.</div>}
          <div className="space-y-2">
            {mine.map((r) => (
              <button key={r.id} onClick={() => setRecords((p) => p.map((x) => (x.id === r.id ? { ...x, done: !x.done } : x)))}
                className={`w-full text-left card card-hover p-4 ${!r.done ? 'border-l-4 border-l-amber-400' : ''}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-slate-900">{r.date}{r.concern !== '—' ? ` · ${r.concern}` : ''}</span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${r.done ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{r.done ? 'Follow-up closed' : `Due ${r.followUp}`}</span>
                </div>
                <p className="text-xs text-slate-600">{r.discussion}</p>
                <p className="text-xs text-slate-400 mt-1">Action: {r.action}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
      <MentorRecordModal open={openForm} onClose={() => setOpenForm(false)} mentee={sel}
        onSave={(rec) => { setRecords((p) => [{ ...rec, id: `mr${Date.now() % 100000}`, studentId: sel.id, done: false }, ...p]); setOpenForm(false); }} />
    </div>
  );
}

function MentorRecordModal({ open, onClose, mentee, onSave }: {
  open: boolean;
  onClose: () => void;
  mentee: Student;
  onSave: (rec: Omit<MentorRecord, 'id' | 'studentId' | 'done'>) => void;
}) {
  const lbl = 'block mb-1 text-xs font-medium text-slate-600';
  const [d, setD] = useState({ date: '2026-09-01', discussion: '', concern: '', action: '', followUp: '2026-09-15' });
  return (
    <Modal open={open} onClose={onClose} title="Record Mentoring Interaction" subtitle={`${mentee.name} · Roll No ${mentee.rollNo}`} size="sm">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className={lbl}>Date</span><input type="date" className="input w-full" value={d.date} onChange={(e) => setD({ ...d, date: e.target.value })} /></label>
          <label className="block"><span className={lbl}>Follow-up date</span><input type="date" className="input w-full" value={d.followUp} onChange={(e) => setD({ ...d, followUp: e.target.value })} /></label>
        </div>
        <label className="block"><span className={lbl}>Discussion / observation</span><textarea className="input w-full" rows={2} value={d.discussion} onChange={(e) => setD({ ...d, discussion: e.target.value })} placeholder="Points discussed with the student…" /></label>
        <label className="block"><span className={lbl}>Academic concern (if any)</span><input className="input w-full" value={d.concern} onChange={(e) => setD({ ...d, concern: e.target.value })} placeholder="e.g. Attendance below threshold" /></label>
        <label className="block"><span className={lbl}>Action taken</span><input className="input w-full" value={d.action} onChange={(e) => setD({ ...d, action: e.target.value })} placeholder="Counselling, referral, schedule change…" /></label>
        <button className="btn-primary w-full" disabled={!d.discussion.trim()} onClick={() => { onSave(d); setD({ date: d.date, discussion: '', concern: '', action: '', followUp: d.followUp }); }}><Plus className="w-4 h-4" /> Save Record</button>
      </div>
    </Modal>
  );
}

/* ============================================================
   Generic record workspace — shared by Research / Committee /
   Institutional modules so tables, badges and modal forms stay
   consistent across the whole faculty workspace.
   ============================================================ */
export interface FieldSpec { key: string; label: string; type?: 'text' | 'date' | 'number' | 'select' | 'textarea' | 'file'; options?: string[]; wide?: boolean }
export interface ColSpec { key: string; header: string }
export interface RecordSpec {
  kind: string;
  singular: string;
  fields: FieldSpec[];
  cols: ColSpec[];
  statusKey?: string;
  stats?: { label: string; calc: (rows: Rec[]) => string | number }[];
}

function statusTone(v: string): string {
  const s = v.toLowerCase();
  if (/complete|published|approved|accepted|funded|ongoing/.test(s)) return 'bg-emerald-50 text-emerald-700';
  if (/review|submitted|progress|manuscript|pending|draft|planned|assigned/.test(s)) return 'bg-blue-50 text-blue-700';
  if (/hold|reject|due/.test(s)) return 'bg-amber-50 text-amber-700';
  if (/not submitted|rejected|cancelled/.test(s)) return 'bg-rose-50 text-rose-700';
  return 'bg-slate-100 text-slate-600';
}

/* Shared record workspace so Research / Committee / Institutional
   tabs all use consistent tables, filters, badges and modal forms. */
function RecordWorkspace({ spec, seeds }: { spec: RecordSpec; seeds: Rec[] }) {
  const [rows, setRows] = useState<Rec[]>(seeds);
  const [query, setQuery] = useState('');
  const [statusF, setStatusF] = useState('all');
  const [editing, setEditing] = useState<Rec | null>(null);
  const lbl = 'block mb-1 text-xs font-medium text-slate-600';
  const statuses = spec.statusKey ? [...new Set(rows.map((r) => String(r[spec.statusKey!])).filter(Boolean))] : [];
  const filtered = rows.filter((r) => JSON.stringify(Object.values(r)).toLowerCase().includes(query.toLowerCase()))
    .filter((r) => statusF === 'all' || r[spec.statusKey ?? ''] === statusF);
  const saveRow = () => setRows((p) => (editing!.id ? p.map((x) => (x.id === editing!.id ? editing! : x)) : [{ ...editing!, id: `${spec.kind}-${Date.now() % 100000}` }, ...p]));
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="input pl-9 w-56" placeholder={`Search ${spec.singular.toLowerCase()}s…`} value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          {spec.statusKey && (
            <select className="input w-auto" value={statusF} onChange={(e) => setStatusF(e.target.value)}>
              <option value="all">All statuses</option>
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          <button className="btn-primary" onClick={() => setEditing({ id: '' })}><Plus className="w-4 h-4" /> Add {spec.singular}</button>
        </div>
      </div>
      {spec.stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {spec.stats.map((st) => (
            <StatCard key={st.label} label={st.label} value={st.calc(rows)} icon={<ClipboardList className="w-5 h-5" />} accent="blue" />
          ))}
        </div>
      )}
      <DataTable
        rows={filtered}
        emptyMessage={`No ${spec.singular.toLowerCase()}s recorded yet`}
        onRowClick={(r) => setEditing(r)}
        columns={[
          ...spec.cols.map((c) => ({
            key: c.key,
            header: c.header,
            render: (r: Rec) =>
              c.key === spec.statusKey
                ? <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusTone(String(r[c.key]))}`}>{r[c.key]}</span>
                : typeof r[c.key] === 'string' && r[c.key].length > 60
                  ? <span title={r[c.key]}>{r[c.key].slice(0, 58)}…</span>
                  : (r[c.key] ?? '—'),
          })),
          ...(spec.fields.some((f) => f.type === 'file')
            ? [{ key: '__file', header: 'Doc', render: (r: Rec) => r.fileName
                ? <span className="inline-flex items-center gap-1 text-xs text-indigo-600"><Paperclip className="w-3 h-3" />{String(r.fileName).slice(0, 14)}</span>
                : <span className="text-xs text-slate-300">—</span> }]
            : []),
          { key: '__act', header: '', render: () => (
            <span className="flex justify-end gap-1 text-slate-400">
              <Eye className="w-3.5 h-3.5" /><Download className="w-3.5 h-3.5" />
            </span>) },
        ]}
      />
      <Modal open={!!editing} onClose={() => setEditing(null)}
        title={editing?.id ? `Edit ${spec.singular}` : `Add ${spec.singular}`}
        subtitle={editing?.id ? 'Updates are logged to the record history.' : undefined} size="md">
        {editing && (
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              {spec.fields.filter((f) => !f.wide).map((f) => (
                <label key={f.key} className="block">
                  <span className={lbl}>{f.label}</span>
                  {f.type === 'select'
                    ? <select className="input w-full" value={editing[f.key] ?? f.options?.[0]} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}>
                        {(f.options ?? []).map((o) => <option key={o}>{o}</option>)}
                      </select>
                    : f.type === 'file'
                      ? <input type="file" className="input w-full" onChange={(e) => setEditing({ ...editing, [f.key]: e.target.files?.[0]?.name ?? '' })} />
                      : <input type={f.type ?? 'text'} className="input w-full" value={editing[f.key] ?? ''} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })} />}
                </label>
              ))}
            </div>
            {spec.fields.filter((f) => f.wide).map((f) => (
              <label key={f.key} className="block">
                <span className={lbl}>{f.label}</span>
                <textarea className="input w-full" rows={2} value={editing[f.key] ?? ''} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })} />
              </label>
            ))}
            <div className="flex justify-end gap-2 pt-1">
              {editing.id && <button className="btn-secondary" onClick={() => { setRows((p) => p.filter((x) => x.id !== editing.id)); setEditing(null); }}><Trash2 className="w-4 h-4" /> Delete</button>}
              <button className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn-primary" onClick={() => { saveRow(); setEditing(null); }}>Save</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ============================================================
   RESEARCH — data-driven tabs
   ============================================================ */
const f = (key: string, label: string, type?: FieldSpec['type'], options?: string[], wide = false): FieldSpec => ({ key, label, type, options, wide });

const SPEC_ACTIVITIES: RecordSpec = {
  kind: 'research-activity', singular: 'Research Activity',
  fields: [f('title', 'Research Title / Topic', 'text'), f('area', 'Research Area'),
    f('startDate', 'Start Date', 'date'), f('endDate', 'Expected Completion', 'date'),
    f('status', 'Current Status', 'select', ['Planned', 'Ongoing', 'Completed', 'On Hold']), f('description', 'Description', 'textarea')],
  cols: [{ key: 'title', header: 'Activity' }, { key: 'area', header: 'Area' }, { key: 'endDate', header: 'Target End' }, { key: 'status', header: 'Status' }],
  statusKey: 'status',
  stats: [
    { label: 'Total Activities', calc: (r) => r.length },
    { label: 'Ongoing', calc: (r) => r.filter((x) => x.status === 'Ongoing').length },
    { label: 'Completed', calc: (r) => r.filter((x) => x.status === 'Completed').length },
    { label: 'Planned / On Hold', calc: (r) => r.filter((x) => x.status === 'Planned' || x.status === 'On Hold').length },
  ],
};
const SEED_ACTIVITIES: Rec[] = [
  { id: 'ra1', title: 'Explainable AI for student performance prediction', area: 'Machine Learning', startDate: '2026-02-10', endDate: '2026-12-15', status: 'Ongoing', description: 'Interpretable models to identify at-risk students early using attendance and internal-assessment signals.' },
  { id: 'ra2', title: 'Federated learning for privacy-preserving campus analytics', area: 'Data Privacy', startDate: '2026-05-01', endDate: '2027-01-20', status: 'Ongoing', description: 'Multi-institution federated framework so colleges can benchmark outcomes without sharing raw student records.' },
  { id: 'ra3', title: 'Graph-based prerequisite mining from course registers', area: 'Educational Data Mining', startDate: '2025-06-15', endDate: '2026-03-30', status: 'Completed', description: 'Mined implicit subject prerequisites from five years of enrolment data; findings shared with the Board of Studies.' },
];

const SPEC_PROJECTS: RecordSpec = {
  kind: 'research-project', singular: 'Project',
  fields: [f('title', 'Project Title'), f('type', 'Project Type', 'select', ['Minor', 'Major', 'Sponsored', 'Consultancy']),
    f('role', 'My Role', 'select', ['Principal Investigator', 'Co-Investigator', 'Collaborator']), f('pi', 'Principal Investigator'),
    f('team', 'Collaborators'), f('startDate', 'Start Date', 'date'), f('endDate', 'End Date', 'date'),
    f('status', 'Project Status', 'select', ['Ongoing', 'Completed', 'On Hold']), f('file', 'Supporting Document', 'file')],
  cols: [{ key: 'title', header: 'Project' }, { key: 'role', header: 'Role' }, { key: 'pi', header: 'PI' }, { key: 'endDate', header: 'End Date' }, { key: 'status', header: 'Status' }],
  statusKey: 'status',
  stats: [
    { label: 'Projects', calc: (r) => r.length },
    { label: 'As PI', calc: (r) => r.filter((x) => x.role === 'Principal Investigator').length },
    { label: 'Ongoing', calc: (r) => r.filter((x) => x.status === 'Ongoing').length },
    { label: 'Completed', calc: (r) => r.filter((x) => x.status === 'Completed').length },
  ],
};
const SEED_PROJECTS: Rec[] = [
  { id: 'rp1', title: 'AI-enabled formative assessment engine', type: 'Major', role: 'Principal Investigator', pi: 'Dr. R. Kulkarni (Assoc. Prof.)', team: 'Dr. A. Nair; Ms. Fathima Z.', startDate: '2026-03-01', endDate: '2027-02-28', status: 'Ongoing' },
  { id: 'rp2', title: 'Smart timetable optimisation pilot', type: 'Sponsored', role: 'Co-Investigator', pi: 'Dr. Lakshmi Menon', team: 'Dr. R. Kulkarni', startDate: '2025-08-10', endDate: '2026-07-31', status: 'Ongoing' },
];

const SPEC_PUBS: RecordSpec = {
  kind: 'publication', singular: 'Publication',
  fields: [f('title', 'Publication Title'), f('authors', 'Authors'),
    f('venue', 'Journal / Conference'), f('type', 'Type', 'select', ['Journal Article', 'Conference Paper', 'Book Chapter', 'Book']),
    f('publisher', 'Publisher'), f('date', 'Publication Date', 'date'),
    f('doi', 'DOI / Identifier'), f('status', 'Status', 'select', ['Manuscript', 'Submitted', 'Under Review', 'Accepted', 'Published']),
    f('file', 'Supporting Document', 'file')],
  cols: [{ key: 'title', header: 'Title' }, { key: 'venue', header: 'Venue' }, { key: 'date', header: 'Date' }, { key: 'doi', header: 'DOI / ID' }, { key: 'status', header: 'Status' }],
  statusKey: 'status',
  stats: [
    { label: 'Publications', calc: (r) => r.length },
    { label: 'Published', calc: (r) => r.filter((x) => x.status === 'Published').length },
    { label: 'In Review', calc: (r) => r.filter((x) => x.status === 'Under Review').length },
  ],
};
const SEED_PUBS: Rec[] = [
  { id: 'pb1', title: 'Early-warning indicators for first-year engineering attrition: a comparative study', authors: 'R. Kulkarni, L. Menon', venue: 'IEEE Transactions on Education', type: 'Journal Article', publisher: 'IEEE', date: '2026-04-18', doi: '10.1109/TE.2026.3141xxx', status: 'Published', fileName: 'ieee-te-2026.pdf' },
  { id: 'pb2', title: 'A rubric-aware deep scoring model for short-answer assessments', authors: 'R. Kulkarni', venue: 'ACM SIGCSE Virtual', type: 'Conference Paper', publisher: 'ACM', date: '2026-08-02', doi: '—', status: 'Under Review', fileName: 'sigcse-submission.pdf' },
  { id: 'pb3', title: 'Federated analytics in higher education: survey and taxonomy', authors: 'R. Kulkarni, A. Nair, K. Rao', venue: 'Springer Education & IT Review', type: 'Journal Article', publisher: 'Springer', date: '—', doi: '—', status: 'Submitted' },
];

const SPEC_CONF: RecordSpec = {
  kind: 'conference-event', singular: 'Event',
  fields: [f('name', 'Event Name'), f('type', 'Event Type', 'select', ['Conference', 'Seminar', 'Workshop', 'FDP', 'Symposium']),
    f('organizer', 'Organizing Institution'), f('date', 'Date', 'date'), f('location', 'Location / Mode'),
    f('participation', 'Participation Type', 'select', ['Paper Presenter', 'Attendee', 'Session Chair', 'Resource Person']),
    f('paperTitle', 'Paper / Presentation Title'), f('fileName', 'Certificate / Document', 'file')],
  cols: [{ key: 'name', header: 'Event' }, { key: 'type', header: 'Type' }, { key: 'participation', header: 'Participation' }, { key: 'location', header: 'Location' }, { key: 'date', header: 'Date' }],
  stats: [
    { label: 'Events Attended', calc: (r) => r.length },
    { label: 'Presentations', calc: (r) => r.filter((x) => x.participation === 'Paper Presenter').length },
    { label: 'Certificates on File', calc: (r) => r.filter((x) => x.fileName).length },
  ],
};
const SEED_CONF: Rec[] = [
  { id: 'cf1', name: 'International Conference on Learning Analytics & Knowledge', type: 'Conference', organizer: 'Society for Learning Analytics Research', date: '2026-03-12', location: 'Bengaluru · Hybrid', participation: 'Paper Presenter', paperTitle: 'LAK-2026 paper on early-warning models', fileName: 'lak2026-certificate.pdf' },
  { id: 'cf2', name: 'National FDP — Outcome Based Education Frameworks', type: 'FDP', organizer: 'NITTTR Chandigarh', date: '2026-01-20', location: 'Online · MS Teams', participation: 'Attendee', paperTitle: '', fileName: 'fdp-obe-cert.pdf' },
];

const SPEC_FUNDING: RecordSpec = {
  kind: 'research-funding', singular: 'Proposal',
  fields: [f('title', 'Project Title'), f('agency', 'Funding Agency'),
    f('requested', 'Amount Requested (₹)', 'number'), f('sanctioned', 'Amount Sanctioned (₹)', 'number'),
    f('submittedOn', 'Submission Date', 'date'), f('duration', 'Project Duration'),
    f('status', 'Status', 'select', ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Ongoing', 'Completed']),
    f('fileName', 'Proposal / Sanction Letter', 'file')],
  cols: [{ key: 'title', header: 'Proposal' }, { key: 'agency', header: 'Agency' }, { key: 'requested', header: 'Requested' }, { key: 'duration', header: 'Duration' }, { key: 'status', header: 'Status' }],
  statusKey: 'status',
  stats: [
    { label: 'Proposals', calc: (r) => r.length },
    { label: 'Approved / Ongoing', calc: (r) => r.filter((x) => ['Approved', 'Ongoing'].includes(x.status)).length },
    { label: 'Sanctioned Amount', calc: (r) => `₹${(r.reduce((a, x) => a + (Number(x.sanctioned) || 0), 0)).toLocaleString('en-IN')}` },
    { label: 'In Review', calc: (r) => r.filter((x) => x.status === 'Under Review').length },
  ],
};
const SEED_FUNDING: Rec[] = [
  { id: 'rf1', title: 'Adaptive assessment engine for large engineering batches', agency: 'AICTE Research Promotion Scheme', requested: 1200000, sanctioned: 950000, submittedOn: '2026-01-15', duration: '2 years', status: 'Ongoing', file: 'aicte-sanction.pdf' },
  { id: 'rf2', title: 'Regional corpus for Kannada-English academic writing assistance', agency: 'DST SERB', requested: 2400000, sanctioned: 0, submittedOn: '2026-06-30', duration: '3 years', status: 'Under Review' },
];

/* Research · Documents */
const DOC_TYPES = ['Research Paper', 'Certificate', 'Project Document', 'Proposal Document', 'Grant Document', 'Conference Document', 'Other'];

function ResearchDocumentsTab() {
  const [docs, setDocs] = useState<Rec[]>([
    { id: 'rd1', name: 'IEEE TE 2026 final manuscript', type: 'Research Paper', related: 'Explainable AI for student performance prediction', uploaded: '2026-04-16', version: 'v3' },
    { id: 'rd2', name: 'LAK-2026 presentation slides', type: 'Conference Document', related: 'Early-warning indicators study', uploaded: '2026-03-10', version: 'v1' },
    { id: 'rd3', name: 'AICTE RPS sanction letter', type: 'Grant Document', related: 'Adaptive assessment engine project', uploaded: '2026-02-02', version: 'v1' },
    { id: 'rd4', name: 'SERB proposal draft', type: 'Proposal Document', related: 'Kannada-English corpus proposal', uploaded: '2026-06-28', version: 'v5' },
  ]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Rec>({ id: '' });
  const lbl = 'block mb-1 text-xs font-medium text-slate-600';
  const bump = (id: string) => setDocs((p) => p.map((x) => (x.id === id ? { ...x, version: `v${(Number(x.version.slice(1)) || 0) + 1}` } : x)));
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-slate-500">Centralised store of research records linked to your activities and projects.</p>
        <button className="btn-primary" onClick={() => { setAdding(true); setDraft({ id: '', name: '', type: DOC_TYPES[6], related: '', version: 'v1' }); }}><Upload className="w-4 h-4" /> Upload Document</button>
      </div>
      <DataTable rows={docs} emptyMessage="No documents uploaded"
        onRowClick={(d) => bump(d.id)}
        columns={[
          { key: 'name', header: 'Document Name', render: (d) => <span className="flex items-center gap-2 font-medium text-slate-900"><FileText className="w-4 h-4 text-indigo-500" />{d.name}</span> },
          { key: 'type', header: 'Type' },
          { key: 'related', header: 'Related Activity / Project' },
          { key: 'uploaded', header: 'Upload Date' },
          { key: 'version', header: 'Version' },
        ]} />
      <p className="text-xs text-slate-400 mt-3">Click a row to upload a newer version — previous versions are retained in the audit trail.</p>
      <Modal open={adding} onClose={() => setAdding(false)} title="Upload Research Document" size="sm">
        <div className="space-y-3">
          <label className="block"><span className={lbl}>File</span><input type="file" className="input w-full" onChange={(e) => setDraft({ ...draft, name: e.target.files?.[0]?.name ?? '' })} /></label>
          <label className="block"><span className={lbl}>Document Type</span>
            <select className="input w-full" value={draft.type ?? DOC_TYPES[6]} onChange={(e) => setDraft({ ...draft, type: e.target.value })}>
              {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select></label>
          <label className="block"><span className={lbl}>Related research activity / project</span><input className="input w-full" value={draft.related ?? ''} onChange={(e) => setDraft({ ...draft, related: e.target.value })} placeholder="Link to an activity or project title" /></label>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setAdding(false)}>Cancel</button>
            <button className="btn-primary" disabled={!draft.name} onClick={() => {
              const match = docs.find((x) => x.name === draft.name);
              setDocs((p) => match
                ? p.map((x) => (x.id === match.id ? { ...x, ...draft, id: x.id, uploaded: '2026-09-01', version: `v${(Number(x.version.slice(1)) || 0) + 1}` } : x))
                : [{ ...draft, id: `rd-${Date.now() % 100000}`, uploaded: '2026-09-01', version: 'v1' }, ...p]);
              setAdding(false);
            }}>Save</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* Research · Supervision (scholars assigned by the institution/HOD; hidden when none) */
function SupervisionTab({ scholars }: { scholars: PhdScholar[] }) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Research Scholars" value={scholars.length} icon={<Users className="w-5 h-5" />} accent="blue" />
        <StatCard label="Active" value={scholars.filter((s) => s.status === 'active').length} icon={<UserCheck className="w-5 h-5" />} accent="indigo" />
        <StatCard label="Avg Progress" value={`${Math.round(scholars.reduce((a, s) => a + s.progress, 0) / Math.max(scholars.length, 1))}%`} icon={<TrendingUp className="w-5 h-5" />} accent="emerald" />
        <StatCard label="Guidance Notes" value={Object.keys(notes).length} icon={<History className="w-5 h-5" />} accent="slate" />
      </div>
      <DataTable rows={scholars} columns={[
        { key: 'name', header: 'Scholar', render: (s) => (<span><span className="block font-medium text-slate-900">{s.name}</span><span className="text-xs text-slate-400">Year {s.year} · {s.qualification}</span></span>) },
        { key: 'topic', header: 'Research Topic' },
        { key: 'progress', header: 'Progress', render: (s) => <StatusPill value={Math.round(s.progress)} /> },
        { key: 'milestone', header: 'Next Milestone' },
        { key: 'publications', header: 'Pubs' },
        { key: 'st', header: 'Status', render: (s) => <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusTone(s.status)}`}>{s.status}</span> },
      ]} />
      <p className="text-xs text-slate-400 mt-3">Scholars are assigned by the institution/HOD. Meetings, guidance provided and milestones are maintained in each scholar's supervision history.</p>
    </div>
  );
}

/* ============================================================
   COMMITTEE WORK
   ============================================================ */
const SPEC_COMMITTEES: RecordSpec = {
  kind: 'committee', singular: 'Committee',
  fields: [f('name', 'Committee Name'), f('year', 'Academic Year'),
    f('role', 'Faculty Role', 'select', ['Member', 'Coordinator', 'Secretary']), f('dept', 'Department'),
    f('head', 'Committee Head / Coordinator'), f('status', 'Status', 'select', ['Active', 'Concluded'])],
  cols: [{ key: 'name', header: 'Committee' }, { key: 'role', header: 'My Role' }, { key: 'head', header: 'Coordinator' }, { key: 'year', header: 'Academic Year' }, { key: 'status', header: 'Status' }],
  statusKey: 'status',
  stats: [
    { label: 'My Committees', calc: (r) => r.length },
    { label: 'Active', calc: (r) => r.filter((x) => x.status === 'Active').length },
    { label: 'As Coordinator', calc: (r) => r.filter((x) => x.role !== 'Member').length },
  ],
};
const SEED_COMMITTEES: Rec[] = [
  { id: 'cm1', name: 'Board of Studies — BCA', year: '2026–27', role: 'Member', dept: 'BCA', head: 'Priyanka (HOD)', status: 'Active' },
  { id: 'cm2', name: 'College Examination Cell', year: '2026–27', role: 'Secretary', dept: 'Institution-wide', head: 'Dr. S. Iyer (Controller of Examinations)', status: 'Active' },
  { id: 'cm3', name: 'Library Advisory Committee', year: '2025–26', role: 'Member', dept: 'Institution-wide', head: 'Librarian N. Rao', status: 'Concluded' },
];
const COMMITTEE_HISTORY: Record<string, any[]> = {
  cm1: [
    { date: '2026-07-11', note: 'Reviewed and approved the 3rd-semester syllabus revision for Data Structures with Python.' },
    { date: '2026-05-23', note: 'Minutes action item: map course outcomes to program outcomes for two electives.' },
  ],
  cm2: [
    { date: '2026-08-02', note: 'Coordinated internal assessment timetable; clash-free schedule circulated.' },
    { date: '2026-06-19', note: 'Prepared valuation slot allocation for end-semester practical examinations.' },
  ],
};

function MyCommitteesTab() {
  const [selId, setSelId] = useState('');
  const [rows] = useState(SEED_COMMITTEES);
  const sel = rows.find((r) => r.id === selId) ?? rows[0];
  const history = sel ? COMMITTEE_HISTORY[sel.id] ?? [] : [];
  return (
    <div>
      <PageHeader title="My Committees" description="Assignments are made by authorized administrators — faculty cannot self-assign." />
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <DataTable rows={rows} onRowClick={(r) => setSelId(r.id)}
            columns={[
              { key: 'name', header: 'Committee', render: (r) => (
                <span>
                  <span className={`block font-medium ${r.id === sel?.id ? 'text-indigo-600' : 'text-slate-900'}`}>{r.name}</span>
                  <span className="text-xs text-slate-400">{r.role} · {r.year}</span>
                </span>) },
              { key: 'status', header: 'Status', render: (r) => <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusTone(r.status)}`}>{r.status}</span> },
            ]} />
        </div>
        {sel && (
          <div className="lg:col-span-3 space-y-4">
            <div className="card p-5">
              <p className="text-sm font-semibold text-slate-900">{sel.name}</p>
              <p className="text-xs text-slate-500 mt-1">Academic Year {sel.year} · {sel.dept} · Coordinator: {sel.head}</p>
              <p className="text-xs text-slate-500 mt-0.5">Your role: <span className="font-medium text-slate-700">{sel.role}</span></p>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Meeting / activity history</p>
            {history.length === 0 && <div className="card p-4 text-sm text-slate-500">No recorded activities for this committee yet.</div>}
            <div className="space-y-2">
              {history.map((h, i) => (
                <div key={i} className="card p-4">
                  <span className="text-sm font-medium text-slate-900">{h.date}</span>
                  <p className="text-xs text-slate-600 mt-1">{h.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* Committee · Committee Activities */
const TASK_STATUSES = ['Assigned', 'In Progress', 'Completed', 'Pending'];

function CommitteeActivitiesTab() {
  const [rows, setRows] = useState<Rec[]>([
    { id: 'ct1', committee: 'College Examination Cell', task: 'Prepare internal assessment timetable', date: '2026-08-02', status: 'In Progress', remarks: 'Draft circulated to HODs for review.' },
    { id: 'ct2', committee: 'Board of Studies — BCA', task: 'Map course outcomes to program outcomes for two electives', date: '2026-05-23', status: 'Assigned', remarks: '' },
    { id: 'ct3', committee: 'College Examination Cell', task: 'Valuation slot allocation — end-semester practicals', date: '2026-06-19', status: 'Completed', remarks: 'Approved by Controller of Examinations.' },
  ]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Rec>({ id: '', status: 'Assigned' });
  const lbl = 'block mb-1 text-xs font-medium text-slate-600';
  const done = rows.filter((r) => r.status === 'Completed').length;
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-slate-500">Work performed as part of your assigned committees.</p>
        <button className="btn-primary" onClick={() => { setAdding(true); setDraft({ id: '', status: 'Assigned' }); }}><Plus className="w-4 h-4" /> Record Activity</button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Activities" value={rows.length} icon={<ClipboardList className="w-5 h-5" />} accent="blue" />
        <StatCard label="Completed" value={done} icon={<CheckSquare className="w-5 h-5" />} accent="emerald" />
        <StatCard label="Open" value={rows.length - done} icon={<Clock className="w-5 h-5" />} accent="amber" />
        <StatCard label="Completion" value={`${rows.length ? Math.round((done / rows.length) * 100) : 0}%`} icon={<TrendingUp className="w-5 h-5" />} accent="indigo" />
      </div>
      <DataTable rows={rows} emptyMessage="No committee activities recorded"
        columns={[
          { key: 'task', header: 'Activity / Task', render: (r) => <span className="font-medium text-slate-900">{r.task}</span> },
          { key: 'committee', header: 'Committee' }, { key: 'date', header: 'Date' },
          { key: 'status', header: 'Status', render: (r) => (
            <select className="input w-auto py-1.5" value={r.status} onChange={(e) => setRows((p) => p.map((x) => (x.id === r.id ? { ...x, status: e.target.value } : x)))}>
              {TASK_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>) },
        ]} />
      <p className="text-xs text-slate-400 mt-3">Status changes are tracked as part of the committee's activity history.</p>
      <Modal open={adding} onClose={() => setAdding(false)} title="Record Committee Activity" size="sm">
        <div className="space-y-3">
          <label className="block"><span className={lbl}>Activity / Task</span><input className="input w-full" value={draft.task ?? ''} onChange={(e) => setDraft({ ...draft, task: e.target.value })} /></label>
          <label className="block"><span className={lbl}>Committee</span>
            <select className="input w-full" value={draft.committee ?? SEED_COMMITTEES[0].name} onChange={(e) => setDraft({ ...draft, committee: e.target.value })}>
              {[...new Set(SEED_COMMITTEES.map((c) => c.name))].map((n) => <option key={n}>{n}</option>)}
            </select></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className={lbl}>Date</span><input type="date" className="input w-full" value={draft.date ?? '2026-09-01'} onChange={(e) => setDraft({ ...draft, date: e.target.value })} /></label>
            <label className="block"><span className={lbl}>Status</span>
              <select className="input w-full" value={draft.status ?? 'Assigned'} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                {TASK_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select></label>
          </div>
          <label className="block"><span className={lbl}>Remarks</span><textarea className="input w-full" rows={2} value={draft.remarks ?? ''} onChange={(e) => setDraft({ ...draft, remarks: e.target.value })} /></label>
          <button className="btn-primary w-full" disabled={!draft.task?.trim()} onClick={() => { setRows((p) => [{ ...draft, id: `ct-${Date.now() % 100000}` }, ...p]); setAdding(false); }}>Save</button>
        </div>
      </Modal>
    </div>
  );
}

/* Committee · Examination Duties */
function ExamDutiesTab() {
  const { currentUser, data } = useStore();
  const [state, setState] = useState<Record<string, string>>({});
  const invigilation = data.exams
    .filter((e) => !currentUser || e.departmentId === currentUser.departmentId)
    .slice(0, 3)
    .map((e) => ({ id: `${e.id}-inv`, exam: e.examName, subject: e.subject, date: e.date, time: e.timing, venue: e.hall, type: 'Invigilation' }));
  const duties = [
    ...invigilation,
    { id: 'duty-qp', exam: 'Mid-Semester Internal 2026', subject: 'Design & Analysis of Algorithms', date: '2026-08-10', time: '—', venue: 'Dept. Office', type: 'Question Paper Setting' },
    { id: 'duty-val', exam: 'End-Semester Practicals 2026', subject: 'Database Management Systems', date: '2026-12-08', time: '09:30 – 16:00', venue: 'DB Lab', type: 'Valuation' },
  ];
  const tone = (s: string) => (s === 'completed' ? 'bg-emerald-50 text-emerald-700' : s === 'acknowledged' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600');
  return (
    <div>
      <PageHeader title="Examination Duties" description="Duties assigned by the examination cell / HOD — acknowledge and update completion here." />
      <DataTable rows={duties} emptyMessage="No examination duties assigned"
        columns={[
          { key: 'exam', header: 'Examination', render: (r) => <span className="font-medium text-slate-900">{r.exam}</span> },
          { key: 'type', header: 'Duty Type' }, { key: 'subject', header: 'Subject' },
          { key: 'date', header: 'Date', render: (r) => r.time === '—' ? r.date : <span>{r.date}<span className="block text-xs text-slate-400">{r.time}</span></span> },
          { key: 'venue', header: 'Venue' },
          { key: 'st', header: 'Status', render: (r) => {
            const s = state[r.id] ?? 'assigned';
            return (
              <span className="flex items-center gap-2">
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${tone(s)}`}>{s}</span>
                {s === 'assigned' && <button className="text-xs font-medium text-indigo-600 hover:underline" onClick={() => setState((p) => ({ ...p, [r.id]: 'acknowledged' }))}>Acknowledge</button>}
                {s === 'acknowledged' && <button className="text-xs font-medium text-emerald-600 hover:underline" onClick={() => setState((p) => ({ ...p, [r.id]: 'completed' }))}>Mark Completed</button>}
              </span>);
          } },
        ]} />
      <p className="text-xs text-slate-400 mt-3">Acknowledgements and completion updates are shared with the examination cell.</p>
    </div>
  );
}

/* ============================================================
   RESEARCH MODULE — manual research workspace of the faculty
   ============================================================ */
export function ResearchModule() {
  const { currentUser, data } = useStore();
  const [tab, setTab] = useState('activities');
  const myScholars = data.scholars.filter((s) => s.supervisor === currentUser?.name);
  const tabs: TabDef[] = [
    { id: 'activities', label: 'Research Activities' },
    { id: 'projects', label: 'Research Projects' },
    { id: 'publications', label: 'Publications' },
    { id: 'conferences', label: 'Conferences & Seminars' },
    { id: 'funding', label: 'Research Funding' },
    { id: 'documents', label: 'Research Documents' },
    ...(myScholars.length ? [{ id: 'supervision', label: 'Research Supervision' }] : []),
  ];
  return (
    <div>
      <Tabs tabs={tabs} active={tab} onChange={setTab} />
      {tab === 'activities' && <RecordWorkspace spec={SPEC_ACTIVITIES} seeds={SEED_ACTIVITIES} />}
      {tab === 'projects' && <RecordWorkspace spec={SPEC_PROJECTS} seeds={SEED_PROJECTS} />}
      {tab === 'publications' && <RecordWorkspace spec={SPEC_PUBS} seeds={SEED_PUBS} />}
      {tab === 'conferences' && <RecordWorkspace spec={SPEC_CONF} seeds={SEED_CONF} />}
      {tab === 'funding' && <RecordWorkspace spec={SPEC_FUNDING} seeds={SEED_FUNDING} />}
      {tab === 'documents' && <ResearchDocumentsTab />}
      {tab === 'supervision' && <SupervisionTab scholars={myScholars} />}
    </div>
  );
}

/* ============================================================
   COMMITTEE WORK MODULE — assignments come from administrators
   ============================================================ */
const SPEC_INSTITUTIONAL: RecordSpec = {
  kind: 'institutional-activity', singular: 'Activity',
  fields: [f('title', 'Activity Title'), f('type', 'Type', 'select', ['Workshop', 'Seminar', 'Academic Event', 'Accreditation Activity', 'Department Event', 'Student Activity', 'Institutional Program']),
    f('date', 'Date', 'date'), f('role', 'My Responsibility'),
    f('status', 'Status', 'select', ['Assigned', 'In Progress', 'Completed']),
    f('remarks', 'Remarks', 'textarea'), f('fileName', 'Supporting Document', 'file')],
  cols: [{ key: 'title', header: 'Activity' }, { key: 'type', header: 'Type' }, { key: 'role', header: 'Responsibility' }, { key: 'date', header: 'Date' }, { key: 'status', header: 'Status' }],
  statusKey: 'status',
  stats: [
    { label: 'Total Assigned', calc: (r) => r.length },
    { label: 'Completed', calc: (r) => r.filter((x) => x.status === 'Completed').length },
    { label: 'Open', calc: (r) => r.filter((x) => x.status !== 'Completed').length },
  ],
};
const SEED_INSTITUTIONAL: Rec[] = [
  { id: 'ia1', title: 'NAAC SSR documentation — Criterion 3 evidence compilation', type: 'Accreditation Activity', date: '2026-08-20', role: 'Department coordinator for research metrics', status: 'In Progress', remarks: 'Collect publication and grant data from all faculty.' },
  { id: 'ia2', title: 'Freshers orientation — technical quiz segment', type: 'Student Activity', date: '2026-07-18', role: 'Quiz master', status: 'Completed', remarks: '48 first-year students participated.', fileName: 'quiz-report.pdf' },
  { id: 'ia3', title: 'National Science Day exhibition judging panel', type: 'Academic Event', date: '2026-02-28', role: 'Judge — CS projects track', status: 'Completed', remarks: '' },
];

export function CommitteeModule() {
  const [tab, setTab] = useState('committees');
  const tabs: TabDef[] = [
    { id: 'committees', label: 'My Committees' },
    { id: 'activities', label: 'Committee Activities' },
    { id: 'duties', label: 'Examination Duties' },
    { id: 'institutional', label: 'Institutional Activities' },
  ];
  return (
    <div>
      <Tabs tabs={tabs} active={tab} onChange={setTab} />
      {tab === 'committees' && <MyCommitteesTab />}
      {tab === 'activities' && <CommitteeActivitiesTab />}
      {tab === 'duties' && <ExamDutiesTab />}
      {tab === 'institutional' && <RecordWorkspace spec={SPEC_INSTITUTIONAL} seeds={SEED_INSTITUTIONAL} />}
    </div>
  );
}
