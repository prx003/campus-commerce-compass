import { createFileRoute } from "@tanstack/react-router";
import { AppProvider, useApp } from "@/components/governance/context";
import BoardOfTrustees from "@/components/governance/pages/BoardOfTrustees";
import Chancellors from "@/components/governance/pages/Chancellors";
import { Button } from "@/components/ui/button";
import { Landmark, Scale } from "lucide-react";

export const Route = createFileRoute("/_app/governance")({
  head: () => ({
    meta: [
      { title: "Governing Body & Executive Management — Edusphere" },
      { name: "description", content: "Institutional governance, executive oversight, policies, finance, appointments, projects, and performance." },
      { property: "og:title", content: "Governing Body & Executive Management — Edusphere" },
      { property: "og:description", content: "Institutional governance and executive management workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AppProvider><GovernanceWorkspace /></AppProvider>,
});

function GovernanceWorkspace() {
  const { currentRole, setRole } = useApp();

  if (currentRole === "board") return <BoardOfTrustees />;
  if (currentRole === "chancellors") return <Chancellors />;

  return (
    <section className="module-workspace py-2">
      <div className="max-w-2xl">
        <div className="grid size-11 place-items-center rounded-md bg-primary text-primary-foreground"><Landmark className="size-5" /></div>
        <h1 className="mt-4 text-xl font-semibold">Governing Body & Executive Management</h1>
        <p className="mt-2 text-sm text-muted-foreground">Choose the leadership workspace you want to open.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button variant="outline" className="h-auto justify-start p-4" onClick={() => setRole("board")}>
            <Scale className="size-5 text-primary" /><span className="text-left"><span className="block font-semibold">Board of Trustees</span><span className="block text-xs text-muted-foreground">Policy, finance and institutional oversight</span></span>
          </Button>
          <Button variant="outline" className="h-auto justify-start p-4" onClick={() => setRole("chancellors")}>
            <Landmark className="size-5 text-primary" /><span className="text-left"><span className="block font-semibold">Chancellors</span><span className="block text-xs text-muted-foreground">Academic and executive leadership</span></span>
          </Button>
        </div>
      </div>
    </section>
  );
}
