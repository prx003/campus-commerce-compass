import { createFileRoute } from "@tanstack/react-router";
import { Plus, MoreHorizontal, Phone, MessageCircle, Mail, Filter } from "lucide-react";
import { PageHeader } from "@/components/ui/page";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/crm")({
  component: CRM,
});

const STAGES = [
  { key: "new", label: "New leads", color: "bg-chart-1" },
  { key: "contact", label: "Contacted", color: "bg-chart-2" },
  { key: "visit", label: "Campus visit", color: "bg-chart-4" },
  { key: "app", label: "Application", color: "bg-chart-5" },
  { key: "won", label: "Enrolled", color: "bg-success" },
] as const;

const LEADS: Record<string, { name: string; grade: string; src: string; value: string; owner: string }[]> = {
  new: [
    { name: "Riya Patel", grade: "Grade 6", src: "Website", value: "₹1.2L", owner: "NK" },
    { name: "Aman Verma", grade: "Grade 9", src: "Referral", value: "₹1.8L", owner: "RS" },
    { name: "Diya Nair", grade: "KG-2", src: "Instagram", value: "₹95K", owner: "NK" },
  ],
  contact: [
    { name: "Kabir Mehta", grade: "Grade 4", src: "WhatsApp", value: "₹1.1L", owner: "PS" },
    { name: "Anaya Roy", grade: "Grade 11", src: "Walk-in", value: "₹2.4L", owner: "RS" },
  ],
  visit: [
    { name: "Vivaan Shah", grade: "Grade 7", src: "Google Ads", value: "₹1.4L", owner: "NK" },
    { name: "Saanvi Joshi", grade: "Grade 2", src: "Referral", value: "₹1.0L", owner: "PS" },
    { name: "Arjun Kapoor", grade: "Grade 10", src: "Website", value: "₹2.1L", owner: "RS" },
  ],
  app: [
    { name: "Myra Gupta", grade: "Grade 5", src: "Walk-in", value: "₹1.3L", owner: "NK" },
    { name: "Reyansh Iyer", grade: "Grade 8", src: "WhatsApp", value: "₹1.6L", owner: "PS" },
  ],
  won: [
    { name: "Aarohi Singh", grade: "Grade 3", src: "Referral", value: "₹1.05L", owner: "NK" },
    { name: "Ishaan Rao", grade: "Grade 12", src: "Website", value: "₹2.6L", owner: "RS" },
  ],
};

function CRM() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead pipeline"
        subtitle="312 active leads · 18 new today"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Filter className="size-4" /> Filter
            </Button>
            <Button size="sm" className="gap-1.5">
              <Plus className="size-4" /> New lead
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {STAGES.map((s) => {
          const items = LEADS[s.key];
          return (
            <div key={s.key} className="rounded-xl border border-border bg-secondary/40 p-3">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${s.color}`} />
                  <h3 className="text-xs font-semibold uppercase tracking-wider">{s.label}</h3>
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground bg-card border border-border rounded px-1.5 py-0.5">
                  {items.length}
                </span>
              </div>
              <div className="space-y-2.5">
                {items.map((l, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-card border border-border p-3 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-semibold">{l.name}</div>
                        <div className="text-[11px] text-muted-foreground">{l.grade} · {l.src}</div>
                      </div>
                      <button className="text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="size-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs font-semibold text-primary">{l.value}</span>
                      <div className="flex items-center gap-1">
                        <button className="size-6 rounded grid place-items-center hover:bg-accent text-muted-foreground">
                          <Phone className="size-3.5" />
                        </button>
                        <button className="size-6 rounded grid place-items-center hover:bg-accent text-muted-foreground">
                          <MessageCircle className="size-3.5" />
                        </button>
                        <button className="size-6 rounded grid place-items-center hover:bg-accent text-muted-foreground">
                          <Mail className="size-3.5" />
                        </button>
                        <span className="ml-1 size-5 rounded-full bg-primary/15 text-primary text-[9px] font-bold grid place-items-center">
                          {l.owner}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
