import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/placement/app-shell";
import { isRole, ROLES } from "@/components/placement/lib/config";

export const Route = createFileRoute("/_app/placement/$role")({
  beforeLoad: ({ params }) => { if (!isRole(params.role)) throw notFound(); },
  head: ({ params }) => {
    const label = isRole(params.role) ? ROLES[params.role].label : "Portal";
    return { meta: [{ title: `${label} — Placements & Career Services` }, { name: "description", content: `${label} workspace in the college Placements & Career Services portal.` }, { property: "og:title", content: `${label} — Placements & Career Services` }, { property: "og:description", content: "Connected placement workflow from company to offer." }] };
  },
  component: Layout,
});

function Layout() {
  const { role } = Route.useParams();
  if (!isRole(role)) return null;
  return <AppShell role={role}><Outlet /></AppShell>;
}
