import { useStore, deptName, deptCode, staffName, roleLabels } from '../../store/StoreContext';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { DataTable, StatusBadge } from '../../components/DataTable';
import { Placeholder, LeaveManagementView } from '../../components/SharedViews';
import { CurriculumOversight } from './CurriculumOversight';
import { BarChart3, TrendingUp, Award, FileText, FlaskConical, Users, Users2, CheckSquare, XCircle, AlertTriangle, Download, FileCheck } from 'lucide-react';
import { useState } from 'react';
import type { ApprovalRequest, Candidate, Staff } from '../../data/types';
import { ExaminationReviewWorkspace } from '../exam/ExamWorkflow';
import { DeanHiringRequests } from '../hod/FacultyHiringRequest';

export function DeanDashboard({ activeMenu }: { activeMenu: string }) {
switch (activeMenu) {
    case 'd-curriculum': return <CurriculumOversight />;
    case 'd-apply-leave': return <LeaveManagementView />;
    case 'd-exam-approvals': return <ExaminationReviewWorkspace reviewer="dean" />;
    case 'd-faculty-recruitment': return <FacultyRecruitment />;
    case 'd-recruit': return <RecruitmentRequests />;
    case 'd-shortlist': return <ShortlistedCandidates />;
    case 'd-vacancy': return <VacancyWorkload />;
    case 'd-candidate': return <CandidateReview />;
    case 'd-rec-status': return <RecommendationStatus />;
    case 'd-rec-reports': return <RecruitmentReports />;
    case 'd-teaching-q': return <TeachingStandardsFilter />;
    case 'd-results': return <ResultAnalysisFilter />;
    case 'd-accred': return <AccreditationReadiness />;
    case 'd-promo': return <PromotionRequests />;
    case 'd-research': return <ResearchManagement />;
    case 'd-dept-reports': return <DeptReports />;
    case 'd-hod-mgmt': return <HodManagement />;
    default: return <DeanHome />;
  }
}

function DeptSelector({ value, onChange, label = 'Department' }: { value: string; onChange: (v: string) => void; label?: string }) {
  const { data } = useStore();
  return (
    <select className="input w-auto" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="all">{label}: All</option>
      {data.departments.map((d) => <option key={d.id} value={d.id}>{d.code} - {d.name}</option>)}
    </select>
  );
}

function DeanHome() {
  const { data } = useStore();
  const pendingRec = data.approvals.filter((a) => (a.type === 'recruitment' || a.type === 'promotion') && a.status === 'pending').length;
  return (
    <div>
      <PageHeader title="Dean Dashboard" description="Monitoring, review, and recommendation across departments" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Departments" value={data.departments.length} icon={<BarChart3 className="w-5 h-5" />} accent="slate" />
        <StatCard label="HODs" value={data.staff.filter((s) => s.role === 'hod').length} icon={<Users2 className="w-5 h-5" />} accent="blue" />
        <StatCard label="Pending Reviews" value={pendingRec} icon={<CheckSquare className="w-5 h-5" />} accent="amber" />
        <StatCard label="Publications" value={data.publications.length} icon={<FileText className="w-5 h-5" />} accent="indigo" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Syllabus Progress by Department</h3>
          <div className="space-y-3">
            {data.departments.map((d) => {
              const subs = data.subjects.filter((s) => s.departmentId === d.id);
              const avg = subs.length ? Math.round(subs.reduce((a, s) => a + s.syllabusCompletion, 0) / subs.length) : 0;
              return (
                <div key={d.id}>
                  <div className="flex justify-between text-sm mb-1"><span className="font-medium text-slate-900">{d.code}</span><span className="text-slate-600">{avg}%</span></div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${avg < 70 ? 'bg-rose-500' : avg < 85 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${avg}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Pending Recommendations</h3>
          <div className="space-y-2">
            {data.approvals.filter((a) => (a.type === 'recruitment' || a.type === 'promotion') && a.status === 'pending').map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <div><p className="text-sm font-medium text-slate-900">{a.title}</p><p className="text-xs text-slate-500">{a.submittedBy} · {a.date}</p></div>
                <StatusBadge status={a.status} />
              </div>
            ))}
            {data.approvals.filter((a) => (a.type === 'recruitment' || a.type === 'promotion') && a.status === 'pending').length === 0 && <p className="text-sm text-slate-400">No pending reviews.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function FacultyRecruitment() {
  const [activeTab, setActiveTab] = useState<'shortlist' | 'promotion'>('shortlist');

  const tabs = [
    { id: 'shortlist', label: 'Shortlisted Candidates', icon: Users },
    { id: 'promotion', label: 'Promotion Request', icon: TrendingUp },
  ] as const;

  return (
    <div>
      <PageHeader
        title="Faculty Recruitment"
        description="Shortlisted candidates, promotion requests, and HR recruitment requests in one place"
      />
      <div className="card inline-flex items-center gap-1 p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>
      {activeTab === 'shortlist' ? <ShortlistedCandidates /> : <PromotionRequests />}
      <div className="mt-6"><DeanHiringRequests /></div>
    </div>
  );
}

function RecruitmentRequests() {
  const { data, currentUser, addApproval, addNotification } = useStore();
  const [departmentId, setDepartmentId] = useState(data.departments[0]?.id ?? '');
  const [subject, setSubject] = useState('');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [vacancy, setVacancy] = useState('1');
  const [qualification, setQualification] = useState('');
  const [requirements, setRequirements] = useState('');
  const [justification, setJustification] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const rows = data.approvals.filter((a) => a.type === 'recruitment' && a.submittedByRole === 'dean');

  const submitRequest = () => {
    if (!subject.trim() || !qualification.trim() || !requirements.trim()) return;
    const title = `Recruitment Request - ${designation}`;
    addApproval({
      id: `a${Date.now()}`,
      type: 'recruitment',
      title,
      submittedBy: currentUser?.name ?? 'Dean',
      submittedByRole: 'dean',
      departmentId,
      date: new Date().toISOString().slice(0, 10),
      purpose: `Recruitment for ${subject}`,
      status: 'pending',
      details: { subject, designation, vacancy, qualification, requirements, justification },
      documents: [],
      shortlistedCandidateIds: [],
    });
    addNotification({
      id: `n${Date.now()}`,
      title: 'Recruitment request submitted',
      message: `${title} has been sent for HOD shortlist review.`,
      date: new Date().toISOString().slice(0, 10),
      audience: ['hod'],
      read: false,
    });
    setSubject('');
    setDesignation('Assistant Professor');
    setVacancy('1');
    setQualification('');
    setRequirements('');
    setJustification('');
    setSubmitted(true);
  };

  return (
    <div>
      <PageHeader title="Send Recruitment Request" description="Submit faculty recruitment requirements for HR review and HOD shortlist." />
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="card p-5 lg:col-span-2">
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
              <select className="input w-full" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                {data.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Subject / Area</label>
              <input className="input w-full" placeholder="e.g. AI/ML Electives" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Designation</label>
                <input className="input w-full" value={designation} onChange={(e) => setDesignation(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Vacancy</label>
                <input className="input w-full" type="number" min="1" value={vacancy} onChange={(e) => setVacancy(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Required Qualification</label>
              <input className="input w-full" placeholder="e.g. PhD in Computer Science" value={qualification} onChange={(e) => setQualification(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Requirements</label>
              <textarea className="input w-full" rows={3} placeholder="Experience, skill set, lab supervision needs" value={requirements} onChange={(e) => setRequirements(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Justification</label>
              <textarea className="input w-full" rows={3} placeholder="Why this hire is needed" value={justification} onChange={(e) => setJustification(e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <button className="btn-primary" onClick={submitRequest}>Send to HR / HOD</button>
              {submitted && <span className="text-sm text-emerald-700">Request submitted successfully.</span>}
            </div>
          </div>
        </div>
        <div className="card p-5 lg:col-span-1 bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Request Guidance</h3>
          <p className="text-sm text-slate-600">Use this form to capture the key faculty recruitment requirement for a subject or specialisation. The HOD will shortlist candidates based on the requirement and forward the shortlist for Dean approval.</p>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <p><span className="font-semibold">Subject / Area:</span> what is the teaching area or lab requirement?</p>
            <p><span className="font-semibold">Qualification:</span> specify minimum academic requirement.</p>
            <p><span className="font-semibold">Requirements:</span> include experience, research, and lab support needs.</p>
          </div>
        </div>
      </div>
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Existing recruitment requests</h3>
        <DataTable
          rows={rows}
          columns={[
            { key: 'title', header: 'Request', render: (a) => <span className="font-medium">{a.title}</span> },
            { key: 'departmentId', header: 'Dept', render: (a) => deptCode(data, a.departmentId) },
            { key: 'date', header: 'Date' },
            { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.status} /> },
          ]}
          emptyMessage="No recruitment requests submitted yet."
        />
      </div>
    </div>
  );
}

function ShortlistedCandidates() {
  const { data, updateApproval, addNotification } = useStore();
  const [selected, setSelected] = useState<ApprovalRequest | null>(null);
  const [remarks, setRemarks] = useState('');
  const rows = data.approvals.filter((a) => a.type === 'recruitment' && a.submittedByRole === 'dean' && a.status === 'pending' && (a.shortlistedCandidateIds?.length ?? 0) > 0);
  const shortlistedCandidates = selected?.shortlistedCandidateIds?.length ? data.candidates.filter((c) => selected.shortlistedCandidateIds?.includes(c.id)) : [];

  const actOnShortlist = (approved: boolean) => {
    if (!selected) return;
    const newStatus = approved ? 'dean-recommended' : 'dean-rejected';
    updateApproval(selected.id, { status: newStatus, deanStatus: approved ? 'recommended' : 'rejected', deanRemarks: remarks });
    addNotification({
      id: `n${Date.now()}`,
      title: `Recruitment shortlist ${approved ? 'approved' : 'rejected'}`,
      message: `${selected.title} has been ${approved ? 'approved' : 'rejected'} by the Dean and ${approved ? 'sent to Principal' : 'returned for review'}.`,
      date: new Date().toISOString().slice(0, 10),
      audience: ['principal'],
      read: false,
    });
    setSelected(null);
    setRemarks('');
  };

  return (
    <div>
      <PageHeader title="Shortlisted Candidates" description="Review candidate shortlists submitted by HODs before sending them for Principal approval." />
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="card p-5 lg:col-span-1">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Shortlisted Recruitment Requests</h3>
          <div className="space-y-3">
            {rows.length === 0 && <p className="text-sm text-slate-400">No shortlisted recruitment requests are pending your review.</p>}
            {rows.map((request) => (
              <button
                key={request.id}
                type="button"
                onClick={() => { setSelected(request); setRemarks(''); }}
                className={`w-full text-left p-3 rounded-xl border ${selected?.id === request.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'} hover:border-blue-400 transition`}
              >
                <p className="font-medium text-slate-900">{request.title}</p>
                <p className="text-xs text-slate-500">{deptCode(data, request.departmentId)} · {request.date}</p>
                <div className="mt-2 text-xs text-slate-600">{request.shortlistedCandidateIds?.length ?? 0} shortlisted</div>
              </button>
            ))}
          </div>
        </div>
        <div className="card p-5 lg:col-span-2">
          {selected ? (
            <>
              <div className="mb-4">
                <h3 className="text-base font-semibold text-slate-900">{selected.title}</h3>
                <p className="text-sm text-slate-500">Submitted by {selected.submittedBy} on {selected.date}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="card p-3 bg-slate-50">
                  <p className="text-xs text-slate-500">Subject / Area</p>
                  <p className="text-sm text-slate-900 mt-1">{selected.details.subject}</p>
                </div>
                <div className="card p-3 bg-slate-50">
                  <p className="text-xs text-slate-500">Required Qualification</p>
                  <p className="text-sm text-slate-900 mt-1">{selected.details.qualification}</p>
                </div>
              </div>
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Shortlist Details</h4>
                <p className="text-sm text-slate-700 mb-3">{selected.details.requirements}</p>
                <div className="space-y-3">
                  {shortlistedCandidates.map((candidate) => (
                    <div key={candidate.id} className="card p-3 border border-slate-200 rounded-xl">
                      <p className="font-medium text-slate-900">{candidate.name}</p>
                      <p className="text-xs text-slate-500">{candidate.qualification} · {candidate.experience}</p>
                      {selected?.shortlistedCandidateNotes?.[candidate.id] && <p className="text-sm text-slate-700 mt-2"><span className="font-medium">HOD note:</span> {selected.shortlistedCandidateNotes[candidate.id]}</p>}
                      <p className="text-sm text-slate-700 mt-2">{candidate.interviewNotes || 'Profile ready for Principal review.'}</p>
                    </div>
                  ))}
                </div>
              </div>
              <textarea className="input" rows={3} placeholder="Add remarks for Principal review" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
              <div className="flex gap-2 mt-4">
                <button className="btn-success flex-1" onClick={() => actOnShortlist(true)}><CheckSquare className="w-4 h-4" /> Send to Principal</button>
                <button className="btn-danger flex-1" onClick={() => actOnShortlist(false)}><XCircle className="w-4 h-4" /> Reject</button>
              </div>
            </>
          ) : (
            <div className="text-sm text-slate-500">Select a shortlisted request to review candidates and forward it to the Principal.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function VacancyWorkload() {
  const { data } = useStore();
  return (
    <div>
      <PageHeader title="Vacancy & Workload Review" description="Faculty strength, vacancies, student-to-faculty ratio, and workload" />
      <DataTable
        rows={data.departments.map((d) => {
          const faculty = data.staff.filter((s) => s.departmentId === d.id && ['professor', 'associate-professor', 'assistant-professor', 'lecturer', 'teaching-assistant'].includes(s.role));
          const ratio = faculty.length ? Math.round(d.studentCount / faculty.length) : 0;
          const avgHours = faculty.length ? Math.round(faculty.reduce((a, f) => a + f.weeklyHours, 0) / faculty.length) : 0;
          const overloaded = faculty.filter((f) => f.weeklyHours > 42).length;
          const vacancy = Math.max(0, 10 - faculty.length);
          return { id: d.id, name: d.name, code: d.code, strength: faculty.length, students: d.studentCount, ratio, vacancy, avgHours, overloaded };
        })}
        columns={[
          { key: 'name', header: 'Department', render: (d) => <span className="font-medium">{d.name}</span> },
          { key: 'strength', header: 'Faculty Strength' },
          { key: 'vacancy', header: 'Vacancies', render: (d) => <span className={d.vacancy > 0 ? 'text-amber-600 font-semibold' : ''}>{d.vacancy}</span> },
          { key: 'students', header: 'Students' },
          { key: 'ratio', header: 'S:F Ratio', render: (d) => `${d.ratio}:1` },
          { key: 'avgHours', header: 'Avg Weekly Hours', render: (d) => `${d.avgHours} hrs` },
          { key: 'overloaded', header: 'Overloaded Faculty', render: (d) => <span className={d.overloaded > 0 ? 'text-rose-600 font-semibold' : ''}>{d.overloaded}</span> },
        ]}
      />
    </div>
  );
}

function CandidateReview() {
  const { data } = useStore();
  const [selected, setSelected] = useState<Candidate | null>(null);
  return (
    <div>
      <PageHeader title="Candidate Review" description="Shortlisted candidate profiles, qualifications, and supporting documents" />
      <DataTable
        rows={data.candidates}
        columns={[
          { key: 'name', header: 'Candidate', render: (c) => <span className="font-medium">{c.name}</span> },
          { key: 'qualification', header: 'Qualification' },
          { key: 'experience', header: 'Experience' },
          { key: 'appliedFor', header: 'Applied For' },
          { key: 'status', header: 'Status', render: (c) => <StatusBadge status={c.status} /> },
        ]}
        onRowClick={(c) => setSelected(c)}
      />
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative max-w-lg w-full bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 sticky top-0 bg-white flex items-center justify-between">
              <div><h2 className="text-lg font-semibold text-slate-900">{selected.name}</h2><p className="text-sm text-slate-500">{selected.appliedFor}</p></div>
              <StatusBadge status={selected.status} />
            </div>
            <div className="px-6 py-5 space-y-3">
              <dl className="grid grid-cols-2 gap-4">
                <div><dt className="text-xs text-slate-500">Qualification</dt><dd className="text-sm text-slate-900 mt-0.5">{selected.qualification}</dd></div>
                <div><dt className="text-xs text-slate-500">Experience</dt><dd className="text-sm text-slate-900 mt-0.5">{selected.experience}</dd></div>
                {selected.interviewScore > 0 && <div><dt className="text-xs text-slate-500">Interview Score</dt><dd className="text-sm text-slate-900 mt-0.5 font-semibold">{selected.interviewScore}/100</dd></div>}
              </dl>
              {selected.interviewNotes && <div className="card p-3"><p className="text-xs text-slate-500">Interview Notes</p><p className="text-sm text-slate-900 mt-1">{selected.interviewNotes}</p></div>}
              <div>
                <p className="text-xs text-slate-500 mb-2">Supporting Documents</p>
                <div className="space-y-2">
                  {selected.documents.map((doc) => (
                    <div key={doc.id} className="card p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3"><FileText className="w-5 h-5 text-slate-400" /><div><p className="text-sm font-medium text-slate-900">{doc.name}</p><p className="text-xs text-slate-500">{doc.type} · {doc.size}</p></div></div>
                      <button className="btn-secondary text-xs"><Download className="w-3.5 h-3.5" /> View</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end"><button className="btn-secondary" onClick={() => setSelected(null)}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

function RecommendationStatus() {
  const { data } = useStore();
  const rows = data.approvals.filter((a) => a.type === 'recruitment' || a.type === 'promotion');
  return (
    <div>
      <PageHeader title="Recommendation & Status Tracking" description="Track recommendations forwarded to the Principal" />
      <DataTable
        rows={rows}
        columns={[
          { key: 'title', header: 'Request', render: (a) => <span className="font-medium">{a.title}</span> },
          { key: 'submittedBy', header: 'HOD' },
          { key: 'deanStatus', header: 'Dean Decision', render: (a) => a.deanStatus ? <StatusBadge status={a.deanStatus} /> : <span className="text-slate-400">Pending</span> },
          { key: 'deanRemarks', header: 'Dean Remarks', render: (a) => a.deanRemarks ?? '—' },
          { key: 'shortlistedCandidateIds', header: 'Shortlisted', render: (a) => a.shortlistedCandidateIds?.length ? `${a.shortlistedCandidateIds.length} candidate${a.shortlistedCandidateIds.length > 1 ? 's' : ''}` : 'None' },
          { key: 'status', header: 'Principal Status', render: (a) => <StatusBadge status={a.status} /> },
        ]}
      />
    </div>
  );
}

function RecruitmentReports() {
  const { data } = useStore();
  const report = data.departments.map((d) => {
    const reqs = data.approvals.filter((a) => a.type === 'recruitment' && a.departmentId === d.id);
    const recommended = reqs.filter((a) => a.status === 'dean-recommended').length;
    const approved = reqs.filter((a) => a.status === 'approved').length;
    const pending = reqs.filter((a) => a.status === 'pending').length;
    const faculty = data.staff.filter((s) => s.departmentId === d.id && ['professor', 'associate-professor', 'assistant-professor', 'lecturer', 'teaching-assistant'].includes(s.role));
    const vacancy = Math.max(0, 10 - faculty.length);
    return { id: d.id, name: d.name, code: d.code, vacancy, requests: reqs.length, recommended, approved, pending, completed: approved };
  });
  return (
    <div>
      <PageHeader title="Recruitment Reports" description="Department-wise vacancies, requests, approved positions, and completed hiring" action={
        <div className="flex gap-2"><button className="btn-secondary" onClick={() => alert('Exporting PDF...')}><FileText className="w-4 h-4" /> PDF</button><button className="btn-secondary" onClick={() => alert('Exporting Excel...')}><Download className="w-4 h-4" /> Excel</button></div>
      } />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Requests" value={report.reduce((a, r) => a + r.requests, 0)} icon={<FileText className="w-5 h-5" />} accent="blue" />
        <StatCard label="Recommended" value={report.reduce((a, r) => a + r.recommended, 0)} icon={<CheckSquare className="w-5 h-5" />} accent="emerald" />
        <StatCard label="Pending" value={report.reduce((a, r) => a + r.pending, 0)} icon={<AlertTriangle className="w-5 h-5" />} accent="amber" />
        <StatCard label="Total Vacancies" value={report.reduce((a, r) => a + r.vacancy, 0)} icon={<Users2 className="w-5 h-5" />} accent="rose" />
      </div>
      <DataTable
        rows={report}
        columns={[
          { key: 'name', header: 'Department', render: (r) => <span className="font-medium">{r.name}</span> },
          { key: 'vacancy', header: 'Vacancies' },
          { key: 'requests', header: 'Requests' },
          { key: 'recommended', header: 'Recommended' },
          { key: 'approved', header: 'Approved' },
          { key: 'pending', header: 'Pending' },
          { key: 'completed', header: 'Completed Hiring', render: (r) => <span className={r.completed > 0 ? 'text-emerald-600 font-semibold' : ''}>{r.completed}</span> },
        ]}
      />
    </div>
  );
}

function TeachingStandardsFilter() {
  const { data } = useStore();
  const [dept, setDept] = useState('all');
  const [selected, setSelected] = useState<Staff | null>(null);
  const teaching = data.staff.filter((s) => ['professor', 'associate-professor', 'assistant-professor', 'lecturer', 'teaching-assistant'].includes(s.role) && (dept === 'all' || s.departmentId === dept));

  const rows = teaching.map((f) => {
    const subs = data.subjects.filter((s) => s.facultyId === f.id);
    const syllabus = subs.length ? Math.round(subs.reduce((a, s) => a + s.syllabusCompletion, 0) / subs.length) : 0;
    const attendance = f.attendancePct;
    const feedback = f.feedbackScore;
    const overall = Math.round((syllabus * 0.4) + (attendance * 0.2) + (feedback / 5 * 100 * 0.4));
    const status = overall >= 85 ? 'meets standard' : overall >= 70 ? 'needs attention' : 'behind standard';
    return { id: f.id, name: f.name, designation: f.designation, dept: deptCode(data, f.departmentId), syllabus, attendance, feedback, overall, status };
  });

  const statusBadge = (status: string) => {
    const cls = status === 'meets standard' ? 'bg-emerald-100 text-emerald-700' : status === 'needs attention' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700';
    return <span className={`badge ${cls}`}>{status}</span>;
  };

  return (
    <div>
      <PageHeader title="Teaching Standards" description="Select department to view faculty teaching standards" action={<DeptSelector value={dept} onChange={setDept} />} />
      <DataTable
        rows={rows}
        columns={[
          { key: 'name', header: 'Faculty', render: (r) => <span className="font-medium">{r.name}</span> },
          { key: 'designation', header: 'Designation' },
          { key: 'dept', header: 'Dept' },
          { key: 'syllabus', header: 'Syllabus', render: (r) => `${r.syllabus}%` },
          { key: 'attendance', header: 'Attendance', render: (r) => `${r.attendance}%` },
          { key: 'feedback', header: 'Feedback', render: (r) => r.feedback ? `${r.feedback}/5` : '—' },
          { key: 'overall', header: 'Overall Score', render: (r) => <span className="font-semibold">{r.overall}</span> },
          { key: 'status', header: 'Status', render: (r) => statusBadge(r.status) },
        ]}
        onRowClick={(r) => setSelected(data.staff.find((s) => s.id === r.id) ?? null)}
      />
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative max-w-lg w-full bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 sticky top-0 bg-white flex items-center justify-between">
              <div><h2 className="text-lg font-semibold text-slate-900">{selected.name}</h2><p className="text-sm text-slate-500">{selected.designation} · {deptCode(data, selected.departmentId)}</p></div>
              {(() => {
                const subs = data.subjects.filter((s) => s.facultyId === selected.id);
                const syllabus = subs.length ? Math.round(subs.reduce((a, s) => a + s.syllabusCompletion, 0) / subs.length) : 0;
                const overall = Math.round((syllabus * 0.4) + (selected.attendancePct * 0.2) + (selected.feedbackScore / 5 * 100 * 0.4));
                const status = overall >= 85 ? 'meets standard' : overall >= 70 ? 'needs attention' : 'behind standard';
                return statusBadge(status);
              })()}
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="card p-3">
                  <p className="text-xs text-slate-500">Syllabus Completion vs Target</p>
                  {(() => {
                    const subs = data.subjects.filter((s) => s.facultyId === selected.id);
                    const avg = subs.length ? Math.round(subs.reduce((a, s) => a + s.syllabusCompletion, 0) / subs.length) : 0;
                    return (
                      <div className="mt-2">
                        <div className="flex justify-between text-sm mb-1"><span className="font-medium text-slate-900">{avg}%</span><span className="text-slate-500">Target 80%</span></div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${avg < 70 ? 'bg-rose-500' : avg < 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(avg, 100)}%` }} /></div>
                      </div>
                    );
                  })()}
                </div>
                <div className="card p-3">
                  <p className="text-xs text-slate-500">Attendance Percentage</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{selected.attendancePct}%</p>
                </div>
                <div className="card p-3">
                  <p className="text-xs text-slate-500">Student Feedback</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{selected.feedbackScore ? `${selected.feedbackScore}/5` : '—'}</p>
                </div>
                <div className="card p-3">
                  <p className="text-xs text-slate-500">Course Outcome Achievement</p>
                  {(() => {
                    const subs = data.subjects.filter((s) => s.facultyId === selected.id);
                    const co = subs.length ? Math.round(subs.reduce((a, s) => a + s.syllabusCompletion, 0) / subs.length) : 0;
                    return <p className="text-lg font-bold text-slate-900 mt-1">{co}%</p>;
                  })()}
                </div>
                <div className="card p-3">
                  <p className="text-xs text-slate-500">Pending Academic Work</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{selected.pendingWork}</p>
                </div>
                <div className="card p-3">
                  <p className="text-xs text-slate-500">Overall Score</p>
                  {(() => {
                    const subs = data.subjects.filter((s) => s.facultyId === selected.id);
                    const syllabus = subs.length ? Math.round(subs.reduce((a, s) => a + s.syllabusCompletion, 0) / subs.length) : 0;
                    const overall = Math.round((syllabus * 0.4) + (selected.attendancePct * 0.2) + (selected.feedbackScore / 5 * 100 * 0.4));
                    return <p className="text-lg font-bold text-slate-900 mt-1">{overall}</p>;
                  })()}
                </div>
              </div>
              <div className="card p-3">
                <p className="text-xs text-slate-500">Status</p>
                {(() => {
                  const subs = data.subjects.filter((s) => s.facultyId === selected.id);
                  const syllabus = subs.length ? Math.round(subs.reduce((a, s) => a + s.syllabusCompletion, 0) / subs.length) : 0;
                  const overall = Math.round((syllabus * 0.4) + (selected.attendancePct * 0.2) + (selected.feedbackScore / 5 * 100 * 0.4));
                  const status = overall >= 85 ? 'meets standard' : overall >= 70 ? 'needs attention' : 'behind standard';
                  return <div className="mt-1">{statusBadge(status)}</div>;
                })()}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end"><button className="btn-secondary" onClick={() => setSelected(null)}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultAnalysisFilter() {
  const { data } = useStore();
  const [dept, setDept] = useState('all');
  const students = data.students.filter((s) => dept === 'all' || s.departmentId === dept);
  const passed = students.filter((s) => s.backlogs === 0).length;
  const passPct = students.length ? Math.round((passed / students.length) * 100) : 0;
  return (
    <div>
      <PageHeader title="Result Analysis" description="Select department to view student results" action={<DeptSelector value={dept} onChange={setDept} />} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Students" value={students.length} icon={<Users2 className="w-5 h-5" />} accent="blue" />
        <StatCard label="Pass Rate" value={`${passPct}%`} icon={<CheckSquare className="w-5 h-5" />} accent="emerald" />
        <StatCard label="With Backlogs" value={students.filter((s) => s.backlogs > 0).length} icon={<AlertTriangle className="w-5 h-5" />} accent="rose" />
        <StatCard label="Avg CGPA" value={students.length ? (students.reduce((a, s) => a + s.cgpa, 0) / students.length).toFixed(2) : '—'} icon={<TrendingUp className="w-5 h-5" />} accent="indigo" />
      </div>
      <DataTable
        rows={students}
        columns={[
          { key: 'name', header: 'Student', render: (s) => <span className="font-medium">{s.name}</span> },
          { key: 'rollNo', header: 'Roll No' },
          { key: 'departmentId', header: 'Dept', render: (s) => deptCode(data, s.departmentId) },
          { key: 'semester', header: 'Sem' },
          { key: 'gpa', header: 'GPA' },
          { key: 'cgpa', header: 'CGPA' },
          { key: 'backlogs', header: 'Backlogs', render: (s) => <span className={s.backlogs > 0 ? 'text-rose-600 font-semibold' : ''}>{s.backlogs}</span> },
        ]}
      />
    </div>
  );
}

function AccreditationReadiness() {
  const criteria = [
    { id: 'cr1', name: 'Criterion 1: Curricular Aspects', progress: 85, status: 'on-track' },
    { id: 'cr2', name: 'Criterion 2: Teaching-Learning & Evaluation', progress: 78, status: 'on-track' },
    { id: 'cr3', name: 'Criterion 3: Research, Innovations & Extension', progress: 72, status: 'needs-attention' },
    { id: 'cr4', name: 'Criterion 4: Infrastructure & Learning Resources', progress: 88, status: 'on-track' },
    { id: 'cr5', name: 'Criterion 5: Student Support & Progression', progress: 80, status: 'on-track' },
    { id: 'cr6', name: 'Criterion 6: Governance, Leadership & Management', progress: 75, status: 'needs-attention' },
    { id: 'cr7', name: 'Criterion 7: Institutional Values & Best Practices', progress: 82, status: 'on-track' },
  ];
  return (
    <div>
      <PageHeader title="Accreditation Readiness (NAAC/NBA)" description="Criteria-wise compliance progress" />
      <div className="space-y-3">
        {criteria.map((c) => (
          <div key={c.id} className="card p-4">
            <div className="flex justify-between mb-2"><span className="text-sm font-medium text-slate-900">{c.name}</span><span className="text-sm text-slate-600">{c.progress}%</span></div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${c.progress < 75 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${c.progress}%` }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PromotionRequests() {
  const { data, updateApproval, addNotification } = useStore();
  const [selected, setSelected] = useState<ApprovalRequest | null>(null);
  const [remarks, setRemarks] = useState('');
  const [perfFaculty, setPerfFaculty] = useState<Staff | null>(null);
  const promoReqs = data.approvals.filter((a) => a.type === 'promotion');

  const rows = promoReqs.map((a) => {
    const faculty = data.staff.find((s) => a.title.includes(s.name));
    const pubs = faculty ? data.publications.filter((p) => p.facultyId === faculty.id).length : 0;
    const projects = faculty ? data.researchProjects.filter((r) => r.facultyId === faculty.id).length : 0;
    const yearsOfService = faculty ? new Date().getFullYear() - new Date(faculty.joinedOn).getFullYear() : 0;
    const eligible = faculty ? yearsOfService >= 10 && (pubs + projects) >= 3 : false;
    return { ...a, faculty, facultyName: faculty?.name ?? a.title.replace('Promotion - ', ''), yearsOfService, pubs, projects, eligible };
  });

  const recommend = (status: ApprovalRequest['deanStatus']) => {
    if (!selected) return;
    const newStatus = status === 'recommended' ? 'dean-recommended' : 'dean-rejected';
    updateApproval(selected.id, { deanStatus: status, deanRemarks: remarks, status: newStatus });
    addNotification({ id: `n${Date.now()}`, title: 'Dean recommendation recorded', message: `${selected.title} — Dean has ${status === 'recommended' ? 'recommended' : 'rejected'} the promotion`, date: new Date().toISOString().slice(0, 10), audience: ['principal', 'hod'], read: false });
    setSelected(null); setRemarks('');
  };

  return (
    <div>
      <PageHeader title="Promotion Requests" description="Review faculty promotion requests from HODs" />
      <DataTable
        rows={rows}
        columns={[
          { key: 'title', header: 'Request', render: (a) => <span className="font-medium">{a.title}</span> },
          { key: 'submittedBy', header: 'HOD' },
          { key: 'date', header: 'Date' },
          { key: 'eligible', header: 'Eligibility', render: (a) => (
            <span className={`badge ${a.eligible ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {a.eligible ? 'Eligible' : 'Not Eligible'}
            </span>
          ) },
          { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.status} /> },
          { key: 'perf', header: 'Performance', render: (a) => (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); a.faculty && setPerfFaculty(a.faculty); }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
              title={`View performance of ${a.facultyName}`}
              aria-label={`View performance of ${a.facultyName}`}
            >
              <Award className="h-4 w-4" />
            </button>
          ) },
        ]}
        onRowClick={(a) => { setSelected(a); setRemarks(a.deanRemarks ?? ''); }}
      />
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative max-w-lg w-full bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 sticky top-0 bg-white"><h2 className="text-lg font-semibold text-slate-900">{selected.title}</h2><p className="text-sm text-slate-500">{selected.submittedBy} · {selected.date}</p></div>
            <div className="px-6 py-5 space-y-3">
              <div className="card p-3"><p className="text-xs text-slate-500">Purpose</p><p className="text-sm text-slate-900">{selected.purpose}</p></div>
              <div className="card p-3"><p className="text-xs text-slate-500 mb-1">Details</p><dl className="grid grid-cols-2 gap-2">{Object.entries(selected.details).map(([k, v]) => <div key={k}><dt className="text-xs text-slate-400 capitalize">{k}</dt><dd className="text-sm text-slate-900">{v}</dd></div>)}</dl></div>
              {selected.documents && selected.documents.length > 0 && (
                <div><p className="text-xs text-slate-500 mb-2">Supporting Documents</p><div className="space-y-2">{selected.documents.map((doc) => <div key={doc.id} className="card p-3 flex items-center justify-between"><div className="flex items-center gap-3"><FileText className="w-5 h-5 text-slate-400" /><div><p className="text-sm font-medium text-slate-900">{doc.name}</p><p className="text-xs text-slate-500">{doc.type} · {doc.size} · {doc.uploaded}</p></div></div><button className="btn-secondary text-xs"><Download className="w-3.5 h-3.5" /> View</button></div>)}</div></div>
              )}
              <textarea className="input" rows={3} placeholder="Recommendation remarks..." value={remarks} onChange={(e) => setRemarks(e.target.value)} />
              <div className="flex gap-2">
                <button className="btn-success flex-1" onClick={() => recommend('recommended')}><CheckSquare className="w-4 h-4" /> Recommend</button>
                <button className="btn-danger flex-1" onClick={() => recommend('rejected')}><XCircle className="w-4 h-4" /> Reject</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {perfFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setPerfFaculty(null)} />
          <div className="relative max-w-lg w-full bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 sticky top-0 bg-white flex items-center justify-between">
              <div><h2 className="text-lg font-semibold text-slate-900">{perfFaculty.name}</h2><p className="text-sm text-slate-500">{perfFaculty.designation} · {deptCode(data, perfFaculty.departmentId)}</p></div>
              <button type="button" className="btn-secondary text-xs" onClick={() => setPerfFaculty(null)}>Close</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {(() => {
                const subs = data.subjects.filter((s) => s.facultyId === perfFaculty.id);
                const syllabus = subs.length ? Math.round(subs.reduce((a, s) => a + s.syllabusCompletion, 0) / subs.length) : 0;
                const pubs = data.publications.filter((p) => p.facultyId === perfFaculty.id);
                const projects = data.researchProjects.filter((r) => r.facultyId === perfFaculty.id);
                const yearsOfService = new Date().getFullYear() - new Date(perfFaculty.joinedOn).getFullYear();
                const eligible = yearsOfService >= 10 && (pubs.length + projects.length) >= 3;
                return (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="card p-3 text-center"><p className="text-xs text-slate-500">Attendance</p><p className="text-lg font-bold text-slate-900">{perfFaculty.attendancePct}%</p></div>
                      <div className="card p-3 text-center"><p className="text-xs text-slate-500">Student Feedback</p><p className="text-lg font-bold text-slate-900">{perfFaculty.feedbackScore ? `${perfFaculty.feedbackScore}/5` : '—'}</p></div>
                      <div className="card p-3 text-center"><p className="text-xs text-slate-500">Performance Rating</p><p className="text-lg font-bold text-slate-900">{perfFaculty.performanceRating}/5</p></div>
                      <div className="card p-3 text-center"><p className="text-xs text-slate-500">Years of Service</p><p className="text-lg font-bold text-slate-900">{yearsOfService} yrs</p></div>
                      <div className="card p-3 text-center"><p className="text-xs text-slate-500">Syllabus Completion</p><p className="text-lg font-bold text-slate-900">{syllabus}%</p></div>
                      <div className="card p-3 text-center"><p className="text-xs text-slate-500">Publications</p><p className="text-lg font-bold text-slate-900">{pubs.length}</p></div>
                      <div className="card p-3 text-center"><p className="text-xs text-slate-500">Research Projects</p><p className="text-lg font-bold text-slate-900">{projects.length}</p></div>
                      <div className="card p-3 text-center"><p className="text-xs text-slate-500">Pending Work</p><p className="text-lg font-bold text-slate-900">{perfFaculty.pendingWork}</p></div>
                    </div>
                    <div className="flex items-center justify-between card p-3 bg-slate-50">
                      <div>
                        <p className="text-xs text-slate-500">Auto Eligibility Check</p>
                        <p className="text-sm text-slate-900 mt-0.5">{yearsOfService} yrs service · {pubs.length} pubs · {projects.length} projects</p>
                      </div>
                      <span className={`badge ${eligible ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{eligible ? 'Eligible' : 'Not Eligible'}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Research Management — main menu hosting the sub-pages as tabs */
const RESEARCH_TABS = [
  { id: 'publications', label: 'Publications', icon: FileText },
  { id: 'projects', label: 'Funded Research Projects', icon: FlaskConical },
] as const;

function ResearchManagement() {
  const [tab, setTab] = useState<(typeof RESEARCH_TABS)[number]['id']>('publications');

  return (
    <div>
      <PageHeader title="Research Management" description="Faculty publications and funded research projects across departments" />
      <div className="border-b border-slate-200 mb-6 flex gap-1 overflow-x-auto" role="tablist" aria-label="Research Management">
        {RESEARCH_TABS.map(({ id, label, icon: Icon }) => (
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
      {tab === 'publications' && <PublicationsView />}
      {tab === 'projects' && <ProjectsView />}
    </div>
  );
}

function PublicationsView() {
  const { data } = useStore();
  return (
    <div>
      <PageHeader title="Publications" description="Faculty research publications" />
      <DataTable
        rows={data.publications}
        columns={[
          { key: 'title', header: 'Title', render: (p) => <span className="font-medium">{p.title}</span> },
          { key: 'type', header: 'Type', render: (p) => <span className="badge bg-slate-100 text-slate-700 capitalize">{p.type}</span> },
          { key: 'journal', header: 'Journal/Conference' },
          { key: 'year', header: 'Year' },
          { key: 'facultyId', header: 'Faculty', render: (p) => staffName(data, p.facultyId) },
          { key: 'departmentId', header: 'Dept', render: (p) => deptCode(data, p.departmentId) },
        ]}
      />
    </div>
  );
}

function ProjectsView() {
  const { data } = useStore();
  return (
    <div>
      <PageHeader title="Funded Research Projects" description="Ongoing and completed funded research" />
      <DataTable
        rows={data.researchProjects}
        columns={[
          { key: 'title', header: 'Title', render: (r) => <span className="font-medium">{r.title}</span> },
          { key: 'fundingAgency', header: 'Funding Agency' },
          { key: 'amount', header: 'Amount', render: (r) => `₹${r.amount.toLocaleString('en-IN')}` },
          { key: 'facultyId', header: 'Investigator', render: (r) => staffName(data, r.facultyId) },
          { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        ]}
      />
    </div>
  );
}

function DeptReports() {
  const { data } = useStore();
  return (
    <div>
      <PageHeader title="Department Reports & Analytics" description="Consolidated reports submitted to the Principal" action={
        <div className="flex gap-2"><button className="btn-secondary" onClick={() => alert('Exporting PDF...')}><FileText className="w-4 h-4" /> PDF</button><button className="btn-secondary" onClick={() => alert('Exporting Excel...')}><Download className="w-4 h-4" /> Excel</button></div>
      } />
      <div className="grid lg:grid-cols-2 gap-4">
        {data.departments.map((d) => {
          const subs = data.subjects.filter((s) => s.departmentId === d.id);
          const avg = subs.length ? Math.round(subs.reduce((a, s) => a + s.syllabusCompletion, 0) / subs.length) : 0;
          const studs = data.students.filter((s) => s.departmentId === d.id);
          const passPct = studs.length ? Math.round((studs.filter((s) => s.backlogs === 0).length / studs.length) * 100) : 0;
          const pubs = data.publications.filter((p) => p.departmentId === d.id).length;
          const reqs = data.approvals.filter((a) => (a.type === 'recruitment' || a.type === 'promotion') && a.departmentId === d.id).length;
          return (
            <div key={d.id} className="card p-5">
              <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold text-slate-900">{d.name}</h3><span className="badge bg-slate-100 text-slate-700">{d.code}</span></div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div><p className="text-xs text-slate-500">Syllabus</p><p className="text-lg font-bold text-slate-900">{avg}%</p></div>
                <div><p className="text-xs text-slate-500">Pass Rate</p><p className="text-lg font-bold text-slate-900">{passPct}%</p></div>
                <div><p className="text-xs text-slate-500">Faculty</p><p className="text-lg font-bold text-slate-900">{data.staff.filter((s) => s.departmentId === d.id && s.role !== 'principal' && s.role !== 'dean').length}</p></div>
                <div><p className="text-xs text-slate-500">Publications</p><p className="text-lg font-bold text-slate-900">{pubs}</p></div>
                <div><p className="text-xs text-slate-500">Requests</p><p className="text-lg font-bold text-slate-900">{reqs}</p></div>
                <div><p className="text-xs text-slate-500">Students</p><p className="text-lg font-bold text-slate-900">{data.students.filter((s) => s.departmentId === d.id).length}</p></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HodManagement() {
  const { data } = useStore();
  const hods = data.staff.filter((s) => s.role === 'hod');
  return (
    <div>
      <PageHeader title="HOD Management" description="Direct reports — issue remarks and instructions to HODs" />
      <DataTable
        rows={hods}
        columns={[
          { key: 'name', header: 'HOD', render: (s) => <span className="font-medium">{s.name}</span> },
          { key: 'departmentId', header: 'Department', render: (s) => deptName(data, s.departmentId) },
          { key: 'email', header: 'Email' },
          { key: 'phone', header: 'Phone' },
          { key: 'status', header: 'Status', render: (s) => <StatusBadge status={s.status} /> },
        ]}
      />
    </div>
  );
}
