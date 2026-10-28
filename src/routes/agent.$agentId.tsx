import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Phone, Mail, Inbox } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getAgentLinkData, submitAgentReason, type Lead } from "@/components/sales/call-center/data";
import { LEAD_STATUSES, STATUS_LABELS, type LeadStatus } from "@/components/sales/call-center/lead-outcomes";

export const Route = createFileRoute("/agent/$agentId")({
  head: () => ({
    meta: [
      { title: "My Assigned Leads — Call Center | Edusphere" },
      { name: "description", content: "View the leads assigned to you and record the call reason." },
      { property: "og:title", content: "My Assigned Leads — Call Center" },
      { property: "og:description", content: "View the leads assigned to you and record the call reason." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AgentLinkPage,
});

function AgentLinkPage() {
  const { agentId } = Route.useParams();
  const { data, isLoading } = useQuery({ queryKey: ["call-center", "agent-link", agentId], queryFn: () => getAgentLinkData(agentId) });
  if (isLoading) return <div className="p-10 text-center text-muted-foreground">Loading…</div>;
  if (!data?.agent) return <div className="p-10 text-center text-muted-foreground">This agent link is not valid.</div>;
  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4 sm:p-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Call Center</p>
        <h1 className="text-2xl font-bold text-foreground">Hi {data.agent.full_name}</h1>
        <p className="text-sm text-muted-foreground">{data.leads.length} lead(s) assigned to you. Choose an outcome and add the reason after each call.</p>
      </header>
      {data.leads.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center text-muted-foreground"><Inbox className="mx-auto mb-3 size-6" />No leads assigned yet.</div>
      ) : (
        <div className="grid gap-4">{data.leads.map(l => <LeadCard key={l.id} lead={l} agentId={agentId} />)}</div>
      )}
    </main>
  );
}

function LeadCard({ lead, agentId }: { lead: Lead; agentId: string }) {
  const qc = useQueryClient();
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [reason, setReason] = useState(lead.reason ?? "");
  const mut = useMutation({
    mutationFn: () => submitAgentReason({ data: { agentId, leadId: lead.id, status, reason } }),
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["call-center"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold text-foreground">{lead.name}</h2>
        {lead.source && <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase text-muted-foreground">{lead.source}</span>}
      </div>
      <div className="flex flex-wrap gap-2 text-sm">
        {lead.phone && <a href={`tel:${lead.phone.replace(/[^+\d]/g, "")}`} className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 font-medium text-primary-foreground"><Phone className="size-4" />{lead.phone}</a>}
        {lead.email && <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2"><Mail className="size-4" />{lead.email}</a>}
      </div>
      {lead.notes && <p className="whitespace-pre-line text-sm text-muted-foreground">{lead.notes}</p>}
      <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
        <select aria-label="Outcome" value={status} onChange={e => setStatus(e.target.value as LeadStatus)} className="h-10 rounded-md border border-border bg-background px-3 text-sm">
          {LEAD_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <Textarea aria-label="Reason" placeholder="Add the reason / call remarks…" value={reason} onChange={e => setReason(e.target.value)} />
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">{lead.reason_at ? `Last saved ${new Date(lead.reason_at).toLocaleString()}` : ""}</span>
        <Button onClick={() => mut.mutate()} disabled={mut.isPending}>{mut.isPending ? "Saving…" : "Save reason"}</Button>
      </div>
    </div>
  );
}
