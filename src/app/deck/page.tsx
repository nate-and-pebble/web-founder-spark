"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getDeckProfiles, recordSwipe } from "@/lib/actions";
import { type Profile } from "@/types/database";
import { AppShell } from "@/components/app-shell";
import { RoleIcon } from "@/components/role-icon";
import { Search, X, Heart, Star, RefreshCw, Zap } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Swipe Card                                                         */
/* ------------------------------------------------------------------ */

function SwipeCard({
  profile,
  isTop,
  onSwipe,
}: {
  profile: Profile;
  isTop: boolean;
  onSwipe: (dir: "like" | "pass") => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const dragging = useRef(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [gone, setGone] = useState<"left" | "right" | null>(null);

  const rotation = offset.x * 0.08; // subtle tilt
  const likeOpacity = Math.min(Math.max(offset.x / 100, 0), 1);
  const nopeOpacity = Math.min(Math.max(-offset.x / 100, 0), 1);

  const handleStart = (clientX: number, clientY: number) => {
    if (!isTop) return;
    dragging.current = true;
    startX.current = clientX;
    startY.current = clientY;
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!dragging.current) return;
    const dx = clientX - startX.current;
    const dy = (clientY - startY.current) * 0.4;
    currentX.current = dx;
    setOffset({ x: dx, y: dy });
  };

  const handleEnd = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const threshold = 100;
    if (currentX.current > threshold) {
      flyAway("right");
    } else if (currentX.current < -threshold) {
      flyAway("left");
    } else {
      currentX.current = 0;
      setOffset({ x: 0, y: 0 });
    }
  };

  const flyAway = (dir: "left" | "right") => {
    setGone(dir);
    setTimeout(() => onSwipe(dir === "right" ? "like" : "pass"), 300);
  };

  // Expose flyAway for button taps
  useEffect(() => {
    if (!isTop || !cardRef.current) return;
    const el = cardRef.current;
    (el as unknown as Record<string, unknown>)._flyAway = flyAway;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTop]);

  const transform = gone
    ? gone === "right"
      ? "translate(120vw, -40px) rotate(25deg)"
      : "translate(-120vw, -40px) rotate(-25deg)"
    : `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg)`;

  const transition = dragging.current ? "none" : "transform 0.35s cubic-bezier(.4,.2,.2,1), opacity 0.35s";

  return (
    <div
      ref={cardRef}
      data-swipe-card={isTop ? "top" : "back"}
      className="absolute inset-0 select-none touch-none"
      style={{
        transform: isTop ? transform : `scale(${gone ? 1 : 0.95}) translateY(${gone ? 0 : 16}px)`,
        transition: isTop ? transition : "transform 0.35s cubic-bezier(.4,.2,.2,1)",
        opacity: gone && isTop ? 0 : 1,
        zIndex: isTop ? 2 : 1,
        pointerEvents: isTop ? "auto" : "none",
      }}
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        handleStart(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => handleMove(e.clientX, e.clientY)}
      onPointerUp={handleEnd}
      onPointerCancel={handleEnd}
    >
      <div className="h-full w-full rounded-2xl overflow-hidden shadow-2xl bg-zinc-900">
        {/* Photo / gradient background */}
        <div className="relative h-full w-full">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name}
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-rose-500 to-purple-600 flex items-center justify-center">
              <RoleIcon role={profile.role} className="h-24 w-24 text-white/60" />
            </div>
          )}

          {/* Gradient overlay at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* LIKE stamp */}
          {isTop && (
            <div
              className="absolute top-8 left-6 border-4 border-green-500 rounded-lg px-4 py-1 -rotate-12"
              style={{ opacity: likeOpacity, transition: dragging.current ? "none" : "opacity 0.15s" }}
            >
              <span className="text-3xl font-black tracking-wide text-green-500">LIKE</span>
            </div>
          )}

          {/* NOPE stamp */}
          {isTop && (
            <div
              className="absolute top-8 right-6 border-4 border-red-500 rounded-lg px-4 py-1 rotate-12"
              style={{ opacity: nopeOpacity, transition: dragging.current ? "none" : "opacity 0.15s" }}
            >
              <span className="text-3xl font-black tracking-wide text-red-500">NOPE</span>
            </div>
          )}

          {/* Info at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">
              {profile.display_name}
            </h2>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-sm px-3 py-0.5 text-xs font-medium text-white">
                <RoleIcon role={profile.role} className="h-3 w-3" />
                {profile.role}
              </span>
            </div>
            {profile.bio && (
              <p className="mt-2 text-sm text-white/80 line-clamp-2 drop-shadow">
                {profile.bio}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Deck Page                                                          */
/* ------------------------------------------------------------------ */

export default function DeckPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [matchAlert, setMatchAlert] = useState<Profile | null>(null);

  useEffect(() => {
    async function load() {
      const result = await getDeckProfiles();
      if (!result) return;
      setUserId(result.userId);
      setProfiles(result.profiles);
      setLoading(false);
    }
    load();
  }, []);

  const handleSwipe = useCallback(
    async (direction: "like" | "pass") => {
      if (!userId || currentIndex >= profiles.length) return;

      const profile = profiles[currentIndex];
      setCurrentIndex((i) => i + 1);

      const result = await recordSwipe({
        swiped_id: profile.id,
        direction,
      });

      if (result.matchProfile) {
        setMatchAlert(result.matchProfile);
      }
    },
    [userId, currentIndex, profiles]
  );

  const triggerSwipe = (dir: "like" | "pass") => {
    const topCard = document.querySelector('[data-swipe-card="top"]');
    if (topCard) {
      const fly = (topCard as unknown as Record<string, unknown>)._flyAway;
      if (typeof fly === "function") {
        fly(dir === "like" ? "right" : "left");
        return;
      }
    }
    handleSwipe(dir);
  };

  const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];
  const done = !loading && (!currentProfile || currentIndex >= profiles.length);

  return (
    <AppShell active="deck">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-4">
        {loading ? (
          <div className="animate-pulse text-zinc-400">Finding founders...</div>
        ) : done ? (
          <div className="text-center space-y-3">
            <Search className="h-10 w-10 mx-auto text-zinc-400" />
            <p className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
              No more founders
            </p>
            <p className="text-sm text-zinc-500">Check back later!</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>
        ) : (
          <>
            {/* Card Stack */}
            <div className="relative w-full max-w-sm" style={{ aspectRatio: "3/4.5" }}>
              {nextProfile && (
                <SwipeCard
                  key={nextProfile.id}
                  profile={nextProfile}
                  isTop={false}
                  onSwipe={() => {}}
                />
              )}
              {currentProfile && (
                <SwipeCard
                  key={currentProfile.id}
                  profile={currentProfile}
                  isTop={true}
                  onSwipe={handleSwipe}
                />
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center gap-5">
              <button
                onClick={() => triggerSwipe("pass")}
                className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-300 dark:border-red-700 bg-white dark:bg-zinc-800 shadow-lg active:scale-90 transition-transform hover:shadow-xl"
              >
                <X className="h-8 w-8 text-red-500" />
              </button>
              <button
                onClick={() => triggerSwipe("like")}
                className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-orange-300 dark:border-orange-700 bg-white dark:bg-zinc-800 shadow-lg active:scale-90 transition-transform hover:shadow-xl"
              >
                <Star className="h-7 w-7 text-orange-500" />
              </button>
              <button
                onClick={() => triggerSwipe("like")}
                className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-green-300 dark:border-green-700 bg-white dark:bg-zinc-800 shadow-lg active:scale-90 transition-transform hover:shadow-xl"
              >
                <Heart className="h-8 w-8 text-green-500" />
              </button>
            </div>

            <p className="mt-3 text-xs text-zinc-400">
              {profiles.length - currentIndex} remaining
            </p>
          </>
        )}

        {/* Match Alert */}
        {matchAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-xs rounded-3xl bg-gradient-to-b from-orange-500 to-rose-600 p-1 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="rounded-[22px] bg-white dark:bg-zinc-900 p-6 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-rose-500">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                  It&apos;s a Match!
                </h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  You and{" "}
                  <strong className="text-zinc-800 dark:text-zinc-200">
                    {matchAlert.display_name}
                  </strong>{" "}
                  want to connect!
                </p>
                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => setMatchAlert(null)}
                    className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 py-2.5 text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Keep Swiping
                  </button>
                  <a
                    href="/matches"
                    className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 py-2.5 text-center text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                  >
                    Say Hi!
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
