import { useState } from 'react';
import { useApp } from '@/components/governance/context';
import { Department } from '@/components/governance/data';
import SectionHeader from '@/components/governance/components/shared/SectionHeader';
import StatsCard from '@/components/governance/components/shared/StatsCard';
import ProgressBar from '@/components/governance/components/shared/ProgressBar';
import Modal from '@/components/governance/components/shared/Modal';
import { BarChart2, TrendingUp } from 'lucide-react';

export default function DepartmentPerformance() {
  const { departments } = useApp();
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  const avgPass = Math.round(departments.reduce((s, d) => s + d.passRate, 0) / departments.length);
  const totalResearch = departments.reduce((s, d) => s + d.researchProjects, 0);

  return (
    <div>
      <SectionHeader title="Department Performance" subtitle="Monitor departmental progress and ensure institutional objectives are achieved. Double-click for details." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
        <StatsCard title="Departments" value={departments.length} icon={<BarChart2 className="w-5 h-5 text-rose-600" />} iconBg="bg-rose-50" layout="horizontal" />
        <StatsCard title="Avg Pass Rate" value={`${avgPass}%`} icon={<TrendingUp className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-50" layout="horizontal" />
        <StatsCard title="Research Projects" value={totalResearch} icon={<TrendingUp className="w-5 h-5 text-primary" />} iconBg="bg-primary/10" layout="horizontal" />
        <StatsCard title="Total Courses" value={departments.reduce((s, d) => s + d.courses.length, 0)} icon={<BarChart2 className="w-5 h-5 text-amber-600" />} iconBg="bg-amber-50" layout="horizontal" />
      </div>

      <div className="mb-2">
        <div className="bg-card rounded-lg border border-border p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Performance Rankings</h3>
          {[...departments].sort((a, b) => b.passRate - a.passRate).map((d, i) => (
            <div key={d.id} className="flex items-center gap-3 mb-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-400 text-primary-foreground' : i === 1 ? 'bg-slate-400 text-primary-foreground' : i === 2 ? 'bg-orange-400 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{i + 1}</span>
              <div className="flex-1">
                <div className="flex justify-between mb-0.5">
                  <span className="text-sm font-medium text-foreground">{d.name}</span>
                  <span className="text-sm font-bold text-emerald-600">{d.passRate}%</span>
                </div>
                <ProgressBar value={d.passRate} color={d.passRate >= 92 ? 'bg-emerald-500' : 'bg-amber-500'} showLabel={false} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-base font-bold text-foreground">Department Performance Report</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Double-click a row to view full department details including all courses</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Department</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">HoD</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Faculty</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Students</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Courses</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Pass Rate</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Research</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Grade</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(dept => (
                <tr key={dept.id} onDoubleClick={() => setSelectedDept(dept)} className="border-b border-slate-50 hover:bg-rose-50/30 cursor-pointer transition-colors">
                  <td className="px-5 py-3 font-medium text-foreground">{dept.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{dept.head}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{dept.faculty}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{dept.students}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{dept.courses.length}</td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-600">{dept.passRate}%</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{dept.researchProjects}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${dept.passRate >= 93 ? 'bg-emerald-100 text-emerald-700' : dept.passRate >= 89 ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-700'}`}>
                      {dept.passRate >= 93 ? 'Excellent' : dept.passRate >= 89 ? 'Very Good' : 'Good'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedDept && (
        <Modal open={!!selectedDept} onClose={() => setSelectedDept(null)} title={selectedDept.name} subtitle={selectedDept.code} size="xl">
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { l: 'Head', v: selectedDept.head }, { l: 'Established', v: selectedDept.established },
                { l: 'Faculty', v: selectedDept.faculty }, { l: 'Students', v: selectedDept.students },
                { l: 'Pass Rate', v: `${selectedDept.passRate}%` }, { l: 'Research Projects', v: selectedDept.researchProjects },
                { l: 'Labs', v: selectedDept.labs }, { l: 'Accreditation', v: selectedDept.accreditation },
              ].map(i => (
                <div key={i.l} className="bg-background rounded-md p-3">
                  <p className="text-xs text-muted-foreground">{i.l}</p>
                  <p className="font-semibold text-foreground text-sm mt-0.5">{i.v}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{selectedDept.description}</p>
            <div>
              <h4 className="text-sm font-bold text-foreground mb-3">Courses ({selectedDept.courses.length})</h4>
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-background border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Course</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Code</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Type</th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Enrolled</th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Pass %</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Instructor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDept.courses.map(c => (
                      <tr key={c.id} className="border-b border-slate-50 hover:bg-background">
                        <td className="px-4 py-2.5 font-medium text-foreground">{c.name}</td>
                        <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs">{c.code}</td>
                        <td className="px-4 py-2.5">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.type === 'UG' ? 'bg-primary/10 text-primary' : c.type === 'PG' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>{c.type}</span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium text-foreground">{c.enrolled}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-emerald-600">{c.passRate}%</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{c.instructor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
