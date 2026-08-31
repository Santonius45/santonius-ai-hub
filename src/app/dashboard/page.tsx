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
    <main className="min-h-screen bg-black text-white p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <p className="text-2xl font-bold">SantoniusAI</p>

            <p className="mt-1 text-sm text-gray-400">
              AI Developer Platform
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
          >
            Logout
          </button>
        </div>

        <section className="mt-12">
          <p className="text-gray-400">Welcome back</p>

          <h1 className="mt-2 text-4xl font-bold">
            {name}
          </h1>

          <p className="mt-2 text-gray-400">
            {email}
          </p>
        </section>

        <section className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-gray-400">
              API Hub
            </p>

            <h2 className="mt-3 text-xl font-semibold">
              Coming Soon
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Connect and test AI providers.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-gray-400">
              Vision AI
            </p>

            <h2 className="mt-3 text-xl font-semibold">
              Coming Soon
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Analyze images with computer vision.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-gray-400">
              Data AI
            </p>

            <h2 className="mt-3 text-xl font-semibold">
              Coming Soon
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Analyze datasets using AI.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}