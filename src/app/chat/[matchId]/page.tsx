"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { type Message, type Profile } from "@/types/database";
import { Avatar } from "@/components/avatar";
import { ArrowLeft, ArrowUp } from "lucide-react";

export default function ChatPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherProfile, setOtherProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: match } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchId)
        .single();

      if (!match) {
        router.push("/matches");
        return;
      }

      if (match.user_a !== user.id && match.user_b !== user.id) {
        router.push("/matches");
        return;
      }

      const otherId =
        match.user_a === user.id ? match.user_b : match.user_a;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", otherId)
        .single();

      setOtherProfile(profile);

      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });

      setMessages(msgs ?? []);
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!matchId) return;
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
    }, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  async function handleSend() {
    if (!text.trim() || !userId || sending) return;
    setSending(true);
    const body = text.trim();
    setText("");

    const { data: msg } = await supabase
      .from("messages")
      .insert({
        match_id: matchId,
        sender_id: userId,
        body,
      })
      .select()
      .single();

    if (msg) {
      setMessages((prev) => [...prev, msg]);
    }
    setSending(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3">
        <button
          onClick={() => router.push("/matches")}
          className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        {otherProfile && (
          <>
            <Avatar url={otherProfile.avatar_url} name={otherProfile.display_name} size="sm" />
            <div>
              <p className="font-semibold text-sm text-zinc-900 dark:text-white">
                {otherProfile.display_name}
              </p>
              <p className="text-xs text-orange-600">{otherProfile.role}</p>
            </div>
          </>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="animate-pulse text-zinc-400 text-center py-12">
            Loading...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16 text-sm text-zinc-400">
            Say hello to start the conversation!
          </div>
        ) : (
          <div className="space-y-2 max-w-lg mx-auto">
            {messages.map((msg) => {
              const isMe = msg.sender_id === userId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                      isMe
                        ? "bg-orange-600 text-white"
                        : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700"
                    }`}
                  >
                    {msg.body}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3">
        <div className="flex gap-2 max-w-lg mx-auto">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Message..."
            className="flex-1 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-orange-500"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-600 text-white disabled:opacity-40 hover:bg-orange-700 transition-colors"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
