import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { StoreProvider, useStore } from "@/components/college-portal/store/StoreContext";
import { LoginPage } from "@/components/college-portal/pages/LoginPage";
import { AppShell } from "@/components/college-portal/pages/AppShell";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app/college")({
  validateSearch: (search: Record<string, unknown>): { page?: string } => ({
    page: typeof search.page === "string" ? search.page : undefined,
  }),
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
  const { currentUser, data, login } = useStore();
  const { roles } = useAuth();
  const isPrincipal = roles.includes("principal");

  // A principal only gets the principal workspace.
  useEffect(() => {
    if (!isPrincipal) return;
    if (currentUser?.role === "principal") return;
    const p = data.staff.find((s) => s.role === "principal");
    if (p) login(p.id);
  }, [isPrincipal, currentUser, data.staff, login]);

  if (isPrincipal) {
    return <div className="college-portal">{currentUser?.role === "principal" ? <AppShell hideSignOut /> : null}</div>;
  }
  return (
    <div className="college-portal">
      {currentUser ? <AppShell /> : <LoginPage hideRoles={roles.includes("admin") ? [] : ["principal"]} />}
    </div>
  );
}
