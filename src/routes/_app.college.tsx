import { createFileRoute } from "@tanstack/react-router";
import { StoreProvider, useStore } from "@/components/college-portal/store/StoreContext";
import { LoginPage } from "@/components/college-portal/pages/LoginPage";
import { AppShell } from "@/components/college-portal/pages/AppShell";

export const Route = createFileRoute("/_app/college")({
  head: () => ({
    meta: [
      { title: "College Management Portal — Edusphere" },
      { name: "description", content: "Role-based college operations, academics, faculty, resources, and institutional workflows." },
      { property: "og:title", content: "College Management Portal — Edusphere" },
      { property: "og:description", content: "Role-based college operations and academic management workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <StoreProvider><CollegePortal /></StoreProvider>,
});

function CollegePortal() {
  const { currentUser } = useStore();

  return (
    <div className="college-portal">
      {currentUser ? <AppShell /> : <LoginPage />}
    </div>
  );
}
