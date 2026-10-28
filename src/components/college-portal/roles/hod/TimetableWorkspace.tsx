import { useMemo, useState } from 'react';
import { useStore, staffName } from '../../store/StoreContext';
import { PageHeader } from '../../components/PageHeader';
import { Modal } from '../../components/Modal';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/DataTable';
import type { TimetableEntry } from '../../data/types';
import { validateTimetableEntry } from './timetableLogic';
import {
  Plus, Save, Send, AlertTriangle, CheckCircle2, XCircle, Users, Building2,
  Beaker, ChevronLeft, ChevronRight, Pencil, CheckSquare, Eye, RotateCcw,
  LayoutGrid, List, Calendar, Clock, FileCheck, ShieldAlert,
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const SLOTS = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00'];
const LUNCH_SLOT = '12:00-13:00';
const SATURDAY_MORNING_SLOTS = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00'];
const CLASS_TYPES = ['Theory', 'Practical', 'Tutorial', 'Seminar', 'Other'];
const ACADEMIC_YEARS = ['2026–27', '2025–26', '2024–25'];
const TEACHING_ROLES = ['professor', 'associate-professor', 'assistant-professor', 'lecturer', 'teaching-assistant'];

interface Conflict {
  id: string;
  type: string;
  severity: 'error' | 'warning';
  message: string;
  reason: string;
  suggestion: string;
  entries: string[];
}

function parseSlot(slot: string) {
  const [s, e] = slot.split('-');
  return { start: s, end: e };
}

function slotLabel(slot: string) {
  const { start, end } = parseSlot(slot);
  return `${start} – ${end}`;
}

function getMonday(date: Date) {
  const monday = new Date(date);
  const day = monday.getDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;
  monday.setDate(monday.getDate() - daysFromMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function weekDates(weekOffset: number = 0) {
  // Week is calculated automatically from the system's current date (Monday start)
  const today = new Date();
  const monday = getMonday(today);
  monday.setDate(monday.getDate() + weekOffset * 7);
  return DAYS.map((_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return { day: DAYS[index], short: DAY_SHORT[index], date: date.getDate(), month: date.toLocaleString('en', { month: 'short' }) };
  });
}

export function TimetableWorkspace({
  deptId,
  embedded = false,
  semesterOverride,
  sectionOverride,
  academicYearOverride,
}: {
  deptId: string;
  embedded?: boolean;
  semesterOverride?: number;
  sectionOverride?: string;
  academicYearOverride?: string;
}) {
  const { data, addTimetableEntry, updateTimetableEntry, publishTimetable, addNotification } = useStore();

  // Contextual selectors
  const [semester, setSemester] = useState(semesterOverride ?? 6);
  const [section, setSection] = useState(sectionOverride ?? 'A');
  const [academicYear, setAcademicYear] = useState(academicYearOverride ?? '2026–27');
  const [weekOffset, setWeekOffset] = useState(0);

  // View state
  const [view, setView] = useState<'weekly' | 'list'>('weekly');
  const [listFilter, setListFilter] = useState<{ day?: string; facultyId?: string; room?: string; subject?: string; classType?: string }>({});

  // Modal state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [availability, setAvailability] = useState<{ ok: boolean; warnings: string[] }>({ ok: true, warnings: [] });

  // Conflict / workflow state
  const [reviewOpen, setReviewOpen] = useState(false);
  const [resolvedConflicts, setResolvedConflicts] = useState<Set<string>>(new Set());
  const [lastSaved, setLastSaved] = useState('Today, 10:42 AM');
  const [classTypes, setClassTypes] = useState<Record<string, string>>({});

  const dept = data.departments.find((d) => d.id === deptId);
  const deptSubs = data.subjects.filter((s) => s.departmentId === deptId && s.semester === semester);
  const deptFaculty = data.staff.filter((s) => s.departmentId === deptId && TEACHING_ROLES.includes(s.role));
  const deptRooms = data.rooms.filter((r) => r.departmentId === deptId);
  const deptLabs = data.labs.filter((l) => l.departmentId === deptId);
  const deptStudents = data.students.filter((s) => s.departmentId === deptId && s.semester === semester && s.section === section);

  const entries = useMemo(
    () => data.timetable.filter((t) => t.departmentId === deptId && t.semester === semester && t.section === section),
    [data.timetable, deptId, semester, section]
  );

  const classTypeOf = (e: TimetableEntry) => classTypes[e.id] ?? (e.isLab ? 'Practical' : 'Theory');

  // Conflict detection
  const conflicts = useMemo(() => {
    const result: Conflict[] = [];
    const bySlot: Record<string, TimetableEntry[]> = {};
    entries.forEach((e) => { const k = `${e.day}|${e.slot}`; (bySlot[k] ??= []).push(e); });

    Object.entries(bySlot).forEach(([key, group]) => {
      const [day, slot] = key.split('|');
      const byFaculty: Record<string, TimetableEntry[]> = {};
      group.forEach((e) => (byFaculty[e.facultyId] ??= []).push(e));
      Object.entries(byFaculty).forEach(([fid, items]) => {
        if (items.length > 1) {
          result.push({
            id: `faculty-${fid}-${key}`, type: 'Faculty double booking', severity: 'error',
            message: `${staffName(data, fid)} is assigned to ${items.length} classes at ${slotLabel(slot)} on ${day}.`,
            reason: 'One faculty member cannot teach two classes at the same time.',
            suggestion: 'Move one class to a different time slot or assign a substitute faculty member.',
            entries: items.map((i) => i.id),
          });
        }
      });

      const byRoom: Record<string, TimetableEntry[]> = {};
      group.forEach((e) => (byRoom[e.room] ??= []).push(e));
      Object.entries(byRoom).forEach(([room, items]) => {
        if (items.length > 1) {
          result.push({
            id: `room-${room}-${key}`, type: 'Room double booking', severity: 'error',
            message: `${room} is occupied by ${items.length} classes at ${slotLabel(slot)} on ${day}.`,
            reason: 'A room/lab can only host one class at a time.',
            suggestion: 'Reassign one class to an available room or lab.',
            entries: items.map((i) => i.id),
          });
        }
      });

      const byBatch: Record<string, TimetableEntry[]> = {};
      group.forEach((e) => { const k = `${e.departmentId}|${e.semester}|${e.section}`; (byBatch[k] ??= []).push(e); });
      Object.entries(byBatch).forEach(([batch, items]) => {
        if (items.length > 1) {
          result.push({
            id: `batch-${batch}-${key}`, type: 'Section overlap', severity: 'error',
            message: `Section ${section} Sem ${semester} has ${items.length} subjects at ${slotLabel(slot)} on ${day}.`,
            reason: 'A student section cannot attend two subjects simultaneously.',
            suggestion: 'Move one class to a free slot for this section.',
            entries: items.map((i) => i.id),
          });
        }
      });
    });

    // Faculty weekly hours
    const hours: Record<string, number> = {};
    entries.forEach((e) => { hours[e.facultyId] = (hours[e.facultyId] ?? 0) + 1; });
    Object.entries(hours).forEach(([fid, h]) => {
      if (h > 44) {
        result.push({
          id: `hours-${fid}`, type: 'Faculty workload', severity: 'warning',
          message: `${staffName(data, fid)} has ${h} weekly teaching hours (max 44).`,
          reason: 'Faculty teaching load exceeds the permitted weekly maximum.',
          suggestion: 'Distribute some classes to other faculty members.',
          entries: [],
        });
      }
    });

    // Room capacity
    entries.forEach((e) => {
      const room = deptRooms.find((r) => r.name === e.room);
      if (room && deptStudents.length > room.capacity) {
        result.push({
          id: `cap-${e.id}`, type: 'Room capacity', severity: 'warning',
          message: `${e.room} (capacity ${room.capacity}) is too small for ${deptStudents.length} students on ${e.day} ${slotLabel(e.slot)}.`,
          reason: 'Room capacity must be at least the class strength.',
          suggestion: 'Move the class to a larger room.',
          entries: [e.id],
        });
      }
    });

    return result.filter((c) => !resolvedConflicts.has(c.id));
  }, [entries, data, deptRooms, deptStudents, section, semester, resolvedConflicts]);

  const errorConflicts = conflicts.filter((c) => c.severity === 'error');
  const warningConflicts = conflicts.filter((c) => c.severity === 'warning');

  // Workflow status
  const workflowStatus = useMemo(() => {
    if (entries.some((e) => e.status === 'rejected')) return 'rejected';
    if (entries.length && entries.every((e) => e.published)) return 'published';
    if (entries.some((e) => e.status === 'approved')) return 'approved';
    if (entries.some((e) => e.status === 'pending-principal')) return 'submitted';
    return 'draft';
  }, [entries]);

  const rejectionReason = useMemo(() => {
    const rej = data.approvals.find((a) => a.type === 'timetable' && a.departmentId === deptId && a.status === 'rejected');
    return rej?.principalRemarks ?? 'Room allocation conflict in Semester 6 Section A.';
  }, [data.approvals, deptId]);

  // Summary stats
  const stats = useMemo(() => ({
    classes: entries.length,
    faculty: new Set(entries.map((e) => e.facultyId)).size,
    rooms: new Set(entries.map((e) => e.room)).size,
    labs: new Set(entries.filter((e) => e.isLab).map((e) => e.room)).size,
    conflicts: conflicts.length,
  }), [entries, conflicts]);

  const validationChecks = useMemo(() => [
    { label: 'All classes scheduled', ok: entries.length > 0 },
    { label: 'Faculty allocation valid', ok: errorConflicts.filter((c) => c.type === 'Faculty double booking').length === 0 },
    { label: 'Room allocation valid', ok: errorConflicts.filter((c) => c.type === 'Room double booking').length === 0 },
    { label: 'Laboratory allocation valid', ok: errorConflicts.filter((c) => c.type === 'Room double booking' && entries.some((e) => e.isLab && e.room === c.message.split(' ')[0])).length === 0 },
    { label: 'No section overlaps', ok: errorConflicts.filter((c) => c.type === 'Section overlap').length === 0 },
  ], [entries, errorConflicts]);

  const allValid = validationChecks.every((c) => c.ok) && conflicts.length === 0;

  // Form helpers
  function emptyForm(): FormState {
    return { subject: '', facultyId: '', day: 'Monday', slot: '09:00-10:00', room: '', section: 'A', classType: 'Theory' };
  }

  /* Subject Allocation is the source of truth: fetch faculty + preferred resource for a subject/section */
  function allocationForSubject(subjectName: string, sec: string) {
    const subject = data.subjects.find((s) => s.name === subjectName && s.departmentId === deptId);
    if (!subject) return null;
    const alloc = data.subjectAllocations.find(
      (a) => a.subjectId === subject.id && a.status !== 'draft' && a.classIds.includes(sec)
    );
    if (!alloc) return null;
    const roomRes = alloc.resourceIds
      .map((id) => data.resources.find((r) => r.id === id))
      .find((r) => r && (r.category === 'classroom' || r.isLab));
    return {
      facultyId: alloc.facultyId ?? '',
      room: roomRes?.name ?? '',
      facultyName: alloc.facultyId ? staffName(data, alloc.facultyId) : '',
    };
  }

  function openAdd(day?: string, slot?: string) {
    setEditingEntry(null);
    setForm({ ...emptyForm(), day: day ?? 'Monday', slot: slot ?? '09:00-10:00', section });
    setAvailability({ ok: true, warnings: [] });
    setEditorOpen(true);
  }

  function openEdit(entry: TimetableEntry) {
    setEditingEntry(entry);
    setForm({
      subject: entry.subject,
      facultyId: entry.facultyId,
      day: entry.day,
      slot: entry.slot,
      room: entry.room,
      section: entry.section,
      classType: classTypeOf(entry),
    });
    setAvailability({ ok: true, warnings: [] });
    setEditorOpen(true);
  }

  function checkAvailability(next: FormState): { ok: boolean; warnings: string[] } {
    const validation = validateTimetableEntry(data, {
      departmentId: deptId,
      semester,
      section: next.section,
      day: next.day,
      slot: next.slot,
      subject: next.subject,
      facultyId: next.facultyId,
      room: next.room,
    }, data.timetable, editingEntry?.id);
    const warnings = validation.message ? [validation.message] : [];
    if (next.classType === 'Practical' && !deptLabs.some((l) => l.name === next.room)) {
      warnings.push('A laboratory must be selected for practical classes.');
    }
    if (next.classType !== 'Practical' && deptLabs.some((l) => l.name === next.room)) {
      warnings.push('A normal classroom should be selected for non-practical classes.');
    }
    return { ok: validation.valid && warnings.length === 0, warnings };
  }

  function eligibleFacultyFor(subjectName: string, sec: string) {
    const subject = data.subjects.find((item) => item.departmentId === deptId && item.semester === semester && item.name === subjectName);
    if (!subject) return [];
    const facultyIds = new Set(data.subjectAllocations
      .filter((allocation) => allocation.subjectId === subject.id && allocation.status === 'allocated' && allocation.classIds.includes(sec) && allocation.facultyId)
      .map((allocation) => allocation.facultyId));
    return deptFaculty.filter((faculty) => facultyIds.has(faculty.id));
  }

  function saveEntry() {
    if (!form.subject || !form.facultyId || !form.room) return;
    const check = checkAvailability(form);
    setAvailability(check);
    if (!check.ok) return;

    const isLab = form.classType === 'Practical';
    const payload: TimetableEntry = {
      id: editingEntry?.id ?? `t${Date.now()}`,
      departmentId: deptId,
      section: form.section,
      semester,
      day: form.day,
      slot: form.slot,
      subject: form.subject,
      facultyId: form.facultyId,
      room: form.room,
      isLab,
      published: editingEntry?.published ?? false,
      status: editingEntry?.status ?? 'draft',
    };
    if (editingEntry) {
      updateTimetableEntry(editingEntry.id, payload);
    } else {
      addTimetableEntry(payload);
    }
    setClassTypes((prev) => ({ ...prev, [payload.id]: form.classType }));
    setLastSaved(`Today, ${new Date().toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}`);
    setEditorOpen(false);
  }

  function saveDraft() {
    setLastSaved(`Today, ${new Date().toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}`);
    addNotification({
      id: `n${Date.now()}`, title: 'Timetable draft saved',
      message: `Draft saved for ${dept?.code} Sem ${semester} Section ${section}.`,
      date: new Date().toISOString().slice(0, 10), audience: ['hod'], read: false,
    });
  }

  function submitForApproval() {
    if (conflicts.length > 0) return;
    entries.forEach((e) => updateTimetableEntry(e.id, { status: 'pending-principal' }));
    addNotification({
      id: `n${Date.now()}`, title: 'Timetable submitted for approval',
      message: `${dept?.code} Sem ${semester} Section ${section} timetable submitted to Principal.`,
      date: new Date().toISOString().slice(0, 10), audience: ['principal'], read: false,
    });
    addNotification({
      id: `n${Date.now() + 1}`, title: 'Timetable submitted',
      message: 'Your timetable has been submitted to the Principal for approval.',
      date: new Date().toISOString().slice(0, 10), audience: ['hod'], read: false,
    });
  }

  function publish() {
    publishTimetable(deptId, section, semester);
    const facultyIds = [...new Set(entries.map((e) => e.facultyId))];
    facultyIds.forEach((fid) => {
      addNotification({
        id: `n${Date.now()}-${fid}`, title: 'Timetable published',
        message: `Your timetable for Sec ${section} Sem ${semester} has been published.`,
        date: new Date().toISOString().slice(0, 10), audience: [data.staff.find((s) => s.id === fid)?.role ?? 'professor'], read: false,
      });
    });
  }

  function resubmit() {
    entries.filter((e) => e.status === 'rejected').forEach((e) => updateTimetableEntry(e.id, { status: 'draft' }));
  }

  const dates = weekDates(weekOffset);

  const filteredList = useMemo(() => {
    return entries.filter((e) => {
      if (listFilter.day && e.day !== listFilter.day) return false;
      if (listFilter.facultyId && e.facultyId !== listFilter.facultyId) return false;
      if (listFilter.room && e.room !== listFilter.room) return false;
      if (listFilter.subject && e.subject !== listFilter.subject) return false;
      if (listFilter.classType && classTypeOf(e) !== listFilter.classType) return false;
      return true;
    });
  }, [entries, listFilter, classTypes]);

  const conflictEntryIds = new Set(conflicts.flatMap((c) => c.entries));

  return (
    <div>
      <PageHeader
        title="Timetable Management"
        description="Manage, review, validate and publish department timetables."
        action={!embedded ? (
          <button className="btn-primary" onClick={() => openAdd()}>
            <Plus className="w-4 h-4" /> Add Class
          </button>
        ) : undefined}
      />

      {/* Contextual selectors */}
      {!embedded && <div className="card p-4 mb-6">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[160px]">
            <label className="block text-xs font-medium text-slate-500 mb-1">Department</label>
            <select className="input" value={deptId} disabled>
              <option value={deptId}>{dept?.code}</option>
            </select>
          </div>
          <div className="min-w-[120px]">
            <label className="block text-xs font-medium text-slate-500 mb-1">Semester</label>
            <select className="input" value={semester} onChange={(e) => setSemester(Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6].map((s) => <option key={s} value={s}>Sem {s}</option>)}
            </select>
          </div>
          <div className="min-w-[120px]">
            <label className="block text-xs font-medium text-slate-500 mb-1">Section</label>
            <select className="input" value={section} onChange={(e) => setSection(e.target.value)}>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </div>
          <div className="min-w-[140px]">
            <label className="block text-xs font-medium text-slate-500 mb-1">Academic Year</label>
            <select className="input" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
              {ACADEMIC_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button className="btn-secondary" onClick={() => { setSemester(6); setSection('A'); setAcademicYear('2026–27'); }}>
            <RotateCcw className="w-4 h-4" /> Change
          </button>
        </div>
      </div>}

      {/* Summary overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <button type="button" onClick={() => { if (!embedded) { setView('list'); setListFilter({}); } }} className="text-left">
          <StatCard label="Classes" value={stats.classes} icon={<Calendar className="w-5 h-5" />} accent="blue" compact />
        </button>
        <button type="button" onClick={() => { if (!embedded) { setView('list'); setListFilter({ facultyId: '' }); } }} className="text-left">
          <StatCard label="Faculty" value={stats.faculty} icon={<Users className="w-5 h-5" />} accent="indigo" compact />
        </button>
        <button type="button" onClick={() => { if (!embedded) { setView('list'); setListFilter({ room: '' }); } }} className="text-left">
          <StatCard label="Rooms" value={stats.rooms} icon={<Building2 className="w-5 h-5" />} accent="emerald" compact />
        </button>
        <button type="button" onClick={() => { if (!embedded) { setView('list'); setListFilter({ classType: 'Practical' }); } }} className="text-left">
          <StatCard label="Labs" value={stats.labs} icon={<Beaker className="w-5 h-5" />} accent="slate" compact />
        </button>
        <button type="button" onClick={() => document.getElementById('conflicts-section')?.scrollIntoView({ behavior: 'smooth' })} className="text-left">
          <StatCard label="Conflicts" value={stats.conflicts} icon={<AlertTriangle className="w-5 h-5" />} accent={stats.conflicts > 0 ? 'rose' : 'emerald'} compact />
        </button>
      </div>

      {/* Workspace toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setView('weekly')}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'weekly' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <LayoutGrid className="w-4 h-4" /> Weekly Timetable
          </button>
          {!embedded && (
            <button
              type="button"
              onClick={() => setView('list')}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'list' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <List className="w-4 h-4" /> List View
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" onClick={saveDraft}><Save className="w-4 h-4" /> Save Draft</button>
          <button className="btn-primary" onClick={submitForApproval} disabled={conflicts.length > 0}>
            <Send className="w-4 h-4" /> Submit for Approval
          </button>
        </div>
      </div>

      {/* Weekly timetable */}
      {view === 'weekly' && (
        <div className="card overflow-hidden mb-6">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setWeekOffset((w) => w - 1)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-sm font-medium text-slate-700">{dates[0].month} {dates[0].date} – {dates[5].month} {dates[5].date}</span>
              <button type="button" onClick={() => setWeekOffset((w) => w + 1)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"><ChevronRight className="w-4 h-4" /></button>
            </div>
            <span className="text-xs text-slate-400">Click a class to edit · Click an empty slot to add · Saturday half day (till 12:00 PM)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-24">Time</th>
                  {dates.map((d) => (
                    <th key={d.day} className="px-2 py-3 text-center">
                      <span className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">{d.short}</span>
                      <span className="block text-xs text-slate-400 mt-0.5">{d.date} {d.month}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SLOTS.map((slot) => {
                  const isLunch = slot === LUNCH_SLOT;
                  return (
                    <tr key={slot} className={isLunch ? 'bg-slate-50/60' : ''}>
                      <td className="px-3 py-2 text-xs font-medium text-slate-500 whitespace-nowrap">{slotLabel(slot)}</td>
                      {dates.map((d) => {
                        if (d.day === 'Saturday' && !SATURDAY_MORNING_SLOTS.includes(slot)) {
                          return <td key={d.day} className="px-2 py-2 bg-slate-50/40" />;
                        }
                        if (isLunch && d.day !== 'Saturday') {
                          return (
                            <td key={d.day} className="px-2 py-2 text-center">
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                <Clock className="w-3.5 h-3.5" /> BREAK
                              </span>
                            </td>
                          );
                        }
                        const cellEntries = entries.filter((e) => e.day === d.day && e.slot === slot);
                        const hasConflict = cellEntries.some((e) => conflictEntryIds.has(e.id));
                        if (cellEntries.length === 0) {
                          return (
                            <td key={d.day} className="px-2 py-2">
                              <button
                                type="button"
                                onClick={() => openAdd(d.day, slot)}
                                className="w-full h-full min-h-[64px] rounded-lg border border-dashed border-slate-200 text-slate-300 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/40 transition-colors flex items-center justify-center"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </td>
                          );
                        }
                        const e = cellEntries[0];
                        return (
                          <td key={d.day} className="px-2 py-2">
                            <button
                              type="button"
                              onClick={() => openEdit(e)}
                              className={`w-full text-left rounded-lg border p-2.5 transition-colors ${hasConflict ? 'border-rose-300 bg-rose-50/60 hover:bg-rose-50' : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40'}`}
                            >
                              {hasConflict && <span className="flex items-center gap-1 text-[10px] font-semibold text-rose-600 mb-1"><ShieldAlert className="w-3 h-3" /> Conflict</span>}
                              <p className="text-sm font-semibold text-slate-900 leading-tight">{e.subject}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{staffName(data, e.facultyId)}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{e.room} · Sec {e.section}</p>
                              {cellEntries.length > 1 && <p className="text-[10px] font-medium text-rose-500 mt-1">+{cellEntries.length - 1} more</p>}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* List view */}
      {!embedded && view === 'list' && (
        <div className="card overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="flex flex-wrap gap-2">
              <select className="input !w-auto" value={listFilter.day ?? ''} onChange={(e) => setListFilter({ ...listFilter, day: e.target.value || undefined })}>
                <option value="">All Days</option>
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <select className="input !w-auto" value={listFilter.facultyId ?? ''} onChange={(e) => setListFilter({ ...listFilter, facultyId: e.target.value || undefined })}>
                <option value="">All Faculty</option>
                {deptFaculty.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              <select className="input !w-auto" value={listFilter.room ?? ''} onChange={(e) => setListFilter({ ...listFilter, room: e.target.value || undefined })}>
                <option value="">All Rooms/Labs</option>
                {[...new Set(entries.map((e) => e.room))].map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <select className="input !w-auto" value={listFilter.subject ?? ''} onChange={(e) => setListFilter({ ...listFilter, subject: e.target.value || undefined })}>
                <option value="">All Subjects</option>
                {[...new Set(entries.map((e) => e.subject))].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className="input !w-auto" value={listFilter.classType ?? ''} onChange={(e) => setListFilter({ ...listFilter, classType: e.target.value || undefined })}>
                <option value="">All Types</option>
                {CLASS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Day', 'Time', 'Subject', 'Faculty', 'Section', 'Room/Lab', 'Type', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-slate-400">No classes match the selected filters.</td></tr>
                )}
                {filteredList.map((e) => (
                  <tr key={e.id} className="table-row">
                    <td className="px-4 py-3 text-sm text-slate-700">{e.day}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{slotLabel(e.slot)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{e.subject}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{staffName(data, e.facultyId)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{e.section} · Sem {e.semester}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{e.room}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`badge ${classTypeOf(e) === 'Practical' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{classTypeOf(e)}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {conflictEntryIds.has(e.id) ? <StatusBadge status="rejected" /> : <StatusBadge status={e.published ? 'approved' : e.status} />}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button type="button" onClick={() => openEdit(e)} className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Conflicts section */}
      <div id="conflicts-section" className="mb-6">
        {conflicts.length === 0 ? (
          <div className="card p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-900">No scheduling conflicts</p>
              <p className="text-xs text-slate-500">All faculty, room, laboratory and section allocations are valid.</p>
            </div>
          </div>
        ) : (
          <div className="card p-4 border-l-4 border-l-rose-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{conflicts.length} Scheduling Conflict{conflicts.length !== 1 ? 's' : ''}</p>
                  <ul className="mt-1.5 space-y-1">
                    {conflicts.slice(0, 2).map((c) => (
                      <li key={c.id} className="text-sm text-slate-600">• {c.message}</li>
                    ))}
                    {conflicts.length > 2 && <li className="text-sm text-slate-400">• +{conflicts.length - 2} more</li>}
                  </ul>
                </div>
              </div>
              <button className="btn-secondary" onClick={() => setReviewOpen(true)}>Review Conflicts</button>
            </div>
          </div>
        )}
      </div>

      {/* Laboratory schedule */}
      {!embedded && <div className="card overflow-hidden mb-6">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Laboratory Schedule</h3>
            <p className="text-xs text-slate-500 mt-0.5">Practical sessions appear automatically in the weekly timetable.</p>
          </div>
          <button className="btn-secondary" onClick={() => openAdd(undefined, undefined)}>
            <Plus className="w-4 h-4" /> Schedule Lab
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Lab', 'Subject', 'Faculty', 'Day', 'Time', 'Room', 'Status'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.filter((e) => e.isLab).length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">No laboratory sessions scheduled.</td></tr>
              )}
              {entries.filter((e) => e.isLab).map((e) => (
                <tr key={e.id} className="table-row" onClick={() => openEdit(e)}>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{e.room}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{e.subject}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{staffName(data, e.facultyId)}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{e.day}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{slotLabel(e.slot)}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{e.room}</td>
                  <td className="px-4 py-3 text-sm">{conflictEntryIds.has(e.id) ? <StatusBadge status="rejected" /> : <StatusBadge status="approved" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>}

      {/* Validation status */}
      <div className="card p-5 mb-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Timetable Validation</h3>
        <div className="grid sm:grid-cols-2 gap-2 mb-4">
          {validationChecks.map((c) => (
            <div key={c.label} className="flex items-center gap-2 text-sm text-slate-700">
              {c.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />}
              {c.label}
            </div>
          ))}
          <div className="flex items-center gap-2 text-sm text-slate-700">
            {conflicts.length === 0 ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />}
            {conflicts.length === 0 ? 'No conflicts detected' : `${conflicts.length} conflict${conflicts.length !== 1 ? 's' : ''} require attention`}
          </div>
        </div>
        {allValid ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" /> Timetable ready for submission
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 text-amber-700 text-sm font-medium">
            <AlertTriangle className="w-4 h-4" /> Resolve conflicts before submitting the timetable
          </div>
        )}
      </div>

      {/* Publication workflow */}
      <div className="card p-5 mb-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Publication Status</h3>
        <div className="flex items-center gap-1 mb-5 overflow-x-auto">
          {['Draft', 'Validation', 'Submitted', 'Principal Review', 'Published'].map((step, i) => {
            const stepKeys = ['draft', 'validation', 'submitted', 'submitted', 'published'];
            const active = workflowStatus === stepKeys[i] || (workflowStatus === 'approved' && step === 'Principal Review') || (workflowStatus === 'rejected' && step === 'Submitted');
            const done = ['draft', 'validation', 'submitted', 'approved', 'published'].indexOf(workflowStatus) > i;
            return (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${active ? 'bg-slate-900 text-white' : done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                    {done ? <CheckSquare className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-[10px] mt-1 whitespace-nowrap ${active ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>{step}</span>
                </div>
                {i < 4 && <div className={`w-8 sm:w-12 h-0.5 mx-1 mb-4 ${done ? 'bg-emerald-300' : 'bg-slate-200'}`} />}
              </div>
            );
          })}
        </div>

        {workflowStatus === 'rejected' && (
          <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-5 h-5 text-rose-600" />
              <p className="text-sm font-semibold text-rose-700">REJECTED</p>
            </div>
            <p className="text-sm text-slate-700 mb-3">Reason: "{rejectionReason}"</p>
            <div className="flex flex-wrap gap-2">
              <button className="btn-secondary" onClick={() => setReviewOpen(true)}><Eye className="w-4 h-4" /> View Remarks</button>
              <button className="btn-secondary" onClick={() => setView('weekly')}><Pencil className="w-4 h-4" /> Edit Timetable</button>
              <button className="btn-primary" onClick={resubmit}><Send className="w-4 h-4" /> Resubmit</button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {workflowStatus === 'draft' && (
            <>
              <button className="btn-secondary" onClick={saveDraft}><Save className="w-4 h-4" /> Save Draft</button>
              <button className="btn-secondary" onClick={() => document.getElementById('conflicts-section')?.scrollIntoView({ behavior: 'smooth' })}><FileCheck className="w-4 h-4" /> Validate</button>
              <button className="btn-primary" onClick={submitForApproval} disabled={conflicts.length > 0}><Send className="w-4 h-4" /> Submit for Approval</button>
            </>
          )}
          {workflowStatus === 'submitted' && (
            <button className="btn-secondary" onClick={() => setReviewOpen(true)}><Eye className="w-4 h-4" /> View Submission</button>
          )}
          {workflowStatus === 'approved' && (
            <button className="btn-success" onClick={publish}><Send className="w-4 h-4" /> Publish Timetable</button>
          )}
          {workflowStatus === 'published' && (
            <button className="btn-secondary" onClick={() => setView('weekly')}><Eye className="w-4 h-4" /> View Published Timetable</button>
          )}
        </div>
      </div>

      {/* Footer action area */}
      <div className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-slate-400">Last saved: {lastSaved}</p>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={saveDraft}><Save className="w-4 h-4" /> Save Draft</button>
          <button className="btn-secondary" onClick={() => document.getElementById('conflicts-section')?.scrollIntoView({ behavior: 'smooth' })}><FileCheck className="w-4 h-4" /> Validate Timetable</button>
          <button className="btn-primary" onClick={submitForApproval} disabled={conflicts.length > 0}><Send className="w-4 h-4" /> Submit for Approval</button>
        </div>
      </div>

      {/* Add / Edit Class modal */}
      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editingEntry ? 'Edit Class' : 'Add Class'}
        subtitle={`${dept?.code} · Sem ${semester} · Section ${form.section}`}
        size="lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Subject</label>
            <select
              className="input"
              value={form.subject}
              onChange={(e) => {
                const name = e.target.value;
                /* Timetable retrieves Subject + Faculty + Class + Preferred Resource from the allocation */
                const hint = name ? allocationForSubject(name, form.section) : null;
                setForm({
                  ...form,
                  subject: name,
                  facultyId: hint?.facultyId || form.facultyId,
                  room: hint?.room || form.room,
                });
              }}
            >
              <option value="">Select subject...</option>
              {deptSubs.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
            {form.subject && (
              allocationForSubject(form.subject, form.section) ? (
                <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  From allocation: {allocationForSubject(form.subject, form.section)!.facultyName || '—'}
                  {allocationForSubject(form.subject, form.section)!.room ? ` · ${allocationForSubject(form.subject, form.section)!.room}` : ''}
                </p>
              ) : (
                <p className="text-[11px] text-amber-600 font-medium mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  No subject allocation found — allocate this subject (faculty + resources) in Subject Allocation first.
                </p>
              )
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Faculty</label>
            <select className="input" value={form.facultyId} onChange={(e) => setForm({ ...form, facultyId: e.target.value })}>
              <option value="">Select faculty...</option>
              {eligibleFacultyFor(form.subject, form.section).map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Day</label>
            <select className="input" value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
              {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Time Slot</label>
            <select className="input" value={form.slot} onChange={(e) => setForm({ ...form, slot: e.target.value })}>
              {(form.day === 'Saturday' ? SATURDAY_MORNING_SLOTS : SLOTS.filter((s) => s !== LUNCH_SLOT)).map((s) => <option key={s} value={s}>{slotLabel(s)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Class Type</label>
            <select className="input" value={form.classType} onChange={(e) => setForm({ ...form, classType: e.target.value })}>
              {CLASS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Class / Section</label>
            <select className="input" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1">{form.classType === 'Practical' ? 'Laboratory' : 'Room'}</label>
            <select className="input" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })}>
              <option value="">Select {form.classType === 'Practical' ? 'laboratory' : 'room'}...</option>
              {(form.classType === 'Practical' ? deptLabs : deptRooms).map((r) => (
                <option key={r.id} value={r.name}>{r.name} (cap {r.capacity})</option>
              ))}
            </select>
          </div>
        </div>

        {availability.warnings.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-xs font-semibold text-amber-700 mb-1">Availability check</p>
            <ul className="space-y-1">
              {availability.warnings.map((w) => (
                <li key={w} className="text-xs text-amber-700 flex items-start gap-1.5"><AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> {w}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button className="btn-secondary" onClick={() => setEditorOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={saveEntry}>
            {editingEntry ? <><Pencil className="w-4 h-4" /> Save Changes</> : <><Plus className="w-4 h-4" /> Add Class</>}
          </button>
        </div>
      </Modal>

      {/* Review conflicts modal */}
      <Modal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title="Review Conflicts"
        subtitle={`${conflicts.length} conflict${conflicts.length !== 1 ? 's' : ''} found`}
        size="lg"
      >
        {conflicts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-900">No conflicts to review</p>
            <p className="text-xs text-slate-500 mt-1">The timetable is clean and ready for submission.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {conflicts.map((c) => (
              <div key={c.id} className={`p-4 rounded-xl border ${c.severity === 'error' ? 'border-rose-200 bg-rose-50/50' : 'border-amber-200 bg-amber-50/50'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {c.severity === 'error' ? <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />}
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{c.type}</p>
                      <p className="text-sm text-slate-700 mt-0.5">{c.message}</p>
                      <p className="text-xs text-slate-500 mt-1.5"><span className="font-medium">Reason:</span> {c.reason}</p>
                      <p className="text-xs text-slate-500 mt-0.5"><span className="font-medium">Suggested resolution:</span> {c.suggestion}</p>
                    </div>
                  </div>
                  <span className={`badge flex-shrink-0 ${c.severity === 'error' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{c.severity}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  {c.entries[0] && (
                    <button
                      className="btn-secondary !py-1.5 !px-3 text-xs"
                      onClick={() => {
                        const entry = entries.find((e) => e.id === c.entries[0]);
                        if (entry) { setReviewOpen(false); openEdit(entry); }
                      }}
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit Class
                    </button>
                  )}
                  <button
                    className="btn-primary !py-1.5 !px-3 text-xs"
                    onClick={() => setResolvedConflicts((prev) => new Set(prev).add(c.id))}
                  >
                    <CheckSquare className="w-3.5 h-3.5" /> Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}

interface FormState {
  subject: string;
  facultyId: string;
  day: string;
  slot: string;
  room: string;
  section: string;
  classType: string;
}