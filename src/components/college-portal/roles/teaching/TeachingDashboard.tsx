import { useStore, deptName, deptCode, staffName, roleLabels } from '../../store/StoreContext';
import { classLabel, semShort, subjectTypeLabel, resourceShortLabel, resourceEffectiveStatus } from '../hod/subjectAllocationLogic';
import { getMenteesOfMentor } from '../hod/mentoringLogic';
import { WORK_CATEGORY_LABELS, TASK_PRIORITY_STYLES, formatIso } from '../hod/workloadLogic';
import type { SubjectAllocation, AssignedTask } from '../../data/types';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { DataTable, StatusBadge } from '../../components/DataTable';
import { Placeholder, RegisterComplaintView, LeaveManagementView } from '../../components/SharedViews';
import { MyResources } from '../../components/ResourceViews';
import { Modal } from '../../components/Modal';
import { BookOpen, GraduationCap, FlaskConical, ScrollText, Users, Calendar, Award, FileCheck, FileText, Beaker, Users2, Send, Plus, CheckSquare, XCircle, ClipboardCheck, ClipboardList, TrendingUp, AlertTriangle, UserCheck, Clock } from 'lucide-react';
import { useState } from 'react';
import type { Student, Subject, PhdScholar } from '../../data/types';
import { TeachingModule, ResearchModule, CommitteeModule } from './AssociateProfessorModule';
import { StudentDetailModal } from '../../components/DetailModals';
import { FacultyExamDuties } from '../exam/ExamWorkflow';

export function TeachingDashboard({ activeMenu }: { activeMenu: string }) {
  const { currentUser } = useStore();
  if (!currentUser) return null;
  const role = currentUser.role;

  if (activeMenu.endsWith('-timetable')) return <MyTimetable />;
  if (activeMenu.endsWith('-class')) return <MyClass />;
  if (activeMenu.endsWith('-resources')) return <MyResources />;
  if (activeMenu.endsWith('-tasks')) return <MyAssignedTasks />;
  if (activeMenu.endsWith('-complaint')) return <RegisterComplaintView />;
  if (activeMenu.endsWith('-apply-leave')) return <LeaveManagementView />;

  if (role === 'professor') {
    switch (activeMenu) {
      case 'pf-teaching': return <AdvancedTeaching />;
      case 'pf-phd': return <PhdGuidance />;
      case 'pf-research': return <ResearchLeadership />;
      case 'pf-policy': return <PolicyInput />;
    }
  }
  if (role === 'associate-professor') {
    switch (activeMenu) {
      case 'ap-teaching': return <TeachingModule />;
      case 'ap-research': return <ResearchModule />;
      case 'ap-committee': return <CommitteeModule />;
    }
  }
  if (role === 'assistant-professor') {
    switch (activeMenu) {
      case 'as-teaching': return <CoreTeaching />;
      case 'as-mentoring': return <MentoringView />;
      case 'as-research': return <ResearchProfile />;
    }
  }
  if (role === 'lecturer') {
    switch (activeMenu) {
      case 'lc-teaching': return <UndergradTeaching />;
      case 'lc-lab': return <LabSupervision />;
    }
  }
  if (role === 'teaching-assistant') {
    switch (activeMenu) {
      case 'ta-lab': return <TaLab />;
      case 'ta-tutorial': return <Tutorials />;
      case 'ta-grading': return <Grading />;
      case 'ta-research': return <ResearchSupport />;
    }
  }
  return <TeachingHome />;
}

function TeachingHome() {
  const { currentUser, data } = useStore();
  if (!currentUser) return null;
  const subs = data.subjects.filter((s) => s.facultyId === currentUser.id);
  const avgCompletion = subs.length ? Math.round(subs.reduce((a, s) => a + s.syllabusCompletion, 0) / subs.length) : 0;
  return (
    <div>
      <PageHeader title={`${currentUser.designation} Dashboard`} description={`${currentUser.name} · ${deptName(data, currentUser.departmentId)}`} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="My Subjects" value={subs.length} icon={<BookOpen className="w-5 h-5" />} accent="blue" />
        <StatCard label="My Classes" value={currentUser.classes.length} icon={<Users className="w-5 h-5" />} accent="indigo" />
        <StatCard label="Weekly Hours" value={currentUser.weeklyHours} icon={<Calendar className="w-5 h-5" />} accent="slate" />
        <StatCard label="Syllabus Done" value={`${avgCompletion}%`} icon={<Award className="w-5 h-5" />} accent={avgCompletion < 75 ? 'amber' : 'emerald'} />
      </div>
      <FacultyExamDuties />
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">My Subjects</h3>
        <div className="space-y-3">
          {subs.length === 0 ? <p className="text-sm text-slate-400">No subjects assigned yet. Subjects will appear here once allocated by the HOD.</p> :
          subs.map((s) => (
            <div key={s.id}>
              <div className="flex justify-between text-sm mb-1"><span className="font-medium text-slate-900">{s.name} ({s.code})</span><span className="text-slate-600">{s.syllabusCompletion}%</span></div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${s.syllabusCompletion < 70 ? 'bg-rose-500' : s.syllabusCompletion < 85 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${s.syllabusCompletion}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MyTimetable() {
  const { currentUser, data } = useStore();
  if (!currentUser) return null;
  const entries = data.timetable.filter((t) => t.facultyId === currentUser.id && t.published);
  return (
    <div>
      <PageHeader title="My Timetable" description="Your published teaching schedule" />
      {entries.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-4"><Calendar className="w-7 h-7 text-slate-400" /></div>
          <p className="text-sm font-medium text-slate-900">No published timetable yet</p>
          <p className="text-xs text-slate-500 mt-1">Your timetable will appear here once the HOD creates and publishes it.</p>
        </div>
      ) : (
        <DataTable
          rows={entries}
          columns={[
            { key: 'day', header: 'Day' },
            { key: 'slot', header: 'Time' },
            { key: 'subject', header: 'Subject' },
            { key: 'room', header: 'Room' },
            { key: 'section', header: 'Class', render: (t) => `${t.section} · Sem ${t.semester}` },
            { key: 'isLab', header: 'Type', render: (t) => t.isLab ? <span className="badge bg-blue-100 text-blue-700">Lab</span> : <span className="badge bg-slate-100 text-slate-600">Theory</span> },
          ]}
        />
      )}
    </div>
  );
}

function MyClass() {
  const { currentUser, data } = useStore();
  const [openAlloc, setOpenAlloc] = useState<{ alloc: SubjectAllocation; section: string } | null>(null);
  const [selected, setSelected] = useState<Student | null>(null);
  if (!currentUser) return null;

  /* My Classes come straight from the HOD's Subject Allocation — no manual setup */
  const myAllocs = data.subjectAllocations.filter((a) => a.facultyId === currentUser.id && a.status !== 'draft');
  const rows = myAllocs.flatMap((a) => {
    const subject = data.subjects.find((s) => s.id === a.subjectId);
    if (!subject) return [];
    return a.classIds.map((sec) => ({ id: `${a.id}-${sec}`, alloc: a, subject, section: sec }));
  });

  return (
    <div>
      <PageHeader title="My Classes" description="Assigned automatically by your HOD through Subject Allocation" />
      {rows.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-4"><Users className="w-7 h-7 text-slate-400" /></div>
          <p className="text-sm font-medium text-slate-900">No classes assigned yet</p>
          <p className="text-xs text-slate-500 mt-1">Your subjects, classes and resources will appear here once the HOD confirms your subject allocation.</p>
        </div>
      ) : (
        <>
          <DataTable
            rows={rows}
            columns={[
              { key: 'subject', header: 'Subject', render: (r) => <span className="font-medium text-slate-900">{r.subject.name}</span> },
              { key: 'code', header: 'Code', render: (r) => r.subject.code },
              { key: 'semester', header: 'Semester', render: (r) => semShort(r.subject.semester) },
              { key: 'class', header: 'Class', render: (r) => <span className="badge bg-blue-100 text-blue-700">{classLabel(r.subject.semester, r.section)}</span> },
              { key: 'type', header: 'Type', render: (r) => subjectTypeLabel(r.subject.type) },
              { key: 'role', header: 'Faculty Role', render: () => <span className="badge bg-slate-100 text-slate-600">Faculty</span> },
              { key: 'resources', header: 'Resources', render: (r) => resourceShortLabel(data, r.alloc.resourceIds) },
            ]}
            onRowClick={(r) => setOpenAlloc({ alloc: r.alloc, section: r.section })}
          />
          <p className="text-xs text-slate-400 mt-3">Click a class to open it — resources, students, syllabus and timetable come from the allocation.</p>
        </>
      )}

      {openAlloc && (
        <MyClassDetailModal
          alloc={openAlloc.alloc}
          section={openAlloc.section}
          onClose={() => setOpenAlloc(null)}
          onOpenStudent={(s) => { setOpenAlloc(null); setSelected(s); }}
        />
      )}
      <StudentDetailModal student={selected} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
}

/* Class workspace opened from My Classes — everything is derived from the allocation */
function MyClassDetailModal({
  alloc,
  section,
  onClose,
  onOpenStudent,
}: {
  alloc: SubjectAllocation;
  section: string;
  onClose: () => void;
  onOpenStudent: (s: Student) => void;
}) {
  const { currentUser, data } = useStore();
  if (!currentUser) return null;
  const subject = data.subjects.find((s) => s.id === alloc.subjectId);
  if (!subject) return null;
  const label = classLabel(subject.semester, section);
  const resources = alloc.resourceIds.map((id) => data.resources.find((r) => r.id === id)).filter((r): r is NonNullable<typeof r> => !!r);
  const students = data.students.filter((s) => s.departmentId === subject.departmentId && s.semester === subject.semester && s.section === section && s.status === 'active');
  const ttEntries = data.timetable.filter((t) => t.published && t.facultyId === currentUser.id && t.subject === subject.name && t.section === section && t.semester === subject.semester);
  const assignments = data.students.filter((s) => s.departmentId === subject.departmentId && s.projectSubject === subject.name && s.projectGuide === currentUser.name);

  return (
    <Modal open onClose={onClose} title={`${subject.name} — ${label}`} subtitle={`${subject.code} · ${semShort(subject.semester)} · ${subjectTypeLabel(subject.type)}`} size="xl">
      <div className="space-y-5">
        {/* Assigned resources */}
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Assigned Resources</p>
          {resources.length === 0 ? (
            <p className="text-sm text-slate-400">No resources assigned yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-2">
              {resources.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-2 p-3 rounded-lg bg-slate-50">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{r.name}</p>
                    <p className="text-xs text-slate-500">{r.location}{r.capacity ? ` · Capacity ${r.capacity}` : ''}</p>
                  </div>
                  <StatusBadge status={resourceEffectiveStatus(data, r)} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Syllabus & teaching progress */}
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="card p-3.5">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Syllabus Progress</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{subject.syllabusCompletion}%</p>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
              <div className={`h-full rounded-full ${subject.syllabusCompletion < 70 ? 'bg-rose-500' : subject.syllabusCompletion < 85 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${subject.syllabusCompletion}%` }} />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">{subject.unitsCompleted}/{subject.unitsTotal} units completed</p>
          </div>
          <div className="card p-3.5">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Assignments</p>
            {assignments.length === 0 ? <p className="text-sm text-slate-400 mt-2">No assignments published yet.</p> : <div className="mt-2 space-y-1.5">{Array.from(new Map(assignments.map((a) => [a.projectTitle, a])).values()).slice(0, 3).map((a) => <div key={a.projectTitle} className="text-xs text-slate-600"><span className="font-medium text-slate-800">{a.projectTitle}</span><span className="block">Due {a.projectDeadline} · {a.projectStatus}</span></div>)}</div>}
          </div>
          <div className="card p-3.5">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Assessments</p>
            <p className="text-sm text-slate-400 mt-2">No assessments scheduled yet.</p>
          </div>
        </div>

        {/* Timetable for this class (only when published) */}
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Timetable</p>
          {ttEntries.length === 0 ? (
            <div className="card p-4 text-center">
              <p className="text-sm text-slate-500">Timetable will be available after timetable publication.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {ttEntries.map((t) => (
                <span key={t.id} className="badge bg-blue-100 text-blue-700">{t.day} · {t.slot} · {t.room}</span>
              ))}
            </div>
          )}
        </div>

        {/* Students */}
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Students ({students.length})</p>
          <DataTable
            rows={students}
            columns={[
              { key: 'name', header: 'Name', render: (s) => <span className="font-medium text-slate-900">{s.name}</span> },
              { key: 'rollNo', header: 'Roll No' },
              { key: 'attendancePct', header: 'Attendance', render: (s) => `${s.attendancePct}%` },
            ]}
            onRowClick={(s) => onOpenStudent(s)}
            emptyMessage="No students found in this section."
          />
        </div>
      </div>
    </Modal>
  );
}

function AdvancedTeaching() {
  const { currentUser, data } = useStore();
  if (!currentUser) return null;
  const subs = data.subjects.filter((s) => s.facultyId === currentUser.id);
  return (
    <div>
      <PageHeader title="Advanced Teaching" description="Postgraduate and advanced course management" />
      <DataTable
        rows={subs}
        columns={[
          { key: 'name', header: 'Course', render: (s) => <span className="font-medium">{s.name}</span> },
          { key: 'code', header: 'Code' },
          { key: 'semester', header: 'Sem' },
          { key: 'syllabusCompletion', header: 'Completion', render: (s) => `${s.syllabusCompletion}%` },
        ]}
      />
    </div>
  );
}

function PhdGuidance() {
  const { data } = useStore();
  const [selected, setSelected] = useState<PhdScholar | null>(null);
  const scholars = data.scholars;
  return (
    <div>
      <PageHeader title="PhD Guidance" description="Supervise PhD scholars — double-click a scholar to view full details" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Scholars" value={scholars.length} icon={<GraduationCap className="w-5 h-5" />} accent="blue" />
        <StatCard label="Active" value={scholars.filter((s) => s.status === 'active').length} icon={<Users className="w-5 h-5" />} accent="emerald" />
        <StatCard label="Submitted" value={scholars.filter((s) => s.status === 'submitted').length} icon={<FileCheck className="w-5 h-5" />} accent="amber" />
        <StatCard label="Avg Progress" value={`${Math.round(scholars.reduce((a, s) => a + s.progress, 0) / scholars.length)}%`} icon={<Award className="w-5 h-5" />} accent="indigo" />
      </div>
      <DataTable
        rows={scholars}
        columns={[
          { key: 'name', header: 'Scholar', render: (s) => <span className="font-medium">{s.name}</span> },
          { key: 'topic', header: 'Research Topic' },
          { key: 'year', header: 'Year' },
          { key: 'milestone', header: 'Current Milestone' },
          { key: 'progress', header: 'Progress', render: (s) => (
            <div className="flex items-center gap-2"><div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600 rounded-full" style={{ width: `${s.progress}%` }} /></div><span className="text-xs">{s.progress}%</span></div>
          ) },
          { key: 'status', header: 'Status', render: (s) => <StatusBadge status={s.status} /> },
        ]}
        onRowDoubleClick={(s) => setSelected(s)}
      />
      <p className="text-xs text-slate-400 mt-3">Double-click a scholar to view full details.</p>
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ''} subtitle={selected?.topic} size="md">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-blue-700 text-white flex items-center justify-center text-lg font-semibold">{selected.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}</div>
              <div><h3 className="text-lg font-semibold text-slate-900">{selected.name}</h3><p className="text-sm text-slate-500">Year {selected.year} · {selected.milestone}</p><div className="mt-1"><StatusBadge status={selected.status} /></div></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div><dt className="text-xs text-slate-500 uppercase">Start Date</dt><dd className="text-sm text-slate-900 mt-0.5">{selected.startDate}</dd></div>
              <div><dt className="text-xs text-slate-500 uppercase">Year</dt><dd className="text-sm text-slate-900 mt-0.5">Year {selected.year}</dd></div>
              <div><dt className="text-xs text-slate-500 uppercase">Supervisor</dt><dd className="text-sm text-slate-900 mt-0.5">{selected.supervisor}</dd></div>
              <div><dt className="text-xs text-slate-500 uppercase">Qualification</dt><dd className="text-sm text-slate-900 mt-0.5">{selected.qualification}</dd></div>
              <div><dt className="text-xs text-slate-500 uppercase">Publications</dt><dd className="text-sm text-slate-900 mt-0.5">{selected.publications}</dd></div>
              <div><dt className="text-xs text-slate-500 uppercase">Current Milestone</dt><dd className="text-sm text-slate-900 mt-0.5">{selected.milestone}</dd></div>
            </div>
            <div className="card p-4"><p className="text-xs text-slate-500 uppercase mb-1">Research Topic</p><p className="text-sm text-slate-900">{selected.topic}</p></div>
            <div className="card p-4"><p className="text-xs text-slate-500 uppercase mb-1">Background</p><p className="text-sm text-slate-900">{selected.background}</p></div>
            <div>
              <p className="text-xs text-slate-500 uppercase mb-2">Progress</p>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600 rounded-full" style={{ width: `${selected.progress}%` }} /></div>
              <p className="text-xs text-slate-500 mt-1">{selected.progress}% complete</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function ResearchLeadership() {
  const { currentUser, data } = useStore();
  if (!currentUser) return null;
  const pubs = data.publications.filter((p) => p.facultyId === currentUser.id);
  const projects = data.researchProjects.filter((r) => r.facultyId === currentUser.id);
  return (
    <div>
      <PageHeader title="Research Leadership" description="Departmental research, funded projects, and publications" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Publications" value={pubs.length} icon={<FileText className="w-5 h-5" />} accent="indigo" />
        <StatCard label="Funded Projects" value={projects.length} icon={<FlaskConical className="w-5 h-5" />} accent="blue" />
        <StatCard label="Ongoing" value={projects.filter((r) => r.status === 'ongoing').length} icon={<FlaskConical className="w-5 h-5" />} accent="amber" />
        <StatCard label="Completed" value={projects.filter((r) => r.status === 'completed').length} icon={<FileCheck className="w-5 h-5" />} accent="emerald" />
      </div>
      <DataTable
        rows={pubs}
        columns={[
          { key: 'title', header: 'Title', render: (p) => <span className="font-medium">{p.title}</span> },
          { key: 'type', header: 'Type', render: (p) => <span className="badge bg-slate-100 text-slate-700 capitalize">{p.type}</span> },
          { key: 'journal', header: 'Venue' },
          { key: 'year', header: 'Year' },
        ]}
      />
    </div>
  );
}

function PolicyInput() {
  const { data, addPolicy, updatePolicy } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Academic', description: '', recommendations: '' });
  const policies = data.policies;

  const submit = () => {
    if (!form.title || !form.description) return;
    addPolicy({ id: `pol${Date.now()}`, title: form.title, category: form.category, status: 'under-review', submittedBy: 'Dr. Priya Sharma', date: new Date().toISOString().slice(0, 10), description: form.description, recommendations: form.recommendations });
    setShowForm(false);
    setForm({ title: '', category: 'Academic', description: '', recommendations: '' });
  };

  return (
    <div>
      <PageHeader title="Policy Input" description="Review academic policies, submit recommendations, and participate in policy discussions" action={<button className="btn-primary" onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4" /> Submit Policy Recommendation</button>} />
      {showForm && (
        <div className="card p-5 mb-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">New Policy Recommendation</h3>
          <div className="space-y-3">
            <input className="input" placeholder="Policy title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <select className="input w-auto" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Academic</option><option>Research</option><option>Student Welfare</option><option>Faculty</option><option>Administration</option></select>
            <textarea className="input" rows={3} placeholder="Policy description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <textarea className="input" rows={3} placeholder="Recommendations..." value={form.recommendations} onChange={(e) => setForm({ ...form, recommendations: e.target.value })} />
            <button className="btn-primary" onClick={submit}><Send className="w-4 h-4" /> Submit for Review</button>
          </div>
        </div>
      )}
      <div className="space-y-4">
        {policies.map((p) => (
          <div key={p.id} className="card p-5">
            <div className="flex items-start justify-between mb-2">
              <div><h3 className="text-sm font-semibold text-slate-900">{p.title}</h3><p className="text-xs text-slate-500">{p.category} · Submitted by {p.submittedBy} · {p.date}</p></div>
              <StatusBadge status={p.status} />
            </div>
            <p className="text-sm text-slate-700 mb-2">{p.description}</p>
            {p.recommendations && <div className="p-3 rounded-lg bg-slate-50"><p className="text-xs text-slate-500 mb-1">Recommendations</p><p className="text-sm text-slate-700">{p.recommendations}</p></div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function TeachingView() {
  const { currentUser, data } = useStore();
  if (!currentUser) return null;
  const subs = data.subjects.filter((s) => s.facultyId === currentUser.id);
  return (
    <div>
      <PageHeader title="Teaching" description="Assigned subjects, schedule, and course progress" />
      <DataTable
        rows={subs}
        columns={[
          { key: 'name', header: 'Subject', render: (s) => <span className="font-medium">{s.name}</span> },
          { key: 'code', header: 'Code' },
          { key: 'semester', header: 'Sem' },
          { key: 'classes', header: 'Classes', render: (s) => s.classes.join(', ') },
          { key: 'syllabusCompletion', header: 'Progress', render: (s) => `${s.syllabusCompletion}%` },
        ]}
      />
    </div>
  );
}

function ResearchSupervision() {
  const { data } = useStore();
  const scholars = [
    { id: 'ms1', name: 'Karthik S', level: 'PhD', topic: 'Edge Computing Optimization', progress: 60, status: 'active' },
    { id: 'ms2', name: 'Divya R', level: 'Masters', topic: 'IoT Security Framework', progress: 75, status: 'active' },
  ];
  return (
    <div>
      <PageHeader title="Research Supervision" description="Master's and PhD dissertation supervision" />
      <DataTable
        rows={scholars}
        columns={[
          { key: 'name', header: 'Scholar', render: (s) => <span className="font-medium">{s.name}</span> },
          { key: 'level', header: 'Level' },
          { key: 'topic', header: 'Topic' },
          { key: 'progress', header: 'Progress', render: (s) => (
            <div className="flex items-center gap-2"><div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600 rounded-full" style={{ width: `${s.progress}%` }} /></div><span className="text-xs">{s.progress}%</span></div>
          ) },
          { key: 'status', header: 'Status', render: (s) => <StatusBadge status={s.status} /> },
        ]}
      />
    </div>
  );
}

function CommitteeWork() {
  const committees = [
    { id: 'cm1', name: 'Academic Council', role: 'Member', nextMeeting: '2026-08-01' },
    { id: 'cm2', name: 'Research Committee', role: 'Chair', nextMeeting: '2026-07-28' },
    { id: 'cm3', name: 'Curriculum Review', role: 'Member', nextMeeting: '2026-08-10' },
  ];
  return (
    <div>
      <PageHeader title="Committee Work" description="Committee memberships and meeting schedules" />
      <DataTable
        rows={committees}
        columns={[
          { key: 'name', header: 'Committee', render: (c) => <span className="font-medium">{c.name}</span> },
          { key: 'role', header: 'Role' },
          { key: 'nextMeeting', header: 'Next Meeting' },
        ]}
      />
    </div>
  );
}

function CoreTeaching() {
  const { currentUser, data } = useStore();
  if (!currentUser) return null;
  const subs = data.subjects.filter((s) => s.facultyId === currentUser.id);
  return (
    <div>
      <PageHeader title="Core Teaching Load" description="Assigned teaching hours, subjects, and weekly workload" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="Weekly Hours" value={currentUser.weeklyHours} icon={<Calendar className="w-5 h-5" />} accent="slate" />
        <StatCard label="Subjects" value={subs.length} icon={<BookOpen className="w-5 h-5" />} accent="blue" />
        <StatCard label="Classes" value={currentUser.classes.length} icon={<Users className="w-5 h-5" />} accent="indigo" />
      </div>
      <DataTable
        rows={subs}
        columns={[
          { key: 'name', header: 'Subject', render: (s) => <span className="font-medium">{s.name}</span> },
          { key: 'code', header: 'Code' },
          { key: 'semester', header: 'Sem' },
          { key: 'syllabusCompletion', header: 'Progress', render: (s) => `${s.syllabusCompletion}%` },
        ]}
      />
    </div>
  );
}

function MentoringView() {
  /* Faculty-side "My Mentees" — reads the SAME central mentor–mentee allocations
     managed by the HOD in Mentoring Management (single source of truth). Faculty
     see only the students allocated to them, never other mentors' mentees. */
  const { currentUser, data } = useStore();
  const [selected, setSelected] = useState<Student | null>(null);
  if (!currentUser) return null;
  const mentees = getMenteesOfMentor(data, currentUser.id);
  const avgAtt = mentees.length ? Math.round(mentees.reduce((a, s) => a + s.attendancePct, 0) / mentees.length) : 0;
  const avgGpa = mentees.length ? (mentees.reduce((a, s) => a + s.gpa, 0) / mentees.length).toFixed(1) : '—';
  const needAttention = mentees.filter((s) => s.attendancePct < 75 || s.backlogs > 0).length;
  return (
    <div>
      <PageHeader title="My Mentees" description={`Students allocated to you for mentoring · ${deptName(data, currentUser.departmentId)}`} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="My Mentees" value={mentees.length} icon={<UserCheck className="w-5 h-5" />} accent="blue" />
        <StatCard label="Avg Attendance" value={mentees.length ? `${avgAtt}%` : '—'} icon={<TrendingUp className="w-5 h-5" />} accent="emerald" />
        <StatCard label="Avg GPA" value={avgGpa} icon={<Award className="w-5 h-5" />} accent="indigo" />
        <StatCard label="Need Attention" value={needAttention} icon={<AlertTriangle className="w-5 h-5" />} accent={needAttention ? 'amber' : 'slate'} />
      </div>
      <DataTable
        rows={mentees}
        emptyMessage="No mentees allocated yet — mentor allocations are managed by your HOD under Faculty Management → Mentoring Management"
        columns={[
          { key: 'name', header: 'Mentee', render: (s) => <span className="font-medium">{s.name}</span> },
          { key: 'rollNo', header: 'Roll No' },
          { key: 'semester', header: 'Semester', render: (s) => semShort(s.semester) },
          { key: 'section', header: 'Class', render: (s) => `${deptCode(data, s.departmentId)}-${s.section}` },
          { key: 'status', header: 'Status', render: () => <StatusBadge status="active" /> },
          { key: 'action', header: 'Action', render: (s) => (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              onClick={() => setSelected(s)}
            >
              View
            </button>
          ) },
        ]}
      />
      <StudentDetailModal student={selected} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function ResearchProfile() {
  const { currentUser, data } = useStore();
  if (!currentUser) return null;
  const pubs = data.publications.filter((p) => p.facultyId === currentUser.id);
  return (
    <div>
      <PageHeader title="Research Profile" description="Publications, conferences, projects, and grants" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Publications" value={currentUser.publications} icon={<FileText className="w-5 h-5" />} accent="indigo" />
        <StatCard label="Projects" value={currentUser.researchProjects} icon={<FlaskConical className="w-5 h-5" />} accent="blue" />
        <StatCard label="Conferences" value={2} icon={<Users2 className="w-5 h-5" />} accent="emerald" />
        <StatCard label="Grants" value={currentUser.researchProjects > 0 ? 1 : 0} icon={<Award className="w-5 h-5" />} accent="amber" />
      </div>
      <DataTable
        rows={pubs}
        columns={[
          { key: 'title', header: 'Title', render: (p) => <span className="font-medium">{p.title}</span> },
          { key: 'type', header: 'Type', render: (p) => <span className="badge bg-slate-100 text-slate-700 capitalize">{p.type}</span> },
          { key: 'journal', header: 'Venue' },
          { key: 'year', header: 'Year' },
        ]}
      />
    </div>
  );
}

function UndergradTeaching() {
  return <TeachingView />;
}

function LabSupervision() {
  const { currentUser, data } = useStore();
  if (!currentUser) return null;
  const labs = data.labs.filter((l) => l.inChargeId === currentUser.id || l.departmentId === currentUser.departmentId);
  return (
    <div>
      <PageHeader title="Lab Supervision" description="Laboratory sessions, batches, and experiment tracking" />
      <DataTable
        rows={labs}
        columns={[
          { key: 'name', header: 'Lab', render: (l) => <span className="font-medium">{l.name}</span> },
          { key: 'capacity', header: 'Capacity' },
          { key: 'systems', header: 'Systems' },
          { key: 'subjects', header: 'Subjects', render: (l) => l.subjects.join(', ') },
          { key: 'maintenanceStatus', header: 'Status', render: (l) => <StatusBadge status={l.maintenanceStatus} /> },
        ]}
      />
    </div>
  );
}

function TaLab() {
  return <LabSupervision />;
}

function Tutorials() {
  const tutorials = [
    { id: 't1', group: 'BCA-A Sem-3', subject: 'Data Structures', schedule: 'Wed 14:00-15:00', students: 17, attendance: 92 },
    { id: 't2', group: 'BCA-A Sem-2', subject: 'Python Programming', schedule: 'Fri 15:00-16:00', students: 17, attendance: 88 },
  ];
  return (
    <div>
      <PageHeader title="Tutorials" description="Tutorial schedules, attendance, and materials" />
      <DataTable
        rows={tutorials}
        columns={[
          { key: 'group', header: 'Group' },
          { key: 'subject', header: 'Subject', render: (t) => <span className="font-medium">{t.subject}</span> },
          { key: 'schedule', header: 'Schedule' },
          { key: 'students', header: 'Students' },
          { key: 'attendance', header: 'Attendance', render: (t) => `${t.attendance}%` },
        ]}
      />
    </div>
  );
}

function Grading() {
  const { currentUser, data } = useStore();
  if (!currentUser) return null;
  const students = data.students.filter((s) => s.departmentId === currentUser.departmentId).slice(0, 8);
  return (
    <div>
      <PageHeader title="Grading" description="Evaluate assignments and enter marks" />
      <DataTable
        rows={students}
        columns={[
          { key: 'name', header: 'Student', render: (s) => <span className="font-medium">{s.name}</span> },
          { key: 'rollNo', header: 'Roll No' },
          { key: 'internalMarks', header: 'Marks Entered', render: (s) => s.internalMarks.length },
          { key: 'status', header: 'Status', render: () => <StatusBadge status="completed" /> },
        ]}
      />
    </div>
  );
}

function ResearchSupport() {
  const { currentUser, data } = useStore();
  if (!currentUser) return null;
  const tasks = [
    { id: 'rs1', title: 'Literature Review - Blockchain Consensus', faculty: 'Dr. Priya Sharma', status: 'in-progress', deadline: '2026-07-30', description: 'Collect and summarize recent papers on consensus mechanisms for the funded project on academic credentialing.' },
    { id: 'rs2', title: 'Data Collection - Federated Learning', faculty: 'Dr. Priya Sharma', status: 'in-progress', deadline: '2026-08-15', description: 'Assist with dataset preparation and preprocessing for the federated learning privacy experiments.' },
    { id: 'rs3', title: 'Documentation - ZKP Systems', faculty: 'Dr. Priya Sharma', status: 'completed', deadline: '2026-07-10', description: 'Prepare documentation for the zero-knowledge proof system implementation.' },
    { id: 'rs4', title: 'Experiment Setup - Edge Computing', faculty: 'Dr. Arjun Nair', status: 'pending', deadline: '2026-08-01', description: 'Set up benchmarking environment for edge computing optimization experiments.' },
  ];
  return (
    <div>
      <PageHeader title="Research Support" description="Assist faculty with research data collection, documentation, literature reviews, and project tasks" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Tasks" value={tasks.length} icon={<ClipboardCheck className="w-5 h-5" />} accent="blue" />
        <StatCard label="In Progress" value={tasks.filter((t) => t.status === 'in-progress').length} icon={<FlaskConical className="w-5 h-5" />} accent="amber" />
        <StatCard label="Completed" value={tasks.filter((t) => t.status === 'completed').length} icon={<CheckSquare className="w-5 h-5" />} accent="emerald" />
        <StatCard label="Pending" value={tasks.filter((t) => t.status === 'pending').length} icon={<FileText className="w-5 h-5" />} accent="rose" />
      </div>
      <div className="space-y-3">
        {tasks.map((t) => (
          <div key={t.id} className="card p-4">
            <div className="flex items-start justify-between mb-2">
              <div><h3 className="text-sm font-semibold text-slate-900">{t.title}</h3><p className="text-xs text-slate-500">Assigned by {t.faculty} · Deadline: {t.deadline}</p></div>
              <StatusBadge status={t.status} />
            </div>
            <p className="text-sm text-slate-700">{t.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
/* ============================================================
 * My Assigned Tasks — tasks assigned by the HOD via the
 * Workload page appear here automatically, with status updates.
 * ============================================================ */
function MyAssignedTasks() {
  const { data, currentUser, updateAssignedTask } = useStore();
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  if (!currentUser) return null;

  const tasks = data.assignedTasks.filter((t) => t.facultyId === currentUser.id);
  const categories = [...new Set(tasks.map((t) => t.category))];
  const filtered = tasks.filter(
    (t) =>
      (statusFilter === 'all' || t.status === statusFilter) &&
      (categoryFilter === 'all' || t.category === categoryFilter)
  );

  const setStatus = (id: string, status: AssignedTask['status']) => updateAssignedTask(id, { status });

  return (
    <div>
      <PageHeader title="Assigned Tasks" description="Tasks assigned by the HOD — track and update your status" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Tasks" value={tasks.length} icon={<ClipboardCheck className="w-5 h-5" />} accent="blue" />
        <StatCard label="Pending" value={tasks.filter((t) => t.status === 'pending').length} icon={<Clock className="w-5 h-5" />} accent="amber" />
        <StatCard label="In Progress" value={tasks.filter((t) => t.status === 'in-progress').length} icon={<TrendingUp className="w-5 h-5" />} accent="indigo" />
        <StatCard label="Completed" value={tasks.filter((t) => t.status === 'completed').length} icon={<CheckSquare className="w-5 h-5" />} accent="emerald" />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select className="input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="on-hold">On Hold</option>
        </select>
        <select className="input w-auto" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{WORK_CATEGORY_LABELS[c] ?? c}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-4">
            <ClipboardList className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-900">No assigned tasks</p>
          <p className="text-xs text-slate-500 mt-1">Tasks assigned by the HOD from the Workload page will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => {
            const overdue = t.deadline && t.status !== 'completed' && t.deadline < new Date().toISOString().slice(0, 10);
            return (
              <div key={t.id} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-900">{t.title}</h4>
                      <span className={`badge ${TASK_PRIORITY_STYLES[t.priority] ?? 'bg-slate-100 text-slate-600'} capitalize`}>{t.priority}</span>
                      <span className="badge bg-slate-100 text-slate-600">{WORK_CATEGORY_LABELS[t.category] ?? t.category}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{t.description || 'No description provided.'}</p>
                    {t.remarks && <p className="text-xs text-slate-500 mt-1 italic">Remarks: {t.remarks}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge status={t.status} />
                    <span className="text-xs font-semibold text-slate-700">{t.allocatedHours} hr{t.allocatedHours > 1 ? 's' : ''} allocated</span>
                  </div>
                </div>
<div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-slate-500">Assigned by</p>
                    <p className="font-medium text-slate-800 mt-0.5">{staffName(data, t.assignedBy)}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-slate-500">Assigned date</p>
                    <p className="font-medium text-slate-800 mt-0.5">{formatIso(t.assignedDate)}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-slate-500">Workload date</p>
                    <p className="font-medium text-slate-800 mt-0.5">{formatIso(t.date)}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-slate-500">Deadline</p>
                    <p className={`font-medium mt-0.5 ${overdue ? 'text-rose-600' : 'text-slate-800'}`}>{formatIso(t.deadline)}{overdue ? ' · overdue' : ''}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">Update status:</span>
                  {(['pending', 'in-progress', 'completed', 'on-hold'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(t.id, s)}
                      className={`badge transition-colors ${t.status === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} capitalize`}
                    >
                      {s === 'in-progress' ? 'In Progress' : s === 'on-hold' ? 'On Hold' : s}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
