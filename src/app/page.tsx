import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="text-xl font-semibold tracking-tight">
          Santonius<span className="text-gray-400">AI</span>
        </div>

        <div className="hidden items-center gap-8 text-sm text-gray-400 md:flex">
          <a href="#features" className="transition hover:text-white">
            Features
          </a>

          <a href="#api" className="transition hover:text-white">
            API Hub
          </a>

          <a href="#about" className="transition hover:text-white">
            About
          </a>
        </div>

        <Link
          href="/register"
          className="rounded-lg border border-white/20 px-4 py-2 text-sm transition hover:bg-white hover:text-black"
        >
          Get Started
        </Link>
      </nav>

      {/* Hero */}
      <section className="mx-auto flex min-h-[75vh] max-w-7xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
          AI Developer Platform
        </div>

        <h1 className="max-w-4xl text-5xl font-bold tracking-tight md:text-7xl">
          Build with AI.
          <br />
          <span className="text-gray-500">One platform.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400">
          Connect, test, and manage your AI APIs from one powerful developer
          platform.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/register"
            className="rounded-xl bg-white px-6 py-3 font-medium text-black transition hover:bg-gray-200"
          >
            Get Started
          </Link>

          <Link
            href="/api-hub"
            className="rounded-xl border border-white/20 px-6 py-3 font-medium text-white transition hover:bg-white/10"
          >
            Explore API Hub
          </Link>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="mx-auto max-w-7xl px-6 pb-24"
      >
        <div className="mb-12 text-center">
          <p className="text-sm text-gray-500">POWERFUL TOOLS</p>

          <h2 className="mt-3 text-3xl font-semibold">
            Everything you need to work with AI
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            A single workspace for experimenting with AI providers,
            computer vision, and data analysis.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* API Hub */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition hover:border-white/20">
            <div className="mb-6 text-3xl">🔑</div>

            <h3 className="text-xl font-semibold">
              API Hub
            </h3>

            <p className="mt-3 leading-7 text-gray-400">
              Connect and test multiple AI providers from one centralized
              workspace.
            </p>
          </div>

          {/* Vision AI */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition hover:border-white/20">
            <div className="mb-6 text-3xl">👁️</div>

            <h3 className="text-xl font-semibold">
              Vision AI
            </h3>

            <p className="mt-3 leading-7 text-gray-400">
              Analyze images, detect objects, and build computer vision
              workflows.
            </p>
          </div>

          {/* Data AI */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition hover:border-white/20">
            <div className="mb-6 text-3xl">📊</div>

            <h3 className="text-xl font-semibold">
              Data AI
            </h3>

            <p className="mt-3 leading-7 text-gray-400">
              Upload datasets and discover insights, anomalies, and trends
              using AI.
            </p>
          </div>
        </div>
      </section>

      {/* API Preview */}
      <section
        id="api"
        className="mx-auto max-w-5xl px-6 pb-32"
      >
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="border-b border-white/10 px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gray-600" />
              <div className="h-3 w-3 rounded-full bg-gray-600" />
              <div className="h-3 w-3 rounded-full bg-gray-600" />

              <span className="ml-4 text-sm text-gray-500">
                API Playground
              </span>
            </div>
          </div>

          <div className="grid gap-8 p-8 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">
                REQUEST
              </p>

              <div className="mt-4 rounded-xl border border-white/10 bg-black p-5 font-mono text-sm text-gray-300">
                <p>
                  <span className="text-gray-500">provider:</span>{" "}
                  Gemini
                </p>

                <p className="mt-2">
                  <span className="text-gray-500">model:</span>{" "}
                  Gemini
                </p>

                <p className="mt-2">
                  <span className="text-gray-500">prompt:</span>
                </p>

                <p className="mt-2 text-gray-500">
                  Explain computer vision...
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                RESPONSE
              </p>

              <div className="mt-4 rounded-xl border border-white/10 bg-black p-5 font-mono text-sm text-gray-300">
                <p>
                  Computer vision is a field of AI that enables computers
                  to understand images and videos.
                </p>

                <div className="mt-6 border-t border-white/10 pt-4 text-xs text-gray-500">
                  200 OK · 1.24s
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="about"
        className="border-t border-white/10 px-6 py-8"
      >
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-gray-500 md:flex-row">
          <p>
            © 2026 Santonius AI
          </p>

          <p>
            AI Developer Platform
          </p>
        </div>
      </footer>
    </main>
  );
}

