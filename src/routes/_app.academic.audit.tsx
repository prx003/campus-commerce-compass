import { createFileRoute } from "@tanstack/react-router";
import { AUDIT_LOGS } from "@/components/academic/data";

export const Route = createFileRoute("/_app/academic/audit")({
  component: AcademicAudit,
});

const ACTION_TONE: Record<string, string> = {
  LOGIN: "bg-blue-100 text-blue-700",
  UPDATE_MARKS: "bg-amber-100 text-amber-700",
  ADD_STUDENT: "bg-green-100 text-green-700",
  EXPORT_REPORT: "bg-indigo-100 text-indigo-700",
  SCHEDULE_EVENT: "bg-purple-100 text-purple-700",
  DELETE_RECORD: "bg-red-100 text-red-700",
  UPDATE_REMARKS: "bg-amber-100 text-amber-700",
  ROLE_CHANGE: "bg-orange-100 text-orange-700",
};

function AcademicAudit() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">System activity trail for the current term</p>
      </div>

      <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left font-medium">Timestamp</th>
              <th className="px-3 py-3 text-left font-medium">User</th>
              <th className="px-3 py-3 text-left font-medium">Action</th>
              <th className="px-3 py-3 text-left font-medium">Target</th>
              <th className="px-5 py-3 text-left font-medium">IP Address</th>
            </tr>
          </thead>
          <tbody>
            {AUDIT_LOGS.map((l, i) => (
              <tr key={i} className="border-t border-border hover:bg-muted/30">
                <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{l.ts}</td>
                <td className="px-3 py-3">{l.user}</td>
                <td className="px-3 py-3">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${ACTION_TONE[l.action] ?? "bg-secondary"}`}>{l.action}</span>
                </td>
                <td className="px-3 py-3 font-mono text-xs">{l.target}</td>
                <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{l.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
