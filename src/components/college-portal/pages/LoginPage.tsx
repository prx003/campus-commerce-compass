import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { GraduationCap, ChevronRight, Shield, Users, BookOpen, FlaskConical, Wrench } from 'lucide-react';
import { useStore, roleLabels } from '../store/StoreContext';
import type { Role } from '../data/types';

const roleGroups: { group: string; icon: React.ReactNode; roles: Role[] }[] = [
  { group: 'Leadership', icon: <Shield className="w-4 h-4" />, roles: ['principal', 'dean'] },
  { group: 'Department Head', icon: <Users className="w-4 h-4" />, roles: ['hod'] },
  { group: 'Teaching Staff', icon: <BookOpen className="w-4 h-4" />, roles: ['professor', 'associate-professor', 'assistant-professor', 'lecturer', 'teaching-assistant'] },
  { group: 'Non-Teaching Staff', icon: <Wrench className="w-4 h-4" />, roles: ['office-superintendent', 'lab-assistant'] },
];

export function LoginPage() {
  const { data, login } = useStore();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const usersForRole = selectedRole ? data.staff.filter((s) => s.role === selectedRole) : [];

  return (
    <div className="module-workspace min-h-[calc(100vh-8rem)] bg-background flex">
      <div className="flex-1 p-4 sm:p-6">
        <div className="w-full max-w-4xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground"><GraduationCap className="size-5" /></div>
            <h1 className="text-xl font-semibold">College Portal</h1>
          </div>

          {!selectedRole ? (
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Select designation</h2>
              <p className="text-sm text-slate-500 mt-1 mb-8">Select your designation.</p>
              <div className="space-y-6">
                {roleGroups.map((g) => (
                  <div key={g.group}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-slate-500">{g.icon}</span>
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{g.group}</h3>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {g.roles.map((r) => {
                        const count = data.staff.filter((s) => s.role === r).length;
                        return (
                          <Button variant="outline"
                            key={r}
                            onClick={() => setSelectedRole(r)}
                            className="h-auto min-h-20 w-full p-4 text-left flex items-center justify-between group"
                          >
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{roleLabels[r]}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{count} user{count !== 1 ? 's' : ''} available</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-700 group-hover:translate-x-1 transition-all" />
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <Button variant="outline" onClick={() => setSelectedRole(null)} className="text-sm text-slate-500 hover:text-slate-900 mb-4 flex items-center gap-1">
                <ChevronRight className="w-4 h-4 rotate-180" /> Back to roles
              </Button>
              <h2 className="text-2xl font-bold text-slate-900">{roleLabels[selectedRole]}</h2>
              <p className="text-sm text-slate-500 mt-1 mb-6">Choose your account to sign in.</p>
              <div className="space-y-3">
                {usersForRole.map((u) => (
                  <Button variant="outline"
                    key={u.id}
                    onClick={() => login(u.id)}
                    className="h-auto p-4 w-full text-left flex items-center gap-4"
                  >
                    <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                      {u.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.designation} · {u.email}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
