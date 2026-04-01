"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { type Profile, ROLE_META, type FounderRole } from "@/types/database";
import { AppShell } from "@/components/app-shell";

export default function DeckPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [matchAlert, setMatchAlert] = useState<Profile | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [swiped, setSwiped] = useState<Set<string>>(new Set());

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Get already-swiped profile IDs
      const { data: existingSwipes } = await supabase
        .from("swipes")
        .select("swiped_id")
        .eq("swiper_id", user.id);

      const swipedIds = new Set(
        (existingSwipes ?? []).map((s: { swiped_id: string }) => s.swiped_id)
      );
      swipedIds.add(user.id); // exclude self
      setSwiped(swipedIds);

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .limit(50);

      const filtered = (data ?? []).filter((p: Profile) => !swipedIds.has(p.id));
      setProfiles(filtered);
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSwipe = useCallback(
    async (direction: "like" | "pass") => {
      if (!userId || currentIndex >= profiles.length) return;

      const profile = profiles[currentIndex];
      setSwipeDirection(direction === "like" ? "right" : "left");

      // Animate out, then advance
      setTimeout(async () => {
        setSwipeDirection(null);
        setCurrentIndex((i) => i + 1);

        // Record swipe
        await supabase.from("swipes").insert({
          swiper_id: userId,
          swiped_id: profile.id,
          direction,
        });

        // Check for match if liked
        if (direction === "like") {
          const { data: matches } = await supabase
            .from("matches")
            .select("*")
            .or(`user_a.eq.${userId},user_b.eq.${userId}`)
            .order("created_at", { ascending: false })
            .limit(1);

          if (
            matches?.[0] &&
            (matches[0].user_a === profile.id ||
              matches[0].user_b === profile.id)
          ) {
            setMatchAlert(profile);
          }
        }
      }, 300);
    },
    [userId, currentIndex, profiles, supabase]
  );

  const currentProfile = profiles[currentIndex];
  const done = !loading && (!currentProfile || currentIndex >= profiles.length);

  return (
    <AppShell active="deck">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        {loading ? (
          <div className="animate-pulse text-zinc-400">Loading profiles...</div>
        ) : done ? (
          <div className="text-center space-y-3">
            <p className="text-4xl">{"🔍"}</p>
            <p className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
              No more founders
            </p>
            <p className="text-sm text-zinc-500">Check back later!</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-orange-600 hover:text-orange-700"
            >
              Refresh
            </button>
          </div>
        ) : (
          <>
            <div
              className={`w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-lg overflow-hidden transition-transform duration-300 ${
                swipeDirection === "left"
                  ? "-translate-x-full rotate-[-12deg] opacity-0"
                  : swipeDirection === "right"
                    ? "translate-x-full rotate-[12deg] opacity-0"
                    : ""
              }`}
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-center text-white">
                <span className="text-5xl">
                  {ROLE_META[currentProfile.role as FounderRole]?.emoji ?? "🚀"}
                </span>
                <h2 className="mt-3 text-xl font-bold">
                  {currentProfile.display_name}
                </h2>
                <span className="mt-1 inline-block rounded-full bg-white/20 px-3 py-0.5 text-xs font-medium">
                  {currentProfile.role}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 min-h-[3rem]">
                  {currentProfile.bio || "No bio yet."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex border-t border-zinc-200 dark:border-zinc-700">
                <button
                  onClick={() => handleSwipe("pass")}
                  className="flex-1 py-4 text-center font-semibold text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                >
                  Pass
                </button>
                <div className="w-px bg-zinc-200 dark:bg-zinc-700" />
                <button
                  onClick={() => handleSwipe("like")}
                  className="flex-1 py-4 text-center font-semibold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                >
                  {"⚡"} Like
                </button>
              </div>
            </div>

            <p className="mt-4 text-xs text-zinc-400">
              {profiles.length - currentIndex} remaining
            </p>
          </>
        )}

        {/* Match Alert */}
        {matchAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-xs rounded-2xl bg-white dark:bg-zinc-800 p-6 text-center shadow-2xl">
              <p className="text-4xl">{"⚡"}</p>
              <h3 className="mt-3 text-xl font-bold text-zinc-900 dark:text-white">
                It&apos;s a Match!
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                You and{" "}
                <strong className="text-orange-600">
                  {matchAlert.display_name}
                </strong>{" "}
                want to connect!
              </p>
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setMatchAlert(null)}
                  className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-600 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Keep Swiping
                </button>
                <a
                  href="/matches"
                  className="flex-1 rounded-lg bg-orange-600 py-2 text-sm font-medium text-white"
                >
                  View Matches
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
