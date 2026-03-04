"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ClientForm from "@/components/clients/ClientForm";

export default function NewClientPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/dashboard/clients"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Clients
      </Link>

      <h1 className="text-2xl font-bold text-foreground mb-8">New Client</h1>

      <ClientForm />
    </div>
  );
}
