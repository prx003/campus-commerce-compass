import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, AlertTriangle, TrendingUp, Brain, ArrowRight } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, Section, StatCard } from "@/components/ui/page";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/ai")({
  component: AIAnalytics,
});

const enroll = [
  { m: "Apr", a: 280, p: 295 }, { m: "May", a: 305, p: 320 }, { m: "Jun", a: 340, p: 355 },
  { m: "Jul", a: 365, p: 380 }, { m: "Aug", a: 410, p: 425 }, { m: "Sep", a: 442, p: 470 },
  { m: "Oct", a: null, p: 510 }, { m: "Nov", a: null, p: 545 },
];

const risk = [
  { d: "W1", v: 18 }, { d: "W2", v: 22 }, { d: "W3", v: 28 }, { d: "W4", v: 34 },
  { d: "W5", v: 40 }, { d: "W6", v: 47 },
];

const insights = [
  {
    icon: AlertTriangle,
    tone: "destructive",
    title: "Drop-out risk rising in Grade 9",
    body: "28 students are predicted to fall below 75% attendance this term. Mentor assignment recommended.",
  },
  {
    icon: TrendingUp,
    tone: "success",
    title: "Conversion up 6% via WhatsApp",
    body: "WhatsApp follow-ups outperformed email by 2.3× this week. Reallocate counselor time accordingly.",
  },
  {
    icon: Brain,
    tone: "primary",
    title: "Fee forecast: ₹78L by Sep 30",
    body: "92% confidence interval based on 3-year seasonality and current pipeline velocity.",
  },
];

const tone = {
  destructive: "bg-destructive/10 text-destructive",
  success: "bg-success/10 text-success",
  primary: "bg-primary/10 text-primary",
} as const;

function AIAnalytics() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Analytics"
        subtitle="Predictive insights powered by your data"
        actions={<Button size="sm" className="gap-1.5"><Sparkles className="size-4" /> Ask AI</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Predicted enrollments" value="545" delta="14%" icon={TrendingUp} />
        <StatCard label="At-risk students" value="47" delta="9%" icon={AlertTriangle} accent="destructive" />
        <StatCard label="Lead score (avg)" value="72.4" delta="3.1" icon={Brain} accent="success" />
        <StatCard label="AI suggestions" value="18" icon={Sparkles} accent="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Section title="Enrollment forecast" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enroll}>
                <defs>
                  <linearGradient id="ap" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="a" stroke="var(--color-chart-2)" strokeWidth={2.5} fill="transparent" />
                <Area type="monotone" dataKey="p" stroke="var(--color-primary)" strokeWidth={2.5} strokeDasharray="5 4" fill="url(#ap)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-chart-2" /> Actual</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" /> Predicted</span>
          </div>
        </Section>

        <Section title="Risk trend">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={risk}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="d" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="v" stroke="var(--color-destructive)" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((it) => {
          const Icon = it.icon;
          return (
            <div key={it.title} className="rounded-xl border border-border bg-card p-5 shadow-soft hover:shadow-card transition">
              <div className={`size-9 rounded-lg grid place-items-center ${tone[it.tone as keyof typeof tone]}`}>
                <Icon className="size-[18px]" />
              </div>
              <div className="mt-3 text-sm font-semibold">{it.title}</div>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{it.body}</p>
              <button className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                Take action <ArrowRight className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
