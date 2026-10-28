import { useState } from 'react';
import { useApp } from '@/components/governance/context';
import SectionHeader from '@/components/governance/components/shared/SectionHeader';
import StatusBadge from '@/components/governance/components/shared/StatusBadge';
import ProgressBar from '@/components/governance/components/shared/ProgressBar';
import StatsCard from '@/components/governance/components/shared/StatsCard';
import Modal from '@/components/governance/components/shared/Modal';
import { Rocket, CheckCircle, Clock, Target } from 'lucide-react';

const INITIATIVES = [
  { id: 'i1', title: 'Vision 2030: Research University Transformation', description: 'Transforming the institution into a research-intensive university with PhD programs across all departments.', status: 'Ongoing', progress: 40, lead: 'Vice-Chancellor', target: '2030' },
  { id: 'i2', title: 'International Accreditation Drive', description: 'Seeking ABET accreditation for CSE and ECE programs and AACSB accreditation for MBA.', status: 'Ongoing', progress: 55, lead: 'Academic Affairs', target: '2025' },
  { id: 'i4', title: 'Faculty Excellence Program', description: 'Funded sabbaticals, PhD completion grants, and overseas research fellowships for faculty members.', status: 'Ongoing', progress: 70, lead: 'HR Dept', target: '2025' },
  { id: 'i5', title: 'Student Success Initiative', description: 'Holistic mentoring, remedial coaching, mental health support, and career readiness programs.', status: 'Ongoing', progress: 80, lead: 'Dean Students', target: '2024' },
];

export default function InstitutionalDevelopment() {
  const { projects } = useApp();
  const [selectedInitiative, setSelectedInitiative] = useState<typeof INITIATIVES[number] | null>(null);
  const ongoing = projects.filter(p => p.status === 'Ongoing').length;
  const completed = projects.filter(p => p.status === 'Completed').length;

  return (
    <div>
      <SectionHeader title="Institutional Development" subtitle="Strategic development plans and long-term growth initiatives" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
        <StatsCard title="Active Initiatives" value={INITIATIVES.filter(i => i.status === 'Ongoing').length} icon={<Rocket className="w-5 h-5 text-primary" />} iconBg="bg-primary/10" layout="horizontal" />
        <StatsCard title="Completed" value={completed} icon={<CheckCircle className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-50" layout="horizontal" />
        <StatsCard title="Ongoing Projects" value={ongoing} icon={<Clock className="w-5 h-5 text-amber-600" />} iconBg="bg-amber-50" layout="horizontal" />
        <StatsCard title="Planned" value={INITIATIVES.filter(i => i.status === 'Planned').length} icon={<Target className="w-5 h-5 text-purple-600" />} iconBg="bg-purple-50" layout="horizontal" />
      </div>

      <div className="space-y-2 mb-2">
        <h3 className="text-base font-bold text-foreground">Strategic Initiatives</h3>
        {INITIATIVES.map(item => (
          <div key={item.id} className="bg-card rounded-lg border border-border p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-foreground">{item.title}</h4>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-sm text-muted-foreground">Lead: {item.lead} · Target: {item.target}</p>
              </div>
              <span className={`text-xl font-bold ${item.progress >= 70 ? 'text-emerald-600' : item.progress >= 40 ? 'text-amber-600' : 'text-muted-foreground'}`}>{item.progress}%</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
            <ProgressBar value={item.progress} color={item.progress >= 70 ? 'bg-emerald-500' : item.progress >= 40 ? 'bg-amber-500' : 'bg-slate-300'} showLabel={false} />
          </div>
        ))}
      </div>

      {selectedInitiative && (
        <Modal open={!!selectedInitiative} onClose={() => setSelectedInitiative(null)} title={selectedInitiative.title} subtitle="Strategic initiative details" size="lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background rounded-md p-4">
              <p className="text-xs text-muted-foreground mb-1">Lead Role</p>
              <p className="font-semibold text-foreground">{selectedInitiative.lead}</p>
            </div>
            <div className="bg-background rounded-md p-4">
              <p className="text-xs text-muted-foreground mb-1">Target Year</p>
              <p className="font-semibold text-foreground">{selectedInitiative.target}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Projects */}
      <div className="bg-card rounded-lg border border-border">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-base font-bold text-foreground">Active Development Projects</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Project</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Lead</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Progress</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-background">
                  <td className="px-5 py-3 font-medium text-foreground">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.lead}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-right font-semibold text-primary">{p.progress}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
