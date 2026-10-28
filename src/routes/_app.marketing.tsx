import { createFileRoute } from "@tanstack/react-router";
import MarketingApp from "@/components/marketing-pr/App";

export const Route = createFileRoute("/_app/marketing")({
  head: () => ({
    meta: [
      { title: "Marketing & PR — Edusphere" },
      { name: "description", content: "Marketing, admissions outreach and PR workspace: campaigns, digital marketing, content, events and team coordination." },
      { property: "og:title", content: "Marketing & PR — Edusphere" },
      { property: "og:description", content: "Marketing, admissions outreach and PR workspace: campaigns, digital marketing, content, events and team coordination." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MarketingPage,
});

function MarketingPage() {
  return (
    <div className="min-w-0">
      <MarketingApp />
    </div>
  );
}
