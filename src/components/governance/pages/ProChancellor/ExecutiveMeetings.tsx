import { useState } from 'react';
import { Plus, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '@/components/governance/context';
import { Meeting } from '@/components/governance/data';
import SectionHeader from '@/components/governance/components/shared/SectionHeader';
import StatusBadge from '@/components/governance/components/shared/StatusBadge';
import Modal from '@/components/governance/components/shared/Modal';
import StatsCard from '@/components/governance/components/shared/StatsCard';
import { Calendar, CheckCircle, Clock } from 'lucide-react';

function MeetingForm({ meeting, onSave, onClose }: { meeting?: Meeting; onSave: (m: Meeting) => void; onClose: () => void }) {
  const [form, setForm] = useState<Partial<Meeting>>(meeting ?? { status: 'Scheduled', attendees: [], agenda: [] });
  const [agendaText, setAgendaText] = useState((meeting?.agenda ?? []).join('\n'));
  const [attendeesText, setAttendeesText] = useState((meeting?.attendees ?? []).join('\n'));
  const set = (k: keyof Meeting, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1">Meeting Title *</label>
        <input value={form.title ?? ''} onChange={e => set('title', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">Date</label>
          <input type="date" value={form.date ?? ''} onChange={e => set('date', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">Time</label>
          <input value={form.time ?? ''} onChange={e => set('time', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="10:00 AM" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">Status</label>
          <select value={form.status ?? ''} onChange={e => set('status', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
            {['Scheduled', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1">Venue</label>
        <input value={form.venue ?? ''} onChange={e => set('venue', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1">Attendees (one per line)</label>
        <textarea value={attendeesText} onChange={e => setAttendeesText(e.target.value)} rows={3} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1">Agenda Items (one per line)</label>
        <textarea value={agendaText} onChange={e => setAgendaText(e.target.value)} rows={4} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg">Cancel</button>
        <button onClick={() => {
          if (!form.title) return;
          onSave({
            ...form,
            id: meeting?.id ?? `m${Date.now()}`,
            attendees: attendeesText.split('\n').filter(Boolean),
            agenda: agendaText.split('\n').filter(Boolean),
            actionItems: meeting?.actionItems ?? [],
          } as Meeting);
        }} className="px-4 py-2 text-sm font-medium bg-emerald-600 text-primary-foreground rounded-lg hover:bg-emerald-700">
          {meeting ? 'Update Meeting' : 'Schedule Meeting'}
        </button>
      </div>
    </div>
  );
}

export default function ExecutiveMeetings() {
  const { meetings, updateMeeting, addMeeting } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editMeeting, setEditMeeting] = useState<Meeting | undefined>(undefined);
  const [expanded, setExpanded] = useState<string | null>(null);

  const counts = {
    total: meetings.length,
    scheduled: meetings.filter(m => m.status === 'Scheduled').length,
    completed: meetings.filter(m => m.status === 'Completed').length,
  };

  return (
    <div>
      <SectionHeader
        title="Executive Meetings"
        subtitle="Plan, schedule, and track executive-level meetings and decisions"
        action={
          <button onClick={() => { setEditMeeting(undefined); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-primary-foreground text-sm font-medium rounded-lg hover:bg-emerald-700">
            <Plus className="w-4 h-4" /> Schedule Meeting
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-2 mb-2">
        <StatsCard title="Total Meetings" value={counts.total} icon={<Calendar className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-50" layout="horizontal" />
        <StatsCard title="Scheduled" value={counts.scheduled} icon={<Clock className="w-5 h-5 text-primary" />} iconBg="bg-primary/10" layout="horizontal" />
        <StatsCard title="Completed" value={counts.completed} icon={<CheckCircle className="w-5 h-5 text-teal-600" />} iconBg="bg-teal-50" layout="horizontal" />
      </div>

      <div className="space-y-2">
        {meetings.map(meeting => {
          const isExpanded = expanded === meeting.id;
          return (
            <div key={meeting.id} className="bg-card rounded-lg border border-border overflow-hidden">
              <div
                className="flex items-start gap-4 p-5 cursor-pointer hover:bg-background transition-colors"
                onClick={() => setExpanded(isExpanded ? null : meeting.id)}
              >
                <div className="bg-emerald-50 rounded-md p-2.5 flex-shrink-0">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-foreground">{meeting.title}</h3>
                    <StatusBadge status={meeting.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">{meeting.date} · {meeting.time} · {meeting.venue}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Attendees: {meeting.attendees.join(', ')}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={e => { e.stopPropagation(); setEditMeeting(meeting); setShowForm(true); }} className="p-1.5 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 rounded-lg">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>
              {isExpanded && (
                <div className="px-5 pb-5 pt-0 border-t border-border">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Agenda</p>
                      <ul className="space-y-1.5">
                        {meeting.agenda.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-emerald-500 font-bold mt-0.5">{i + 1}.</span>{item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {meeting.decisions && meeting.decisions.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Decisions Taken</p>
                        <ul className="space-y-1.5">
                          {meeting.decisions.map((d, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />{d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {meeting.actionItems && meeting.actionItems.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Action Items</p>
                      <div className="overflow-x-auto rounded-md border border-border">
                        <table className="w-full text-sm">
                          <thead className="bg-background border-b border-border">
                            <tr>
                              <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Task</th>
                              <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Assigned To</th>
                              <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Deadline</th>
                              <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {meeting.actionItems.map((item, i) => (
                              <tr key={i} className="border-b border-slate-50">
                                <td className="px-4 py-2 text-foreground">{item.task}</td>
                                <td className="px-4 py-2 text-muted-foreground">{item.assignedTo}</td>
                                <td className="px-4 py-2 text-muted-foreground">{item.deadline}</td>
                                <td className="px-4 py-2"><StatusBadge status={item.status} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editMeeting ? 'Edit Meeting' : 'Schedule New Meeting'} size="lg">
        <MeetingForm
          meeting={editMeeting}
          onSave={m => { editMeeting ? updateMeeting(m) : addMeeting(m); setShowForm(false); }}
          onClose={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
}
