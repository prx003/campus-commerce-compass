import { useState } from 'react';
import SectionHeader from '@/components/governance/components/shared/SectionHeader';
import StatusBadge from '@/components/governance/components/shared/StatusBadge';
import Modal from '@/components/governance/components/shared/Modal';
import { FileText, CheckCircle, Clock, XCircle } from 'lucide-react';

const REPORTS = [
  { id: 'ar1', dept: 'Academic Affairs', title: 'Semester End Examination Report – May 2024', date: '2024-06-20', status: 'Approved', highlights: 'Overall pass rate: 91.2%. Improvements noted in CSE and MBA departments.' },
  { id: 'ar2', dept: 'Finance', title: 'Monthly Expenditure Report – June 2024', date: '2024-07-05', status: 'Approved', highlights: 'Monthly expenditure within budget. Faculty salary disbursement 100% complete.' },
  { id: 'ar3', dept: 'HR Department', title: 'Faculty Recruitment Status Report', date: '2024-07-10', status: 'Under Review', highlights: '8 positions advertised; 3 offers extended; 2 accepted. ME department vacancy still open.' },
  { id: 'ar4', dept: 'IT & Systems', title: 'Campus Network Upgrade Progress', date: '2024-07-15', status: 'Pending', highlights: 'Wi-Fi coverage extended to hostels. ERP upgrade 60% complete. Expected completion: Sep 2024.' },
  { id: 'ar5', dept: 'Placement Cell', title: 'Placement Activity Report – 2023-24', date: '2024-06-30', status: 'Approved', highlights: '87% placement rate for eligible students. 142 companies visited. Average package ₹5.8 LPA.' },
  { id: 'ar6', dept: 'Infrastructure', title: 'New Block Construction Progress Report', date: '2024-07-20', status: 'Approved', highlights: 'Structural work 45% complete. Civil contractor on schedule. Completion expected by June 2025.' },
  { id: 'ar7', dept: 'Library', title: 'Library Utilization Report Q1 2024', date: '2024-05-01', status: 'Approved', highlights: '12,400 books borrowed; 3,200 e-journal accesses; 850 digital resource downloads.' },
];

const deptColors: Record<string, string> = {
  'Academic Affairs': 'bg-primary/10 text-primary',
  'Finance': 'bg-emerald-100 text-emerald-700',
  'HR Department': 'bg-purple-100 text-purple-700',
  'IT & Systems': 'bg-primary/10 text-primary',
  'Placement Cell': 'bg-amber-100 text-amber-700',
  'Infrastructure': 'bg-rose-100 text-rose-700',
  'Library': 'bg-teal-100 text-teal-700',
};

export default function AdministrativeReports() {
  const [reports, setReports] = useState(REPORTS);
  const [selectedReport, setSelectedReport] = useState<typeof REPORTS[number] | null>(null);

  const updateReportStatus = (status: string) => {
    if (!selectedReport) return;
    const updatedReport = { ...selectedReport, status };
    setReports(currentReports => currentReports.map(report => report.id === updatedReport.id ? updatedReport : report));
    setSelectedReport(updatedReport);
  };

  return (
    <div>
      <SectionHeader title="Administrative Reports" subtitle="Department-wise administrative reports and operational updates" />

      <div className="space-y-2">
        {reports.map(r => (
          <div
            key={r.id}
            onDoubleClick={() => setSelectedReport(r)}
            title="Double-click for details"
            className="bg-card rounded-lg border border-border p-5 hover:shadow-sm transition-shadow cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-md flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${deptColors[r.dept] ?? 'bg-muted text-muted-foreground'}`}>{r.dept}</span>
                  <StatusBadge status={r.status} />
                </div>
                <h3 className="font-bold text-foreground text-sm mb-1">{r.title}</h3>
                <p className="text-xs text-muted-foreground mb-2">{r.date}</p>
                <p className="text-sm text-muted-foreground">{r.highlights}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedReport && (
        <Modal
          open={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title={selectedReport.title}
          subtitle="Administrative report details"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-background rounded-md p-3">
                <p className="text-xs text-muted-foreground mb-1">Department</p>
                <p className="font-semibold text-foreground text-sm">{selectedReport.dept}</p>
              </div>
              <div className="bg-background rounded-md p-3">
                <p className="text-xs text-muted-foreground mb-1">Date</p>
                <p className="font-semibold text-foreground text-sm">{selectedReport.date}</p>
              </div>
              <div className="bg-background rounded-md p-3">
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <StatusBadge status={selectedReport.status} />
              </div>
            </div>
            <div className="bg-background rounded-md p-4">
              <h4 className="text-sm font-bold text-foreground mb-2">Report Information</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedReport.highlights}</p>
            </div>
            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button onClick={() => updateReportStatus('Pending')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors">
                <Clock className="w-4 h-4" /> Mark Pending
              </button>
              <button onClick={() => updateReportStatus('Rejected')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                <XCircle className="w-4 h-4" /> Reject
              </button>
              <button onClick={() => updateReportStatus('Approved')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
