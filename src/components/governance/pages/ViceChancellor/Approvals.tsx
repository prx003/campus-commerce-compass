import { useState } from 'react';
import { useApp } from '@/components/governance/context';
import { Policy, Appointment } from '@/components/governance/data';
import SectionHeader from '@/components/governance/components/shared/SectionHeader';
import StatusBadge from '@/components/governance/components/shared/StatusBadge';
import StatsCard from '@/components/governance/components/shared/StatsCard';
import Modal from '@/components/governance/components/shared/Modal';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export default function Approvals() {
  const { policies, appointments, projects, updatePolicy, updateAppointment, updateProject } = useApp();
  const [viewItem, setViewItem] = useState<Policy | null>(null);
  const [activeTab, setActiveTab] = useState<'policies' | 'appointments' | 'projects'>('policies');

  const pendingPolicies = policies.filter(p => p.status === 'Pending' || p.status === 'Under Review');
  const pendingAppts = appointments.filter(a => a.status === 'Pending' || a.status === 'Under Review');
  const pendingProjects = projects.filter(p => p.status === 'Planned');

  const approve = (policy: Policy) => updatePolicy({ ...policy, status: 'Approved', approvedBy: 'Vice-Chancellor', approvedDate: new Date().toISOString().split('T')[0] });
  const reject = (policy: Policy) => updatePolicy({ ...policy, status: 'Rejected' });
  const approveAppt = (a: Appointment) => updateAppointment({ ...a, status: 'Approved' });

  return (
    <div>
      <SectionHeader title="Approvals" subtitle="Review and approve institutional proposals, policies, and recommendations" />

      <div className="grid grid-cols-3 gap-2 mb-2">
        <StatsCard title="Pending Policies" value={pendingPolicies.length} icon={<Clock className="w-5 h-5 text-amber-600" />} iconBg="bg-amber-50" layout="horizontal" />
        <StatsCard title="Pending Appointments" value={pendingAppts.length} icon={<AlertCircle className="w-5 h-5 text-primary" />} iconBg="bg-primary/10" layout="horizontal" />
        <StatsCard title="Projects to Activate" value={pendingProjects.length} icon={<CheckCircle className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-50" layout="horizontal" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-border pb-0">
        {(['policies', 'appointments', 'projects'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2.5 text-sm font-semibold capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-amber-500 text-amber-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {tab} {tab === 'policies' ? `(${pendingPolicies.length})` : tab === 'appointments' ? `(${pendingAppts.length})` : `(${pendingProjects.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'policies' && (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {pendingPolicies.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No pending policies.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingPolicies.map(policy => (
                <div key={policy.id} className="p-5 hover:bg-background">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setViewItem(policy)}>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground">{policy.title}</h3>
                        <StatusBadge status={policy.status} />
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${policy.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>{policy.priority}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{policy.category} · Submitted by {policy.submittedBy} on {policy.submittedDate}</p>
                      <p className="text-sm text-muted-foreground">{policy.description}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => approve(policy)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-600 text-primary-foreground rounded-lg hover:bg-emerald-700 transition-colors">
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button onClick={() => reject(policy)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {pendingAppts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No pending appointments.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-background">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Position</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Qualification</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Exp.</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingAppts.map(appt => (
                    <tr key={appt.id} className="border-b border-slate-50 hover:bg-background">
                      <td className="px-5 py-3 font-medium text-foreground">{appt.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{appt.position}</td>
                      <td className="px-4 py-3 text-muted-foreground">{appt.qualification}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{appt.experience} yrs</td>
                      <td className="px-4 py-3"><StatusBadge status={appt.status} /></td>
                      <td className="px-4 py-3">
                        <button onClick={() => approveAppt(appt)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-amber-500 text-primary-foreground rounded-lg hover:bg-amber-600">
                          <CheckCircle className="w-3 h-3" /> Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="space-y-3">
          {pendingProjects.length === 0 ? (
            <div className="bg-card rounded-lg border border-border py-12 text-center text-muted-foreground">No planned projects pending activation.</div>
          ) : pendingProjects.map(p => (
            <div key={p.id} className="bg-card rounded-lg border border-border p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-foreground">{p.name}</h3>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">Lead: {p.lead} · Category: {p.category} · Budget: ₹{(p.budget / 10000000).toFixed(1)} Cr</p>
                  <p className="text-sm text-muted-foreground">{p.description}</p>
                </div>
                <button onClick={() => updateProject({ ...p, status: 'Ongoing' })} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-500 text-primary-foreground rounded-lg hover:bg-amber-600 flex-shrink-0">
                  <CheckCircle className="w-3.5 h-3.5" /> Activate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewItem && (
        <Modal open={!!viewItem} onClose={() => setViewItem(null)} title={viewItem.title} size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { l: 'Category', v: viewItem.category },
                { l: 'Priority', v: viewItem.priority },
                { l: 'Submitted By', v: viewItem.submittedBy },
                { l: 'Date', v: viewItem.submittedDate },
              ].map(i => (
                <div key={i.l} className="bg-background rounded-md p-3">
                  <p className="text-xs text-muted-foreground">{i.l}</p>
                  <p className="font-semibold text-foreground text-sm mt-0.5">{i.v}</p>
                </div>
              ))}
            </div>
            <div className="bg-background rounded-md p-4">
              <p className="text-sm text-foreground leading-relaxed">{viewItem.description}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
