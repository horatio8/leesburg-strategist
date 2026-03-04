import DashboardShell from "./DashboardShell";

// Auth + org membership checks are handled by middleware (supabase/middleware.ts).
// No need to duplicate them here — middleware already redirects unauthenticated
// users to /login and users without org membership to /onboarding.
// This eliminates 3 redundant Supabase round-trips per page load.

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
