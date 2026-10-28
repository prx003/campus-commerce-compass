import { useState } from 'react';
import { Search, Edit2, CheckCircle, XCircle } from 'lucide-react';
import { useApp } from '@/components/governance/context';
import { Policy } from '@/components/governance/data';
import SectionHeader from '@/components/governance/components/shared/SectionHeader';
import StatusBadge from '@/components/governance/components/shared/StatusBadge';
import Modal from '@/components/governance/components/shared/Modal';
import { FileText, AlertCircle, Clock } from 'lucide-react';

function PolicyForm({ policy, onSave, onClose }: { policy?: Policy; onSave: (p: Policy) => void; onClose: () => void }) {
  const [suggestion, setSuggestion] = useState('');

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1">Suggest Changes</label>
        <textarea
          value={suggestion}
          onChange={e => setSuggestion(e.target.value)}
          rows={5}
          className="w-full border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Enter suggested changes for this policy..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors">Cancel</button>
        <button
          onClick={() => {
            if (!suggestion.trim()) return;
            onSave({ ...(policy ?? { id: `p${Date.now()}`, title: '', category: 'Academic', status: 'Pending', submittedBy: '', submittedDate: '', description: '', priority: 'Medium' }), suggestion } as Policy);
          }}
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Update Policy
        </button>
      </div>
    </div>
  );
}

export default function PolicyManagement() {
  const { policies, updatePolicy, addPolicy } = useApp();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [editPolicy, setEditPolicy] = useState<Policy | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [viewPolicy, setViewPolicy] = useState<Policy | null>(null);

  const filtered = policies.filter(p =>
    (filterStatus === 'All' || p.status === filterStatus) &&
    (p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))
  );

  const counts = {
    total: policies.length,
    approved: policies.filter(p => p.status === 'Approved').length,
    pending: policies.filter(p => p.status === 'Pending').length,
    review: policies.filter(p => p.status === 'Under Review').length,
  };

  const updatePolicyStatus = (status: Policy['status']) => {
    if (!viewPolicy) return;

    const updatedPolicy: Policy = {
      ...viewPolicy,
      status,
      ...(status === 'Approved'
        ? { approvedBy: 'Board of Trustees', approvedDate: new Date().toISOString().split('T')[0] }
        : { approvedBy: undefined, approvedDate: undefined }),
    };
    updatePolicy(updatedPolicy);
    setViewPolicy(updatedPolicy);
  };

  return (
    <div>
      <SectionHeader
        title="Policy Management"
        subtitle="Review, approve, and manage institutional policies"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
        <div className="flex items-center gap-2 bg-card rounded-lg border border-border p-5 hover:shadow-md transition-shadow duration-200 whitespace-nowrap">
          <p className="text-xl font-bold text-foreground leading-none">{counts.total}</p>
          <p className="text-muted-foreground text-sm font-medium">Total Policies</p>
          <div className="ml-auto w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0"><FileText className="w-5 h-5 text-primary" /></div>
        </div>
        <div className="flex items-center gap-2 bg-card rounded-lg border border-border p-5 hover:shadow-md transition-shadow duration-200 whitespace-nowrap">
          <p className="text-xl font-bold text-foreground leading-none">{counts.approved}</p>
          <p className="text-muted-foreground text-sm font-medium">Approved</p>
          <div className="ml-auto w-10 h-10 bg-emerald-50 rounded-md flex items-center justify-center flex-shrink-0"><CheckCircle className="w-5 h-5 text-emerald-600" /></div>
        </div>
        <div className="flex items-center gap-2 bg-card rounded-lg border border-border p-5 hover:shadow-md transition-shadow duration-200 whitespace-nowrap">
          <p className="text-xl font-bold text-foreground leading-none">{counts.pending}</p>
          <p className="text-muted-foreground text-sm font-medium">Pending</p>
          <div className="ml-auto w-10 h-10 bg-amber-50 rounded-md flex items-center justify-center flex-shrink-0"><Clock className="w-5 h-5 text-amber-600" /></div>
        </div>
        <div className="flex items-center gap-2 bg-card rounded-lg border border-border p-5 hover:shadow-md transition-shadow duration-200 whitespace-nowrap">
          <p className="text-xl font-bold text-foreground leading-none">{counts.review}</p>
          <p className="text-muted-foreground text-sm font-medium">Under Review</p>
          <div className="ml-auto w-10 h-10 bg-purple-50 rounded-md flex items-center justify-center flex-shrink-0"><AlertCircle className="w-5 h-5 text-purple-600" /></div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border">
        <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search policies..." className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['All', 'Approved', 'Pending', 'Rejected'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filterStatus === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted'}`}>{s}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Policy Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Submitted</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Approved By</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Suggest</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(policy => (
                <tr key={policy.id} onDoubleClick={() => setViewPolicy(policy)} className="border-b border-slate-50 hover:bg-background cursor-pointer">
                  <td className="px-5 py-3 font-medium text-foreground max-w-xs truncate">{policy.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{policy.category}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${policy.priority === 'High' ? 'bg-red-100 text-red-600' : policy.priority === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-muted text-muted-foreground'}`}>{policy.priority}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setFilterStatus(policy.status); }}
                      aria-label={`Filter policies by ${policy.status} status`}
                      className="rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                    >
                      <StatusBadge status={policy.status} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{policy.submittedDate}</td>
                  <td className="px-4 py-3 text-muted-foreground">{policy.approvedBy ?? '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={e => { e.stopPropagation(); setEditPolicy(policy); setShowForm(true); }} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No policies found.</p>}
        </div>
      </div>

      {/* Form Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editPolicy ? 'Suggest Policy' : 'Add New Policy'} size="lg">
        <PolicyForm
          policy={editPolicy}
          onSave={p => {
            if (editPolicy) updatePolicy(p);
            else addPolicy(p);
            setShowForm(false);
          }}
          onClose={() => setShowForm(false)}
        />
      </Modal>

      {/* View Modal */}
      {viewPolicy && (
        <Modal open={!!viewPolicy} onClose={() => setViewPolicy(null)} title={viewPolicy.title} subtitle={viewPolicy.category} size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Status', value: <StatusBadge status={viewPolicy.status} /> },
                { label: 'Priority', value: viewPolicy.priority },
                { label: 'Submitted By', value: viewPolicy.submittedBy },
                { label: 'Submitted Date', value: viewPolicy.submittedDate },
                { label: 'Approved By', value: viewPolicy.approvedBy ?? '—' },
                { label: 'Approved Date', value: viewPolicy.approvedDate ?? '—' },
              ].map(item => (
                <div key={item.label} className="bg-background rounded-md p-3">
                  <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                  <div className="font-semibold text-foreground text-sm">{item.value}</div>
                </div>
              ))}
            </div>
            <div className="bg-background rounded-md p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Description</p>
              <p className="text-sm text-foreground leading-relaxed">{viewPolicy.description}</p>
            </div>
            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button onClick={() => updatePolicyStatus('Pending')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors">
                <Clock className="w-4 h-4" /> Mark Pending
              </button>
              <button onClick={() => updatePolicyStatus('Rejected')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                <XCircle className="w-4 h-4" /> Reject
              </button>
              <button onClick={() => updatePolicyStatus('Approved')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
