import { useStore, deptName, deptCode, roleLabels } from '../../store/StoreContext';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { DataTable, StatusBadge } from '../../components/DataTable';
import { StaffDirectory, RegisterComplaintView, LeaveManagementView } from '../../components/SharedViews';
import { LabMaintenanceRequests } from '../../components/ResourceViews';
import { Users, Mail, Send, FileText, FolderOpen, Cpu, Beaker, Plus, CheckSquare } from 'lucide-react';
import { useState } from 'react';
import type { Staff, Role } from '../../data/types';
import { StaffDetailModal } from '../../components/DetailModals';

export function NonTeachingDashboard({ activeMenu }: { activeMenu: string }) {
  const { currentUser } = useStore();
  if (!currentUser) return null;

if (currentUser.role === 'office-superintendent') {
    switch (activeMenu) {
      case 'os-apply-leave': return <LeaveManagementView />;
      case 'os-directory': return <StaffDirectory scopeDept={currentUser.departmentId} roles={['office-superintendent', 'lab-assistant']} title="Staff Directory" editable />;
      case 'os-letters': return <ReceiveLetters />;
      case 'os-send': return <SendComms />;
      case 'os-docs': return <UploadDocs />;
      case 'os-files': return <DeptFiles />;
      case 'os-complaint': return <RegisterComplaintView />;
      default: return <OfficeHome />;
    }
  }

if (currentUser.role === 'lab-assistant') {
    switch (activeMenu) {
      case 'la-apply-leave': return <LeaveManagementView />;
      case 'la-equipment': return <Equipment />;
      case 'la-session': return <SessionAssist />;
      case 'la-maintenance': return <LabMaintenanceRequests />;
      case 'la-complaint': return <RegisterComplaintView />;
      default: return <LabHome />;
    }
  }
  return null;
}

function OfficeHome() {
  const { currentUser, data } = useStore();
  if (!currentUser) return null;
  const staff = data.staff.filter((s) => s.departmentId === currentUser.departmentId && ['office-superintendent', 'lab-assistant'].includes(s.role));
  return (
    <div>
      <PageHeader title="Office Superintendent Dashboard" description={`${deptName(data, currentUser.departmentId)} · Administrative`} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Staff" value={staff.length} icon={<Users className="w-5 h-5" />} accent="blue" />
        <StatCard label="Letters Received" value={5} icon={<Mail className="w-5 h-5" />} accent="indigo" />
        <StatCard label="Communications Sent" value={3} icon={<Send className="w-5 h-5" />} accent="emerald" />
        <StatCard label="Department Files" value={12} icon={<FolderOpen className="w-5 h-5" />} accent="amber" />
      </div>
    </div>
  );
}

function ReceiveLetters() {
  const letters = [
    { id: 'lt1', from: 'University Registrar', subject: 'Exam Notification - Aug 2026', date: '2026-07-18', type: 'Exam', status: 'acknowledged' },
    { id: 'lt2', from: 'AICTE', subject: 'Annual Compliance Report Request', date: '2026-07-15', type: 'Compliance', status: 'pending' },
    { id: 'lt3', from: 'Finance Dept', subject: 'Budget Revision Circular', date: '2026-07-12', type: 'Circular', status: 'acknowledged' },
    { id: 'lt4', from: 'Admission Cell', subject: 'Document Verification Schedule', date: '2026-07-10', type: 'Internal', status: 'pending' },
    { id: 'lt5', from: 'NAAC Coordinator', subject: 'Evidence Document Request', date: '2026-07-08', type: 'Accreditation', status: 'acknowledged' },
  ];
  return (
    <div>
      <PageHeader title="Receive Official Letters" description="Log all official correspondence at point of receipt" action={<button className="btn-primary"><Plus className="w-4 h-4" /> Log Letter</button>} />
      <DataTable
        rows={letters}
        columns={[
          { key: 'from', header: 'From' },
          { key: 'subject', header: 'Subject', render: (l) => <span className="font-medium">{l.subject}</span> },
          { key: 'type', header: 'Type', render: (l) => <span className="badge bg-slate-100 text-slate-700">{l.type}</span> },
          { key: 'date', header: 'Date' },
          { key: 'status', header: 'Status', render: (l) => <StatusBadge status={l.status} /> },
        ]}
      />
    </div>
  );
}

function SendComms() {
  const { currentUser, data, sendMessage } = useStore();
  const [toRole, setToRole] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  if (!currentUser) return null;
  const sent = data.messages.filter((m) => m.fromId === currentUser.id);

  const send = () => {
    if (!toRole || !subject) return;
    const recipient = data.staff.find((s) => s.role === toRole);
    sendMessage({
      id: `msg${Date.now()}`,
      fromId: currentUser.id,
      fromName: currentUser.name,
      fromRole: currentUser.role,
      toRole: toRole as Role,
      toName: recipient?.name ?? roleLabels[toRole as Role],
      subject,
      body,
      date: new Date().toISOString().slice(0, 10),
      read: false,
    });
    setToRole(''); setSubject(''); setBody('');
  };

  return (
    <div>
      <PageHeader title="Send Communications" description="Send official communications to Principal / Dean / HOD — delivered to their Inbox" />
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">New Communication</h3>
          <div className="space-y-3">
            <select className="input" value={toRole} onChange={(e) => setToRole(e.target.value)}>
              <option value="">Select recipient...</option>
              <option value="principal">Principal</option>
              <option value="dean">Dean</option>
              <option value="hod">Head of Department</option>
            </select>
            <input className="input" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            <textarea className="input" rows={5} placeholder="Message..." value={body} onChange={(e) => setBody(e.target.value)} />
            <button className="btn-primary w-full" onClick={send}>
              <Send className="w-4 h-4" /> Send
            </button>
          </div>
        </div>
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Sent Communications</h3>
          {sent.length === 0 ? <p className="text-sm text-slate-400">No communications sent yet.</p> :
          <div className="space-y-2">
            {sent.map((s) => (
              <div key={s.id} className="p-3 rounded-lg bg-slate-50">
                <div className="flex justify-between"><p className="text-sm font-medium text-slate-900">{s.subject}</p><span className="text-xs text-slate-400">{s.date}</span></div>
                <p className="text-xs text-slate-500">To: {s.toName} · {roleLabels[s.toRole]}</p>
              </div>
            ))}
          </div>}
        </div>
      </div>
    </div>
  );
}

function UploadDocs() {
  const docs = [
    { id: 'doc1', name: 'Annual_Report_2026.pdf', size: '2.4 MB', uploaded: '2026-07-15', category: 'Reports' },
    { id: 'doc2', name: 'Compliance_Evidence.zip', size: '8.1 MB', uploaded: '2026-07-12', category: 'Compliance' },
    { id: 'doc3', name: 'Staff_Attendance_July.xlsx', size: '340 KB', uploaded: '2026-07-10', category: 'Attendance' },
  ];
  return (
    <div>
      <PageHeader title="Upload Official Documents" description="Securely store important official documents" action={<button className="btn-primary"><Plus className="w-4 h-4" /> Upload</button>} />
      <DataTable
        rows={docs}
        columns={[
          { key: 'name', header: 'Document', render: (d) => <span className="font-medium">{d.name}</span> },
          { key: 'category', header: 'Category', render: (d) => <span className="badge bg-slate-100 text-slate-700">{d.category}</span> },
          { key: 'size', header: 'Size' },
          { key: 'uploaded', header: 'Uploaded' },
        ]}
      />
    </div>
  );
}

function DeptFiles() {
  const files = [
    { id: 'f1', name: 'BCA-Faculty-Records', category: 'Confidential', docs: 8, created: '2025-01-15' },
    { id: 'f2', name: 'BCA-Student-Admissions', category: 'Admissions', docs: 17, created: '2025-06-01' },
    { id: 'f3', name: 'BCA-Exam-Records', category: 'Examination', docs: 15, created: '2025-08-10' },
    { id: 'f4', name: 'BCA-Inventory', category: 'Inventory', docs: 6, created: '2025-04-20' },
  ];
  return (
    <div>
      <PageHeader title="Department Files" description="Create, categorize, and search department files" action={<button className="btn-primary"><Plus className="w-4 h-4" /> New File</button>} />
      <DataTable
        rows={files}
        columns={[
          { key: 'name', header: 'File Name', render: (f) => <span className="font-medium">{f.name}</span> },
          { key: 'category', header: 'Category', render: (f) => <span className="badge bg-slate-100 text-slate-700">{f.category}</span> },
          { key: 'docs', header: 'Documents' },
          { key: 'created', header: 'Created' },
        ]}
      />
    </div>
  );
}

function LabHome() {
  const { currentUser, data } = useStore();
  if (!currentUser) return null;
  const labs = data.labs.filter((l) => l.departmentId === currentUser.departmentId);
  const totalEquipment = labs.reduce((a, l) => a + l.equipment.length, 0);
  const underRepair = labs.reduce((a, l) => a + l.equipment.filter((e) => e.status === 'under-repair').length, 0);
  return (
    <div>
      <PageHeader title="Lab Assistant Dashboard" description={`${deptName(data, currentUser.departmentId)} · Laboratory`} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Labs" value={labs.length} icon={<Beaker className="w-5 h-5" />} accent="blue" />
        <StatCard label="Equipment Items" value={totalEquipment} icon={<Cpu className="w-5 h-5" />} accent="indigo" />
        <StatCard label="Under Repair" value={underRepair} icon={<Cpu className="w-5 h-5" />} accent="rose" />
        <StatCard label="Sessions Today" value={3} icon={<CheckSquare className="w-5 h-5" />} accent="emerald" />
      </div>
    </div>
  );
}

function Equipment() {
  const { currentUser, data, updateStaff } = useStore();
  const [selected, setSelected] = useState<Staff | null>(null);
  if (!currentUser) return null;
  const labs = data.labs.filter((l) => l.departmentId === currentUser.departmentId);
  const allEquipment = labs.flatMap((l) => l.equipment.map((e, i) => ({ id: `${l.id}-${i}`, name: e.name, qty: e.qty, status: e.status, lab: l.name })));
  return (
    <div>
      <PageHeader title="Laboratory Equipment" description="View, add, and update equipment inventory" action={<button className="btn-primary"><Plus className="w-4 h-4" /> Add Equipment</button>} />
      <DataTable
        rows={allEquipment}
        columns={[
          { key: 'name', header: 'Equipment', render: (e) => <span className="font-medium">{e.name}</span> },
          { key: 'lab', header: 'Lab' },
          { key: 'qty', header: 'Quantity' },
          { key: 'status', header: 'Status', render: (e) => <StatusBadge status={e.status} /> },
        ]}
      />
    </div>
  );
}

function SessionAssist() {
  const sessions = [
    { id: 's1', lab: 'Programming Lab - 1', subject: 'Data Structures Lab', date: '2026-07-20', time: '09:00-11:00', status: 'prepared' },
    { id: 's2', lab: 'Networking Lab', subject: 'Networks Lab', date: '2026-07-20', time: '11:30-13:30', status: 'pending' },
    { id: 's3', lab: 'Programming Lab - 1', subject: 'Python Lab', date: '2026-07-20', time: '14:00-16:00', status: 'completed' },
  ];
  return (
    <div>
      <PageHeader title="Session Assistance" description="Prepare labs and record completed practical sessions" />
      <DataTable
        rows={sessions}
        columns={[
          { key: 'lab', header: 'Lab' },
          { key: 'subject', header: 'Subject', render: (s) => <span className="font-medium">{s.subject}</span> },
          { key: 'date', header: 'Date' },
          { key: 'time', header: 'Time' },
          { key: 'status', header: 'Status', render: (s) => <StatusBadge status={s.status} /> },
        ]}
      />
    </div>
  );
}
