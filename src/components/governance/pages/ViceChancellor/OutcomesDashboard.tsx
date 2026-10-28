import { useApp } from '@/components/governance/context';
import SectionHeader from '@/components/governance/components/shared/SectionHeader';
import StatsCard from '@/components/governance/components/shared/StatsCard';
import ProgressBar from '@/components/governance/components/shared/ProgressBar';
import BarChart from '@/components/governance/components/shared/BarChart';
import { TrendingUp, Award, Users, GraduationCap } from 'lucide-react';

const OUTCOMES = [
  { label: 'Graduate Employment Rate', value: 87, target: 90, color: 'bg-emerald-500' },
  { label: 'Student Retention Rate', value: 94, target: 95, color: 'bg-primary/100' },
  { label: 'Alumni Satisfaction Score', value: 88, target: 90, color: 'bg-purple-500' },
  { label: 'Research Citation Index', value: 72, target: 80, color: 'bg-primary/100' },
  { label: 'NAAC Preparation Score', value: 91, target: 95, color: 'bg-amber-500' },
  { label: 'Student-Faculty Ratio', value: 78, target: 85, color: 'bg-rose-500' },
];

export default function OutcomesDashboard() {
  const { departments, collaborations, projects, achievements } = useApp();

  const activeProjects = projects.filter(p => p.status === 'Ongoing').length;
  const activeCollabs = collaborations.filter(c => c.status === 'Active').length;

  const placementData = [
    { label: 'CSE', value: 94, color: 'bg-primary/100' },
    { label: 'ECE', value: 88, color: 'bg-emerald-500' },
    { label: 'ME', value: 82, color: 'bg-amber-500' },
    { label: 'CE', value: 79, color: 'bg-rose-500' },
    { label: 'MBA', value: 91, color: 'bg-purple-500' },
  ];

  return (
    <div>
      <SectionHeader title="Outcomes Dashboard" subtitle="Institutional outcomes: academic, research, placement, and strategic performance" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
        <StatsCard title="Placement Rate" value="87%" subtitle="Eligible students placed" icon={<TrendingUp className="w-5 h-5 text-amber-600" />} iconBg="bg-amber-50" trend={{ value: 4.2, label: 'vs last year' }} layout="horizontal" />
        <StatsCard title="Achievements" value={achievements.length} subtitle="Awards & accreditations" icon={<Award className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-50" layout="horizontal" />
        <StatsCard title="Active Collaborations" value={activeCollabs} icon={<Users className="w-5 h-5 text-primary" />} iconBg="bg-primary/10" layout="horizontal" />
        <StatsCard title="Projects Ongoing" value={activeProjects} icon={<GraduationCap className="w-5 h-5 text-purple-600" />} iconBg="bg-purple-50" layout="horizontal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
        <div className="bg-card rounded-lg border border-border p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Key Institutional Outcomes</h3>
          <div className="space-y-4">
            {OUTCOMES.map(o => (
              <div key={o.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-foreground">{o.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Target: {o.target}%</span>
                    <span className={`text-sm font-bold ${o.value >= o.target ? 'text-emerald-600' : 'text-amber-600'}`}>{o.value}%</span>
                  </div>
                </div>
                <ProgressBar value={o.value} color={o.color} showLabel={false} size="sm" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="bg-card rounded-lg border border-border p-5">
            <BarChart data={placementData} title="Placement Rate by Department (%)" height={150} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-amber-50 rounded-lg border border-amber-100 p-4">
              <p className="text-xs text-amber-600 font-semibold mb-1">Avg. Package</p>
              <p className="text-2xl font-bold text-amber-700">₹5.8 LPA</p>
              <p className="text-xs text-amber-600 mt-0.5">+12% vs last year</p>
            </div>
            <div className="bg-emerald-50 rounded-lg border border-emerald-100 p-4">
              <p className="text-xs text-emerald-600 font-semibold mb-1">Highest Package</p>
              <p className="text-2xl font-bold text-emerald-700">₹24 LPA</p>
              <p className="text-xs text-emerald-600 mt-0.5">Infosys – CSE Student</p>
            </div>
          </div>
        </div>
      </div>

      {/* Academic performance summary */}
      <div className="bg-card rounded-lg border border-border">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-base font-bold text-foreground">Academic Outcomes by Department</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Department</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Pass Rate</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Research Projects</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Students</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(d => (
                <tr key={d.id} className="border-b border-slate-50 hover:bg-background">
                  <td className="px-5 py-3 font-medium text-foreground">{d.name}</td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-600">{d.passRate}%</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{d.researchProjects}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{d.students}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${d.passRate >= 92 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {d.passRate >= 92 ? 'Excellent' : 'Good'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
