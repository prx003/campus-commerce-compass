import { createFileRoute } from "@tanstack/react-router";
import { FileText, Download } from "lucide-react";
import { REPORTS } from "@/components/academic/data";

export const Route = createFileRoute("/_app/academic/reports")({
  component: AcademicReports,
});

function AcademicReports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Generated academic reports and exports</p>
      </div>

      <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left font-medium">Report</th>
              <th className="px-3 py-3 text-left font-medium">Period</th>
              <th className="px-3 py-3 text-left font-medium">Generated</th>
              <th className="px-3 py-3 text-left font-medium">Format</th>
              <th className="px-3 py-3 text-right font-medium">Size</th>
              <th className="px-5 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {REPORTS.map((r) => (
              <tr key={r.name} className="border-t border-border hover:bg-muted/30">
                <td className="px-5 py-3 font-medium flex items-center gap-2">
                  <FileText className="size-4 text-primary" /> {r.name}
                </td>
                <td className="px-3 py-3 text-muted-foreground">{r.period}</td>
                <td className="px-3 py-3 text-muted-foreground">{r.generated}</td>
                <td className="px-3 py-3">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-secondary text-foreground">{r.format}</span>
                </td>
                <td className="px-3 py-3 text-right tabular-nums">{r.size}</td>
                <td className="px-5 py-3 text-right">
                  <button className="inline-flex items-center gap-1 text-primary text-xs font-semibold hover:underline">
                    <Download className="size-3.5" /> Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
