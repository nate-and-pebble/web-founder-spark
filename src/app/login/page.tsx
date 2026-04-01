import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            Founder Spark
          </Link>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to your account
          </p>
        </div>

        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="********"
              className="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
            />
          </div>
          <button
            type="button"
            className="w-full rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 transition-colors"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
          Don&apos;t have an account?{" "}
          <span className="text-orange-600 dark:text-orange-400 font-medium cursor-pointer">
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}
