import { createFileRoute } from "@tanstack/react-router";
import { AcademicLayout } from "@/components/academic/layout";

export const Route = createFileRoute("/_app/academic")({
  component: AcademicLayout,
});
