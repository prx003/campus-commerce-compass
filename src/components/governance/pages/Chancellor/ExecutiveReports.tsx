import SectionHeader from '@/components/governance/components/shared/SectionHeader';
import StatusBadge from '@/components/governance/components/shared/StatusBadge';
import { FileText, Download, Eye } from 'lucide-react';

const REPORTS = [
  { id: 'r1', title: 'Annual Academic Report 2023-24', type: 'Academic', date: '2024-06-30', pages: 84, status: 'Approved', summary: 'Full academic performance review, faculty contributions, curriculum updates, and student outcomes.' },
  { id: 'r2', title: 'Institutional Performance Summary', type: 'Performance', date: '2024-07-01', pages: 52, status: 'Approved', summary: 'Executive summary of all KPIs, rankings, accreditations, and strategic milestones.' },
  { id: 'r3', title: 'Research Output Report 2023-24', type: 'Research', date: '2024-06-15', pages: 44, status: 'Approved', summary: '148 Scopus papers, 3 patents, 12 funded projects, and 6 active collaborations.' },
  { id: 'r4', title: 'Vice-Chancellor Report 2023-24', type: 'Executive', date: '2024-07-10', pages: 36, status: 'Approved', summary: 'Year-end report covering all institutional activities and forward-looking strategic directions.' },
];

export default function ExecutiveReports() {
  return (
    <div>
      <SectionHeader title="Executive Reports" subtitle="Institutional performance and academic summary reports" />
      <div className="space-y-4">
        {REPORTS.map(r => (
          <div key={r.id} className="bg-card rounded-lg border border-border p-5 flex items-start gap-4 hover:shadow-sm transition-shadow">
            <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <h3 className="font-bold text-foreground">{r.title}</h3>
                <StatusBadge status={r.status} />
              </div>
              <p className="text-xs text-muted-foreground mb-2">{r.date} · {r.pages} pages · {r.type}</p>
              <p className="text-sm text-muted-foreground">{r.summary}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground border border-border rounded-lg hover:bg-background">
                <Eye className="w-3.5 h-3.5" /> View
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary border border-cyan-200 rounded-lg hover:bg-primary/10">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
