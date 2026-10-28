import { useMemo, useState } from 'react';
import { useStore, staffName } from '../../store/StoreContext';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { DataTable } from '../../components/DataTable';
import { ArrowLeft, BookOpen, Building2, ChevronRight, GraduationCap, Search, TrendingUp, X } from 'lucide-react';
import type { Department, Subject } from '../../data/types';
import { ACADEMIC_YEAR } from '../hod/subjectAllocationLogic';

/* Academic year options — the active year is the shared ACADEMIC_YEAR constant
   used across the application; past years mirror the HOD Timetable workspace list.
   Curriculum records exist for the active academic year only. */
const ACADEMIC_YEAR_OPTIONS = [ACADEMIC_YEAR, '2025–26', '2024–25'];

/* ===== Syllabus status rules (applied consistently to departments, programs and subjects) =====
   ≥80% → On Track · 70–79% → Slightly Behind Schedule · below 70% → At Risk */
export type SyllabusLevel = 'on-track' | 'slightly-behind' | 'at-risk';

export function syllabusLevel(pct: number): SyllabusLevel {
  if (pct >= 80) return 'on-track';
  if (pct >= 70) return 'slightly-behind';
  return 'at-risk';
}

const SYLLABUS_STATUS: Record<SyllabusLevel, { label: string; badge: string; bar: string; text: string; dot: string }> = {
  'on-track': { label: 'On Track', badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  'slightly-behind': { label: 'Slightly Behind Schedule', badge: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500', text: 'text-amber-600', dot: 'bg-amber-500' },
  'at-risk': { label: 'At Risk', badge: 'bg-rose-100 text-rose-700', bar: 'bg-rose-500', text: 'text-rose-600', dot: 'bg-rose-500' },
};

/* Department → Program → Subject → Faculty → Syllabus completion.
   Every average is derived from the subject-level syllabusCompletion of the
   existing sample data, so department, program and subject figures stay
   logically related throughout the page. */
function avgCompletion(subjects: Subject[]): number {
  if (!subjects.length) return 0;
  return Math.round(subjects.reduce((a, s) => a + s.syllabusCompletion, 0) / subjects.length);
}

interface ProgramRow { id: string; name: string; note?: string; subjects: Subject[]; avg: number; }
interface DeptRow { id: string; dept: Department; programs: ProgramRow[]; subjects: Subject[]; avg: number; }

function ProgressBar({ pct, className = 'w-full' }: { pct: number; className?: string }) {
  return (
    <div className={`h-2 bg-slate-100 rounded-full overflow-hidden ${className}`}>
      <div className={`h-full rounded-full ${SYLLABUS_STATUS[syllabusLevel(pct)].bar}`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}

function SyllabusStatusBadge({ pct }: { pct: number }) {
  const meta = SYLLABUS_STATUS[syllabusLevel(pct)];
  return <span className={`badge ${meta.badge}`}>{meta.label}</span>;
}

function statusAccent(pct: number): 'emerald' | 'amber' | 'rose' {
  return pct >= 80 ? 'emerald' : pct >= 70 ? 'amber' : 'rose';
}

export function CurriculumOversight() {
  const { data } = useStore();
  const [year, setYear] = useState(ACADEMIC_YEAR);
  const [deptFilter, setDeptFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');
  const [semFilter, setSemFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [drawerDeptId, setDrawerDeptId] = useState<string | null>(null);

  /* Programs per department — derived from the existing student records
     (student.program), which is the program data available in the application. */
  const programsByDept = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const d of data.departments) {
      map[d.id] = [...new Set(data.students.filter((st) => st.departmentId === d.id).map((st) => st.program))];
    }
    return map;
  }, [data]);

  const rows = useMemo<DeptRow[]>(() => {
    if (year !== ACADEMIC_YEAR) return [];
    const q = search.trim().toLowerCase();
    return data.departments
      .filter((d) => deptFilter === 'all' || d.id === deptFilter)
      .filter((d) => programFilter === 'all' || (programsByDept[d.id] ?? []).includes(programFilter))
      .filter((d) => {
        if (!q) return true;
        return [d.name, d.code, ...(programsByDept[d.id] ?? [])].join(' ').toLowerCase().includes(q);
      })
      .map((d) => {
        const all = data.subjects.filter((s) => s.departmentId === d.id);
        const scoped = semFilter === 'all' ? all : all.filter((s) => s.semester === Number(semFilter));
        const programs = (programsByDept[d.id] ?? []).map((name, i) => ({ id: `${d.id}::${i}`, name, subjects: scoped, avg: avgCompletion(scoped) }));
        return { id: d.id, dept: d, programs, subjects: scoped, avg: avgCompletion(scoped) };
      });
  }, [data, year, deptFilter, programFilter, semFilter, search, programsByDept]);

  const programOptions = useMemo(() => {
    const depts = deptFilter === 'all' ? data.departments : data.departments.filter((d) => d.id === deptFilter);
    return [...new Set(depts.flatMap((d) => programsByDept[d.id] ?? []))];
  }, [data, deptFilter, programsByDept]);

  const semesterOptions = useMemo(
    () => [...new Set(data.subjects.filter((s) => deptFilter === 'all' || s.departmentId === deptFilter).map((s) => s.semester))].sort((a, b) => a - b),
    [data, deptFilter]
  );

  const scopedSubjects = rows.flatMap((r) => r.subjects);
  const totalPrograms = rows.reduce((a, r) => a + r.programs.length, 0);
  const overallAvg = avgCompletion(scopedSubjects);
  const emptyMessage = year !== ACADEMIC_YEAR
    ? `No curriculum records found for Academic Year ${year}`
    : 'No departments match the selected filters';
  return (
    <div>
      <PageHeader
        title="Curriculum Oversight"
        description="Monitor curriculum delivery, program-wise syllabus progress and academic status across departments"
      />

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-wrap items-center gap-3">
        <select className="input w-auto" value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setProgramFilter('all'); }} aria-label="Department">
          <option value="all">Department: All</option>
          {data.departments.map((d) => <option key={d.id} value={d.id}>{d.code} - {d.name}</option>)}
        </select>
        <select className="input w-auto" value={programFilter} onChange={(e) => setProgramFilter(e.target.value)} aria-label="Program">
          <option value="all">Program: All</option>
          {programOptions.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="input w-auto" value={semFilter} onChange={(e) => setSemFilter(e.target.value)} aria-label="Semester">
          <option value="all">Semester: All</option>
          {semesterOptions.map((s) => <option key={s} value={s}>Sem {s}</option>)}
        </select>
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="input pl-9 w-full sm:w-64"
            placeholder="Search department or program..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Departments" value={rows.length} icon={<Building2 className="w-5 h-5" />} accent="slate" />
        <StatCard label="Programs" value={totalPrograms} icon={<GraduationCap className="w-5 h-5" />} accent="indigo" />
        <StatCard label="Subjects" value={scopedSubjects.length} icon={<BookOpen className="w-5 h-5" />} accent="blue" />
        <StatCard
          label="Avg Completion"
          value={`${overallAvg}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          accent={scopedSubjects.length ? statusAccent(overallAvg) : 'slate'}
        />
      </div>
      {/* Departments */}
      <DataTable
        rows={rows}
        emptyMessage={emptyMessage}
        onRowDoubleClick={(r) => setDrawerDeptId(r.id)}
        columns={[
          {
            key: 'name',
            header: 'Department',
            render: (r) => (
              <div>
                <p className="font-medium text-slate-900">{r.dept.name}</p>
                <p className="text-xs text-slate-500">{r.dept.code}</p>
              </div>
            ),
          },
          { key: 'programs', header: 'Programs', render: (r) => r.programs.length },
          { key: 'subjects', header: 'Total Subjects', render: (r) => r.subjects.length },
          {
            key: 'avg',
            header: 'Avg Syllabus Completion',
            render: (r) => (
              <div className="flex items-center gap-2">
                <ProgressBar pct={r.avg} className="w-28" />
                <span className="text-xs font-medium text-slate-700">{r.avg}%</span>
              </div>
            ),
          },
          { key: 'status', header: 'Academic Status', render: (r) => <SyllabusStatusBadge pct={r.avg} /> },
        ]}
      />
      <p className="text-xs text-slate-400 mt-3">Double-click a department to open its curriculum detail panel.</p>

      {/* Department detail drawer */}
      {drawerDeptId && (
        <DepartmentDrawer
          key={drawerDeptId}
          deptId={drawerDeptId}
          academicYear={year}
          onClose={() => setDrawerDeptId(null)}
        />
      )}
    </div>
  );
}
/* ===== Right-side department detail panel (nested drill-down, no navigation) ===== */
function DepartmentDrawer({ deptId, academicYear, onClose }: { deptId: string; academicYear: string; onClose: () => void }) {
  const { data } = useStore();
  const [programId, setProgramId] = useState<string | null>(null);

  const dept = data.departments.find((d) => d.id === deptId);
  const subjects = useMemo(
    () => data.subjects
      .filter((s) => s.departmentId === deptId)
      .sort((a, b) => a.semester - b.semester || a.name.localeCompare(b.name)),
    [data, deptId]
  );

  /* Every program of the department. Subjects belong to their department in the
     sample data, so the department's curriculum is shown under each of its programs. */
  const programs = useMemo<ProgramRow[]>(() => {
    if (!dept) return [];
    return [...new Set(data.students.filter((st) => st.departmentId === dept.id).map((st) => st.program))]
      .map((name, i) => ({ id: `${dept.id}::${i}`, name, subjects, avg: avgCompletion(subjects) }));
  }, [dept, data, subjects]);

  if (!dept) return null;

  const avg = avgCompletion(subjects);
  /* Departments without enrolled programs (service departments) still expose
     their real subjects through a clearly-labeled entry. */
  const serviceProgram: ProgramRow | null = programs.length === 0 && subjects.length > 0
    ? { id: `service::${dept.id}`, name: 'Service Subjects', note: 'No enrolled programs · subjects taught across other departments', subjects, avg }
    : null;
  const openProgram = programs.find((p) => p.id === programId) ?? (serviceProgram?.id === programId ? serviceProgram : undefined);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl flex flex-col">
        {/* Department header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{dept.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Department · {dept.code}</p>
            <p className="text-sm text-slate-600 mt-1">Academic Year: {academicYear}</p>
          </div>
          <button type="button" className="btn-secondary" onClick={onClose}>
            <X className="w-4 h-4" /> Close
          </button>
        </div>

        {/* Panel body */}
        <div className="flex-1 overflow-y-auto p-6">
          {openProgram ? (
            <ProgramDetail program={openProgram} academicYear={academicYear} onBack={() => setProgramId(null)} />
          ) : (
            <DeptOverview
              programs={programs}
              serviceProgram={serviceProgram}
              subjects={subjects}
              onOpenProgram={setProgramId}
            />
          )}
        </div>
      </aside>
    </div>
  );
}
function DeptOverview({ programs, serviceProgram, subjects, onOpenProgram }: {
  programs: ProgramRow[];
  serviceProgram: ProgramRow | null;
  subjects: Subject[];
  onOpenProgram: (id: string) => void;
}) {
  const avg = avgCompletion(subjects);
  const meta = SYLLABUS_STATUS[syllabusLevel(avg)];
  const list = serviceProgram ? [...programs, serviceProgram] : programs;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Number of Programs" value={programs.length} icon={<GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />} accent="blue" compact />
        <StatCard label="Total Subjects" value={subjects.length} icon={<BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />} accent="indigo" compact />
        <StatCard label="Average Completion" value={`${avg}%`} icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />} accent={statusAccent(avg)} compact />
      </div>

      {/* Academic status */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Academic Status</h3>
        <div className="card p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full ${meta.dot}`} />
            <div>
              <p className={`text-sm font-semibold ${meta.text}`}>{meta.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">Based on average syllabus completion of {avg}% across {subjects.length} subjects</p>
            </div>
          </div>
          <SyllabusStatusBadge pct={avg} />
        </div>
        <p className="text-xs text-slate-400 mt-2">Status rule: 80% and above On Track · 70–79% Slightly Behind Schedule · below 70% At Risk</p>
      </div>

      {/* Programs */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Programs</h3>
        {list.length === 0 ? (
          <div className="card p-6 text-center text-sm text-slate-400">No programs recorded for this department.</div>
        ) : (
          <div className="space-y-3">
            {list.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onOpenProgram(p.id)}
                className="card card-hover p-4 w-full text-left group"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                    {p.note && <p className="text-xs text-slate-400 mt-0.5">{p.note}</p>}
                    <p className="text-xs text-slate-500 mt-0.5">Average Syllabus Completion: {p.avg}%</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <SyllabusStatusBadge pct={p.avg} />
                    <ChevronRight className="w-4 h-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-600" />
                  </div>
                </div>
                <ProgressBar pct={p.avg} className="mt-3" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
/* ===== Program drill-down (rendered inside the department panel) ===== */
function ProgramDetail({ program, academicYear, onBack }: { program: ProgramRow; academicYear: string; onBack: () => void }) {
  const { data } = useStore();
  const [sem, setSem] = useState('all');
  const meta = SYLLABUS_STATUS[syllabusLevel(program.avg)];

  const semesters = useMemo(() => [...new Set(program.subjects.map((s) => s.semester))].sort((a, b) => a - b), [program]);
  const rows = sem === 'all' ? program.subjects : program.subjects.filter((s) => s.semester === Number(sem));

  return (
    <div className="space-y-5">
      <div>
        <button type="button" className="btn-secondary" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" /> Back to Programs
        </button>
      </div>

      {/* Program header */}
      <div className="card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{program.name}</h3>
            <p className="text-sm text-slate-500 mt-0.5">Academic Year: {academicYear}</p>
          </div>
          <SyllabusStatusBadge pct={program.avg} />
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-slate-500">Average Syllabus Completion</span>
            <span className={`font-semibold ${meta.text}`}>{program.avg}%</span>
          </div>
          <ProgressBar pct={program.avg} />
        </div>
      </div>

      {/* Subjects & syllabus progress */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h3 className="text-sm font-semibold text-slate-900">Subjects &amp; Syllabus Progress</h3>
          <select className="input w-auto" value={sem} onChange={(e) => setSem(e.target.value)} aria-label="Semester">
            <option value="all">Semester: All</option>
            {semesters.map((s) => <option key={s} value={s}>Sem {s}</option>)}
          </select>
        </div>
        <DataTable
          rows={rows}
          emptyMessage="No subjects found for the selected semester"
          columns={[
            {
              key: 'name',
              header: 'Subject',
              render: (s) => (
                <div>
                  <p className="font-medium text-slate-900">{s.name}</p>
                  <p className="text-xs text-slate-500">{s.code}</p>
                </div>
              ),
            },
            { key: 'semester', header: 'Semester', render: (s) => s.semester },
            {
              key: 'facultyId',
              header: 'Faculty',
              render: (s) => (s.facultyId ? staffName(data, s.facultyId) : <span className="text-slate-400">Unassigned</span>),
            },
            {
              key: 'completion',
              header: 'Completion',
              render: (s) => (
                <span className={`text-sm font-semibold ${SYLLABUS_STATUS[syllabusLevel(s.syllabusCompletion)].text}`}>
                  {s.syllabusCompletion}%
                </span>
              ),
            },
            { key: 'progress', header: 'Progress', render: (s) => <ProgressBar pct={s.syllabusCompletion} className="w-24" /> },
            { key: 'status', header: 'Status', render: (s) => <SyllabusStatusBadge pct={s.syllabusCompletion} /> },
          ]}
        />
      </div>
    </div>
  );
}


