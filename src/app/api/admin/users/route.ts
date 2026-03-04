import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceClient();

  // Check super admin
  const { data: profile } = await admin
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_super_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch profiles and memberships in parallel
  const [
    { data: profiles, error },
    { data: memberships },
  ] = await Promise.all([
    admin
      .from("profiles")
      .select("id, display_name, is_super_admin, created_at")
      .order("created_at", { ascending: false }),
    admin.from("org_members").select("user_id"),
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const orgCounts: Record<string, number> = {};
  if (memberships) {
    for (const m of memberships) {
      orgCounts[m.user_id] = (orgCounts[m.user_id] || 0) + 1;
    }
  }

  const users = (profiles || []).map((p) => ({
    ...p,
    org_count: orgCounts[p.id] || 0,
  }));

  return NextResponse.json(users);
}
