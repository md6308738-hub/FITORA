"use client";

import { LogOut } from "lucide-react";
import { useFormStatus } from "react-dom";

import { deconnecter } from "@/app/(auth)/actions";

function Bouton({ className }: { className: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      <LogOut aria-hidden="true" className="size-5 shrink-0" />
      {pending ? "Déconnexion…" : "Se déconnecter"}
    </button>
  );
}

export function LogoutButton({ className = "" }: { className?: string }) {
  return (
    <form action={deconnecter}>
      <Bouton
        className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-raised hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60 ${className}`}
      />
    </form>
  );
}
