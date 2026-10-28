import { useState } from 'react';
import { useApp } from '@/components/governance/context';
import SectionHeader from '@/components/governance/components/shared/SectionHeader';
import StatsCard from '@/components/governance/components/shared/StatsCard';
import Modal from '@/components/governance/components/shared/Modal';
import { Users, TrendingUp, GraduationCap, BookOpen } from 'lucide-react';
import BarChart from '@/components/governance/components/shared/BarChart';

export default function StudentEnrollment() {
  const { departments, enrollmentTrends, students } = useApp();
  const [selectedDepartment, setSelectedDepartment] = useState<{ name: string; courses: string[] } | null>(null);

  const totalStudents = departments.reduce((s, d) => s + d.students, 0);
  const activeStudents = students.filter(s => s.status === 'Active').length;
  const graduated = students.filter(s => s.status === 'Graduated').length;

  const latest = enrollmentTrends[enrollmentTrends.length - 1];
  const prev = enrollmentTrends[enrollmentTrends.length - 2];
  const growth = (((latest.total - prev.total) / prev.total) * 100).toFixed(1);

  const deptChartData = departments.map(d => ({ label: d.code, value: d.students, color: 'bg-primary/100' }));

  const trendData = enrollmentTrends.map(t => ({ label: t.year.slice(0, 4), value: t.total, color: 'bg-primary/100' }));

  return (
    <div>
      <SectionHeader title="Student Enrollment" subtitle="Admission trends, enrollment statistics, and department-wise distribution" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
        <StatsCard title="Total Enrolled" value={totalStudents.toLocaleString()} icon={<Users className="w-5 h-5 text-primary" />} iconBg="bg-primary/10" trend={{ value: parseFloat(growth), label: 'vs last year' }} layout="horizontal" />
        <StatsCard title="UG Students" value={latest.ug.toLocaleString()} subtitle="Undergraduate programs" icon={<BookOpen className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-50" layout="horizontal" />
        <StatsCard title="PG Students" value={latest.pg} subtitle="Postgraduate programs" icon={<GraduationCap className="w-5 h-5 text-purple-600" />} iconBg="bg-purple-50" layout="horizontal" />
        <StatsCard title="PhD Scholars" value={latest.phd} subtitle="Doctoral research" icon={<TrendingUp className="w-5 h-5 text-amber-600" />} iconBg="bg-amber-50" layout="horizontal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
        <div className="bg-card rounded-lg border border-border p-5">
          <BarChart data={deptChartData} title="Students by Department" height={180} />
        </div>
        <div className="bg-card rounded-lg border border-border p-5">
          <BarChart data={trendData} title="5-Year Enrollment Trend" height={180} />
        </div>
      </div>

      {/* Dept breakdown */}
      <div className="bg-card rounded-lg border border-border mb-2">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-base font-bold text-foreground">Department-Wise Enrollment</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Department</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Students</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">% of Total</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Courses</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Share</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(dept => {
                const pct = ((dept.students / totalStudents) * 100).toFixed(1);
                return (
                  <tr key={dept.id} className="border-b border-slate-50 hover:bg-background">
                    <td className="px-5 py-3 font-medium text-foreground">{dept.name}</td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">{dept.students}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{pct}%</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedDepartment({ name: dept.name, courses: dept.courses.map(course => course.name) })}
                        className="text-muted-foreground hover:text-primary hover:underline underline-offset-2 transition-colors"
                      >
                        {dept.courses.length}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="h-1.5 bg-primary/100 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!selectedDepartment} onClose={() => setSelectedDepartment(null)} title={selectedDepartment?.name ?? 'Department Courses'} subtitle="Courses offered" size="md">
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Courses:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {selectedDepartment?.courses.map(course => (
              <li key={course} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/100 shrink-0" />
                <span>{course}</span>
              </li>
            ))}
          </ul>
        </div>
      </Modal>
    </div>
  );
}
