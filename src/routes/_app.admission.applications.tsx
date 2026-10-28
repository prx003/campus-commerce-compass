import { createFileRoute } from "@tanstack/react-router";
import { AdmissionApplications } from "./_app.admission";

export const Route = createFileRoute("/_app/admission/applications")({
  component: AdmissionApplications,
});
