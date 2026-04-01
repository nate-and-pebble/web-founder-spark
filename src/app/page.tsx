import Link from "next/link";

const swipeCards = [
  {
    name: "Jordan K.",
    role: "Technical Cofounder",
    emoji: "🛠️",
    bio: "Full-stack dev. Built 3 MVPs. Will argue about database choices on the first date.",
    tag: "Swipe right if you have the idea",
  },
  {
    name: "Priya S.",
    role: "Sales & Growth",
    emoji: "📈",
    bio: "Closed $2M in enterprise deals. Will cold-email your mom if the TAM is big enough.",
    tag: "Swipe right if you need revenue",
  },
  {
    name: "Alex R.",
    role: "Idea & Vision",
    emoji: "💡",
    bio: "Serial idea person. 47 notebooks full of 'the next big thing.' Ready to commit… to one.",
    tag: "Swipe right if you can build it",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <span className="text-xl font-bold tracking-tight text-orange-600 dark:text-orange-400">
          🔥 Founder Spark
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
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-500 dark:text-orange-400">
            It&apos;s not dating. It&apos;s worse.
          </p>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
            Swipe right on
            <span className="text-orange-600 dark:text-orange-400"> your cofounder</span>
          </h1>
          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
            Finding a cofounder is harder than finding a soulmate — at least on
            dates you don&apos;t have to discuss equity splits.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/login"
              className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3.5 text-base font-bold text-white hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg shadow-orange-500/25"
            >
              Start Swiping
            </Link>
            <a
              href="#how-it-works"
              className="rounded-full border border-zinc-300 dark:border-zinc-700 px-8 py-3.5 text-base font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              How It Works
            </a>
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 pt-1">
            No ghosting. No &quot;let&apos;s just be LinkedIn connections.&quot; Real builders only.
          </p>
        </div>
      </main>

      {/* Faux Swipe Cards */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-3">
            Your next match is waiting
          </h2>
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mb-10 max-w-md mx-auto">
            Except this time, &quot;compatibility&quot; means complementary skill sets — not shared taste in music.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {swipeCards.map((card, i) => (
              <div
                key={card.name}
                className={`relative rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-6 shadow-xl transition-transform hover:-translate-y-1 hover:shadow-2xl ${
                  i === 1 ? "sm:-translate-y-3" : ""
                }`}
              >
                <div className="text-4xl mb-3">{card.emoji}</div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  {card.name}
                </h3>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-2">
                  {card.role}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  {card.bio}
                </p>
                <p className="text-xs font-semibold text-pink-500 dark:text-pink-400 italic">
                  {card.tag}
                </p>
                {/* Fake swipe buttons */}
                <div className="flex justify-center gap-4 mt-5">
                  <span className="w-10 h-10 rounded-full border-2 border-zinc-300 dark:border-zinc-600 flex items-center justify-center text-zinc-400 text-lg select-none">
                    ✕
                  </span>
                  <span className="w-10 h-10 rounded-full border-2 border-orange-400 dark:border-orange-500 flex items-center justify-center text-orange-500 text-lg select-none">
                    ♥
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 px-6 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-10">
            Three steps to your startup relationship
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create your profile",
                desc: "Tell us your role — Technical, Sales, or Idea person. We won't judge. (Okay, we might.)",
              },
              {
                step: "2",
                title: "Browse founders",
                desc: "Swipe through builders who complement your skills. It's like window shopping, but for equity partners.",
              },
              {
                step: "3",
                title: "Spark a match",
                desc: "When it's mutual, start talking. First topic: who's CEO. Good luck.",
              },
            ].map((s) => (
              <div key={s.step} className="space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  {s.title}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-lg mx-auto space-y-5">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white">
            Stop building alone.
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Your cofounder is out there, probably also doomscrolling instead of shipping. Fix that.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-3.5 text-base font-bold text-white hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg shadow-orange-500/25"
          >
            Find Your Match
          </Link>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Free forever. No subscription. No &quot;premium likes.&quot; Just builders.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-zinc-400 dark:text-zinc-600">
        &copy; {new Date().getFullYear()} Founder Spark. All rights reserved.
        <br />
        <span className="text-xs">Not a dating app. Seriously. Please don&apos;t send selfies.</span>
      </footer>
    </div>
  );
}
