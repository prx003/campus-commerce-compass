import SectionHeader from '@/components/governance/components/shared/SectionHeader';
import StatusBadge from '@/components/governance/components/shared/StatusBadge';
import StatsCard from '@/components/governance/components/shared/StatsCard';
import ProgressBar from '@/components/governance/components/shared/ProgressBar';
import { Network, CheckCircle, Clock } from 'lucide-react';
import { useApp } from '@/components/governance/context';

const TASKS = [
  { id: 't1', task: "Disseminate VC's circular on NAAC preparation to all departments", from: 'Vice-Chancellor', dept: 'All Depts', deadline: '2024-07-25', status: 'Done', priority: 'High' },
  { id: 't2', task: 'Coordinate lab modernization schedule with CSE and ECE HoDs', from: 'VC Approval', dept: 'CSE & ECE', deadline: '2024-08-10', status: 'In Progress', priority: 'High' },
  { id: 't3', task: 'Ensure all departments submit NAAC self-study data', from: 'Academic Affairs', dept: 'All Depts', deadline: '2024-08-15', status: 'In Progress', priority: 'High' },
  { id: 't4', task: 'Coordinate examination calendar finalization with CoE', from: 'Registrar', dept: 'Exam Cell', deadline: '2024-07-30', status: 'Done', priority: 'Medium' },
  { id: 't5', task: 'Facilitate FDP program registrations across departments', from: 'IQAC', dept: 'All Depts', deadline: '2024-07-31', status: 'In Progress', priority: 'Medium' },
  { id: 't6', task: 'Review new hostel expansion project timeline with admin', from: 'Admin Office', dept: 'Admin', deadline: '2024-09-01', status: 'Pending', priority: 'Low' },
  { id: 't7', task: 'Arrange orientation for new faculty batch joining Aug 2024', from: 'HR Dept', dept: 'All Depts', deadline: '2024-08-01', status: 'Pending', priority: 'Medium' },
];

export default function InstitutionalCoordination() {
  const { meetings, projects } = useApp();
  const done = TASKS.filter(t => t.status === 'Done').length;
  const inProgress = TASKS.filter(t => t.status === 'In Progress').length;
  const pending = TASKS.filter(t => t.status === 'Pending').length;

  return (
    <div>
      <SectionHeader title="Institutional Coordination" subtitle="Coordinate VC decisions across departments and track execution progress" />

      <div className="grid grid-cols-3 gap-2 mb-2">
        <StatsCard title="Completed Tasks" value={done} icon={<CheckCircle className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-50" layout="horizontal" />
        <StatsCard title="In Progress" value={inProgress} icon={<Clock className="w-5 h-5 text-primary" />} iconBg="bg-primary/10" layout="horizontal" />
        <StatsCard title="Pending" value={pending} icon={<Network className="w-5 h-5 text-amber-600" />} iconBg="bg-amber-50" layout="horizontal" />
      </div>

      <div className="bg-card rounded-lg border border-border p-5 mb-2">
        <h3 className="text-sm font-bold text-foreground mb-3">Coordination Progress</h3>
        <ProgressBar value={(done / TASKS.length) * 100} color="bg-rose-500" label={`${done}/${TASKS.length} tasks completed`} />
      </div>

      <div className="bg-card rounded-lg border border-border">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-base font-bold text-foreground">Coordination Tasks</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Task</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Source</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Department</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Deadline</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {TASKS.map(t => (
                <tr key={t.id} className="border-b border-slate-50 hover:bg-background">
                  <td className="px-5 py-3 text-foreground font-medium max-w-xs">{t.task}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{t.from}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.dept}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.deadline}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${t.priority === 'High' ? 'bg-red-100 text-red-600' : t.priority === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-muted text-muted-foreground'}`}>{t.priority}</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
