import { useMemo, useState } from 'react';
import { BookOpen, CalendarDays, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../store/StoreContext';
import { PageHeader } from '../../components/PageHeader';
import { SubjectAllocationWorkspace } from './SubjectAllocationWorkspace';
import { TimetableWorkspace } from './TimetableWorkspace';

const SEMESTERS = [1, 2, 3, 4, 5, 6];
const SECTIONS = ['A', 'B'];
const ACADEMIC_YEAR = '2026–27';

type SetupMode = 'allocation' | 'timetable';

export function AcademicSetupWorkspace({ deptId }: { deptId: string }) {
  const { data } = useStore();
  const [mode, setMode] = useState<SetupMode>('allocation');
  const [semester, setSemester] = useState(6);
  const [section, setSection] = useState('A');

  const department = data.departments.find((item) => item.id === deptId);
  const status = useMemo(() => {
    const entries = data.timetable.filter((entry) => entry.departmentId === deptId && entry.semester === semester && entry.section === section);
    if (entries.length > 0 && entries.every((entry) => entry.published)) return 'Published';
    if (entries.some((entry) => entry.status === 'pending-principal')) return 'Ready for Approval';
    return 'Setup in Progress';
  }, [data.timetable, deptId, semester, section]);

  return (
    <div>
      <PageHeader
        title="Academic Setup"
        description="Configure subjects, faculty assignments and the semester timetable."
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
            <CheckCircle2 className={`h-3.5 w-3.5 ${status === 'Published' ? 'text-emerald-500' : 'text-slate-400'}`} />
            {status}
          </span>
        }
      />

      <div className="card mb-5 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[180px]">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">Department</p>
            <p className="text-sm font-semibold text-slate-900">{department?.code ?? department?.name ?? 'Department'}</p>
          </div>
          <label className="min-w-[120px]">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">Semester</span>
            <select className="input" value={semester} onChange={(event) => setSemester(Number(event.target.value))}>
              {SEMESTERS.map((value) => <option key={value} value={value}>Sem {value}</option>)}
            </select>
          </label>
          <label className="min-w-[110px]">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">Section</span>
            <select className="input" value={section} onChange={(event) => setSection(event.target.value)}>
              {SECTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <div className="min-w-[120px]">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">Academic Year</p>
            <p className="text-sm font-medium text-slate-700">{ACADEMIC_YEAR}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 inline-flex rounded-lg border border-slate-200 bg-white p-1" role="tablist" aria-label="Academic Setup mode">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'allocation'}
          onClick={() => setMode('allocation')}
          className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${mode === 'allocation' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <BookOpen className="h-4 w-4" /> Subject Allocation
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'timetable'}
          onClick={() => setMode('timetable')}
          className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${mode === 'timetable' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <CalendarDays className="h-4 w-4" /> Timetable
        </button>
      </div>

      {mode === 'allocation' ? (
        <SubjectAllocationWorkspace key={`${semester}-${section}`} deptId={deptId} embedded semesterOverride={semester} sectionOverride={section} />
      ) : (
        <TimetableWorkspace key={`${semester}-${section}`} deptId={deptId} embedded semesterOverride={semester} sectionOverride={section} academicYearOverride={ACADEMIC_YEAR} />
      )}
    </div>
  );
}
