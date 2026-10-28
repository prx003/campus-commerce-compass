import { useApp } from '@/components/governance/context';
import SectionHeader from '@/components/governance/components/shared/SectionHeader';
import StatusBadge from '@/components/governance/components/shared/StatusBadge';
import ProgressBar from '@/components/governance/components/shared/ProgressBar';
import StatsCard from '@/components/governance/components/shared/StatsCard';
import { Settings, CheckCircle, Clock } from 'lucide-react';

const IMPLEMENTATIONS = [
  { id: 'pi1', policy: 'Academic Integrity Policy 2024', dept: 'All Departments', implementationLead: 'Dean Academics', targetDate: '2024-08-01', progress: 90, status: 'In Progress', notes: 'Plagiarism detection software deployed. Faculty training 85% complete.' },
  { id: 'pi2', policy: 'Research Grant Utilization Policy', dept: 'Research Cell', implementationLead: 'Dean Research', targetDate: '2024-07-31', progress: 100, status: 'Done', notes: 'All grant utilization reports filed. Audit completed with zero adverse findings.' },
  { id: 'pi3', policy: 'Campus Safety & Security Protocol', dept: 'Admin Office', implementationLead: 'Chief Security Officer', targetDate: '2024-06-30', progress: 100, status: 'Done', notes: 'CCTV expanded to 120 cameras. Visitor management system deployed.' },
  { id: 'pi4', policy: 'Anti-Ragging Policy Amendment', dept: 'Student Affairs', implementationLead: 'Dean Students', targetDate: '2024-08-10', progress: 75, status: 'In Progress', notes: 'Anonymous reporting portal live. Fresher orientation anti-ragging module pending.' },
  { id: 'pi5', policy: 'E-Learning Platform Adoption Policy', dept: 'IT Dept + All Depts', implementationLead: 'IT Head', targetDate: '2024-10-31', progress: 40, status: 'In Progress', notes: 'LMS platform selected. Pilot with CSE & MBA departments started.' },
  { id: 'pi6', policy: 'Faculty Recruitment Policy Revision', dept: 'HR Department', implementationLead: 'HR Head', targetDate: '2024-09-30', progress: 20, status: 'Pending', notes: 'Policy approved by VC. Implementation guidelines being prepared by HR.' },
];

export default function PolicyImplementation() {
  const { policies } = useApp();
  const approvedPolicies = policies.filter(p => p.status === 'Approved').length;
  const done = IMPLEMENTATIONS.filter(i => i.status === 'Done').length;
  const inProg = IMPLEMENTATIONS.filter(i => i.status === 'In Progress').length;

  return (
    <div>
      <SectionHeader title="Policy Implementation" subtitle="Oversee implementation of approved policies across the institution" />

      <div className="grid grid-cols-3 gap-2 mb-2">
        <StatsCard title="Approved Policies" value={approvedPolicies} icon={<Settings className="w-5 h-5 text-rose-600" />} iconBg="bg-rose-50" layout="horizontal" />
        <StatsCard title="Fully Implemented" value={done} icon={<CheckCircle className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-50" layout="horizontal" />
        <StatsCard title="In Progress" value={inProg} icon={<Clock className="w-5 h-5 text-primary" />} iconBg="bg-primary/10" layout="horizontal" />
      </div>

      <div className="space-y-2">
        {IMPLEMENTATIONS.map(item => (
          <div key={item.id} className="bg-card rounded-lg border border-border p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-bold text-foreground">{item.policy}</h3>
                  <StatusBadge status={item.status} />
                </div>
                <div className="text-xs text-muted-foreground flex flex-wrap gap-3">
                  <span>Dept: <span className="font-medium text-muted-foreground">{item.dept}</span></span>
                  <span>Lead: <span className="font-medium text-muted-foreground">{item.implementationLead}</span></span>
                  <span>Target: <span className="font-medium text-muted-foreground">{item.targetDate}</span></span>
                </div>
              </div>
              <span className={`text-xl font-bold flex-shrink-0 ${item.progress === 100 ? 'text-emerald-600' : item.progress >= 60 ? 'text-primary' : 'text-amber-600'}`}>{item.progress}%</span>
            </div>
            <ProgressBar value={item.progress} color={item.progress === 100 ? 'bg-emerald-500' : item.progress >= 60 ? 'bg-primary/100' : 'bg-amber-500'} showLabel={false} />
            <p className="text-sm text-muted-foreground mt-3 bg-background rounded-lg p-3">{item.notes}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
