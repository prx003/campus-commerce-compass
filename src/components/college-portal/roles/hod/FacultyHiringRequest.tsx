import { useEffect, useState, type ReactNode } from 'react';
import { useStore, deptName } from '../../store/StoreContext';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/DataTable';
import { X, Send, Check, XCircle } from 'lucide-react';
import type { ApprovalRequest } from '../../data/types';

const today = () => new Date().toISOString().slice(0, 10);

function Drawer({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [onClose]);
  return <div className="fixed inset-0 z-50"><div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} /><aside className="absolute right-0 top-0 h-full w-full max-w-3xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur-sm"><p className="text-sm font-semibold text-slate-900">{title}</p><button type="button" onClick={onClose} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="Close panel"><X className="w-4 h-4" /></button></div><div className="p-5">{children}</div></aside></div>;
}

type FormState = { academicYear: string; semester: string; subject: string; vacancy: string; designation: string; employmentType: string; qualification: string; reason: string; remarks: string };
const emptyForm: FormState = { academicYear: '2026-27', semester: '1', subject: '', vacancy: '1', designation: 'Assistant Professor', employmentType: 'Full-time', qualification: '', reason: '', remarks: '' };

export function HodHiringRequestPanel({ deptId, onClose }: { deptId: string; onClose: () => void }) {
  const { data, currentUser, addApproval, addNotification } = useStore();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const subjects = data.subjects.filter((s) => s.departmentId === deptId);
  const requests = data.approvals.filter((a) => a.type === 'recruitment' && a.submittedByRole === 'hod' && a.departmentId === deptId);
  const set = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = () => {
    if (!form.subject.trim() || !form.qualification.trim() || !form.reason.trim()) return;
    const id = `hire-${Date.now()}`;
    const title = `Faculty Hiring Request — ${form.designation}`;
    addApproval({ id, type: 'recruitment', title, submittedBy: currentUser?.name ?? 'HOD', submittedByRole: 'hod', departmentId: deptId, date: today(), purpose: form.reason, status: 'pending-dean-approval', deanStatus: 'pending', details: { ...form }, documents: [], shortlistedCandidateIds: [] });
    addNotification({ id: `n-${id}-hod`, title: 'Hiring request submitted successfully', message: `${title} (${id}) has been sent to the Dean for approval.`, date: today(), audience: ['hod'], targetUserIds: currentUser ? [currentUser.id] : undefined, read: false });
    addNotification({ id: `n-${id}-dean`, title: 'New faculty hiring request received', message: `${currentUser?.name ?? 'HOD'} submitted ${title} for ${deptName(data, deptId)}.`, date: today(), audience: ['dean'], read: false });
    setSubmitted(id); setForm(emptyForm);
  };
  return <Drawer title="Send Hiring Request" onClose={onClose}>
    <PageHeader title="Send Hiring Request" description="Submit faculty requirements to the Dean for approval." />
    {submitted && <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">Request <span className="font-semibold">{submitted}</span> sent to the Dean for approval.</div>}
    <div className="card p-5"><div className="grid gap-4 md:grid-cols-2">
      <Field label="Department"><input className="input w-full bg-slate-50" value={deptName(data, deptId)} readOnly /></Field>
      <Field label="Academic Year"><input className="input w-full" value={form.academicYear} onChange={(e) => set('academicYear', e.target.value)} /></Field>
      <Field label="Semester"><select className="input w-full" value={form.semester} onChange={(e) => set('semester', e.target.value)}>{[1,2,3,4,5,6,7,8].map((s) => <option key={s}>{s}</option>)}</select></Field>
      <Field label="Subject or area"><input className="input w-full" list="hod-subjects" placeholder="Select or enter subject" value={form.subject} onChange={(e) => set('subject', e.target.value)} /><datalist id="hod-subjects">{subjects.map((s) => <option key={s.id} value={s.name} />)}</datalist></Field>
      <Field label="Number of faculty required"><input className="input w-full" type="number" min="1" value={form.vacancy} onChange={(e) => set('vacancy', e.target.value)} /></Field>
      <Field label="Designation"><select className="input w-full" value={form.designation} onChange={(e) => set('designation', e.target.value)}>{['Professor','Associate Professor','Assistant Professor','Lecturer'].map((x) => <option key={x}>{x}</option>)}</select></Field>
      <Field label="Employment type"><select className="input w-full" value={form.employmentType} onChange={(e) => set('employmentType', e.target.value)}><option>Full-time</option><option>Part-time</option><option>Contract</option></select></Field>
      <Field label="Required qualification"><input className="input w-full" placeholder="e.g. PhD / NET" value={form.qualification} onChange={(e) => set('qualification', e.target.value)} /></Field>
      <Field label="Reason for hiring" wide><textarea className="input w-full" rows={3} value={form.reason} onChange={(e) => set('reason', e.target.value)} /></Field>
      <Field label="Additional remarks" wide><textarea className="input w-full" rows={3} value={form.remarks} onChange={(e) => set('remarks', e.target.value)} /></Field>
    </div><button type="button" className="btn-primary mt-5" onClick={submit}><Send className="w-4 h-4" /> Send to Dean</button></div>
    <HiringRequestList requests={requests} data={data} />
  </Drawer>;
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: ReactNode }) { return <label className={wide ? 'md:col-span-2' : ''}><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>{children}</label>; }

function HiringRequestList({ requests, data, onSelect }: { requests: ApprovalRequest[]; data: ReturnType<typeof useStore>['data']; onSelect?: (request: ApprovalRequest) => void }) { return <div className="mt-6 card p-5"><h3 className="mb-3 text-sm font-semibold text-slate-900">Hiring Requests</h3>{requests.length === 0 ? <p className="text-sm text-slate-400">No hiring requests submitted yet.</p> : <div className="space-y-3">{requests.map((r) => <button type="button" key={r.id} onClick={() => onSelect?.(r)} className="w-full rounded-lg border border-slate-200 p-3 text-left hover:border-blue-400"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-semibold text-slate-900">{r.id}</span><StatusBadge status={r.status} /></div><p className="mt-1 text-sm text-slate-700">{r.details.subject} · {r.details.vacancy} faculty</p><p className="text-xs text-slate-500">{deptName(data, r.departmentId)} · Submitted {r.date}</p>{r.deanRemarks && <p className="mt-2 text-xs text-rose-700">Dean: {r.deanRemarks}</p>}</button>)}</div>}</div>; }

export function DeanHiringRequests() {
  const { data, currentUser, updateApproval, addNotification } = useStore();
  const [selected, setSelected] = useState<ApprovalRequest | null>(null);
  const [remarks, setRemarks] = useState('');
  const requests = data.approvals.filter((a) => a.type === 'recruitment' && a.submittedByRole === 'hod' && a.status === 'pending-dean-approval');
  const decide = (approved: boolean) => { if (!selected || (!approved && !remarks.trim())) return; const status = approved ? 'approved-by-dean' : 'rejected-by-dean'; const patch = { status: status as ApprovalRequest['status'], deanStatus: approved ? 'recommended' as const : 'rejected' as const, deanRemarks: remarks.trim() || 'Approved by Dean', details: { ...selected.details, deanDecisionAt: new Date().toISOString(), deanDecisionBy: currentUser?.name ?? 'Dean' } }; updateApproval(selected.id, patch); addNotification({ id: `n-${selected.id}-${status}`, title: approved ? 'Dean approved the hiring request' : 'Dean rejected the hiring request', message: approved ? `${selected.id} is approved and visible to HR.` : `${selected.id} was rejected: ${remarks}`, date: today(), audience: ['hod'], read: false }); if (approved) addNotification({ id: `n-${selected.id}-hr`, title: 'Approved faculty hiring request received', message: `${selected.id} was approved by the Dean and is ready for HR recruitment.` , date: today(), audience: ['office-superintendent'], read: false }); setSelected(null); setRemarks(''); };
  return <div className="card p-5"><div className="mb-4 flex items-center justify-between"><div><h3 className="text-sm font-semibold text-slate-900">HOD Hiring Requests</h3><p className="text-xs text-slate-500">Review requests submitted by department heads.</p></div><span className="badge bg-amber-100 text-amber-700">{requests.length} pending</span></div>{requests.length === 0 ? <p className="text-sm text-slate-400">No HOD hiring requests are pending review.</p> : <div className="space-y-2">{requests.map((r) => <button type="button" key={r.id} onClick={() => { setSelected(r); setRemarks(''); }} className="w-full rounded-lg border border-slate-200 p-3 text-left hover:border-blue-400"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-900">{r.id}</span><StatusBadge status={r.status} /></div><p className="mt-1 text-sm text-slate-700">{deptName(data, r.departmentId)} · {r.details.subject} · {r.details.vacancy} faculty</p><p className="text-xs text-slate-500">Submitted by {r.submittedBy} on {r.date}</p></button>)}</div>}{selected && <Drawer title={`Review ${selected.id}`} onClose={() => setSelected(null)}><div className="space-y-4"><div className="grid grid-cols-2 gap-4">{Object.entries(selected.details).filter(([key]) => !key.startsWith('dean')).map(([key, value]) => <div key={key}><p className="text-xs capitalize text-slate-500">{key.replace(/([A-Z])/g, ' $1')}</p><p className="text-sm text-slate-900">{value}</p></div>)}</div><textarea className="input w-full" rows={3} placeholder="Required when rejecting; optional approval remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} /><div className="flex gap-2"><button type="button" className="btn-success" onClick={() => decide(true)}><Check className="w-4 h-4" /> Approve</button><button type="button" className="btn-danger" onClick={() => decide(false)}><XCircle className="w-4 h-4" /> Reject</button></div></div></Drawer>}</div>;
}
