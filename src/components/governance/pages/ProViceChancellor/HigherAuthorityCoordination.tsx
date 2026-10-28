import { useState } from 'react';
import SectionHeader from '@/components/governance/components/shared/SectionHeader';
import StatusBadge from '@/components/governance/components/shared/StatusBadge';
import Modal from '@/components/governance/components/shared/Modal';
import { Users2, MessageSquare } from 'lucide-react';

const COMMUNICATIONS = [
  {
    id: 'hc1', from: 'Pro-Vice-Chancellor', to: 'Vice-Chancellor', subject: 'NAAC Preparation — Department-wise Status Report', date: '2024-07-22', type: 'Report Submission', status: 'Sent',
    summary: 'Submitted consolidated department-wise NAAC preparation status. 4 out of 5 departments are on track. MBA department requires attention.',
  },
  {
    id: 'hc2', from: 'Pro-Vice-Chancellor', to: 'Board of Trustees', subject: 'Academic Performance Report — Semester 2024', date: '2024-07-18', type: 'Report Submission', status: 'Sent',
    summary: 'Semester performance report forwarded. Overall pass rate 91.2%. Improvement plans for low-performing courses attached.',
  },
  {
    id: 'hc3', from: 'Pro-Vice-Chancellor', to: 'Vice-Chancellor', subject: 'Improvement Plan — CSE Lab Modernization Progress', date: '2024-07-15', type: 'Progress Update', status: 'Sent',
    summary: 'Reported 60% completion of CSE lab modernization. 2 labs operational with new hardware. Remaining 2 labs expected by September.',
  },
  {
    id: 'hc4', from: 'Pro-Vice-Chancellor', to: 'Chancellor', subject: 'Research Output Summary 2023-24', date: '2024-07-10', type: 'Report Submission', status: 'Acknowledged',
    summary: 'Annual research output report submitted. 148 publications in Scopus journals. 3 patents granted. Improvement of 18% over last year.',
  },
  {
    id: 'hc5', from: 'Pro-Vice-Chancellor', to: 'Registrar', subject: 'Coordination — Examination Calendar Feedback from HoDs', date: '2024-07-08', type: 'Coordination', status: 'Completed',
    summary: 'Collected feedback from all 5 HoDs on proposed examination calendar. Consolidated feedback forwarded to Registrar for finalization.',
  },
  {
    id: 'hc6', from: 'Pro-Vice-Chancellor', to: 'Vice-Chancellor', subject: 'Request: Additional Faculty Position — Civil Engineering', date: '2024-07-05', type: 'Recommendation', status: 'Pending',
    summary: 'Submitted recommendation for 2 additional faculty positions in CE department due to student-faculty ratio exceeding 1:22.',
  },
  {
    id: 'hc7', from: 'Pro-Vice-Chancellor', to: 'Pro-Chancellor', subject: 'Strategic Committee Meeting — Minutes Forwarded', date: '2024-07-02', type: 'Minutes', status: 'Sent',
    summary: 'Forwarded minutes of Strategic Planning Committee meeting held on June 28, 2024, to Pro-Chancellor for records.',
  },
];

const typeColors: Record<string, string> = {
  'Report Submission': 'bg-primary/10 text-primary',
  'Progress Update': 'bg-emerald-100 text-emerald-700',
  'Coordination': 'bg-purple-100 text-purple-700',
  'Recommendation': 'bg-amber-100 text-amber-700',
  'Minutes': 'bg-muted text-muted-foreground',
};

const AUTHORITIES = [
  { name: 'Vice-Chancellor', role: 'Chief Executive', frequency: 'Daily', lastContact: '2024-07-22', topics: 'Academic oversight, NAAC, approvals' },
  { name: 'Board of Trustees', role: 'Governing Body', frequency: 'Monthly', lastContact: '2024-07-18', topics: 'Performance reports, budget updates' },
  { name: 'Chancellor', role: 'Academic Head', frequency: 'Quarterly', lastContact: '2024-07-10', topics: 'Research output, development plans' },
  { name: 'Pro-Chancellor', role: 'Executive Chair', frequency: 'Weekly', lastContact: '2024-07-02', topics: 'Committee minutes, strategic projects' },
];

export default function HigherAuthorityCoordination() {
  const [selectedCommunication, setSelectedCommunication] = useState<typeof COMMUNICATIONS[number] | null>(null);

  return (
    <div>
      <SectionHeader title="Higher Authority Coordination" subtitle="Communications and coordination with VC, Board, Chancellor, and senior officials" />

      {/* Authority contacts */}
      <div className="grid grid-cols-4 gap-2 mb-2">
        {AUTHORITIES.map(a => (
          <div key={a.name} className="h-full bg-card rounded-lg border border-border p-4 flex items-start gap-3">
            <div className="w-10 h-10 bg-rose-50 rounded-md flex items-center justify-center flex-shrink-0">
              <Users2 className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">{a.name}</p>
              <p className="text-xs text-rose-600 font-medium">{a.role}</p>
              <p className="text-xs text-muted-foreground mt-1">Frequency: {a.frequency}</p>
              <p className="text-xs text-muted-foreground">Last Contact: {a.lastContact}</p>
              <p className="text-xs text-muted-foreground mt-1">{a.topics}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Communications log */}
      <h3 className="text-base font-bold text-foreground mb-3">Communications Log</h3>
      <div className="space-y-2">
        {COMMUNICATIONS.map(c => (
          <div
            key={c.id}
            onDoubleClick={() => setSelectedCommunication(c)}
            title="Double-click for details"
            className="bg-card rounded-lg border border-border p-5 hover:shadow-sm transition-shadow cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-rose-50 rounded-md flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-4.5 h-4.5 text-rose-600" style={{ width: 18, height: 18 }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h4 className="font-bold text-foreground text-sm">{c.subject}</h4>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeColors[c.type] ?? 'bg-muted text-muted-foreground'}`}>{c.type}</span>
                  <StatusBadge status={c.status} />
                </div>
                <p className="text-xs text-muted-foreground mb-2">To: <span className="font-medium text-muted-foreground">{c.to}</span> · {c.date}</p>
                <p className="text-sm text-muted-foreground">{c.summary}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedCommunication && (
        <Modal
          open={!!selectedCommunication}
          onClose={() => setSelectedCommunication(null)}
          title={selectedCommunication.subject}
          subtitle="Communication details"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'From', value: selectedCommunication.from },
                { label: 'To', value: selectedCommunication.to },
                { label: 'Date', value: selectedCommunication.date },
                { label: 'Type', value: selectedCommunication.type },
                { label: 'Status', value: selectedCommunication.status },
              ].map(item => (
                <div key={item.label} className="bg-background rounded-md p-3">
                  <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                  <p className="font-semibold text-foreground text-sm">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-background rounded-md p-4">
              <h4 className="text-sm font-bold text-foreground mb-2">Details Sent</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedCommunication.summary}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
