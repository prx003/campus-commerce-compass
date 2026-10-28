import { useState } from 'react';
import SectionHeader from '@/components/governance/components/shared/SectionHeader';
import StatusBadge from '@/components/governance/components/shared/StatusBadge';
import StatsCard from '@/components/governance/components/shared/StatsCard';
import ProgressBar from '@/components/governance/components/shared/ProgressBar';
import Modal from '@/components/governance/components/shared/Modal';
import { CheckSquare, Clock, AlertCircle } from 'lucide-react';
import { useApp } from '@/components/governance/context';

const INITIAL_DECISIONS = [
  { id: 'd1', decision: 'Budget ₹1.2 Cr approved for new academic block infrastructure', meeting: 'Annual Board Review', date: '2024-07-15', status: 'In Progress', responsible: 'Admin Office' },
  { id: 'd2', decision: 'New faculty positions (3) sanctioned for ECE department', meeting: 'Annual Board Review', date: '2024-07-15', status: 'Done', responsible: 'HR Dept' },
  { id: 'd3', decision: 'Strategic plan 2025-2030 formally adopted', meeting: 'Annual Board Review', date: '2024-07-15', status: 'Done', responsible: 'Planning Committee' },
  { id: 'd4', decision: 'Fee revision for PG programs deferred to FY 2025-26', meeting: 'Finance Committee', date: '2024-07-28', status: 'Pending', responsible: 'Finance Dept' },
  { id: 'd5', decision: 'Research fund ₹50L released to CSE department', meeting: 'Finance Committee', date: '2024-07-28', status: 'Done', responsible: 'Finance Dept' },
];

export default function DecisionMonitoring() {
  const { meetings } = useApp();
  const [filter, setFilter] = useState('All');
  const [decisions, setDecisions] = useState(INITIAL_DECISIONS);
  const [selectedDecision, setSelectedDecision] = useState<typeof INITIAL_DECISIONS[number] | null>(null);

  const allActions = meetings.flatMap(m =>
    (m.actionItems ?? []).map(a => ({ ...a, meetingTitle: m.title, meetingDate: m.date }))
  );

  const filtered = filter === 'All' ? allActions : allActions.filter(a => a.status === filter);

  const counts = {
    total: allActions.length,
    done: allActions.filter(a => a.status === 'Done').length,
    inProgress: allActions.filter(a => a.status === 'In Progress').length,
    pending: allActions.filter(a => a.status === 'Pending').length,
  };

  const completionPct = counts.total > 0 ? Math.round((counts.done / counts.total) * 100) : 0;

  const updateDecisionStatus = (status: string) => {
    if (!selectedDecision) return;
    const updatedDecision = { ...selectedDecision, status };
    setDecisions(currentDecisions => currentDecisions.map(decision => decision.id === updatedDecision.id ? updatedDecision : decision));
    setSelectedDecision(updatedDecision);
  };

  return (
    <div>
      <SectionHeader title="Decision Monitoring" subtitle="Track implementation status of decisions approved across executive meetings" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
        <StatsCard title="Total Actions" value={counts.total + decisions.length} icon={<CheckSquare className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-50" layout="horizontal" />
        <StatsCard title="Completed" value={counts.done + decisions.filter(d => d.status === 'Done').length} icon={<CheckSquare className="w-5 h-5 text-teal-600" />} iconBg="bg-teal-50" layout="horizontal" />
        <StatsCard title="In Progress" value={counts.inProgress + decisions.filter(d => d.status === 'In Progress').length} icon={<Clock className="w-5 h-5 text-primary" />} iconBg="bg-primary/10" layout="horizontal" />
        <StatsCard title="Pending" value={counts.pending + decisions.filter(d => d.status === 'Pending').length} icon={<AlertCircle className="w-5 h-5 text-amber-600" />} iconBg="bg-amber-50" layout="horizontal" />
      </div>

      <div className="bg-card rounded-lg border border-border p-5 mb-2">
        <h3 className="text-sm font-bold text-foreground mb-3">Overall Implementation Progress</h3>
        <ProgressBar value={completionPct} color="bg-emerald-500" />
        <p className="text-xs text-muted-foreground mt-2">{counts.done} of {counts.total} action items completed ({completionPct}%)</p>
      </div>

      <div className="bg-card rounded-lg border border-border mb-6">
        <div className="px-5 py-4 border-b border-border flex gap-2 flex-wrap">
          {['All', 'Done', 'In Progress', 'Pending'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filter === s ? 'bg-emerald-600 text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted'}`}>{s}</button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Decision / Action</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Source Meeting</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Responsible</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Deadline</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {decisions.filter(d => filter === 'All' || d.status === filter).map(d => (
                <tr key={d.id} onDoubleClick={() => setSelectedDecision(d)} title="Double-click to update status" className="border-b border-slate-50 hover:bg-background cursor-pointer">
                  <td className="px-5 py-3 text-foreground font-medium max-w-xs">{d.decision}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{d.meeting}</td>
                  <td className="px-4 py-3 text-muted-foreground">{d.responsible}</td>
                  <td className="px-4 py-3 text-muted-foreground">{d.date}</td>
                  <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                </tr>
              ))}
              {filtered.map((a, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-background">
                  <td className="px-5 py-3 text-foreground font-medium">{a.task}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{a.meetingTitle}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.assignedTo}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.deadline}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedDecision && (
        <Modal open={!!selectedDecision} onClose={() => setSelectedDecision(null)} title="Decision Status" subtitle={selectedDecision.decision} size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Source Meeting', value: selectedDecision.meeting },
                { label: 'Responsible', value: selectedDecision.responsible },
                { label: 'Deadline', value: selectedDecision.date },
              ].map(detail => (
                <div key={detail.label} className="bg-background rounded-md p-3">
                  <p className="text-xs text-muted-foreground mb-1">{detail.label}</p>
                  <p className="font-semibold text-foreground text-sm">{detail.value}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button onClick={() => updateDecisionStatus('Pending')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors">
                <AlertCircle className="w-4 h-4" /> Mark Pending
              </button>
              <button onClick={() => updateDecisionStatus('In Progress')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors">
                <Clock className="w-4 h-4" /> In Progress
              </button>
              <button onClick={() => updateDecisionStatus('Done')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">
                <CheckSquare className="w-4 h-4" /> Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
