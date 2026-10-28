import { useApp } from '@/components/governance/context';
import SectionHeader from '@/components/governance/components/shared/SectionHeader';
import ProgressBar from '@/components/governance/components/shared/ProgressBar';
import BarChart from '@/components/governance/components/shared/BarChart';
import { TrendingUp } from 'lucide-react';

const KPIs = [
  { label: 'Academic Excellence', value: 92, color: 'bg-primary/100', target: 95 },
  { label: 'Research Output', value: 78, color: 'bg-emerald-500', target: 85 },
  { label: 'Student Satisfaction', value: 88, color: 'bg-amber-500', target: 90 },
  { label: 'Faculty Development', value: 83, color: 'bg-purple-500', target: 88 },
  { label: 'Industry Connect', value: 76, color: 'bg-rose-500', target: 80 },
  { label: 'Infrastructure Quality', value: 85, color: 'bg-primary/100', target: 90 },
  { label: 'Placement Rate', value: 89, color: 'bg-teal-500', target: 92 },
  { label: 'Financial Health', value: 82, color: 'bg-orange-500', target: 85 },
];

export default function InstitutionalPerformance() {
  const { departments } = useApp();

  const passRateData = departments.map(d => ({ label: d.code, value: d.passRate, color: 'bg-primary/100' }));
  const facultyData = departments.map(d => ({ label: d.code, value: d.faculty, color: 'bg-emerald-500' }));

  return (
    <div>
      <SectionHeader title="Institutional Performance" subtitle="Key performance indicators across academic, administrative, and financial dimensions" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
        <div className="bg-card rounded-lg border border-border p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">KPI Scorecard</h3>
          </div>
          <div className="space-y-4">
            {KPIs.map(kpi => (
              <div key={kpi.label}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-foreground font-medium">{kpi.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Target: {kpi.target}%</span>
                    <span className={`text-sm font-bold ${kpi.value >= kpi.target ? 'text-emerald-600' : 'text-amber-600'}`}>{kpi.value}%</span>
                  </div>
                </div>
                <ProgressBar value={kpi.value} max={100} color={kpi.color} showLabel={false} size="sm" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="bg-card rounded-lg border border-border p-5">
            <BarChart data={passRateData} title="Department Pass Rates (%)" height={150} />
          </div>
          <div className="bg-card rounded-lg border border-border p-5">
            <BarChart data={facultyData} title="Faculty Count by Department" height={150} />
          </div>
        </div>
      </div>

      {/* Rankings & Accreditations */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
        {[
          { title: 'NAAC Grade', value: 'A+', sub: 'CGPA: 3.72', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'NIRF Rank', value: '#85', sub: 'Engineering Category 2024', color: 'text-primary', bg: 'bg-primary/10' },
          { title: 'NBA Accredited', value: '4/5', sub: 'Departments accredited', color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(item => (
          <div key={item.title} className={`${item.bg} rounded-lg p-5 border border-border`}>
            <p className="text-sm text-muted-foreground mb-2">{item.title}</p>
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Dept performance table */}
      <div className="bg-card rounded-lg border border-border">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-base font-bold text-foreground">Department Performance Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Department</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Pass Rate</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Research</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Faculty</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Students</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Performance</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(dept => (
                <tr key={dept.id} className="border-b border-slate-50 hover:bg-background">
                  <td className="px-5 py-3 font-medium text-foreground">{dept.name}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-semibold ${dept.passRate >= 92 ? 'text-emerald-600' : 'text-amber-600'}`}>{dept.passRate}%</span>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{dept.researchProjects}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{dept.faculty}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{dept.students}</td>
                  <td className="px-4 py-3">
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className="h-1.5 bg-primary/100 rounded-full" style={{ width: `${dept.passRate}%` }} />
                    </div>
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
