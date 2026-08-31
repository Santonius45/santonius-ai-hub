"use client";

import { useState } from "react";

export default function ApiHubPage() {
  const [provider, setProvider] = useState("gemini");
  const [model, setModel] = useState("gemini-2.5-flash");
  const [prompt, setPrompt] = useState("");

  const [response, setResponse] = useState("");
  const [responseProvider, setResponseProvider] = useState("");
  const [responseModel, setResponseModel] = useState("");
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendRequest = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }

    setLoading(true);
    setError("");
    setResponse("");
    setStatusCode(null);
    setResponseTime(null);
    setResponseProvider("");
    setResponseModel("");

    const startTime = performance.now();

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          model,
          prompt: prompt.trim(),
        }),
      });

      const data = await res.json();

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      setResponseTime(duration);
      setStatusCode(res.status);

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Request failed.");
      }

      setResponse(data.response || "");
      setResponseProvider(data.provider || "Google Gemini");
      setResponseModel(data.model || model);
    } catch (err) {
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearPlayground = () => {
    setPrompt("");
    setResponse("");
    setError("");
    setStatusCode(null);
    setResponseTime(null);
    setResponseProvider("");
    setResponseModel("");
  };

  const handlePromptKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();

      if (!loading) {
        sendRequest();
      }
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-10">
          <p className="mb-2 text-sm font-semibold tracking-wider text-cyan-400">
            SANTONIUS AI HUB
          </p>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                API Playground
              </h1>

              <p className="mt-3 max-w-2xl text-slate-400">
                Test AI providers from one centralized developer workspace.
              </p>
            </div>

            <div className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-400">
              API Status{" "}
              <span className="ml-1 font-semibold text-green-400">
                Operational
              </span>
            </div>
          </div>
        </div>

        {/* Playground */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Request */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">

            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Request
                </h2>

                <span className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-500">
                  POST
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-400">
                Configure your AI request.
              </p>
            </div>

            {/* Provider */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Provider
              </label>

              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="gemini">
                  Google Gemini
                </option>
              </select>
            </div>

            {/* Model */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Model
              </label>

              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="gemini-2.5-flash">
                  Gemini 2.5 Flash
                </option>
              </select>
            </div>

            {/* Prompt */}
            <div className="mb-5">
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-300">
                  Prompt
                </label>

                <span className="text-xs text-slate-600">
                  Ctrl + Enter to send
                </span>
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handlePromptKeyDown}
                placeholder="Ask Gemini something..."
                rows={9}
                disabled={loading}
                className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-600 focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <div className="mt-2 text-right text-xs text-slate-600">
                {prompt.length} characters
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-300">
                <div className="font-semibold">
                  Request Error
                </div>

                <div className="mt-1 text-red-400">
                  {error}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={sendRequest}
                disabled={loading}
                className="flex-1 rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                    Sending...
                  </span>
                ) : (
                  "Send Request"
                )}
              </button>

              <button
                onClick={clearPlayground}
                disabled={loading}
                className="rounded-lg border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear
              </button>
            </div>
          </section>

          {/* Response */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">

            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Response
                </h2>

                {statusCode && (
                  <span
                    className={`rounded-md border px-2 py-1 text-xs font-medium ${
                      statusCode >= 200 && statusCode < 300
                        ? "border-green-900 bg-green-950/40 text-green-400"
                        : "border-red-900 bg-red-950/40 text-red-400"
                    }`}
                  >
                    {statusCode >= 200 && statusCode < 300
                      ? `${statusCode} OK`
                      : `${statusCode} ERROR`}
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-slate-400">
                AI response will appear here.
              </p>
            </div>

            {/* Response Box */}
            <div className="min-h-[330px] rounded-lg border border-slate-800 bg-slate-950 p-5">

              {loading ? (
                <div className="flex min-h-[290px] flex-col items-center justify-center text-center">
                  <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />

                  <p className="text-sm text-slate-400">
                    Generating response...
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    Google Gemini is processing your request
                  </p>
                </div>
              ) : response ? (
                <div className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                  {response}
                </div>
              ) : (
                <div className="flex min-h-[290px] items-center justify-center text-center text-slate-600">
                  <div>
                    <p className="text-sm">
                      Send a request to see the AI response.
                    </p>

                    <p className="mt-2 text-xs text-slate-700">
                      Your response will appear here.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Metadata */}
            {response && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <p className="text-xs text-slate-600">
                    Status
                  </p>

                  <p className="mt-1 text-sm font-semibold text-green-400">
                    {statusCode || 200}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <p className="text-xs text-slate-600">
                    Response
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-300">
                    {responseTime !== null
                      ? `${responseTime} ms`
                      : "-"}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <p className="text-xs text-slate-600">
                    Provider
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-slate-300">
                    {responseProvider || "Google Gemini"}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <p className="text-xs text-slate-600">
                    Model
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-slate-300">
                    {responseModel || model}
                  </p>
                </div>

              </div>
            )}

          </section>
        </div>

        {/* Endpoint Info */}
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
                API Endpoint
              </p>

              <code className="mt-1 block text-sm text-slate-400">
                POST /api/ai/generate
              </code>
            </div>

            <div className="text-xs text-slate-600">
              API key secured server-side
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}