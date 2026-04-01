"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { type Profile, type FounderRole, ROLE_META } from "@/types/database";
import { AppShell } from "@/components/app-shell";

const ROLES: FounderRole[] = ["Technical", "Sales", "Idea"];

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState<FounderRole>("Idea");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
        setDisplayName(data.display_name);
        setBio(data.bio);
        setRole(data.role as FounderRole);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    setSaved(false);

    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim(),
        bio: bio.trim(),
        role,
      })
      .eq("id", profile.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <AppShell active="profile">
      <div className="flex-1 px-4 py-6">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
          Your Profile
        </h1>

        {loading ? (
          <div className="animate-pulse text-zinc-400 text-center py-12">
            Loading...
          </div>
        ) : (
          <div className="max-w-sm mx-auto space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
                className="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`rounded-lg border-2 p-3 text-center text-sm transition-colors ${
                      role === r
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                        : "border-zinc-200 dark:border-zinc-700"
                    }`}
                  >
                    <span className="text-xl">{ROLE_META[r].emoji}</span>
                    <p className="mt-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      {r}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={300}
                className="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-orange-500 resize-none"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !displayName.trim()}
              className="w-full rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
