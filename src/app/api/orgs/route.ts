import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/orgs — list user's organizations (super admin: all)
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if super admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .single();

  if (profile?.is_super_admin) {
    // Super admin sees all orgs (use service client to bypass RLS)
    const admin = createServiceClient();
    const { data: orgs, error } = await admin
      .from("organizations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(orgs);
  }

  // Regular user: get orgs through membership (use service client to avoid RLS issues)
  const admin = createServiceClient();
  const { data: memberships, error } = await admin
    .from("org_members")
    .select("org_id, role, organizations(*)")
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const orgs = (memberships || []).map((m) => ({
    ...m.organizations,
    role: m.role,
  }));

  return NextResponse.json(orgs);
}

// POST /api/orgs — create a new organization
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, industry, website } = body;

  if (!name || !name.trim()) {
    return NextResponse.json(
      { error: "Organization name is required" },
      { status: 400 }
    );
  }

  // Generate slug from name
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 60);

  // Use service client to bypass RLS for org creation (chicken-and-egg: user
  // can't be a member of an org that doesn't exist yet)
  const admin = createServiceClient();

  // Check slug uniqueness
  const { data: existing } = await admin
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .single();

  const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug;

  // Create org
  const { data: org, error: orgError } = await admin
    .from("organizations")
    .insert({
      name: name.trim(),
      slug: finalSlug,
      industry: industry || null,
      website: website || null,
    })
    .select()
    .single();

  if (orgError) {
    return NextResponse.json({ error: orgError.message }, { status: 500 });
  }

  // Add creator as owner
  const { error: memberError } = await admin.from("org_members").insert({
    org_id: org.id,
    user_id: user.id,
    role: "owner",
  });

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  return NextResponse.json(org, { status: 201 });
}
