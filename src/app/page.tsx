import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
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
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-2xl text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
            Build winning messaging strategies
          </h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            AI-powered political strategy tool for building Leesburg Grids.
            Research your campaign, generate strategies, and create your
            messaging framework.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Start Building
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 border border-border rounded-lg font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
