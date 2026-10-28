import { useState } from 'react';
import { Users, BookOpen, GraduationCap, Building2, TrendingUp, Award, Layers } from 'lucide-react';
import { useApp } from '@/components/governance/context';
import StatsCard from '@/components/governance/components/shared/StatsCard';
import SectionHeader from '@/components/governance/components/shared/SectionHeader';
import Modal from '@/components/governance/components/shared/Modal';
import ProgressBar from '@/components/governance/components/shared/ProgressBar';
import { Department } from '@/components/governance/data';

export default function InstitutionOverview() {
  const { departments, students, faculty, enrollmentTrends } = useApp();
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  const totalStudents = departments.reduce((s, d) => s + d.students, 0);
  const totalFaculty = departments.reduce((s, d) => s + d.faculty, 0);
  const totalCourses = departments.reduce((s, d) => s + d.courses.length, 0);
  const avgPassRate = Math.round(departments.reduce((s, d) => s + d.passRate, 0) / departments.length);

  return (
    <div>
      <SectionHeader
        title="Institution Overview"
        subtitle="Comprehensive view of Vishwavidyalaya Institute of Technology"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
        <StatsCard className="p-4" title="Total Students" value={totalStudents.toLocaleString()} subtitle="Across all departments" icon={<Users className="w-5 h-5 text-primary" />} iconBg="bg-primary/10" trend={{ value: 2.5, label: 'vs last year' }} layout="horizontal" />
        <StatsCard className="p-4" title="Faculty Members" value={totalFaculty} subtitle="Full-time teaching staff" icon={<GraduationCap className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-50" trend={{ value: 4.2, label: 'vs last year' }} layout="horizontal" />
        <StatsCard className="p-4" title="Departments" value={departments.length} subtitle="Academic departments" icon={<Building2 className="w-5 h-5 text-amber-600" />} iconBg="bg-amber-50" layout="horizontal" />
        <StatsCard className="p-4" title="Courses Offered" value={totalCourses} subtitle="UG, PG & PhD programs" icon={<BookOpen className="w-5 h-5 text-rose-600" />} iconBg="bg-rose-50" layout="horizontal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-2">
        <StatsCard className="p-4" title="Avg. Pass Rate" value={`${avgPassRate}%`} subtitle="Across all departments" icon={<TrendingUp className="w-5 h-5 text-purple-600" />} iconBg="bg-purple-50" trend={{ value: 1.8, label: 'vs last year' }} layout="horizontal" />
        <StatsCard className="p-4" title="Research Projects" value={departments.reduce((s, d) => s + d.researchProjects, 0)} subtitle="Active research projects" icon={<Layers className="w-5 h-5 text-primary" />} iconBg="bg-primary/10" trend={{ value: 10.5, label: 'vs last year' }} layout="horizontal" />
        <StatsCard className="p-4" title="Accreditations" value="NAAC A+" subtitle="Highest grade; NIRF Rank 85" icon={<Award className="w-5 h-5 text-amber-600" />} iconBg="bg-amber-50" layout="horizontal" />
      </div>

      {/* Departments Table */}
      <div className="bg-card rounded-lg border border-border mb-2">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-base font-bold text-foreground">Departments</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Double-click a row to view full department details</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Department</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Code</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Head</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Faculty</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Students</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pass Rate</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Accreditation</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(dept => (
                <tr
                  key={dept.id}
                  onDoubleClick={() => setSelectedDept(dept)}
                  className="border-b border-slate-50 hover:bg-primary/10/40 cursor-pointer transition-colors"
                  title="Double-click for details"
                >
                  <td className="px-5 py-3.5 font-medium text-foreground">{dept.name}</td>
                  <td className="px-4 py-3.5"><span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded">{dept.code}</span></td>
                  <td className="px-4 py-3.5 text-muted-foreground">{dept.head}</td>
                  <td className="px-4 py-3.5 text-right font-medium text-foreground">{dept.faculty}</td>
                  <td className="px-4 py-3.5 text-right font-medium text-foreground">{dept.students}</td>
                  <td className="px-4 py-3.5 text-right">
                    <span className={`font-semibold ${dept.passRate >= 92 ? 'text-emerald-600' : dept.passRate >= 88 ? 'text-amber-600' : 'text-red-500'}`}>{dept.passRate}%</span>
                  </td>
                  <td className="px-4 py-3.5"><span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">{dept.accreditation}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enrollment Trend */}
      <div className="bg-card rounded-lg border border-border p-5">
        <h3 className="text-base font-bold text-foreground mb-4">Enrollment Trend (5 Years)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-xs font-semibold text-muted-foreground">Year</th>
                <th className="text-right py-2 text-xs font-semibold text-muted-foreground">Total</th>
                <th className="text-right py-2 text-xs font-semibold text-muted-foreground">UG</th>
                <th className="text-right py-2 text-xs font-semibold text-muted-foreground">PG</th>
                <th className="text-right py-2 text-xs font-semibold text-muted-foreground">PhD</th>
                <th className="py-2 px-4 text-right min-w-[88px] text-xs font-semibold text-muted-foreground">Growth</th>
              </tr>
            </thead>
            <tbody>
              {enrollmentTrends.map((row, i) => {
                const prev = enrollmentTrends[i - 1];
                const growth = prev
                  ? (((row.total - prev.total) / prev.total) * 100).toFixed(1)
                  : null;
                return (
                  <tr key={row.year} className="border-b border-slate-50 hover:bg-background">
                    <td className="py-2.5 font-medium text-foreground">{row.year}</td>
                    <td className="py-2.5 text-right font-bold text-foreground">{row.total.toLocaleString()}</td>
                    <td className="py-2.5 text-right text-muted-foreground">{row.ug.toLocaleString()}</td>
                    <td className="py-2.5 text-right text-muted-foreground">{row.pg}</td>
                    <td className="py-2.5 text-right text-muted-foreground">{row.phd}</td>
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      {growth && <span className="text-emerald-600 font-semibold text-xs">+{growth}%</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department Detail Modal */}
      {selectedDept && (
        <Modal open={!!selectedDept} onClose={() => setSelectedDept(null)} title={selectedDept.name} subtitle={`Department Code: ${selectedDept.code}`} size="xl">
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Head of Department', value: selectedDept.head },
                { label: 'Established', value: selectedDept.established },
                { label: 'Faculty Members', value: selectedDept.faculty },
                { label: 'Total Students', value: selectedDept.students },
                { label: 'Pass Rate', value: `${selectedDept.passRate}%` },
                { label: 'Research Projects', value: selectedDept.researchProjects },
                { label: 'Labs', value: selectedDept.labs },
                { label: 'Accreditation', value: selectedDept.accreditation },
              ].map(item => (
                <div key={item.label} className="bg-background rounded-md p-3">
                  <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                  <p className="font-semibold text-foreground text-sm">{item.value}</p>
                </div>
              ))}
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground mb-2">About the Department</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedDept.description}</p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground mb-3">Courses Offered ({selectedDept.courses.length})</h4>
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-background border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Course</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Code</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Type</th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Credits</th>
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
                        <td className="px-4 py-2.5 text-right text-muted-foreground">{c.credits}</td>
                        <td className="px-4 py-2.5 text-right text-foreground font-medium">{c.enrolled}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-emerald-600">{c.passRate}%</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{c.instructor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground mb-3">Performance</h4>
              <ProgressBar value={selectedDept.passRate} label="Overall Pass Rate" color="bg-emerald-500" />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
