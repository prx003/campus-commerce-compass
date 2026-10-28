interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  accent?: 'slate' | 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo';
  compact?: boolean;
}

const accentMap = {
  slate: 'bg-slate-50 text-slate-700',
  blue: 'bg-blue-50 text-blue-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  rose: 'bg-rose-50 text-rose-700',
  indigo: 'bg-indigo-50 text-indigo-700',
};

export function StatCard({ label, value, icon, trend, trendUp, accent = 'slate', compact = false }: StatCardProps) {
  return (
    <div className={`card card-hover ${compact ? 'p-3 sm:p-4' : 'p-5'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-slate-500 font-medium ${compact ? 'text-xs sm:text-sm' : 'text-sm'}`}>{label}</p>
          <p className={`font-bold text-slate-900 mt-1 ${compact ? 'text-xl' : 'text-2xl'}`}>{value}</p>
        </div>
        {icon && <div className={`${compact ? 'w-8 h-8 sm:w-9 sm:h-9' : 'w-10 h-10'} rounded-lg flex items-center justify-center ${accentMap[accent]}`}>{icon}</div>}
      </div>
      {trend && (
        <p className={`text-xs mt-3 font-medium ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>{trend}</p>
      )}
    </div>
  );
}
