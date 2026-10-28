import { useState } from 'react';
import SectionHeader from '@/components/governance/components/shared/SectionHeader';
import StatusBadge from '@/components/governance/components/shared/StatusBadge';
import StatsCard from '@/components/governance/components/shared/StatsCard';
import Modal from '@/components/governance/components/shared/Modal';
import { ClipboardList, CheckCircle, Clock } from 'lucide-react';

const COMMITTEES = [
  { id: 'c1', name: 'Academic Council', chair: 'Vice-Chancellor', members: 22, lastMeeting: '2024-06-28', reportStatus: 'Submitted', nextMeeting: '2024-08-05', activities: 'Curriculum revision for 4 programs; 2 new elective courses approved; Examination reforms discussed.' },
  { id: 'c2', name: 'Finance Committee', chair: 'Pro-Chancellor', members: 8, lastMeeting: '2024-07-28', reportStatus: 'Submitted', nextMeeting: '2024-10-15', activities: 'Q2 financial review completed; ₹50L research fund released; Fee revision deferred.' },
  { id: 'c3', name: 'Board of Studies – CSE', chair: 'Dr. Arun Kumar', members: 12, lastMeeting: '2024-07-10', reportStatus: 'Submitted', nextMeeting: '2024-09-10', activities: 'AI & ML course syllabus updated; Industry expert advisory board constituted.' },
  { id: 'c4', name: 'Research & Development Committee', chair: 'Dean Research', members: 15, lastMeeting: '2024-07-05', reportStatus: 'Pending', nextMeeting: '2024-09-05', activities: 'Reviewed 6 research proposals; Approved 4 for funding; DRDO collaboration reviewed.' },
  { id: 'c5', name: 'IQAC (Internal Quality)', chair: 'IQAC Coordinator', members: 18, lastMeeting: '2024-07-20', reportStatus: 'Submitted', nextMeeting: '2024-10-20', activities: 'NAAC preparation progress reviewed; Self-study report draft reviewed; FDP calendar finalized.' },
  { id: 'c6', name: 'Anti-Ragging Committee', chair: 'Dean Students', members: 10, lastMeeting: '2024-06-15', reportStatus: 'Submitted', nextMeeting: '2024-08-01', activities: 'Zero incidents reported; New student orientation conducted; Awareness campaigns planned.' },
  { id: 'c7', name: 'Placement & Industry Interface', chair: 'Placement Officer', members: 14, lastMeeting: '2024-07-15', reportStatus: 'Submitted', nextMeeting: '2024-09-01', activities: '85% placement rate achieved; 15 new company tie-ups; Aptitude training schedule released.' },
];

export default function CommitteeReports() {
  const [selectedCommittee, setSelectedCommittee] = useState<typeof COMMITTEES[number] | null>(null);
  const submitted = COMMITTEES.filter(c => c.reportStatus === 'Submitted').length;
  const pending = COMMITTEES.filter(c => c.reportStatus === 'Pending').length;

  return (
    <div>
      <SectionHeader title="Committee Reports" subtitle="Monitor all institutional committee activities and submitted reports" />

      <div className="grid grid-cols-3 gap-2 mb-2">
        <StatsCard title="Total Committees" value={COMMITTEES.length} icon={<ClipboardList className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-50" layout="horizontal" />
        <StatsCard title="Reports Submitted" value={submitted} icon={<CheckCircle className="w-5 h-5 text-teal-600" />} iconBg="bg-teal-50" layout="horizontal" />
        <StatsCard title="Reports Pending" value={pending} icon={<Clock className="w-5 h-5 text-amber-600" />} iconBg="bg-amber-50" layout="horizontal" />
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Committee</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Chairperson</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Members</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Last Meeting</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Next Meeting</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Report</th>
              </tr>
            </thead>
            <tbody>
              {COMMITTEES.map(c => (
                <tr key={c.id} className="border-b border-slate-50 hover:bg-background">
                  <td className="px-5 py-3 font-medium text-foreground">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.chair}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{c.members}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.lastMeeting}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.nextMeeting}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.reportStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <h3 className="text-base font-bold text-foreground">Recent Committee Activities</h3>
        {COMMITTEES.filter(c => c.reportStatus === 'Submitted').slice(0, 4).map(c => (
          <div
            key={c.id}
            onDoubleClick={() => setSelectedCommittee(c)}
            title="Double-click for details"
            className="bg-card rounded-lg border border-border p-4 cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-semibold text-foreground text-sm">{c.name}</h4>
              <span className="text-xs text-muted-foreground">{c.lastMeeting}</span>
            </div>
            <p className="text-sm text-muted-foreground">{c.activities}</p>
          </div>
        ))}
      </div>

      {selectedCommittee && (
        <Modal
          open={!!selectedCommittee}
          onClose={() => setSelectedCommittee(null)}
          title={selectedCommittee.name}
          subtitle="Committee activity details"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Chairperson', value: selectedCommittee.chair },
                { label: 'Members', value: selectedCommittee.members },
                { label: 'Last Meeting', value: selectedCommittee.lastMeeting },
                { label: 'Next Meeting', value: selectedCommittee.nextMeeting },
                { label: 'Report Status', value: selectedCommittee.reportStatus },
              ].map(item => (
                <div key={item.label} className="bg-background rounded-md p-3">
                  <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                  <p className="font-semibold text-foreground text-sm">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-background rounded-md p-4">
              <h4 className="text-sm font-bold text-foreground mb-2">Activities</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedCommittee.activities}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
