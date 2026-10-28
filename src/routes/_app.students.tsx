import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Filter, Download, MoreHorizontal, ArrowUpDown } from "lucide-react";
import { PageHeader } from "@/components/ui/page";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/students")({
  component: Students,
});

const STUDENTS = [
  { id: "GW2451", name: "Aarohi Singh", grade: "Grade 3-A", parent: "Rajesh Singh", attendance: 96, fee: "Paid", status: "Active" },
  { id: "GW2452", name: "Ishaan Rao", grade: "Grade 12-B", parent: "Vikram Rao", attendance: 88, fee: "Pending", status: "Active" },
  { id: "GW2453", name: "Myra Gupta", grade: "Grade 5-C", parent: "Anjali Gupta", attendance: 91, fee: "Paid", status: "Active" },
  { id: "GW2454", name: "Reyansh Iyer", grade: "Grade 8-A", parent: "Karthik Iyer", attendance: 78, fee: "Overdue", status: "Active" },
  { id: "GW2455", name: "Saanvi Joshi", grade: "Grade 2-B", parent: "Mohit Joshi", attendance: 99, fee: "Paid", status: "Active" },
  { id: "GW2456", name: "Vivaan Shah", grade: "Grade 7-A", parent: "Nilesh Shah", attendance: 85, fee: "Paid", status: "Active" },
  { id: "GW2457", name: "Anaya Roy", grade: "Grade 11-A", parent: "Sourav Roy", attendance: 93, fee: "Pending", status: "Active" },
  { id: "GW2458", name: "Kabir Mehta", grade: "Grade 4-B", parent: "Sameer Mehta", attendance: 90, fee: "Paid", status: "On leave" },
];

function badge(text: string) {
  const map: Record<string, string> = {
    Paid: "bg-success/10 text-success",
    Pending: "bg-warning/15 text-warning-foreground",
    Overdue: "bg-destructive/10 text-destructive",
    Active: "bg-primary/10 text-primary",
    "On leave": "bg-muted text-muted-foreground",
  };
  return map[text] ?? "bg-secondary text-secondary-foreground";
}

function Students() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        subtitle="2,847 active · 32 new this month"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="size-4" /> Export
            </Button>
            <Button size="sm" className="gap-1.5">
              <Plus className="size-4" /> Add student
            </Button>
          </>
        }
      />

      <div className="rounded-xl border border-border bg-card shadow-soft overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 p-4 border-b border-border">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              placeholder="Search by name, ID, parent…"
              className="w-full h-9 pl-9 pr-3 text-sm rounded-md bg-secondary border border-transparent focus:bg-card focus:border-border focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Filter className="size-4" /> Grade
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Filter className="size-4" /> Status
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground sticky top-0">
              <tr>
                <th className="w-10 px-4 py-3"><input type="checkbox" className="accent-primary" /></th>
                <th className="px-3 py-3 text-left font-medium">
                  <button className="flex items-center gap-1 hover:text-foreground">ID <ArrowUpDown className="size-3" /></button>
                </th>
                <th className="px-3 py-3 text-left font-medium">Student</th>
                <th className="px-3 py-3 text-left font-medium">Class</th>
                <th className="px-3 py-3 text-left font-medium">Parent</th>
                <th className="px-3 py-3 text-left font-medium">Attendance</th>
                <th className="px-3 py-3 text-left font-medium">Fees</th>
                <th className="px-3 py-3 text-left font-medium">Status</th>
                <th className="w-10 px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {STUDENTS.map((s) => (
                <tr key={s.id} className="border-t border-border hover:bg-secondary/40 transition-colors">
                  <td className="px-4 py-3"><input type="checkbox" className="accent-primary" /></td>
                  <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{s.id}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-full bg-gradient-to-br from-primary/80 to-chart-5 grid place-items-center text-primary-foreground text-[11px] font-semibold">
                        {s.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                      </div>
                      <span className="font-medium">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{s.grade}</td>
                  <td className="px-3 py-3 text-muted-foreground">{s.parent}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full ${s.attendance >= 90 ? "bg-success" : s.attendance >= 80 ? "bg-warning" : "bg-destructive"}`}
                          style={{ width: `${s.attendance}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums">{s.attendance}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${badge(s.fee)}`}>{s.fee}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${badge(s.status)}`}>{s.status}</span>
                  </td>
                  <td className="px-3 py-3">
                    <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal className="size-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-border text-xs text-muted-foreground">
          <span>Showing 1–8 of 2,847</span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm">Prev</Button>
            <Button variant="outline" size="sm">1</Button>
            <Button size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
