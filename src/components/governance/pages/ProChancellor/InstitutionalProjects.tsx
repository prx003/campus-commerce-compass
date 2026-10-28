import { useState } from 'react';
import { useApp } from '@/components/governance/context';
import { Project } from '@/components/governance/data';
import SectionHeader from '@/components/governance/components/shared/SectionHeader';
import StatusBadge from '@/components/governance/components/shared/StatusBadge';
import ProgressBar from '@/components/governance/components/shared/ProgressBar';
import Modal from '@/components/governance/components/shared/Modal';
import StatsCard from '@/components/governance/components/shared/StatsCard';
import { Rocket, CheckCircle, Clock } from 'lucide-react';

export default function InstitutionalProjects() {
  const { projects } = useApp();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const counts = {
    total: projects.length,
    ongoing: projects.filter(p => p.status === 'Ongoing').length,
    completed: projects.filter(p => p.status === 'Completed').length,
    planned: projects.filter(p => p.status === 'Planned').length,
  };

  return (
    <div>
      <SectionHeader
        title="Institutional Projects"
        subtitle="Monitor strategic projects and development initiatives"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
        <StatsCard title="Total Projects" value={counts.total} icon={<Rocket className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-50" layout="horizontal" />
        <StatsCard title="Ongoing" value={counts.ongoing} icon={<Clock className="w-5 h-5 text-primary" />} iconBg="bg-primary/10" layout="horizontal" />
        <StatsCard title="Completed" value={counts.completed} icon={<CheckCircle className="w-5 h-5 text-teal-600" />} iconBg="bg-teal-50" layout="horizontal" />
        <StatsCard title="Planned" value={counts.planned} icon={<Rocket className="w-5 h-5 text-amber-600" />} iconBg="bg-amber-50" layout="horizontal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {projects.map(project => (
          <div key={project.id} onDoubleClick={() => setSelectedProject(project)} title="Double-click for details" className="bg-card rounded-lg border border-border p-5 hover:shadow-sm transition-shadow cursor-pointer">
            <div className="mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-bold text-foreground text-sm">{project.name}</h3>
                  <StatusBadge status={project.status} />
                </div>
                <p className="text-xs text-muted-foreground">Lead: {project.lead} · Category: {project.category}</p>
                <p className="text-xs text-muted-foreground">{project.startDate} → {project.endDate}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Progress</span>
              <span className="text-sm font-bold text-emerald-600">{project.progress}%</span>
            </div>
            <ProgressBar value={project.progress} color={project.progress === 100 ? 'bg-teal-500' : project.progress >= 60 ? 'bg-emerald-500' : project.progress >= 30 ? 'bg-amber-500' : 'bg-slate-300'} showLabel={false} />
            <div className="mt-3 text-xs text-muted-foreground">
              Budget: <span className="font-semibold text-foreground">₹{(project.budget / 10000000).toFixed(1)} Cr</span>
            </div>
          </div>
        ))}
      </div>

      {selectedProject && (
        <Modal open={!!selectedProject} onClose={() => setSelectedProject(null)} title={selectedProject.name} subtitle={`${selectedProject.category} project`} size="lg">
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusBadge status={selectedProject.status} />
            </div>
            <p className="text-sm leading-6 text-muted-foreground">{selectedProject.description}</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { label: 'Project Lead', value: selectedProject.lead },
                { label: 'Category', value: selectedProject.category },
                { label: 'Start Date', value: selectedProject.startDate },
                { label: 'End Date', value: selectedProject.endDate },
                { label: 'Budget', value: `₹${(selectedProject.budget / 10000000).toFixed(1)} Cr` },
                { label: 'Progress', value: `${selectedProject.progress}%` },
              ].map(detail => (
                <div key={detail.label} className="rounded-md bg-background p-3">
                  <p className="text-xs text-muted-foreground">{detail.label}</p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">{detail.value}</p>
                </div>
              ))}
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Project Progress</span>
                <span className="text-sm font-bold text-emerald-600">{selectedProject.progress}%</span>
              </div>
              <ProgressBar value={selectedProject.progress} color={selectedProject.progress === 100 ? 'bg-teal-500' : selectedProject.progress >= 60 ? 'bg-emerald-500' : selectedProject.progress >= 30 ? 'bg-amber-500' : 'bg-slate-300'} showLabel={false} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
