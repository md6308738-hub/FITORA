"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";

import {
  MAIN_NAV_ITEMS,
  PROFILE_NAV_ITEM,
  isNavItemActive,
  type NavItem,
} from "./nav-items";

function SidebarLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
        active
          ? "bg-primary-soft text-primary"
          : "text-text-secondary hover:bg-surface-raised hover:text-text"
      }`}
    >
      <Icon aria-hidden="true" className="size-5 shrink-0" />
      {item.label}
    </Link>
  );
}

/** Navigation principale sur ordinateur (≥ lg). */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-surface px-4 py-6 lg:flex">
      <Link
        href="/"
        className="mb-8 px-3 font-display text-xl font-extrabold tracking-tight text-primary"
      >
        FITORA
      </Link>
      <nav aria-label="Navigation principale" className="flex flex-1 flex-col">
        <ul className="flex flex-col gap-1">
          {MAIN_NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <SidebarLink
                item={item}
                active={isNavItemActive(pathname, item.href, item.autres)}
              />
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-col gap-1 border-t border-border pt-4">
          <SidebarLink
            item={PROFILE_NAV_ITEM}
            active={isNavItemActive(pathname, PROFILE_NAV_ITEM.href)}
          />
          <LogoutButton />
        </div>
      </nav>
    </aside>
  );
}
