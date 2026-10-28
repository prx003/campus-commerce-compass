interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, string> = {
  Approved: 'bg-emerald-100 text-emerald-700',
  Active: 'bg-emerald-100 text-emerald-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Done: 'bg-emerald-100 text-emerald-700',
  Implemented: 'bg-emerald-100 text-emerald-700',
  Pending: 'bg-amber-100 text-amber-700',
  Scheduled: 'bg-primary/10 text-primary',
  Ongoing: 'bg-primary/10 text-primary',
  'In Progress': 'bg-primary/10 text-primary',
  'In Review': 'bg-purple-100 text-purple-700',
  'Under Review': 'bg-purple-100 text-purple-700',
  Submitted: 'bg-muted text-muted-foreground',
  Planned: 'bg-muted text-muted-foreground',
  Rejected: 'bg-red-100 text-red-700',
  Cancelled: 'bg-red-100 text-red-700',
  'On Hold': 'bg-orange-100 text-orange-700',
  Graduated: 'bg-teal-100 text-teal-700',
  Expired: 'bg-gray-100 text-gray-600',
  Inactive: 'bg-gray-100 text-gray-600',
  'On Leave': 'bg-orange-100 text-orange-700',
};

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const style = statusConfig[status] ?? 'bg-muted text-muted-foreground';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${style} ${className}`}>
      {status}
    </span>
  );
}
