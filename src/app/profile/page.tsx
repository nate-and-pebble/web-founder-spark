"use client";

import { useEffect, useState, useRef } from "react";
import { getSessionUser, getProfile, upsertProfile } from "@/lib/actions";
import { type FounderRole, ROLE_META } from "@/types/database";
import { AppShell } from "@/components/app-shell";
import { RoleIcon } from "@/components/role-icon";
import { Avatar } from "@/components/avatar";
import { Camera } from "lucide-react";

const ROLES: FounderRole[] = ["Technical", "Sales", "Idea"];

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState<FounderRole>("Idea");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const user = await getSessionUser();
      if (!user) return;

      setUserId(user.id);

      const data = await getProfile(user.id);
      if (data) {
        setDisplayName(data.display_name);
        setBio(data.bio);
        setRole(data.role as FounderRole);
        setAvatarUrl(data.avatar_url);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2 MB.");
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/avatar", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Upload failed");
      setUploading(false);
      return;
    }

    const publicUrl = data.url;

    const result = await upsertProfile({
      display_name: displayName.trim() || "Anonymous",
      bio: bio.trim(),
      role,
      avatar_url: publicUrl,
    });

    if (result.error) {
      setError(`Failed to save avatar: ${result.error}`);
      setUploading(false);
      return;
    }

    setAvatarUrl(publicUrl + "?t=" + Date.now());
    setUploading(false);
  }

  async function handleSave() {
    if (!userId || !displayName.trim()) return;
    setSaving(true);
    setSaved(false);
    setError(null);

    const result = await upsertProfile({
      display_name: displayName.trim(),
      bio: bio.trim(),
      role,
    });

    if (result.error) {
      setError(`Save failed: ${result.error}`);
      setSaving(false);
      return;
    }

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
            {/* Avatar Upload */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative group"
                disabled={uploading}
              >
                <Avatar url={avatarUrl} name={displayName} size="lg" />
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <p className="text-center text-xs text-zinc-400">
              Tap to upload photo
            </p>

            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

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
                    <RoleIcon role={r} className="h-5 w-5 mx-auto text-orange-600 dark:text-orange-400" />
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
