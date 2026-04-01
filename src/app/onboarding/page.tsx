"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createProfile } from "@/lib/actions";
import { type FounderRole, ROLE_META } from "@/types/database";
import { RoleIcon } from "@/components/role-icon";
import { Avatar } from "@/components/avatar";
import { Camera } from "lucide-react";

const ROLES: FounderRole[] = ["Technical", "Sales", "Idea"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<"role" | "profile">("role");
  const [selectedRole, setSelectedRole] = useState<FounderRole | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2 MB.");
      return;
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/avatar", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Upload failed");
      setUploading(false);
      return;
    }

    setAvatarUrl(data.url);
    setUploading(false);
  }

  async function handleCreateProfile() {
    if (!selectedRole || !displayName.trim()) return;
    setLoading(true);
    setError("");

    const result = await createProfile({
      display_name: displayName.trim(),
      role: selectedRole,
      bio: bio.trim(),
      avatar_url: avatarUrl,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/deck");
  }

  if (step === "role") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 px-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              What&apos;s your superpower?
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Pick the role that best describes you
            </p>
          </div>

          <div className="grid gap-4">
            {ROLES.map((role) => (
              <button
                key={role}
                onClick={() => {
                  setSelectedRole(role);
                  setStep("profile");
                }}
                className="flex items-center gap-4 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-5 text-left hover:border-orange-400 dark:hover:border-orange-500 transition-colors"
              >
                <RoleIcon role={role} className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white">
                    {role}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {ROLE_META[role].description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <RoleIcon role={selectedRole!} className="h-10 w-10 mx-auto text-orange-600 dark:text-orange-400" />
          <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
            Set up your profile
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {selectedRole} founder
          </p>
        </div>

        <div className="space-y-4">
          {/* Optional Photo Upload */}
          <div className="flex flex-col items-center gap-1">
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
            <p className="text-xs text-zinc-400">
              Add a photo (optional)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Display Name
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              maxLength={50}
              className="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other founders about yourself..."
              rows={3}
              maxLength={300}
              className="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <button
            onClick={handleCreateProfile}
            disabled={loading || !displayName.trim()}
            className="w-full rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Start Swiping"}
          </button>

          <button
            onClick={() => setStep("role")}
            className="w-full text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Back to role selection
          </button>
        </div>
      </div>
    </div>
  );
}
