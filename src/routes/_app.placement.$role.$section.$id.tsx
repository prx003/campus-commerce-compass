import { createFileRoute } from "@tanstack/react-router";
import { Detail } from "@/components/placement/details";
import { SECTIONS, type RoleId } from "@/components/placement/lib/config";

export const Route = createFileRoute("/_app/placement/$role/$section/$id")({
  head: ({ params }) => {
    const title = `${SECTIONS[params.section]?.title ?? "Placement"} Record — Edusphere`;
    const description = "Placement record details and coordinated career services activity.";
    return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] };
  },
  component: () => { const { role, section, id } = Route.useParams(); return <Detail role={role as RoleId} sectionId={section} id={id} />; },
});
