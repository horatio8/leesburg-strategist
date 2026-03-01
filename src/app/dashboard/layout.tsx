import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "./LogoutButton";

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

  const displayName = user.user_metadata?.full_name || user.email || "User";

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Image
              src="/logo.svg"
              alt="Campaign Institute"
              width={200}
              height={60}
              className="h-10 w-auto"
              priority
            />
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{displayName}</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  );
}
