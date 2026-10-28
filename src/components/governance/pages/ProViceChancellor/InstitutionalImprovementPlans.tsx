import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '@/components/governance/context';
import { ImprovementPlan } from '@/components/governance/data';
import SectionHeader from '@/components/governance/components/shared/SectionHeader';
import StatusBadge from '@/components/governance/components/shared/StatusBadge';
import ProgressBar from '@/components/governance/components/shared/ProgressBar';
import Modal from '@/components/governance/components/shared/Modal';
import StatsCard from '@/components/governance/components/shared/StatsCard';
import { TrendingUp, CheckCircle, Clock } from 'lucide-react';

function PlanForm({ plan, onSave, onClose }: { plan?: ImprovementPlan; onSave: (p: ImprovementPlan) => void; onClose: () => void }) {
  const [form, setForm] = useState<Partial<ImprovementPlan>>(plan ?? { status: 'Submitted', priority: 'Medium', progress: 0 });
  const set = (k: keyof ImprovementPlan, v: string | number) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1">Plan Title *</label>
        <input value={form.title ?? ''} onChange={e => set('title', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">Department</label>
          <input value={form.department ?? ''} onChange={e => set('department', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">Submitted By</label>
          <input value={form.submittedBy ?? ''} onChange={e => set('submittedBy', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">Priority</label>
          <select value={form.priority ?? ''} onChange={e => set('priority', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
            {['High', 'Medium', 'Low'].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">Status</label>
          <select value={form.status ?? ''} onChange={e => set('status', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
            {['Submitted', 'In Review', 'Approved', 'Implemented'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">Progress %</label>
          <input type="number" min="0" max="100" value={form.progress ?? 0} onChange={e => set('progress', parseInt(e.target.value) || 0)} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1">Description</label>
        <textarea value={form.description ?? ''} onChange={e => set('description', e.target.value)} rows={3} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none" />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg">Cancel</button>
        <button onClick={() => { if (!form.title) return; onSave({ ...form, id: plan?.id ?? `ip${Date.now()}`, submittedDate: form.submittedDate ?? new Date().toISOString().split('T')[0] } as ImprovementPlan); }} className="px-4 py-2 text-sm font-medium bg-rose-600 text-primary-foreground rounded-lg hover:bg-rose-700">
          {plan ? 'Update Plan' : 'Submit Plan'}
        </button>
      </div>
    </div>
  );
}

export default function InstitutionalImprovementPlans() {
  const { improvementPlans, addImprovementPlan } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ImprovementPlan | null>(null);

  const counts = {
    total: improvementPlans.length,
    approved: improvementPlans.filter(p => p.status === 'Approved').length,
    implemented: improvementPlans.filter(p => p.status === 'Implemented').length,
    pending: improvementPlans.filter(p => p.status === 'Submitted' || p.status === 'In Review').length,
  };

  return (
    <div>
      <SectionHeader
        title="Institutional Improvement Plans"
        subtitle="Review and monitor departmental improvement proposals and implementation progress"
        action={
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-primary-foreground text-sm font-medium rounded-lg hover:bg-rose-700">
            <Plus className="w-4 h-4" /> Submit Plan
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
        <StatsCard title="Total Plans" value={counts.total} icon={<TrendingUp className="w-5 h-5 text-rose-600" />} iconBg="bg-rose-50" layout="horizontal" />
        <StatsCard title="Approved" value={counts.approved} icon={<CheckCircle className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-50" layout="horizontal" />
        <StatsCard title="Implemented" value={counts.implemented} icon={<CheckCircle className="w-5 h-5 text-teal-600" />} iconBg="bg-teal-50" layout="horizontal" />
        <StatsCard title="Pending Review" value={counts.pending} icon={<Clock className="w-5 h-5 text-amber-600" />} iconBg="bg-amber-50" layout="horizontal" />
      </div>

      <div className="space-y-2">
        {improvementPlans.map(plan => (
          <div
            key={plan.id}
            onDoubleClick={() => setSelectedPlan(plan)}
            title="Double-click for details"
            className="bg-card rounded-lg border border-border p-5 hover:shadow-sm transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-bold text-foreground">{plan.title}</h3>
                  <StatusBadge status={plan.status} />
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${plan.priority === 'High' ? 'bg-red-100 text-red-600' : plan.priority === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-muted text-muted-foreground'}`}>{plan.priority}</span>
                </div>
                <div className="text-xs text-muted-foreground flex flex-wrap gap-3">
                  <span>Dept: <span className="font-medium text-muted-foreground">{plan.department}</span></span>
                  <span>By: <span className="font-medium text-muted-foreground">{plan.submittedBy}</span></span>
                  <span>Date: <span className="font-medium text-muted-foreground">{plan.submittedDate}</span></span>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-xl font-bold ${plan.progress === 100 ? 'text-emerald-600' : plan.progress >= 50 ? 'text-primary' : 'text-amber-600'}`}>{plan.progress}%</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
            <ProgressBar value={plan.progress} color={plan.progress === 100 ? 'bg-teal-500' : plan.progress >= 60 ? 'bg-emerald-500' : plan.progress >= 30 ? 'bg-amber-500' : 'bg-slate-300'} showLabel={false} />
          </div>
        ))}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Submit New Improvement Plan" size="lg">
        <PlanForm
          onSave={p => { addImprovementPlan(p); setShowForm(false); }}
          onClose={() => setShowForm(false)}
        />
      </Modal>

      {selectedPlan && (
        <Modal open={!!selectedPlan} onClose={() => setSelectedPlan(null)} title={selectedPlan.title} subtitle="Improvement plan details" size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Department', value: selectedPlan.department },
                { label: 'Submitted By', value: selectedPlan.submittedBy },
                { label: 'Submitted Date', value: selectedPlan.submittedDate },
                { label: 'Status', value: selectedPlan.status },
                { label: 'Priority', value: selectedPlan.priority },
                { label: 'Progress', value: `${selectedPlan.progress}%` },
              ].map(detail => (
                <div key={detail.label} className="bg-background rounded-md p-3">
                  <p className="text-xs text-muted-foreground mb-1">{detail.label}</p>
                  <p className="font-semibold text-foreground text-sm">{detail.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-background rounded-md p-4">
              <h4 className="text-sm font-bold text-foreground mb-2">Description</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedPlan.description}</p>
            </div>
            <ProgressBar value={selectedPlan.progress} color={selectedPlan.progress === 100 ? 'bg-teal-500' : selectedPlan.progress >= 60 ? 'bg-emerald-500' : selectedPlan.progress >= 30 ? 'bg-amber-500' : 'bg-slate-300'} />
          </div>
        </Modal>
      )}
    </div>
  );
}
