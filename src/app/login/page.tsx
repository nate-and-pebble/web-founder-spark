"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMagicLink, setShowMagicLink] = useState(false);
  const submitRef = useRef(false);

  async function handleGoogleLogin() {
    if (googleLoading) return;
    setGoogleLoading(true);
    setError("");

    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (err) {
      setError(err.message);
      setGoogleLoading(false);
    }
    // On success, browser redirects — no need to reset loading
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    // Debounce: prevent double submit
    if (submitRef.current || loading) return;
    submitRef.current = true;
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (err) {
        setError(err.message);
      } else {
        setSent(true);
      }
    } finally {
      setLoading(false);
      // Allow re-submit after 5 seconds (rate limit cooldown)
      setTimeout(() => {
        submitRef.current = false;
      }, 5000);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Link
            href="/"
            className="text-2xl font-bold text-orange-600 dark:text-orange-400"
          >
            Founder Spark
          </Link>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to find your co-founder
          </p>
        </div>

        {sent ? (
          <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 text-center">
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              Check your email!
            </p>
            <p className="mt-1 text-xs text-green-600 dark:text-green-400">
              We sent a magic link to <strong>{email}</strong>. Click it to sign
              in.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Google OAuth — primary */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {googleLoading ? "Redirecting..." : "Continue with Google"}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 px-2 text-zinc-400">
                  or
                </span>
              </div>
            </div>

            {/* Magic link — secondary */}
            {showMagicLink ? (
              <form onSubmit={handleMagicLink} className="space-y-3">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Magic Link"}
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowMagicLink(true)}
                className="w-full text-center text-sm text-zinc-500 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                Use magic link instead
              </button>
            )}

            {error && !showMagicLink && (
              <p className="text-sm text-red-600 dark:text-red-400 text-center">
                {error}
              </p>
            )}
          </div>
        )}

        <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
          No account needed — we&apos;ll create one automatically.
        </p>
      </div>
    </div>
  );
}
