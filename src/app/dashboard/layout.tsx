import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardShell from "./DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check org membership — redirect to onboarding if no org (unless super admin)
  const [{ data: memberships }, { data: profile }] = await Promise.all([
    supabase
      .from("org_members")
      .select("id")
      .eq("user_id", user.id)
      .limit(1),
    supabase
      .from("profiles")
      .select("is_super_admin")
      .eq("id", user.id)
      .single(),
  ]);

  const hasMembership = memberships && memberships.length > 0;
  const isSuperAdmin = profile?.is_super_admin === true;

  if (!hasMembership && !isSuperAdmin) {
    redirect("/onboarding");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
