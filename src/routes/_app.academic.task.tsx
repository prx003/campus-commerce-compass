import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, Plus, Clock, MapPin } from "lucide-react";

export const Route = createFileRoute("/_app/academic/task")({
  component: AcademicTask,
});

type Event = { id: string; title: string; date: string; time: string; location: string };

const SEED: Event[] = [
  { id: "e1", title: "Faculty Meeting", date: "2025-06-18", time: "10:00", location: "Conference Room A" },
  { id: "e2", title: "B.Sc Internal Test", date: "2025-06-20", time: "09:30", location: "Hall 2" },
  { id: "e3", title: "Term Result Review", date: "2025-06-22", time: "14:00", location: "Principal's Office" },
];

function AcademicTask() {
  const [events, setEvents] = useState<Event[]>(SEED);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", time: "", location: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date) return;
    setEvents((p) => [...p, { id: `e${Date.now()}`, ...form }]);
    setForm({ title: "", date: "", time: "", location: "" });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Task & Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">Schedule academic events and view your calendar</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
        >
          <Plus className="size-4" /> Schedule Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl bg-card border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center gap-2">
            <Calendar className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Calendar</h3>
          </div>
          <div className="relative" style={{ height: 620 }}>
            <iframe
              title="Calendar"
              src="https://calendar.google.com/calendar/embed?src=en.indian%23holiday%40group.v.calendar.google.com&ctz=Asia%2FKolkata&showPrint=0&showTabs=0&showCalendars=0&showTz=0&showNav=1&showTitle=0&showDate=1"
              className="absolute inset-0 w-full h-full border-0"
            />
            {/* Mask out footer area that contains the "Events shown in time zone" line and "+Google Calendar" link */}
            <div className="absolute bottom-0 left-0 right-0 h-9 bg-card pointer-events-none" />
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border shadow-sm">
          <div className="px-5 py-3 border-b border-border">
            <h3 className="text-sm font-semibold">Upcoming Events</h3>
          </div>
          <ul className="divide-y divide-border">
            {events.map((e) => (
              <li key={e.id} className="px-5 py-3.5">
                <div className="text-sm font-medium">{e.title}</div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="size-3" /> {e.date}</span>
                  {e.time && <span className="flex items-center gap-1"><Clock className="size-3" /> {e.time}</span>}
                  {e.location && <span className="flex items-center gap-1"><MapPin className="size-3" /> {e.location}</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
            className="w-full max-w-md bg-card rounded-xl border border-border shadow-2xl p-6 space-y-4"
          >
            <h3 className="text-base font-semibold">Schedule Event</h3>
            {[
              { k: "title", label: "Event title", type: "text" },
              { k: "date", label: "Date", type: "date" },
              { k: "time", label: "Time", type: "time" },
              { k: "location", label: "Location", type: "text" },
            ].map((f) => (
              <div key={f.k}>
                <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
                <input
                  type={f.type}
                  value={(form as Record<string, string>)[f.k]}
                  onChange={(e) => setForm((p) => ({ ...p, [f.k]: e.target.value }))}
                  className="mt-1 w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required={f.k === "title" || f.k === "date"}
                />
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="h-9 px-4 rounded-md border border-border text-sm font-medium hover:bg-muted">Cancel</button>
              <button type="submit" className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Schedule</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
