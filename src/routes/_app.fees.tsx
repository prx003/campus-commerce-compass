import { createFileRoute } from "@tanstack/react-router";
import { Wallet, TrendingUp, AlertCircle, CheckCircle2, Plus, Smartphone } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, Section, StatCard } from "@/components/ui/page";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/fees")({
  component: Fees,
});

const data = [
  { m: "Apr", c: 38, d: 4 }, { m: "May", c: 42, d: 6 }, { m: "Jun", c: 51, d: 5 },
  { m: "Jul", c: 47, d: 7 }, { m: "Aug", c: 58, d: 4 }, { m: "Sep", c: 62, d: 3 },
];

const invoices = [
  { id: "INV-2451", student: "Aarohi Singh", term: "Term 2", amount: "₹42,000", due: "Sep 15", status: "Paid" },
  { id: "INV-2452", student: "Ishaan Rao", term: "Term 2", amount: "₹58,500", due: "Sep 18", status: "Pending" },
  { id: "INV-2453", student: "Reyansh Iyer", term: "Term 2", amount: "₹46,200", due: "Sep 10", status: "Overdue" },
  { id: "INV-2454", student: "Myra Gupta", term: "Term 2", amount: "₹40,000", due: "Sep 22", status: "Paid" },
  { id: "INV-2455", student: "Anaya Roy", term: "Term 2", amount: "₹62,000", due: "Sep 25", status: "Pending" },
];

function badge(s: string) {
  return s === "Paid"
    ? "bg-success/10 text-success"
    : s === "Pending"
      ? "bg-warning/15 text-warning-foreground"
      : "bg-destructive/10 text-destructive";
}

function Fees() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee management"
        subtitle="Track invoices, collections, and payments"
        actions={<Button size="sm" className="gap-1.5"><Plus className="size-4" /> New invoice</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Collected (MTD)" value="₹62.4L" delta="14%" icon={Wallet} accent="success" />
        <StatCard label="Pending" value="₹8.6L" delta="2%" icon={AlertCircle} accent="warning" trend="down" />
        <StatCard label="Overdue" value="₹3.1L" delta="6%" icon={AlertCircle} accent="destructive" />
        <StatCard label="Forecast" value="₹78.0L" delta="9%" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Section title="Collections vs defaults" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="c" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="d" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-destructive)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-destructive)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="c" stroke="var(--color-success)" strokeWidth={2.5} fill="url(#c)" />
                <Area type="monotone" dataKey="d" stroke="var(--color-destructive)" strokeWidth={2.5} fill="url(#d)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Quick UPI payment">
          <div className="rounded-lg border border-border p-4 gradient-soft">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <Smartphone className="size-4" /> Pay via UPI
            </div>
            <div className="mt-3 text-3xl font-semibold tracking-tight">₹46,200</div>
            <div className="text-xs text-muted-foreground mt-1">Reyansh Iyer · INV-2453 · Term 2</div>
            <div className="grid grid-cols-4 gap-2 mt-4">
              {["GPay", "PhonePe", "Paytm", "BHIM"].map((p) => (
                <button key={p} className="rounded-md border border-border bg-card py-2 text-[11px] font-semibold hover:border-primary hover:text-primary transition">
                  {p}
                </button>
              ))}
            </div>
            <Button className="w-full mt-3" size="sm">
              Generate QR
            </Button>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-success">
            <CheckCircle2 className="size-4" /> Settlements arrive in T+1
          </div>
        </Section>
      </div>

      <Section title="Recent invoices" action={<button className="text-xs text-primary font-medium hover:underline">View all</button>}>
        <div className="overflow-x-auto -m-5">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Invoice</th>
                <th className="px-3 py-3 text-left font-medium">Student</th>
                <th className="px-3 py-3 text-left font-medium">Term</th>
                <th className="px-3 py-3 text-right font-medium">Amount</th>
                <th className="px-3 py-3 text-left font-medium">Due</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i.id} className="border-t border-border hover:bg-secondary/40">
                  <td className="px-5 py-3 font-mono text-xs text-primary font-semibold">{i.id}</td>
                  <td className="px-3 py-3 font-medium">{i.student}</td>
                  <td className="px-3 py-3 text-muted-foreground">{i.term}</td>
                  <td className="px-3 py-3 text-right font-semibold tabular-nums">{i.amount}</td>
                  <td className="px-3 py-3 text-muted-foreground">{i.due}</td>
                  <td className="px-5 py-3"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${badge(i.status)}`}>{i.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
