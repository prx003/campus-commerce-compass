import { Outlet, createFileRoute, useRouterState, Link } from "@tanstack/react-router";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AuthProvider, useAuth, canAccess } from "@/lib/auth";

export const Route = createFileRoute("/_app")({
  ssr: false,
  component: AppLayout,
});

function AppLayout() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-x-hidden">
            <Guarded />
          </main>
        </div>
        <MobileNav />
      </div>
    </AuthProvider>
  );
}

function Guarded() {
  const { roles, loading } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  const allowed = pathname === "/users" ? roles.includes("admin") : canAccess(roles, pathname);
  if (!allowed) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <h1 className="text-xl font-semibold">No access</h1>
        <p className="text-sm text-muted-foreground mt-2">Your role can't open this section. Ask an administrator to give you access.</p>
        <Link to="/" className="inline-block mt-4 text-sm text-primary hover:underline">Back to dashboard</Link>
      </div>
    );
  }
  return <Outlet />;
}
