"use server";

import { getCurrentUser } from "./auth";
import { supabaseAdmin } from "./supabase-admin";
import type { Profile, Match, Message } from "@/types/database";

// ─── Auth helpers ─────────────────────────────────────────────

export async function getSessionUser() {
  return getCurrentUser();
}

// ─── Profiles ─────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
}

export async function hasProfile(userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();
  return !!data;
}

export async function createProfile(input: {
  display_name: string;
  role: string;
  bio: string;
}): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabaseAdmin.from("profiles").insert({
    id: user.id,
    display_name: input.display_name,
    role: input.role,
    bio: input.bio,
    owner_user_id: user.id,
  });

  return error ? { error: error.message } : {};
}

export async function upsertProfile(input: {
  display_name: string;
  role: string;
  bio: string;
  avatar_url?: string | null;
}): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabaseAdmin.from("profiles").upsert(
    {
      id: user.id,
      display_name: input.display_name,
      role: input.role,
      bio: input.bio,
      ...(input.avatar_url !== undefined ? { avatar_url: input.avatar_url } : {}),
      owner_user_id: user.id,
    },
    { onConflict: "id" }
  );

  return error ? { error: error.message } : {};
}

// ─── Deck / Swipes ────────────────────────────────────────────

export async function getDeckProfiles(): Promise<{
  userId: string;
  profiles: Profile[];
} | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data: existingSwipes } = await supabaseAdmin
    .from("swipes")
    .select("swiped_id")
    .eq("swiper_id", user.id);

  const swipedIds = new Set(
    (existingSwipes ?? []).map((s: { swiped_id: string }) => s.swiped_id)
  );
  swipedIds.add(user.id);

  const { data } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .limit(50);

  const filtered = (data ?? []).filter(
    (p: Profile) => !swipedIds.has(p.id)
  );

  return { userId: user.id, profiles: filtered };
}

export async function recordSwipe(input: {
  swiped_id: string;
  direction: "like" | "pass";
}): Promise<{ matchProfile?: Profile | null }> {
  const user = await getCurrentUser();
  if (!user) return {};

  await supabaseAdmin.from("swipes").insert({
    swiper_id: user.id,
    swiped_id: input.swiped_id,
    direction: input.direction,
  });

  if (input.direction === "like") {
    const { data: matches } = await supabaseAdmin
      .from("matches")
      .select("*")
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(1);

    if (
      matches?.[0] &&
      (matches[0].user_a === input.swiped_id ||
        matches[0].user_b === input.swiped_id)
    ) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", input.swiped_id)
        .single();
      return { matchProfile: profile };
    }
  }

  return {};
}

// ─── Matches ──────────────────────────────────────────────────

export async function getMatches(): Promise<
  { match: Match; profile: Profile }[]
> {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data: matchRows } = await supabaseAdmin
    .from("matches")
    .select("*")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (!matchRows || matchRows.length === 0) return [];

  const otherIds = matchRows.map((m: Match) =>
    m.user_a === user.id ? m.user_b : m.user_a
  );

  const { data: profileRows } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .in("id", otherIds);

  const profileMap = new Map(
    (profileRows ?? []).map((p: Profile) => [p.id, p])
  );

  return matchRows
    .map((m: Match) => {
      const otherId = m.user_a === user.id ? m.user_b : m.user_a;
      const profile = profileMap.get(otherId);
      return profile ? { match: m, profile } : null;
    })
    .filter(Boolean) as { match: Match; profile: Profile }[];
}

// ─── Chat / Messages ──────────────────────────────────────────

export async function getChatData(matchId: string): Promise<{
  userId: string;
  otherProfile: Profile | null;
  messages: Message[];
  authorized: boolean;
} | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data: match } = await supabaseAdmin
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (!match) return { userId: user.id, otherProfile: null, messages: [], authorized: false };
  if (match.user_a !== user.id && match.user_b !== user.id) {
    return { userId: user.id, otherProfile: null, messages: [], authorized: false };
  }

  const otherId = match.user_a === user.id ? match.user_b : match.user_a;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", otherId)
    .single();

  const { data: msgs } = await supabaseAdmin
    .from("messages")
    .select("*")
    .eq("match_id", matchId)
    .order("created_at", { ascending: true });

  return {
    userId: user.id,
    otherProfile: profile,
    messages: msgs ?? [],
    authorized: true,
  };
}

export async function sendMessage(input: {
  match_id: string;
  body: string;
}): Promise<Message | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  // Verify user is part of this match
  const { data: match } = await supabaseAdmin
    .from("matches")
    .select("user_a, user_b")
    .eq("id", input.match_id)
    .single();

  if (!match || (match.user_a !== user.id && match.user_b !== user.id)) {
    return null;
  }

  const { data: msg } = await supabaseAdmin
    .from("messages")
    .insert({
      match_id: input.match_id,
      sender_id: user.id,
      body: input.body,
    })
    .select()
    .single();

  return msg;
}

export async function pollMessages(matchId: string): Promise<Message[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  // Verify ownership
  const { data: match } = await supabaseAdmin
    .from("matches")
    .select("user_a, user_b")
    .eq("id", matchId)
    .single();

  if (!match || (match.user_a !== user.id && match.user_b !== user.id)) {
    return [];
  }

  const { data } = await supabaseAdmin
    .from("messages")
    .select("*")
    .eq("match_id", matchId)
    .order("created_at", { ascending: true });

  return data ?? [];
}
