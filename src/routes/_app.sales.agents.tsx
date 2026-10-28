import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/sales/agents")({
  component: AgentsLayout,
});

function AgentsLayout() {
  return <Outlet />;
}
