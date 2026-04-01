"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { Zap, MessageCircle, User, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { href: "/deck", label: "Discover", icon: Zap },
  { href: "/matches", label: "Matches", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: User },
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
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </header>

      {/* Content — bottom padding so it doesn't hide behind fixed nav */}
      <main className="flex flex-1 flex-col pb-20">{children}</main>

      {/* Bottom nav — fixed, safe-area aware for iOS Safari */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map((item) => {
          const isActive =
            active === item.href.slice(1) || pathname === item.href;
          const Icon = item.icon;
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
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
