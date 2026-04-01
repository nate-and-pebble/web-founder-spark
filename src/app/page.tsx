import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <span className="text-xl font-bold tracking-tight text-orange-600 dark:text-orange-400">
          Founder Spark
        </span>
        <Link
          href="/login"
          className="rounded-full bg-orange-600 px-5 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
        >
          Log in
        </Link>
      </nav>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
            Ignite your
            <span className="text-orange-600 dark:text-orange-400"> founder journey</span>
          </h1>
          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
            Tools, insights, and community to help first-time founders go from idea to traction — faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/login"
              className="rounded-full bg-orange-600 px-8 py-3 text-base font-semibold text-white hover:bg-orange-700 transition-colors"
            >
              Get Started
            </Link>
            <a
              href="#features"
              className="rounded-full border border-zinc-300 dark:border-zinc-700 px-8 py-3 text-base font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </main>

      {/* Features placeholder */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            { title: "Validate Fast", desc: "Quickly test ideas before committing months of effort." },
            { title: "Build Smart", desc: "Frameworks and templates to ship your MVP in weeks." },
            { title: "Grow Together", desc: "Connect with founders who've been where you are." },
          ].map((f) => (
            <div key={f.title} className="space-y-2">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{f.title}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-zinc-400 dark:text-zinc-600">
        &copy; {new Date().getFullYear()} Founder Spark. All rights reserved.
      </footer>
    </div>
  );
}
