export type FounderRole = "Technical" | "Sales" | "Idea";

export interface Profile {
  id: string;
  display_name: string;
  role: string;
  bio: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Swipe {
  id?: string;
  swiper_id: string;
  swiped_id: string;
  direction: "like" | "pass";
  created_at?: string;
}

export interface Match {
  id: string;
  user_a: string;
  user_b: string;
  created_at: string;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export const ROLE_META: Record<FounderRole, { emoji: string; description: string }> = {
  Technical: { emoji: "\u{1F4BB}", description: "I build things" },
  Sales: { emoji: "\u{1F4C8}", description: "I sell things" },
  Idea: { emoji: "\u{1F4A1}", description: "I dream things" },
};
