interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  label?: string;
}

export default function ProgressBar({ value, max = 100, color = 'bg-primary/100', size = 'md', showLabel = true, label }: ProgressBarProps) {
  const pct = Math.min((value / max) * 100, 100);
  const h = size === 'sm' ? 'h-1.5' : 'h-2';
  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between mb-1">
          {label && <span className="text-xs text-muted-foreground">{label}</span>}
          {showLabel && <span className="text-xs font-semibold text-foreground">{pct.toFixed(0)}%</span>}
        </div>
      )}
      <div className={`w-full bg-muted rounded-full ${h} overflow-hidden`}>
        <div
          className={`${h} ${color} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
