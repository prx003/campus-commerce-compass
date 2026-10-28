import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  iconBg?: string;
  trend?: { value: number; label: string };
  className?: string;
  layout?: 'stacked' | 'horizontal';
}

export default function StatsCard({ title, value, subtitle, icon, iconBg = 'bg-primary/10', trend, className = '', layout = 'stacked' }: StatsCardProps) {
  if (layout === 'horizontal') {
    return (
      <div className={`bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow duration-200 ${className}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2 min-w-0">
            <p className="text-xl font-bold text-foreground leading-none">{value}</p>
            <p className="text-muted-foreground text-sm font-medium truncate leading-tight">{title}</p>
          </div>
          <div className={`w-10 h-10 ${iconBg} rounded-md flex items-center justify-center flex-shrink-0`}>
            {icon}
          </div>
        </div>
        {subtitle && <p className="text-muted-foreground text-xs mt-1 leading-snug">{subtitle}</p>}
        {trend && (
          <div className="flex items-center justify-end gap-1 text-xs mt-0">
            <span className={`flex items-center gap-1 font-semibold ${trend.value >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend.value >= 0
                ? <TrendingUp className="w-3.5 h-3.5" />
                : <TrendingDown className="w-3.5 h-3.5" />}
              {Math.abs(trend.value)}%
            </span>
            <span className="text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow duration-200 ${className}`}>
      <div className="flex items-start justify-between mb-2">
        <div className={`w-10 h-10 ${iconBg} rounded-md flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trend.value >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend.value >= 0
              ? <TrendingUp className="w-3.5 h-3.5" />
              : <TrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <p className="text-xl font-bold text-foreground leading-none mb-1">{value}</p>
      <p className="text-muted-foreground text-sm font-medium leading-tight">{title}</p>
      {subtitle && <p className="text-muted-foreground text-xs mt-0 leading-snug">{subtitle}</p>}
      {trend && <p className="text-muted-foreground text-xs mt-0">{trend.label}</p>}
    </div>
  );
}
