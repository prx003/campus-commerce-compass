import { createFileRoute, Link } from "@tanstack/react-router";
import { AdmissionsProvider } from "@/components/sales/admissions/context";
import { ApplicationForm } from "@/components/sales/admissions/application-form";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/skill-ai/apply")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Skill AI — Application Form" },
      { name: "description", content: "Skill AI student admission application form: learn skill, get job. Complete all eight sections and submit your dossier." },
      { property: "og:title", content: "Skill AI — Application Form" },
      { property: "og:description", content: "Skill AI student admission application form: learn skill, get job. Complete all eight sections and submit your dossier." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PublicApplyPage,
});

function PublicApplyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <Link to="/sales/applications" className="text-sm text-primary inline-flex gap-1 items-center">
          <ArrowLeft className="size-3" /> Back to Sales
        </Link>
        <AdmissionsProvider>
          <ApplicationForm />
        </AdmissionsProvider>
      </div>
    </div>
  );
}
