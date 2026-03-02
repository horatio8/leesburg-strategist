import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceClient();
  const { data, error } = await admin
    .from("approvals")
    .select("*, campaign:campaigns(id, name, status)")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceClient();
  const body = await req.json();
  const { status, feedback } = body;

  if (!status || !["approved", "rejected", "edited"].includes(status)) {
    return NextResponse.json(
      { error: "status must be approved, rejected, or edited" },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = {
    status,
    reviewer_id: user.id,
    resolved_at: new Date().toISOString(),
  };

  if (feedback !== undefined) {
    updates.feedback = feedback;
  }

  const { data, error } = await admin
    .from("approvals")
    .update(updates)
    .eq("id", id)
    .select("*, campaign:campaigns(id, name, status)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
