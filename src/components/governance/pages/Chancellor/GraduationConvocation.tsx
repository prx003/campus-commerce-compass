import { useState } from 'react';
import { useApp } from '@/components/governance/context';
import SectionHeader from '@/components/governance/components/shared/SectionHeader';
import StatsCard from '@/components/governance/components/shared/StatsCard';
import Modal from '@/components/governance/components/shared/Modal';
import { GraduationCap, Users, Award, Calendar } from 'lucide-react';

export default function GraduationConvocation() {
  const { graduationData, departments, students } = useApp();
  const [selectedDept, setSelectedDept] = useState<(typeof departments)[number] | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<{ time: string; event: string; venue: string } | null>(null);
  const graduating = students.filter(s => s.status === 'Active' && s.year === 4);
  const graduated = students.filter(s => s.status === 'Graduated');

  return (
    <div>
      <SectionHeader title="Graduation & Convocation" subtitle="Class of 2024 — convocation schedule and statistics" />

      {/* Convocation Card */}
      <div className="bg-gradient-to-br from-cyan-600 to-cyan-800 rounded-lg p-5 md:p-6 mb-2 text-primary-foreground">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="pl-1 text-cyan-200 text-xs sm:text-sm font-semibold uppercase tracking-[0.22em] mb-2">Convocation 2024</p>
            <h2 className="pl-1 text-2xl sm:text-3xl font-bold leading-tight mb-5">Annual Graduation Ceremony</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6">
              <div className="min-w-0">
                <p className="text-cyan-200 text-[10px] sm:text-xs uppercase tracking-[0.2em]">Date</p>
                <p className="mt-2 font-bold text-primary-foreground text-base sm:text-lg leading-snug">{graduationData.date}</p>
              </div>
              <div className="min-w-0">
                <p className="text-cyan-200 text-[10px] sm:text-xs uppercase tracking-[0.2em]">Venue</p>
                <p className="mt-2 font-bold text-primary-foreground text-base sm:text-lg leading-snug">{graduationData.venue}</p>
              </div>
              <div className="min-w-0">
                <p className="text-cyan-200 text-[10px] sm:text-xs uppercase tracking-[0.2em]">Chief Guest</p>
                <p className="mt-2 font-bold text-primary-foreground text-sm sm:text-[15px] leading-relaxed break-words">{graduationData.chiefGuest}</p>
              </div>
              <div className="min-w-0">
                <p className="text-cyan-200 text-[10px] sm:text-xs uppercase tracking-[0.2em]">Total Graduates</p>
                <p className="mt-2 font-bold text-primary-foreground text-2xl sm:text-3xl leading-none">{graduationData.totalGraduates}</p>
              </div>
            </div>
          </div>

          <GraduationCap className="w-12 h-12 sm:w-16 sm:h-16 text-primary-foreground/20 flex-shrink-0 mt-1 mr-1" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
        <StatsCard title="Total Graduates" value={graduationData.totalGraduates} icon={<GraduationCap className="w-5 h-5 text-primary" />} iconBg="bg-primary/10" layout="horizontal" />
        <StatsCard title="UG Graduates" value={graduationData.ug} subtitle="Bachelor's degrees" icon={<Users className="w-5 h-5 text-primary" />} iconBg="bg-primary/10" layout="horizontal" />
        <StatsCard title="PG Graduates" value={graduationData.pg} subtitle="Master's degrees" icon={<Users className="w-5 h-5 text-purple-600" />} iconBg="bg-purple-50" layout="horizontal" />
        <StatsCard title="Gold Medalists" value={graduationData.goldMedalists} subtitle="Academic excellence" icon={<Award className="w-5 h-5 text-amber-600" />} iconBg="bg-amber-50" layout="horizontal" />
      </div>

      {/* Dept-wise graduates */}
      <div className="bg-card rounded-lg border border-border mb-2">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-base font-bold text-foreground">Department-Wise Graduating Students (2024)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Department</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">UG Graduates</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">PG Graduates</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">PhD</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Gold Medals</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept, i) => {
                const ugGrads = [98, 88, 82, 76, 72][i];
                const pgGrads = [20, 18, 14, 12, 16][i];
                const phd = [6, 5, 4, 4, 5][i];
                return (
                  <tr
                    key={dept.id}
                    className="border-b border-slate-50 hover:bg-background"
                  >
                    <td className="px-5 py-3 font-medium text-foreground">{dept.name}</td>
                    <td className="px-4 py-3 text-right text-foreground font-medium">{ugGrads}</td>
                    <td className="px-4 py-3 text-right text-foreground font-medium">{pgGrads}</td>
                    <td className="px-4 py-3 text-right text-foreground font-medium">{phd}</td>
                    <td className="px-4 py-3 text-right font-bold text-amber-600">{[2, 2, 1, 1, 2][i]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming ceremony schedule */}
      <div className="bg-card rounded-lg border border-border p-5">
        <h3 className="text-base font-bold text-foreground mb-4">Convocation Schedule</h3>
        <div className="space-y-3">
          {[
            { time: '9:00 AM', event: 'Academic Procession & Assembly', venue: 'Main Auditorium' },
            { time: '9:30 AM', event: 'Lighting of the Lamp — Inaugural Ceremony', venue: 'Stage' },
            { time: '10:00 AM', event: 'Chancellor\'s Address', venue: 'Main Auditorium' },
            { time: '10:30 AM', event: 'Chief Guest Address — Dr. K. Radhakrishnan', venue: 'Main Auditorium' },
            { time: '11:00 AM', event: 'Conferral of Degrees — UG Programs', venue: 'Main Auditorium' },
            { time: '12:30 PM', event: 'Conferral of Degrees — PG & PhD Programs', venue: 'Main Auditorium' },
            { time: '1:00 PM', event: 'Gold Medal & Award Presentation', venue: 'Main Stage' },
            { time: '1:30 PM', event: 'National Anthem & Closure', venue: 'Main Auditorium' },
          ].map(item => (
            <div
              key={item.time}
              className="flex items-start gap-4 p-3 rounded-md hover:bg-background transition-colors"
            >
              <div className="w-20 flex-shrink-0">
                <span className="text-sm font-bold text-primary">{item.time}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{item.event}</p>
                <p className="text-xs text-muted-foreground">{item.venue}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedDept && (
        <Modal
          open={!!selectedDept}
          onClose={() => setSelectedDept(null)}
          title={selectedDept.name}
          subtitle={`${selectedDept.code} graduating students`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Head', value: selectedDept.head },
                { label: 'Students', value: selectedDept.students },
                { label: 'Faculty', value: selectedDept.faculty },
                { label: 'Accreditation', value: selectedDept.accreditation },
              ].map(item => (
                <div key={item.label} className="bg-background rounded-md p-3">
                  <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                  <p className="font-semibold text-foreground text-sm">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-background rounded-md p-4">
              <h4 className="text-sm font-bold text-foreground mb-2">Department Overview</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedDept.description}</p>
            </div>
          </div>
        </Modal>
      )}

      {selectedSchedule && (
        <Modal
          open={!!selectedSchedule}
          onClose={() => setSelectedSchedule(null)}
          title={selectedSchedule.event}
          subtitle="Convocation ceremony detail"
          size="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background rounded-md p-3">
                <p className="text-xs text-muted-foreground mb-1">Time</p>
                <p className="font-semibold text-foreground text-sm">{selectedSchedule.time}</p>
              </div>
              <div className="bg-background rounded-md p-3">
                <p className="text-xs text-muted-foreground mb-1">Venue</p>
                <p className="font-semibold text-foreground text-sm">{selectedSchedule.venue}</p>
              </div>
            </div>
            <div className="bg-background rounded-md p-4">
              <h4 className="text-sm font-bold text-foreground mb-2">Program Notes</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">This segment is part of the annual convocation ceremony and is scheduled to take place at the venue listed above.</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
