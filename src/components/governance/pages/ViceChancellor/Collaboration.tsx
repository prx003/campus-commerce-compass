import { useState } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import { useApp } from '@/components/governance/context';
import { Collaboration as CollabType } from '@/components/governance/data';
import SectionHeader from '@/components/governance/components/shared/SectionHeader';
import StatusBadge from '@/components/governance/components/shared/StatusBadge';
import Modal from '@/components/governance/components/shared/Modal';
import StatsCard from '@/components/governance/components/shared/StatsCard';
import { Handshake, Globe, Building2 } from 'lucide-react';

function CollabForm({ collab, onSave, onClose }: { collab?: CollabType; onSave: (c: CollabType) => void; onClose: () => void }) {
  const [form, setForm] = useState<Partial<CollabType>>(collab ?? { status: 'Active', type: 'MoU' });
  const set = (k: keyof CollabType, v: string) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">Partner Name *</label>
          <input value={form.partner ?? ''} onChange={e => set('partner', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">Type</label>
          <select value={form.type ?? ''} onChange={e => set('type', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
            {['MoU', 'Research', 'Industry', 'International'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">Start Date</label>
          <input type="date" value={form.startDate ?? ''} onChange={e => set('startDate', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">End Date</label>
          <input type="date" value={form.endDate ?? ''} onChange={e => set('endDate', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">Status</label>
          <select value={form.status ?? ''} onChange={e => set('status', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
            {['Active', 'Pending', 'Expired'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1">Description</label>
        <textarea value={form.description ?? ''} onChange={e => set('description', e.target.value)} rows={2} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1">Benefits</label>
        <textarea value={form.benefits ?? ''} onChange={e => set('benefits', e.target.value)} rows={2} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg">Cancel</button>
        <button onClick={() => { if (!form.partner) return; onSave({ ...form, id: collab?.id ?? `co${Date.now()}` } as CollabType); }} className="px-4 py-2 text-sm font-medium bg-amber-500 text-primary-foreground rounded-lg hover:bg-amber-600">
          {collab ? 'Update' : 'Add Collaboration'}
        </button>
      </div>
    </div>
  );
}

const typeColors: Record<string, string> = {
  MoU: 'bg-primary/10 text-primary',
  Research: 'bg-purple-100 text-purple-700',
  Industry: 'bg-emerald-100 text-emerald-700',
  International: 'bg-amber-100 text-amber-700',
};

export default function Collaboration() {
  const { collaborations, updateCollaboration, addCollaboration } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editCollab, setEditCollab] = useState<CollabType | undefined>(undefined);

  return (
    <div>
      <SectionHeader
        title="Collaboration"
        subtitle="MoUs, academic partnerships, and industry-research collaborations"
        action={
          <button onClick={() => { setEditCollab(undefined); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-primary-foreground text-sm font-medium rounded-lg hover:bg-amber-600">
            <Plus className="w-4 h-4" /> Add Collaboration
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
        <StatsCard title="Total Collaborations" value={collaborations.length} icon={<Handshake className="w-5 h-5 text-amber-600" />} iconBg="bg-amber-50" layout="horizontal" />
        <StatsCard title="Active MoUs" value={collaborations.filter(c => c.status === 'Active').length} icon={<Handshake className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-50" layout="horizontal" />
        <StatsCard title="International" value={collaborations.filter(c => c.type === 'International').length} icon={<Globe className="w-5 h-5 text-primary" />} iconBg="bg-primary/10" layout="horizontal" />
        <StatsCard title="Industry" value={collaborations.filter(c => c.type === 'Industry').length} icon={<Building2 className="w-5 h-5 text-purple-600" />} iconBg="bg-purple-50" layout="horizontal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {collaborations.map(c => (
          <div key={c.id} className="bg-card rounded-lg border border-border p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeColors[c.type] ?? 'bg-muted text-muted-foreground'}`}>{c.type}</span>
                  <StatusBadge status={c.status} />
                </div>
                <h3 className="font-bold text-foreground">{c.partner}</h3>
                <p className="text-xs text-muted-foreground">{c.startDate} → {c.endDate}</p>
              </div>
              <button onClick={() => { setEditCollab(c); setShowForm(true); }} className="p-1.5 text-muted-foreground hover:text-amber-600 hover:bg-amber-50 rounded-lg">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{c.description}</p>
            <div className="bg-amber-50 rounded-md p-3">
              <p className="text-xs font-semibold text-amber-700 mb-1">Key Benefits</p>
              <p className="text-xs text-amber-800">{c.benefits}</p>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editCollab ? 'Edit Collaboration' : 'Add New Collaboration'} size="lg">
        <CollabForm
          collab={editCollab}
          onSave={c => { editCollab ? updateCollaboration(c) : addCollaboration(c); setShowForm(false); }}
          onClose={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
}
