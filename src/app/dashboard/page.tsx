"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      setEmail(user.email ?? "");
      setName(user.user_metadata?.full_name ?? "Developer");
    }

    loadUser();
  }, [router, supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();

    router.replace("/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <p className="text-2xl font-bold">SantoniusAI</p>

            <p className="mt-1 text-sm text-gray-400">
              AI Developer Platform
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm transition hover:bg-white/10"
          >
            Logout
          </button>
        </div>

        {/* Welcome */}
        <section className="mt-12">
          <p className="text-gray-400">Welcome back</p>

          <h1 className="mt-2 text-4xl font-bold">
            {name}
          </h1>

          <p className="mt-2 text-gray-400">
            {email}
          </p>
        </section>

        {/* Features */}
        <section className="mt-12 grid gap-6 md:grid-cols-3">
          {/* API Hub */}
          <button
            type="button"
            onClick={() => router.push("/api-hub")}
            className="group rounded-2xl border border-white/10 bg-white/5 p-6 text-left transition hover:-translate-y-1 hover:border-white/30 hover:bg-white/10"
          >
            <div className="mb-5 text-3xl">🔑</div>

            <p className="text-sm text-gray-400">
              API Hub
            </p>

            <h2 className="mt-3 text-xl font-semibold group-hover:text-white">
              AI API Playground
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Connect and test AI providers from one centralized workspace.
            </p>

            <p className="mt-5 text-sm text-gray-300">
              Open API Hub →
            </p>
          </button>

          {/* Vision AI */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 opacity-70">
            <div className="mb-5 text-3xl">👁️</div>

            <p className="text-sm text-gray-400">
              Vision AI
            </p>

            <h2 className="mt-3 text-xl font-semibold">
              Coming Soon
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Analyze images, detect objects, and build computer vision
              workflows.
            </p>
          </div>

          {/* Data AI */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 opacity-70">
            <div className="mb-5 text-3xl">📊</div>

            <p className="text-sm text-gray-400">
              Data AI
            </p>

            <h2 className="mt-3 text-xl font-semibold">
              Coming Soon
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Upload datasets and discover insights, anomalies, and trends
              using AI.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

