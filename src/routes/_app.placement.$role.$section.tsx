import { createFileRoute, Outlet, useMatch } from "@tanstack/react-router";
import { SectionPage } from "@/components/placement/crud";
import { SECTIONS, type RoleId } from "@/components/placement/lib/config";

export const Route = createFileRoute("/_app/placement/$role/$section")({
  component: Page,
});

function Page() {
  const { role, section } = Route.useParams();
  const child = useMatch({ from: "/_app/placement/$role/$section/$id", shouldThrow: false });
  if (child) return <Outlet />;
  if (!SECTIONS[section]) return <p className="text-muted-foreground">Page not found.</p>;
  return <SectionPage key={section} role={role as RoleId} sectionId={section} />;
}
