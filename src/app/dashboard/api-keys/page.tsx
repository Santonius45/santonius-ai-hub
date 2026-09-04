"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type ApiKey = {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

export default function ApiKeysPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [keyName, setKeyName] = useState("My Development Key");

  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      await loadKeys();
    }

    checkUser();
  }, [router, supabase]);

  async function loadKeys() {
    try {
      setError("");

      const response = await fetch("/api/keys", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load API keys.");
      }

      setKeys(data.keys ?? []);
    } catch (err) {
      console.error("API keys loading error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load API keys."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateKey() {
    try {
      setCreating(true);
      setError("");
      setCopied(false);

      const response = await fetch("/api/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: keyName.trim() || "My API Key",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Failed to create API key."
        );
      }

      setNewKey(data.key);
      setShowCreateModal(false);
      setKeyName("My Development Key");

      await loadKeys();
    } catch (err) {
      console.error("API key creation error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create API key."
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to revoke this API key? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setRevoking(id);
      setError("");

      const response = await fetch(`/api/keys/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Failed to revoke API key."
        );
      }

      await loadKeys();
    } catch (err) {
      console.error("API key revoke error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to revoke API key."
      );
    } finally {
      setRevoking(null);
    }
  }

  async function handleCopyKey() {
    if (!newKey) {
      return;
    }

    try {
      await navigator.clipboard.writeText(newKey);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Copy API key error:", err);
    }
  }

  function formatDate(date: string | null) {
    if (!date) {
      return "Never";
    }

    return new Date(date).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function getKeyStatus(key: ApiKey) {
    if (key.revoked_at) {
      return "Revoked";
    }

    return "Active";
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <header className="flex flex-col gap-5 border-b border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-2xl font-bold">
              SantoniusAI
            </p>

            <p className="mt-1 text-sm text-slate-400">
              AI Developer Platform
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-fit rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
          >
            ← Dashboard
          </button>
        </header>

        {/* Title */}
        <section className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">
              Developer Settings
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight">
              API Keys
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Create and manage API keys for accessing
              Santonius AI services.
            </p>
          </div>

          <button
            onClick={() => {
              setError("");
              setShowCreateModal(true);
            }}
            className="rounded-lg bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            + Create API Key
          </button>
        </section>

        {/* Security Notice */}
        <section className="mt-8 rounded-2xl border border-cyan-900/50 bg-cyan-950/20 p-5">
          <div className="flex gap-4">
            <div className="mt-0.5 text-cyan-400">
              🔐
            </div>

            <div>
              <p className="text-sm font-semibold text-cyan-300">
                Keep your API keys secure
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-400">
                API keys provide access to your AI services.
                Never share them publicly or commit them to
                GitHub. The full key is shown only once after
                creation.
              </p>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-900 bg-red-950/30 p-4">
            <p className="text-sm font-semibold text-red-300">
              API Key Error
            </p>

            <p className="mt-1 text-sm text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* API Keys */}
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Your API Keys
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage your active and revoked keys.
              </p>
            </div>

            <span className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-500">
              {keys.length} {keys.length === 1 ? "KEY" : "KEYS"}
            </span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
              <p className="text-sm text-slate-500">
                Loading API keys...
              </p>
            </div>
          ) : keys.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-12 text-center">
              <div className="text-4xl">
                🔑
              </div>

              <h3 className="mt-4 text-lg font-semibold">
                No API keys yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Create your first API key to start building
                applications with Santonius AI.
              </p>

              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-6 rounded-lg bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Create Your First API Key
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {keys.map((key) => {
                const revoked = Boolean(key.revoked_at);

                return (
                  <div
                    key={key.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-slate-700"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-semibold text-slate-200">
                            {key.name}
                          </h3>

                          <span
                            className={`rounded-md border px-2 py-1 text-xs font-semibold ${
                              revoked
                                ? "border-red-900 bg-red-950/30 text-red-400"
                                : "border-green-900 bg-green-950/30 text-green-400"
                            }`}
                          >
                            {getKeyStatus(key)}
                          </span>
                        </div>

                        <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 px-4 py-3">
                          <code className="break-all text-sm text-slate-400">
                            {key.key_prefix}
                            ••••••••••••••••••••
                          </code>
                        </div>

                        <div className="mt-4 flex flex-col gap-2 text-xs text-slate-600 sm:flex-row sm:gap-6">
                          <span>
                            Created:{" "}
                            {formatDate(key.created_at)}
                          </span>

                          <span>
                            Last used:{" "}
                            {formatDate(key.last_used_at)}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {!revoked && (
                          <button
                            onClick={() =>
                              handleRevoke(key.id)
                            }
                            disabled={revoking === key.id}
                            className="rounded-lg border border-red-900 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {revoking === key.id
                              ? "Revoking..."
                              : "Revoke"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Back */}
        <div className="mt-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm font-medium text-cyan-400 transition hover:text-cyan-300"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Footer */}
        <footer className="py-10 text-center text-xs text-slate-600">
          © 2026 Santonius AI · AI Developer Platform
        </footer>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    Create API Key
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Give your API key a recognizable name.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowCreateModal(false)
                  }
                  className="text-xl text-slate-500 transition hover:text-white"
                >
                  ×
                </button>
              </div>

              <div className="mt-6">
                <label className="text-sm font-medium text-slate-300">
                  Key Name
                </label>

                <input
                  value={keyName}
                  onChange={(event) =>
                    setKeyName(event.target.value)
                  }
                  maxLength={100}
                  placeholder="My Development Key"
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() =>
                    setShowCreateModal(false)
                  }
                  disabled={creating}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  onClick={handleCreateKey}
                  disabled={creating}
                  className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating
                    ? "Creating..."
                    : "Create Key"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Key Modal */}
        {newKey && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
            <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

              <div>
                <p className="text-sm font-semibold text-green-400">
                  ✓ API Key Created
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Save your API key
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  This is the only time the full API key will
                  be shown. Copy it now and store it somewhere
                  secure.
                </p>
              </div>

              <div className="mt-6 rounded-xl border border-slate-700 bg-slate-950 p-4">
                <code className="block break-all text-sm leading-6 text-cyan-400">
                  {newKey}
                </code>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={handleCopyKey}
                  className="rounded-lg bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  {copied
                    ? "✓ Copied"
                    : "Copy API Key"}
                </button>

                <button
                  onClick={() => {
                    setNewKey(null);
                    setCopied(false);
                  }}
                  className="rounded-lg border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

