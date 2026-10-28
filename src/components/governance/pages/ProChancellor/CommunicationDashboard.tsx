import { useState } from 'react';
import SectionHeader from '@/components/governance/components/shared/SectionHeader';
import StatusBadge from '@/components/governance/components/shared/StatusBadge';
import Modal from '@/components/governance/components/shared/Modal';
import { MessageSquare, ArrowRight } from 'lucide-react';

const MESSAGES = [
  { id: 'msg1', from: 'Vice-Chancellor', to: 'All HoDs', subject: 'NAAC Preparation — Action Required', date: '2024-07-22', priority: 'High', status: 'Sent', body: 'All departments must submit their self-study reports by August 15. Ensure data accuracy and completeness.' },
  { id: 'msg2', from: 'Dr. Arun Kumar (HoD CSE)', to: 'Vice-Chancellor', subject: 'CSE Lab Modernization — Approval Request', date: '2024-07-20', priority: 'High', status: 'Pending', body: 'Requesting approval for ₹45L equipment purchase for 4 computer labs. Quote attached for review.' },
  { id: 'msg3', from: 'Finance Dept', to: 'Pro-Chancellor', subject: 'Q2 Budget Utilization Report', date: '2024-07-18', priority: 'Medium', status: 'Read', body: 'Q2 budget utilization stands at 68%. Faculty salary and R&D expenses on track. Infrastructure spend slightly behind.' },
  { id: 'msg4', from: 'Registrar', to: 'Vice-Chancellor', subject: 'Examination Calendar 2024-25', date: '2024-07-15', priority: 'Medium', status: 'Approved', body: 'The examination calendar for 2024-25 has been finalized. Requesting approval for circulation to departments.' },
  { id: 'msg5', from: 'IQAC Coordinator', to: 'All Deans & HoDs', subject: 'FDP Schedule Released', date: '2024-07-12', priority: 'Low', status: 'Sent', body: 'Faculty Development Program schedule for Aug-Oct 2024 has been released. Faculty must register by July 31.' },
  { id: 'msg6', from: 'Industry Relations', to: 'Vice-Chancellor', subject: 'TCS Partnership Renewal Update', date: '2024-07-10', priority: 'High', status: 'Read', body: 'TCS Innovation Hub has agreed to renew the partnership for 2 more years with enhanced placement commitment of 150 students.' },
];

const priorityColor: Record<string, string> = {
  High: 'bg-red-100 text-red-600',
  Medium: 'bg-amber-100 text-amber-600',
  Low: 'bg-muted text-muted-foreground',
};

export default function CommunicationDashboard() {
  const [selectedMessage, setSelectedMessage] = useState<typeof MESSAGES[number] | null>(null);

  return (
    <div>
      <SectionHeader title="Communication Dashboard" subtitle="View communications between management and departments" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
        {[
          { label: 'Total Messages', value: MESSAGES.length },
          { label: 'High Priority', value: MESSAGES.filter(m => m.priority === 'High').length },
          { label: 'Pending', value: MESSAGES.filter(m => m.status === 'Pending').length },
          { label: 'Sent', value: MESSAGES.filter(m => m.status === 'Sent').length },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-xl font-bold text-foreground leading-none">{s.value}</p>
              <p className="text-sm text-muted-foreground font-medium truncate">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {MESSAGES.map(msg => (
          <div
            key={msg.id}
            onDoubleClick={() => setSelectedMessage(msg)}
            title="Double-click for details"
            className="bg-card rounded-lg border border-border p-5 hover:shadow-sm transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 bg-emerald-50 rounded-md flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4.5 h-4.5 text-emerald-600" style={{ width: 18, height: 18 }} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-foreground text-sm">{msg.subject}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityColor[msg.priority]}`}>{msg.priority}</span>
                    <StatusBadge status={msg.status} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-muted-foreground">{msg.from}</span>
                    <ArrowRight className="w-3 h-3" />
                    <span>{msg.to}</span>
                    <span>·</span>
                    <span>{msg.date}</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground pl-12">{msg.body}</p>
          </div>
        ))}
      </div>

      {selectedMessage && (
        <Modal
          open={!!selectedMessage}
          onClose={() => setSelectedMessage(null)}
          title={selectedMessage.subject}
          subtitle="Communication details"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'From', value: selectedMessage.from },
                { label: 'To', value: selectedMessage.to },
                { label: 'Date', value: selectedMessage.date },
                { label: 'Priority', value: selectedMessage.priority },
                { label: 'Status', value: selectedMessage.status },
              ].map(item => (
                <div key={item.label} className="bg-background rounded-md p-3">
                  <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                  <p className="font-semibold text-foreground text-sm">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-background rounded-md p-4">
              <h4 className="text-sm font-bold text-foreground mb-2">Message</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedMessage.body}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
