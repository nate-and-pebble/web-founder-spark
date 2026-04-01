"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import { type Match, type Profile } from "@/types/database";
import { AppShell } from "@/components/app-shell";
import { Avatar } from "@/components/avatar";
import { Sparkles, ChevronRight } from "lucide-react";

interface MatchWithProfile {
  match: Match;
  profile: Profile;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: matchRows } = await supabase
        .from("matches")
        .select("*")
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (!matchRows || matchRows.length === 0) {
        setLoading(false);
        return;
      }

      const otherIds = matchRows.map((m: Match) =>
        m.user_a === user.id ? m.user_b : m.user_a
      );

      const { data: profileRows } = await supabase
        .from("profiles")
        .select("*")
        .in("id", otherIds);

      const profileMap = new Map(
        (profileRows ?? []).map((p: Profile) => [p.id, p])
      );

      const results: MatchWithProfile[] = matchRows
        .map((m: Match) => {
          const otherId = m.user_a === user.id ? m.user_b : m.user_a;
          const profile = profileMap.get(otherId);
          return profile ? { match: m, profile } : null;
        })
        .filter(Boolean) as MatchWithProfile[];

      setMatches(results);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <AppShell active="matches">
      <div className="flex-1 px-4 py-6">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
          Your Matches
        </h1>

        {loading ? (
          <div className="animate-pulse text-zinc-400 text-center py-12">
            Loading matches...
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Sparkles className="h-10 w-10 mx-auto text-zinc-400" />
            <p className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
              No matches yet
            </p>
            <p className="text-sm text-zinc-500">
              Keep swiping to find your co-founder!
            </p>
            <Link
              href="/deck"
              className="inline-block mt-2 text-sm text-orange-600 hover:text-orange-700"
            >
              Go to Discover
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {matches.map(({ match, profile }) => (
              <Link
                key={match.id}
                href={`/chat/${match.id}`}
                className="flex items-center gap-4 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4 hover:border-orange-300 dark:hover:border-orange-600 transition-colors"
              >
                <Avatar url={profile.avatar_url} name={profile.display_name} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-zinc-900 dark:text-white truncate">
                    {profile.display_name}
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    {profile.role}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-400" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
