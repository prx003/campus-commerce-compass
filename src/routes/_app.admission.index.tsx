import { createFileRoute } from "@tanstack/react-router";
import { AdmissionOverview } from "./_app.admission";

export const Route = createFileRoute("/_app/admission/")({
  component: AdmissionOverview,
});
