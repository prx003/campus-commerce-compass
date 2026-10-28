import { createFileRoute } from "@tanstack/react-router";
import { AdmissionFees } from "./_app.admission";

export const Route = createFileRoute("/_app/admission/fees")({
  component: AdmissionFees,
});
