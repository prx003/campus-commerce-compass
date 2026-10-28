import { createFileRoute } from "@tanstack/react-router";
import { HRLayout } from "@/components/hr/layout";

export const Route = createFileRoute("/_app/hr")({
  component: HRLayout,
});
