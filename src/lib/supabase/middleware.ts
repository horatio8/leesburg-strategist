import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Public routes that don't require auth
  const publicRoutes = ["/", "/login", "/signup", "/auth/callback", "/auth/confirm"];
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith("/share/") || pathname.startsWith("/api/district-boundary");
  const isAuthRoute = pathname === "/login" || pathname === "/signup";
  const isOnboarding = pathname === "/onboarding";

  // Redirect authenticated users away from auth pages
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Redirect unauthenticated users to login for protected routes
  if (!user && !isPublicRoute && !pathname.startsWith("/api/share")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // For authenticated users on dashboard routes: check if they have an org
  // Skip for API routes, onboarding, framework pages, and admin pages
  if (
    user &&
    pathname.startsWith("/dashboard") &&
    !pathname.startsWith("/api/")
  ) {
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
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
  }

  // Redirect away from onboarding if user already has an org
  if (user && isOnboarding) {
    const { data: memberships } = await supabase
      .from("org_members")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    if (memberships && memberships.length > 0) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
