"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

const NAV_ITEMS = [
  { href: "/deck", label: "Discover", icon: "⚡" },
  { href: "/matches", label: "Matches", icon: "💬" },
  { href: "/profile", label: "Profile", icon: "👤" },
] as const;

export function AppShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3">
        <Link
          href="/deck"
          className="text-lg font-bold text-orange-600 dark:text-orange-400"
        >
          Founder Spark
        </Link>
        <button
          onClick={handleSignOut}
          className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          Sign Out
        </button>
      </header>

      {/* Content */}
      <main className="flex flex-1 flex-col">{children}</main>

      {/* Bottom nav */}
      <nav className="flex border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        {NAV_ITEMS.map((item) => {
          const isActive =
            active === item.href.slice(1) || pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-3 text-xs transition-colors ${
                isActive
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
