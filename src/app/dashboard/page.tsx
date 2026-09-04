"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type RequestItem = {
  id: string;
  provider_name: string;
  model: string;
  prompt: string;
  response: string | null;
  status_code: number | null;
  latency_ms: number | null;
  created_at: string;
};

type Stats = {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  averageSuccessfulLatency: number;
  successRate: number;
  requestsToday: number;
  requestsThisWeek: number;
};

type DailyRequest = {
  date: string;
  label: string;
  count: number;
  successful: number;
  failed: number;
};

type ProviderUsage = {
  provider: string;
  count: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("Developer");

  const [stats, setStats] = useState<Stats>({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    averageSuccessfulLatency: 0,
    successRate: 0,
    requestsToday: 0,
    requestsThisWeek: 0,
  });

  const [recentRequests, setRecentRequests] = useState<RequestItem[]>([]);
  const [dailyRequests, setDailyRequests] = useState<DailyRequest[]>([]);
  const [providerUsage, setProviderUsage] = useState<ProviderUsage[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

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

      setName(
        user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Developer"
      );

      await loadStats();
    }

    loadUser();
  }, [router, supabase]);

  async function loadStats() {
    try {
      setError("");

      const response = await fetch("/api/ai/stats", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Failed to load dashboard statistics."
        );
      }

      setStats(data.stats ?? stats);
      setRecentRequests(data.recentRequests ?? []);
      setDailyRequests(data.dailyRequests ?? []);
      setProviderUsage(data.providerUsage ?? []);
    } catch (err) {
      console.error("Dashboard statistics error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load dashboard statistics."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadStats();
  }

  async function handleLogout() {
    await supabase.auth.signOut();

    router.replace("/login");
    router.refresh();
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function truncateText(text: string, length = 80) {
    if (text.length <= length) {
      return text;
    }

    return `${text.slice(0, length)}...`;
  }

  const maxDailyRequests = Math.max(
    ...dailyRequests.map((item) => item.count),
    1
  );

  const maxProviderRequests = Math.max(
    ...providerUsage.map((item) => item.count),
    1
  );

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <header className="flex flex-col gap-6 border-b border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-2xl font-bold">
              SantoniusAI
            </p>

            <p className="mt-1 text-sm text-slate-400">
              AI Developer Platform
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </header>

        {/* WELCOME */}
        <section className="mt-10">
          <p className="text-sm text-slate-500">
            Welcome back
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            {name}
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            {email}
          </p>
        </section>

        {/* ERROR */}
        {error && (
          <div className="mt-8 rounded-xl border border-red-900 bg-red-950/30 p-4">
            <p className="text-sm font-semibold text-red-300">
              Dashboard Error
            </p>

            <p className="mt-1 text-sm text-red-400">
              {error}
            </p>

            <button
              onClick={handleRefresh}
              className="mt-3 text-sm font-medium text-red-300 underline hover:text-red-200"
            >
              Try again
            </button>
          </div>
        )}

        {/* KPI */}
        <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-start justify-between">
              <p className="text-sm text-slate-500">
                Total API Requests
              </p>

              <span className="text-xs text-slate-600">
                ALL TIME
              </span>
            </div>

            <p className="mt-4 text-4xl font-bold">
              {loading ? "-" : stats.totalRequests}
            </p>

            <p className="mt-2 text-xs text-slate-600">
              All API requests
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-start justify-between">
              <p className="text-sm text-slate-500">
                Success Rate
              </p>

              <span className="text-xs text-green-500">
                HEALTH
              </span>
            </div>

            <p className="mt-4 text-4xl font-bold text-green-400">
              {loading ? "-" : `${stats.successRate}%`}
            </p>

            <p className="mt-2 text-xs text-slate-600">
              Successful API responses
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-start justify-between">
              <p className="text-sm text-slate-500">
                Requests Today
              </p>

              <span className="text-xs text-cyan-500">
                TODAY
              </span>
            </div>

            <p className="mt-4 text-4xl font-bold">
              {loading ? "-" : stats.requestsToday}
            </p>

            <p className="mt-2 text-xs text-slate-600">
              API activity today
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-start justify-between">
              <p className="text-sm text-slate-500">
                Avg Latency
              </p>

              <span className="text-xs text-slate-600">
                PERFORMANCE
              </span>
            </div>

            <p className="mt-4 text-4xl font-bold">
              {loading
                ? "-"
                : `${stats.averageResponseTime} ms`}
            </p>

            <p className="mt-2 text-xs text-slate-600">
              Average API latency
            </p>
          </div>

        </section>

        {/* SECONDARY STATS */}
        <section className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-600">
              This Week
            </p>

            <p className="mt-2 text-2xl font-bold">
              {loading ? "-" : stats.requestsThisWeek}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Requests this week
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-600">
              Successful
            </p>

            <p className="mt-2 text-2xl font-bold text-green-400">
              {loading ? "-" : stats.successfulRequests}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              HTTP 2xx responses
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-600">
              Failed
            </p>

            <p className="mt-2 text-2xl font-bold text-red-400">
              {loading ? "-" : stats.failedRequests}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Failed API calls
            </p>
          </div>

        </section>

        {/* ANALYTICS */}
        <section className="mt-10 grid gap-6 lg:grid-cols-3">

          {/* DAILY USAGE */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">

            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  API Usage
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Requests over the last 7 days.
                </p>
              </div>

              <span className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-500">
                7 DAYS
              </span>
            </div>

            <div className="mt-8">

              {loading ? (
                <div className="flex h-64 items-center justify-center text-sm text-slate-600">
                  Loading analytics...
                </div>
              ) : dailyRequests.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-sm text-slate-600">
                  No usage data yet.
                </div>
              ) : (
                <div className="flex h-64 items-end gap-3 sm:gap-5">

                  {dailyRequests.map((item) => {

                    const height =
                      item.count === 0
                        ? 4
                        : Math.max(
                            (item.count /
                              maxDailyRequests) *
                              100,
                            8
                          );

                    return (
                      <div
                        key={item.date}
                        className="flex h-full flex-1 flex-col items-center justify-end"
                      >

                        <div className="mb-2 text-xs text-slate-500">
                          {item.count}
                        </div>

                        <div className="flex w-full max-w-10 flex-1 items-end">
                          <div
                            className="w-full rounded-t-lg bg-cyan-500/80 transition-all hover:bg-cyan-400"
                            style={{
                              height: `${height}%`,
                            }}
                            title={`${item.count} requests`}
                          />
                        </div>

                        <div className="mt-3 text-xs text-slate-600">
                          {item.label}
                        </div>

                      </div>
                    );
                  })}

                </div>
              )}

            </div>
          </div>

          {/* REQUEST HEALTH */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="text-lg font-semibold">
              Request Health
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Success and failure overview.
            </p>

            <div className="mt-8 flex items-center justify-center">

              <div
                className="relative flex h-44 w-44 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(
                    rgb(74 222 128) ${stats.successRate}%,
                    rgb(127 29 29) ${stats.successRate}% 100%
                  )`,
                }}
              >

                <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-slate-900">

                  <p className="text-3xl font-bold">
                    {loading
                      ? "-"
                      : `${stats.successRate}%`}
                  </p>

                  <p className="text-xs text-slate-500">
                    success
                  </p>

                </div>

              </div>

            </div>

            <div className="mt-8 space-y-4">

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-green-400" />

                  <span className="text-sm text-slate-400">
                    Successful
                  </span>
                </div>

                <span className="text-sm font-semibold">
                  {stats.successfulRequests}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-red-700" />

                  <span className="text-sm text-slate-400">
                    Failed
                  </span>
                </div>

                <span className="text-sm font-semibold">
                  {stats.failedRequests}
                </span>
              </div>

            </div>

          </div>

        </section>

        {/* PROVIDER USAGE */}
        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex items-start justify-between">

            <div>
              <h2 className="text-lg font-semibold">
                Provider Usage
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                API requests grouped by provider.
              </p>
            </div>

            <span className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-500">
              PROVIDERS
            </span>

          </div>

          <div className="mt-8 space-y-5">

            {providerUsage.length === 0 ? (
              <p className="text-sm text-slate-600">
                No provider usage data yet.
              </p>
            ) : (
              providerUsage.map((item) => {

                const percentage =
                  (item.count /
                    maxProviderRequests) *
                  100;

                return (
                  <div key={item.provider}>

                    <div className="mb-2 flex items-center justify-between">

                      <span className="text-sm font-medium text-slate-300">
                        {item.provider}
                      </span>

                      <span className="text-sm text-slate-500">
                        {item.count} requests
                      </span>

                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                      <div
                        className="h-full rounded-full bg-cyan-500 transition-all"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />

                    </div>

                  </div>
                );
              })
            )}

          </div>

        </section>

        {/* RECENT REQUESTS */}
        <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900">

          <div className="flex flex-col gap-3 border-b border-slate-800 p-6 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-lg font-semibold">
                Recent API Activity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your latest AI API requests.
              </p>
            </div>

            <button
              onClick={() => router.push("/api-hub")}
              className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Open API Hub →
            </button>

          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Loading API requests...
            </div>
          ) : recentRequests.length === 0 ? (
            <div className="p-10 text-center">

              <p className="text-sm text-slate-400">
                No API requests yet.
              </p>

              <button
                onClick={() => router.push("/api-hub")}
                className="mt-4 text-sm font-medium text-cyan-400 hover:text-cyan-300"
              >
                Try your first API request →
              </button>

            </div>
          ) : (
            <div className="divide-y divide-slate-800">

              {recentRequests.map((item) => {

                const successful =
                  item.status_code !== null &&
                  item.status_code >= 200 &&
                  item.status_code < 300;

                return (
                  <div
                    key={item.id}
                    className="p-6 transition hover:bg-slate-800/30"
                  >

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <span className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs font-medium text-slate-300">
                            {item.provider_name}
                          </span>

                          <span className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-500">
                            {item.model}
                          </span>

                          <span
                            className={`rounded-md border px-2 py-1 text-xs font-semibold ${
                              successful
                                ? "border-green-900 bg-green-950/30 text-green-400"
                                : "border-red-900 bg-red-950/30 text-red-400"
                            }`}
                          >
                            {item.status_code ?? "ERROR"}
                          </span>

                        </div>

                        <p className="mt-4 text-sm font-medium text-slate-300">
                          {truncateText(item.prompt)}
                        </p>

                        <p className="mt-2 text-xs text-slate-600">
                          {formatDate(item.created_at)}
                        </p>

                      </div>

                      <div className="flex gap-6 lg:text-right">

                        <div>
                          <p className="text-xs text-slate-600">
                            Status
                          </p>

                          <p
                            className={`mt-1 text-sm font-semibold ${
                              successful
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {item.status_code ?? "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-600">
                            Latency
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-300">
                            {item.latency_ms !== null
                              ? `${item.latency_ms} ms`
                              : "-"}
                          </p>
                        </div>

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </section>

        {/* QUICK ACTIONS */}
        <section className="mt-6 grid gap-5 md:grid-cols-3">

          <button
            onClick={() => router.push("/api-hub")}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-left transition hover:border-cyan-500/50 hover:bg-slate-800"
          >
            <p className="text-sm font-semibold text-cyan-400">
              API Hub
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Test Gemini and OpenAI through the Santonius AI platform.
            </p>

            <p className="mt-4 text-sm font-medium text-slate-300">
              Open API Hub →
            </p>
          </button>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm font-semibold text-slate-300">
              Vision AI
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Analyze images with computer vision.
            </p>

            <p className="mt-4 text-xs font-medium text-slate-600">
              COMING SOON
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm font-semibold text-slate-300">
              Data AI
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Analyze datasets using AI.
            </p>

            <p className="mt-4 text-xs font-medium text-slate-600">
              COMING SOON
            </p>
          </div>

        </section>

        {/* FOOTER */}
        <footer className="py-10 text-center text-xs text-slate-600">
          © 2026 Santonius AI · AI Developer Platform
        </footer>

      </div>
    </main>
  );
}