"use client";

import Image from "next/image";
import Link from "next/link";
import { useOrg } from "@/lib/hooks/use-org";
import LogoutButton from "@/app/dashboard/LogoutButton";

export default function TopBar() {
  const { profile } = useOrg();

  const displayName =
    profile?.display_name || "User";

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 h-14">
      <div className="flex items-center justify-between h-full px-4">
        <Link href="/dashboard">
          <Image
            src="/logo.svg"
            alt="Campaign Institute"
            width={180}
            height={50}
            className="h-8 w-auto"
            priority
          />
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{displayName}</span>
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}
