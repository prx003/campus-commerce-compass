import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/placement/dashboards";
import { ROLES, isRole, type RoleId } from "@/components/placement/lib/config";

export const Route = createFileRoute("/_app/placement/$role/")({
  head: ({ params }) => {
    const label = isRole(params.role) ? ROLES[params.role].label : "Placement";
    const title = `${label} Dashboard — Edusphere`;
    const description = `Placement activity, upcoming drives and recruitment outcomes for ${label}.`;
    return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] };
  },
  component: () => { const { role } = Route.useParams(); return <Dashboard role={role as RoleId} />; },
});
