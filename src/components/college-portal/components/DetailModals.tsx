import { Modal } from './Modal';
import { StatusBadge } from './DataTable';
import { useStore, deptName, roleLabels } from '../store/StoreContext';
import type { Student, Staff } from '../data/types';

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</dt>
      <dd className="text-sm text-slate-900 mt-0.5">{value || '—'}</dd>
    </div>
  );
}

export function StaffDetailModal({ staff, open, onClose, editable, onSave }: {
  staff: Staff | null;
  open: boolean;
  onClose: () => void;
  editable?: boolean;
  onSave?: (patch: Partial<Staff>) => void;
}) {
  const { data } = useStore();
  if (!staff) return null;
  const dept = data.departments.find((d) => d.id === staff.departmentId);
  const subjects = data.subjects.filter((s) => s.facultyId === staff.id);
  const pubs = data.publications.filter((p) => p.facultyId === staff.id);
  const projects = data.researchProjects.filter((r) => r.facultyId === staff.id);

  return (
    <Modal open={open} onClose={onClose} title={staff.name} subtitle={`${staff.designation} · ${deptName(data, staff.departmentId)}`} size="lg">
      <div className="space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center text-xl font-semibold">
            {staff.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{staff.name}</h3>
            <p className="text-sm text-slate-500">{staff.designation}</p>
            <div className="mt-1"><StatusBadge status={staff.status} /></div>
          </div>
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Field label="Employee ID" value={staff.id.toUpperCase()} />
          <Field label="Role" value={roleLabels[staff.role]} />
          <Field label="Department" value={dept?.name} />
          <Field label="Email" value={staff.email} />
          <Field label="Phone" value={staff.phone} />
          <Field label="Qualifications" value={staff.qualifications} />
          <Field label="Employment" value={<span className="capitalize">{staff.employmentType}</span>} />
          <Field label="Joined On" value={staff.joinedOn} />
          <Field label="Weekly Hours" value={`${staff.weeklyHours} hrs`} />
          <Field label="Gender" value={staff.gender} />
          <Field label="Date of Birth" value={staff.dob} />
          <Field label="Blood Group" value={staff.bloodGroup} />
          <Field label="Address" value={staff.address} />
        </dl>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="card p-3 text-center"><p className="text-xs text-slate-500">Attendance</p><p className="text-lg font-bold text-slate-900">{staff.attendancePct}%</p></div>
          <div className="card p-3 text-center"><p className="text-xs text-slate-500">Feedback</p><p className="text-lg font-bold text-slate-900">{staff.feedbackScore || '—'}/5</p></div>
          <div className="card p-3 text-center"><p className="text-xs text-slate-500">Rating</p><p className="text-lg font-bold text-slate-900">{staff.performanceRating || '—'}/5</p></div>
          <div className="card p-3 text-center"><p className="text-xs text-slate-500">Pending Work</p><p className="text-lg font-bold text-slate-900">{staff.pendingWork}</p></div>
          <div className="card p-3 text-center"><p className="text-xs text-slate-500">Avg Syllabus</p><p className="text-lg font-bold text-slate-900">{subjects.length ? `${Math.round(subjects.reduce((a, s) => a + s.syllabusCompletion, 0) / subjects.length)}%` : '—'}</p></div>
        </div>

        {subjects.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Teaching Progress & Syllabus Completion</h4>
            <div className="space-y-2">
              {subjects.map((s) => {
                const c = s.syllabusCompletion >= 85 ? { bar: 'bg-emerald-500', text: 'text-emerald-600', label: 'On track' } : s.syllabusCompletion >= 70 ? { bar: 'bg-amber-500', text: 'text-amber-600', label: 'Behind' } : { bar: 'bg-rose-500', text: 'text-rose-600', label: 'Delayed' };
                return (
                  <div key={s.id} className="card p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.code} · Sem {s.semester} · {s.classes.join(', ')}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${c.text}`}>{s.syllabusCompletion}%</p>
                        <p className="text-xs text-slate-500">{c.label}</p>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${s.syllabusCompletion}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {subjects.length === 0 && staff.subjects.length === 0 && (() => {
          const tasks = data.nonTeachingTasks.filter((t) => t.staffId === staff.id);
          if (tasks.length === 0) return null;
          const completed = tasks.filter((t) => t.status === 'completed').length;
          const inProg = tasks.filter((t) => t.status === 'in-progress').length;
          const pending = tasks.filter((t) => t.status === 'pending').length;
          const pct = Math.round((completed / tasks.length) * 100);
          return (
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Work Progress & Performance</h4>
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div className="card p-3 text-center"><p className="text-xs text-slate-500">Total Tasks</p><p className="text-lg font-bold text-slate-900">{tasks.length}</p></div>
                <div className="card p-3 text-center"><p className="text-xs text-slate-500">Completed</p><p className="text-lg font-bold text-emerald-600">{completed}</p></div>
                <div className="card p-3 text-center"><p className="text-xs text-slate-500">In Progress</p><p className="text-lg font-bold text-amber-600">{inProg}</p></div>
                <div className="card p-3 text-center"><p className="text-xs text-slate-500">Pending</p><p className="text-lg font-bold text-rose-600">{pending}</p></div>
              </div>
              <div className="card p-3">
                <div className="flex justify-between text-xs text-slate-500 mb-1"><span>Overall Work Progress</span><span>{pct}%</span></div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${pct >= 85 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {tasks.map((t) => (
                  <div key={t.id} className="flex items-center justify-between card p-3">
                    <p className="text-sm font-medium text-slate-900">{t.task}</p>
                    <StatusBadge status={t.status} />
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {(pubs.length > 0 || projects.length > 0) && (
          <div className="grid sm:grid-cols-2 gap-4">
            {pubs.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Publications ({pubs.length})</h4>
                <div className="space-y-2">
                  {pubs.map((p) => (
                    <div key={p.id} className="card p-3">
                      <p className="text-sm font-medium text-slate-900">{p.title}</p>
                      <p className="text-xs text-slate-500">{p.journal} · {p.year} · <span className="capitalize">{p.type}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {projects.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Research Projects ({projects.length})</h4>
                <div className="space-y-2">
                  {projects.map((r) => (
                    <div key={r.id} className="card p-3">
                      <p className="text-sm font-medium text-slate-900">{r.title}</p>
                      <p className="text-xs text-slate-500">{r.fundingAgency} · ₹{r.amount.toLocaleString('en-IN')}</p>
                      <div className="mt-1"><StatusBadge status={r.status} /></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {editable && onSave && <EditStaffForm staff={staff} onSave={onSave} />}
      </div>
    </Modal>
  );
}

function EditStaffForm({ staff, onSave }: { staff: Staff; onSave: (patch: Partial<Staff>) => void }) {
  return (
    <div className="pt-4 border-t border-slate-100">
      <h4 className="text-sm font-semibold text-slate-900 mb-3">Update Information</h4>
      <div className="grid grid-cols-2 gap-3">
        <input className="input" defaultValue={staff.phone} placeholder="Phone" id="ed-phone" />
        <input className="input" defaultValue={staff.email} placeholder="Email" id="ed-email" />
        <select className="input" defaultValue={staff.status} id="ed-status">
          <option value="active">Active</option>
          <option value="on-leave">On Leave</option>
          <option value="inactive">Inactive</option>
        </select>
        <input className="input" type="number" defaultValue={staff.weeklyHours} id="ed-hours" />
      </div>
      <button className="btn-primary mt-3" onClick={() => {
        const phone = (document.getElementById('ed-phone') as HTMLInputElement).value;
        const email = (document.getElementById('ed-email') as HTMLInputElement).value;
        const status = (document.getElementById('ed-status') as HTMLSelectElement).value as Staff['status'];
        const weeklyHours = Number((document.getElementById('ed-hours') as HTMLInputElement).value);
        onSave({ phone, email, status, weeklyHours });
      }}>Save Changes</button>
    </div>
  );
}

export function StudentDetailModal({ student, open, onClose, editable, onSave }: {
  student: Student | null;
  open: boolean;
  onClose: () => void;
  editable?: boolean;
  onSave?: (patch: Partial<Student>) => void;
}) {
  const { data } = useStore();
  if (!student) return null;
  const dept = data.departments.find((d) => d.id === student.departmentId);

  return (
    <Modal open={open} onClose={onClose} title={student.name} subtitle={`${student.rollNo} · ${student.program}`} size="lg">
      <div className="space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-xl font-semibold">
            {student.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{student.name}</h3>
            <p className="text-sm text-slate-500">{student.rollNo} · Sem {student.semester} · Sec {student.section}</p>
            <div className="mt-1 flex gap-2">
              <StatusBadge status={student.status} />
              {student.backlogs > 0 && <span className="badge bg-rose-100 text-rose-700">{student.backlogs} backlog</span>}
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-3">Academic Snapshot</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card p-3 text-center"><p className="text-xs text-slate-500">Attendance</p><p className="text-lg font-bold text-slate-900">{student.attendancePct}%</p></div>
            <div className="card p-3 text-center"><p className="text-xs text-slate-500">GPA</p><p className="text-lg font-bold text-slate-900">{student.gpa}</p></div>
            <div className="card p-3 text-center"><p className="text-xs text-slate-500">CGPA</p><p className="text-lg font-bold text-slate-900">{student.cgpa}</p></div>
            <div className="card p-3 text-center"><p className="text-xs text-slate-500">Backlogs</p><p className="text-lg font-bold text-slate-900">{student.backlogs}</p></div>
          </div>
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Field label="Student ID" value={student.id.toUpperCase()} />
          <Field label="Department" value={dept?.name} />
          <Field label="Program" value={student.program} />
          <Field label="Email" value={student.email} />
          <Field label="Phone" value={student.phone} />
          <Field label="Admission Date" value={student.admissionDate} />
          <Field label="Admission Type" value={student.admissionType} />
          <Field label="Gender" value={student.gender} />
          <Field label="Date of Birth" value={student.dob} />
          <Field label="Blood Group" value={student.bloodGroup} />
          <Field label="Address" value={student.address} />
        </dl>

        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-3">Parent / Guardian</h4>
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field label="Parent Name" value={student.parentName} />
            <Field label="Parent Phone" value={student.parentPhone} />
            <Field label="Parent Email" value={student.parentEmail} />
          </dl>
        </div>

        {student.internalMarks.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Internal Marks</h4>
            <div className="space-y-2">
              {student.internalMarks.map((m, i) => (
                <div key={i} className="flex items-center justify-between card p-3">
                  <span className="text-sm font-medium text-slate-900">{m.subject}</span>
                  <span className="text-sm text-slate-700">{m.marks}/{m.max} <span className="text-slate-400">({Math.round((m.marks / m.max) * 100)}%)</span></span>
                </div>
              ))}
            </div>
          </div>
        )}

        {student.projectTitle && (
          <div className="card p-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Project</h4>
            <p className="text-sm text-slate-700">{student.projectTitle}</p>
            <p className="text-xs text-slate-500 mt-1">{student.projectType ?? 'Project'} · {student.projectSubject ?? '—'} · Guide: {student.projectGuide}</p>
            <p className="text-xs text-slate-500 mt-1">Status: {student.projectStatus ?? 'In Progress'} · Due: {student.projectDeadline ?? '—'} · Marks: {student.projectMarks ?? '—'} ({student.projectGrade ?? '—'})</p>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-slate-500 mb-1"><span>Progress</span><span>{student.projectProgress}%</span></div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${student.projectProgress}%` }} />
              </div>
            </div>
          </div>
        )}

        {student.grievances.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Grievances</h4>
            <div className="space-y-2">
              {student.grievances.map((g) => (
                <div key={g.id} className="card p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{g.title}</p>
                    <p className="text-xs text-slate-500">{g.date} · Assigned: {g.assignedTo}</p>
                  </div>
                  <StatusBadge status={g.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {student.discipline.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Discipline Records</h4>
            <div className="space-y-2">
              {student.discipline.map((d) => (
                <div key={d.id} className="card p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{d.incident}</p>
                    <p className="text-xs text-slate-500">{d.date} · {d.action}</p>
                  </div>
                  <StatusBadge status={d.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {editable && onSave && <EditStudentForm student={student} onSave={onSave} />}
      </div>
    </Modal>
  );
}

function EditStudentForm({ student, onSave }: { student: Student; onSave: (patch: Partial<Student>) => void }) {
  return (
    <div className="pt-4 border-t border-slate-100">
      <h4 className="text-sm font-semibold text-slate-900 mb-3">Update Information</h4>
      <div className="grid grid-cols-2 gap-3">
        <input className="input" defaultValue={student.phone} id="st-phone" placeholder="Phone" />
        <input className="input" defaultValue={student.email} id="st-email" placeholder="Email" />
        <input className="input" type="number" defaultValue={student.attendancePct} id="st-att" placeholder="Attendance %" />
        <input className="input" type="number" step="0.1" defaultValue={student.gpa} id="st-gpa" placeholder="GPA" />
      </div>
      <button className="btn-primary mt-3" onClick={() => {
        const phone = (document.getElementById('st-phone') as HTMLInputElement).value;
        const email = (document.getElementById('st-email') as HTMLInputElement).value;
        const attendancePct = Number((document.getElementById('st-att') as HTMLInputElement).value);
        const gpa = Number((document.getElementById('st-gpa') as HTMLInputElement).value);
        onSave({ phone, email, attendancePct, gpa });
      }}>Save Changes</button>
    </div>
  );
}
