import type { ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  onRowDoubleClick?: (row: T) => void;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  onRowClick,
  onRowDoubleClick,
  emptyMessage = 'No records found',
}: DataTableProps<T>) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {columns.map((c) => (
                <th key={c.key} className={`text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider ${c.className ?? ''}`}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="table-row"
                  onClick={() => onRowClick?.(row)}
                  onDoubleClick={() => onRowDoubleClick?.(row)}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={`px-4 py-3 text-sm text-slate-700 ${c.className ?? ''}`}>
                      {c.render ? c.render(row) : (row as Record<string, ReactNode>)[c.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface StatusBadgeProps {
  status: string;
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  approved: 'bg-emerald-100 text-emerald-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-slate-100 text-slate-700',
  recommended: 'bg-blue-100 text-blue-700',
  pending: 'bg-amber-100 text-amber-700',
  'pending-dean': 'bg-amber-100 text-amber-700',
  'dean-recommended': 'bg-blue-100 text-blue-700',
  'dean-rejected': 'bg-rose-100 text-rose-700',
  open: 'bg-rose-100 text-rose-700',
  assigned: 'bg-blue-100 text-blue-700',
  rejected: 'bg-rose-100 text-rose-700',
  revision: 'bg-orange-100 text-orange-700',
  'on-leave': 'bg-amber-100 text-amber-700',
  inactive: 'bg-slate-100 text-slate-500',
  graduated: 'bg-indigo-100 text-indigo-700',
  draft: 'bg-slate-100 text-slate-600',
  good: 'bg-emerald-100 text-emerald-700',
  'needs-attention': 'bg-amber-100 text-amber-700',
  'under-repair': 'bg-rose-100 text-rose-700',
  available: 'bg-emerald-100 text-emerald-700',
  ongoing: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  submitted: 'bg-emerald-100 text-emerald-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  overdue: 'bg-rose-100 text-rose-700',
  planned: 'bg-blue-100 text-blue-700',
  'on-hold': 'bg-amber-100 text-amber-700',
  manuscript: 'bg-slate-100 text-slate-600',
  'under-review': 'bg-amber-100 text-amber-700',
  accepted: 'bg-blue-100 text-blue-700',
  published: 'bg-emerald-100 text-emerald-700',
  'not-submitted': 'bg-rose-100 text-rose-700',
  'not-applicable': 'bg-slate-100 text-slate-500',
  acknowledged: 'bg-blue-100 text-blue-700',
  allocated: 'bg-blue-100 text-blue-700',
  'partially-allocated': 'bg-amber-100 text-amber-700',
  conflict: 'bg-rose-100 text-rose-700',
  'in-use': 'bg-indigo-100 text-indigo-700',
  reserved: 'bg-violet-100 text-violet-700',
  'under-maintenance': 'bg-orange-100 text-orange-700',
  damaged: 'bg-rose-100 text-rose-700',
  retired: 'bg-slate-100 text-slate-500',
  eligible: 'bg-blue-100 text-blue-700',
  'not-recommended': 'bg-slate-100 text-slate-500',
  added: 'bg-emerald-100 text-emerald-700',
  changed: 'bg-blue-100 text-blue-700',
  removed: 'bg-rose-100 text-rose-700',
  faculty: 'bg-blue-100 text-blue-700',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const cls = statusColors[status] ?? 'bg-slate-100 text-slate-700';
  const label = status.replace(/-/g, ' ');
  return <span className={`badge ${cls} capitalize`}>{label}</span>;
}
