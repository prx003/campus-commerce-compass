import type { AppData, TimetableEntry } from '../../data/types';

export type TimetableConflictType =
  | 'SECTION_CONFLICT'
  | 'FACULTY_CONFLICT'
  | 'ROOM_CONFLICT'
  | 'ALLOCATION_CONFLICT'
  | 'OUT_OF_HOURS';

export interface TimetableValidation {
  valid: boolean;
  type?: TimetableConflictType;
  message?: string;
  conflictingEntry?: TimetableEntry;
}

export function validateTimetableEntry(
  data: AppData,
  entry: Pick<TimetableEntry, 'departmentId' | 'semester' | 'section' | 'day' | 'slot' | 'subject' | 'facultyId' | 'room'>,
  existingEntries: TimetableEntry[] = data.timetable,
  excludeId?: string,
): TimetableValidation {
  const weekdaySlots = new Set(['09:00-10:00', '10:00-11:00', '11:00-12:00', '13:00-14:00', '14:00-15:00', '15:00-16:00']);
  const saturdaySlots = new Set(['09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00']);
  if (entry.day === 'Sunday' || (entry.day === 'Saturday' ? !saturdaySlots.has(entry.slot) : !weekdaySlots.has(entry.slot))) {
    return { valid: false, type: 'OUT_OF_HOURS', message: 'Classes can only be scheduled during the Monday-Saturday working hours.' };
  }
  const others = existingEntries.filter((item) => item.id !== excludeId);
  const sameTime = (item: TimetableEntry) => item.day === entry.day && item.slot === entry.slot;
  const sectionConflict = others.find(
    (item) => sameTime(item) && item.departmentId === entry.departmentId && item.semester === entry.semester && item.section === entry.section,
  );
  if (sectionConflict) {
    return {
      valid: false,
      type: 'SECTION_CONFLICT',
      message: `Section ${entry.section} - Sem ${entry.semester} already has ${sectionConflict.subject} from ${entry.slot.replace('-', ' to ')}.`,
      conflictingEntry: sectionConflict,
    };
  }

  const facultyConflict = others.find((item) => sameTime(item) && item.facultyId === entry.facultyId);
  if (facultyConflict) {
    const faculty = data.staff.find((item) => item.id === entry.facultyId)?.name ?? entry.facultyId;
    return {
      valid: false,
      type: 'FACULTY_CONFLICT',
      message: `Faculty Conflict: ${faculty} is already scheduled for ${facultyConflict.section}-Sem ${facultyConflict.semester} - ${facultyConflict.subject} from ${entry.slot.replace('-', ' to ')}.`,
      conflictingEntry: facultyConflict,
    };
  }

  const roomConflict = others.find((item) => sameTime(item) && item.room === entry.room);
  if (roomConflict) {
    return {
      valid: false,
      type: 'ROOM_CONFLICT',
      message: `Room Conflict: ${entry.room} is already booked for ${roomConflict.section}-Sem ${roomConflict.semester} - ${roomConflict.subject} from ${entry.slot.replace('-', ' to ')}.`,
      conflictingEntry: roomConflict,
    };
  }

  const subject = data.subjects.find(
    (item) => item.departmentId === entry.departmentId && item.semester === entry.semester && item.name === entry.subject,
  );
  const allocation = subject && data.subjectAllocations.find(
    (item) => item.subjectId === subject.id && item.status === 'allocated' && item.classIds.includes(entry.section) && item.facultyId === entry.facultyId,
  );
  if (!allocation) {
    return {
      valid: false,
      type: 'ALLOCATION_CONFLICT',
      message: `${data.staff.find((item) => item.id === entry.facultyId)?.name ?? 'Selected faculty'} is not allocated to ${entry.subject} for ${entry.section}-Sem ${entry.semester}.`,
    };
  }

  return { valid: true };
}
