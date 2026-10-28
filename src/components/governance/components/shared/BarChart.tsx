interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
  maxValue?: number;
  height?: number;
  title?: string;
  showValues?: boolean;
}

export default function BarChart({ data, maxValue, height = 160, title, showValues = true }: BarChartProps) {
  const max = maxValue ?? Math.max(...data.map(d => d.value));
  return (
    <div>
      {title && <p className="text-sm font-semibold text-foreground mb-3">{title}</p>}
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((item, i) => {
          const pct = max > 0 ? (item.value / max) * 100 : 0;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              {showValues && (
                <p className="text-[10px] font-semibold text-muted-foreground">{item.value.toLocaleString()}</p>
              )}
              <div className="w-full flex items-end" style={{ height: height - 32 }}>
                <div
                  className={`w-full rounded-t-md transition-all duration-500 ${item.color ?? 'bg-primary/100'}`}
                  style={{ height: `${pct}%`, minHeight: 4 }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground text-center leading-tight">{item.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
