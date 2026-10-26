"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { PROFILE_NAV_ITEM, isNavItemActive } from "./nav-items";

/** En-tête mobile (< lg) : logo et accès au profil. */
export function MobileHeader() {
  const pathname = usePathname();
  const active = isNavItemActive(pathname, PROFILE_NAV_ITEM.href);
  const ProfileIcon = PROFILE_NAV_ITEM.icon;

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface px-4 pt-[env(safe-area-inset-top)] lg:hidden">
      <div className="flex h-14 items-center justify-between">
        <Link
          href="/"
          className="font-display text-lg font-extrabold tracking-tight text-primary"
        >
          FITORA
        </Link>
        <Link
          href={PROFILE_NAV_ITEM.href}
          aria-label={PROFILE_NAV_ITEM.label}
          aria-current={active ? "page" : undefined}
          className={`flex size-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-primary ${
            active ? "bg-primary-soft text-primary" : "text-text-secondary"
          }`}
        >
          <ProfileIcon aria-hidden="true" className="size-6" />
        </Link>
      </div>
    </header>
  );
}
