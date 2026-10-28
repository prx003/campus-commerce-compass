import { useState } from 'react';
import { useApp } from '@/components/governance/context';
import { FacultyMember } from '@/components/governance/data';
import SectionHeader from '@/components/governance/components/shared/SectionHeader';
import StatsCard from '@/components/governance/components/shared/StatsCard';
import ProgressBar from '@/components/governance/components/shared/ProgressBar';
import Modal from '@/components/governance/components/shared/Modal';
import { GraduationCap, TrendingUp, Award, Users } from 'lucide-react';

export default function AcademicPerformance() {
  const { departments, faculty } = useApp();
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);

  const avgPass = Math.round(departments.reduce((s, d) => s + d.passRate, 0) / departments.length);
  const totalPublications = faculty.reduce((s, f) => s + f.publications, 0);

  return (
    <div>
      <SectionHeader title="Academic Performance" subtitle="Pass rates, results analysis, and department-level academic outcomes" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
        <StatsCard title="Avg. Pass Rate" value={`${avgPass}%`} icon={<TrendingUp className="w-5 h-5 text-primary" />} iconBg="bg-primary/10" trend={{ value: 1.8, label: 'vs last year' }} layout="horizontal" />
        <StatsCard title="Total Faculty" value={faculty.length} subtitle="Full-time teaching staff" icon={<Users className="w-5 h-5 text-primary" />} iconBg="bg-primary/10" layout="horizontal" />
        <StatsCard title="Publications" value={totalPublications} subtitle="Total research papers" icon={<Award className="w-5 h-5 text-purple-600" />} iconBg="bg-purple-50" trend={{ value: 12.5, label: 'vs last year' }} layout="horizontal" />
        <StatsCard title="Top Department" value={departments.sort((a, b) => b.passRate - a.passRate)[0].code} subtitle="Highest pass rate" icon={<GraduationCap className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-50" layout="horizontal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
        <div className="lg:col-span-2 bg-card rounded-lg border border-border p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Department Pass Rate Details</h3>
          <div className="space-y-3">
            {departments.sort((a, b) => b.passRate - a.passRate).map(dept => (
              <div key={dept.id}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-foreground font-medium">{dept.name}</span>
                  <span className={`text-sm font-bold ${dept.passRate >= 92 ? 'text-emerald-600' : dept.passRate >= 88 ? 'text-amber-600' : 'text-red-600'}`}>{dept.passRate}%</span>
                </div>
                <ProgressBar value={dept.passRate} max={100} color={dept.passRate >= 92 ? 'bg-emerald-500' : dept.passRate >= 88 ? 'bg-amber-500' : 'bg-red-500'} showLabel={false} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Faculty performance */}
      <div className="bg-card rounded-lg border border-border">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-base font-bold text-foreground">Faculty Academic Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Faculty Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Designation</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Department</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Specialization</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Publications</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Experience</th>
              </tr>
            </thead>
            <tbody>
              {faculty.sort((a, b) => b.publications - a.publications).map(f => (
                <tr key={f.id} onDoubleClick={() => setSelectedFaculty(f)} title="Double-click for details" className="border-b border-slate-50 hover:bg-background cursor-pointer">
                  <td className="px-5 py-3 font-medium text-foreground">{f.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{f.designation}</td>
                  <td className="px-4 py-3">
                    <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded">{f.department}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{f.specialization}</td>
                  <td className="px-4 py-3 text-right font-semibold text-purple-600">{f.publications}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{f.experience} yrs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedFaculty && (
        <Modal open={!!selectedFaculty} onClose={() => setSelectedFaculty(null)} title={selectedFaculty.name} subtitle="Faculty academic performance details" size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Designation', value: selectedFaculty.designation },
                { label: 'Department', value: selectedFaculty.department },
                { label: 'Qualification', value: selectedFaculty.qualification },
                { label: 'Specialization', value: selectedFaculty.specialization },
                { label: 'Experience', value: `${selectedFaculty.experience} years` },
                { label: 'Academic Status', value: selectedFaculty.status },
                { label: 'Email', value: selectedFaculty.email },
                { label: 'Research Publications', value: selectedFaculty.publications },
              ].map(detail => (
                <div key={detail.label} className="bg-background rounded-md p-3">
                  <p className="text-xs text-muted-foreground mb-1">{detail.label}</p>
                  <p className="font-semibold text-foreground text-sm break-words">{detail.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-background rounded-md p-4">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Publication contribution</span>
                <span className="font-bold text-purple-600">{selectedFaculty.publications} publications</span>
              </div>
              <ProgressBar value={selectedFaculty.publications} max={50} color="bg-purple-500" showLabel={false} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
