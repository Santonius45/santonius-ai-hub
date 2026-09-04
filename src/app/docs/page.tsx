"use client";

import { useState } from "react";
import Link from "next/link";

const curlCode = `curl -X POST http://localhost:3000/api/ai/generate \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "provider": "gemini",
    "prompt": "Explain computer vision in simple terms."
  }'`;

const javascriptCode = `const response = await fetch(
  "https://YOUR_DOMAIN/api/ai/generate",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer YOUR_API_KEY"
    },
    body: JSON.stringify({
      provider: "gemini",
      prompt: "Explain computer vision in simple terms."
    })
  }
);

const data = await response.json();

console.log(data);`;

const pythonCode = `import requests

url = "https://YOUR_DOMAIN/api/ai/generate"

headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY"
}

payload = {
    "provider": "gemini",
    "prompt": "Explain computer vision in simple terms."
}

response = requests.post(
    url,
    headers=headers,
    json=payload
)

print(response.json())`;

const requestCode = `{
  "provider": "gemini",
  "prompt": "Explain computer vision in simple terms."
}`;

const responseCode = `{
  "success": true,
  "provider": "Google Gemini",
  "model": "gemini-2.5-flash",
  "response": "Computer vision is a field of AI..."
}`;

const errorCode = `{
  "success": false,
  "error": "Invalid API key."
}`;

export default function DocsPage() {
  const [copied, setCopied] = useState("");

  async function copyCode(code: string, name: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(name);

      setTimeout(() => {
        setCopied("");
      }, 1800);
    } catch {
      setCopied("");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight"
          >
            Santonius<span className="text-cyan-400">AI</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <Link
              href="/dashboard"
              className="transition hover:text-white"
            >
              Dashboard
            </Link>

            <Link
              href="/api-hub"
              className="transition hover:text-white"
            >
              API Hub
            </Link>

            <Link
              href="/dashboard/api-keys"
              className="transition hover:text-white"
            >
              API Keys
            </Link>

            <span className="font-medium text-cyan-400">
              Docs
            </span>
          </nav>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* SIDEBAR */}
        <aside className="sticky top-[73px] hidden h-[calc(100vh-73px)] w-64 shrink-0 border-r border-white/10 py-8 lg:block">
          <div className="pr-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Documentation
            </p>

            <nav className="space-y-1 text-sm">
              <a
                href="#introduction"
                className="block rounded-lg px-3 py-2 text-cyan-400 hover:bg-white/5"
              >
                Introduction
              </a>

              <a
                href="#authentication"
                className="block rounded-lg px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-white"
              >
                Authentication
              </a>

              <a
                href="#endpoint"
                className="block rounded-lg px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-white"
              >
                API Endpoint
              </a>

              <a
                href="#request"
                className="block rounded-lg px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-white"
              >
                Request Body
              </a>

              <a
                href="#response"
                className="block rounded-lg px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-white"
              >
                Response
              </a>

              <a
                href="#examples"
                className="block rounded-lg px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-white"
              >
                Code Examples
              </a>

              <a
                href="#errors"
                className="block rounded-lg px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-white"
              >
                Errors
              </a>
            </nav>
          </div>
        </aside>

        {/* CONTENT */}
        <section className="min-w-0 flex-1 px-6 py-12 md:px-10 lg:px-14">
          {/* INTRO */}
          <div id="introduction" className="scroll-mt-28">
            <div className="mb-5 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
              Santonius AI API v1
            </div>

            <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-5xl">
              Santonius AI API
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">
              Build AI-powered applications with a simple API.
              Santonius AI provides a unified interface for
              accessing multiple AI providers from one platform.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <div className="text-2xl">⚡</div>
                <h3 className="mt-3 font-semibold">
                  Simple API
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  One endpoint for AI text generation.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <div className="text-2xl">🔐</div>
                <h3 className="mt-3 font-semibold">
                  Secure Keys
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  Authenticate requests using API keys.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <div className="text-2xl">🤖</div>
                <h3 className="mt-3 font-semibold">
                  Multiple AI
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  Use Gemini and OpenAI through one API.
                </p>
              </div>
            </div>
          </div>

          {/* AUTH */}
          <div
            id="authentication"
            className="mt-20 scroll-mt-28"
          >
            <h2 className="text-2xl font-bold">
              Authentication
            </h2>

            <p className="mt-4 leading-7 text-slate-400">
              Every external API request must include a valid
              Santonius API key in the Authorization header.
            </p>

            <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-5">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Authorization
              </p>

              <code className="mt-3 block text-sm text-cyan-300">
                Authorization: Bearer YOUR_API_KEY
              </code>
            </div>

            <div className="mt-5 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-5">
              <p className="font-semibold text-yellow-300">
                🔐 Keep your API key private
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Never expose your API key in frontend JavaScript,
                public repositories, screenshots, or client-side
                applications. Store it securely as an environment
                variable on your server.
              </p>
            </div>
          </div>

          {/* ENDPOINT */}
          <div
            id="endpoint"
            className="mt-20 scroll-mt-28"
          >
            <h2 className="text-2xl font-bold">
              API Endpoint
            </h2>

            <div className="mt-6 overflow-hidden rounded-xl border border-white/10">
              <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.03] px-5 py-4">
                <span className="rounded-md bg-green-500/10 px-2 py-1 text-xs font-bold text-green-400">
                  POST
                </span>

                <code className="text-sm text-slate-200">
                  /api/ai/generate
                </code>
              </div>

              <div className="p-5">
                <p className="text-sm leading-6 text-slate-400">
                  Generates an AI response using the selected
                  provider and model.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-3 text-sm font-medium text-slate-300">
                Example URL
              </p>

              <div className="rounded-xl border border-white/10 bg-black/30 p-5">
                <code className="break-all text-sm text-cyan-300">
                  https://YOUR_DOMAIN/api/ai/generate
                </code>
              </div>
            </div>
          </div>

          {/* REQUEST */}
          <div
            id="request"
            className="mt-20 scroll-mt-28"
          >
            <h2 className="text-2xl font-bold">
              Request Body
            </h2>

            <p className="mt-4 text-slate-400">
              Send a JSON object containing the AI provider and
              your prompt.
            </p>

            <div className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-black/30">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                <span className="text-xs text-slate-500">
                  JSON
                </span>

                <button
                  onClick={() =>
                    copyCode(requestCode, "request")
                  }
                  className="text-xs text-slate-400 hover:text-white"
                >
                  {copied === "request" ? "Copied!" : "Copy"}
                </button>
              </div>

              <pre className="overflow-x-auto p-5 text-sm leading-7 text-cyan-300">
                <code>{requestCode}</code>
              </pre>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-white/10">
              <div className="grid grid-cols-3 border-b border-white/10 bg-white/[0.03] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <span>Parameter</span>
                <span>Type</span>
                <span>Required</span>
              </div>

              <div className="grid grid-cols-3 border-b border-white/10 px-5 py-4 text-sm">
                <code className="text-cyan-300">
                  provider
                </code>
                <span className="text-slate-400">string</span>
                <span className="text-green-400">Yes</span>
              </div>

              <div className="grid grid-cols-3 px-5 py-4 text-sm">
                <code className="text-cyan-300">
                  prompt
                </code>
                <span className="text-slate-400">string</span>
                <span className="text-green-400">Yes</span>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold">
                Supported providers
              </h3>

              <div className="mt-3 flex flex-wrap gap-3">
                <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300">
                  gemini
                </span>

                <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300">
                  openai
                </span>
              </div>
            </div>
          </div>

          {/* RESPONSE */}
          <div
            id="response"
            className="mt-20 scroll-mt-28"
          >
            <h2 className="text-2xl font-bold">
              Response
            </h2>

            <p className="mt-4 text-slate-400">
              A successful request returns the provider, model,
              and generated AI response.
            </p>

            <div className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-black/30">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                <span className="text-xs text-slate-500">
                  200 OK
                </span>

                <button
                  onClick={() =>
                    copyCode(responseCode, "response")
                  }
                  className="text-xs text-slate-400 hover:text-white"
                >
                  {copied === "response" ? "Copied!" : "Copy"}
                </button>
              </div>

              <pre className="overflow-x-auto p-5 text-sm leading-7 text-green-300">
                <code>{responseCode}</code>
              </pre>
            </div>
          </div>

          {/* EXAMPLES */}
          <div
            id="examples"
            className="mt-20 scroll-mt-28"
          >
            <h2 className="text-2xl font-bold">
              Code Examples
            </h2>

            <p className="mt-4 text-slate-400">
              Use Santonius AI from your preferred programming
              language.
            </p>

            {/* CURL */}
            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">
                  cURL
                </h3>

                <button
                  onClick={() => copyCode(curlCode, "curl")}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  {copied === "curl" ? "Copied!" : "Copy"}
                </button>
              </div>

              <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30">
                <pre className="overflow-x-auto p-5 text-sm leading-7 text-cyan-300">
                  <code>{curlCode}</code>
                </pre>
              </div>
            </div>

            {/* JAVASCRIPT */}
            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">
                  JavaScript
                </h3>

                <button
                  onClick={() =>
                    copyCode(javascriptCode, "javascript")
                  }
                  className="text-xs text-slate-400 hover:text-white"
                >
                  {copied === "javascript"
                    ? "Copied!"
                    : "Copy"}
                </button>
              </div>

              <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30">
                <pre className="overflow-x-auto p-5 text-sm leading-7 text-cyan-300">
                  <code>{javascriptCode}</code>
                </pre>
              </div>
            </div>

            {/* PYTHON */}
            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">
                  Python
                </h3>

                <button
                  onClick={() =>
                    copyCode(pythonCode, "python")
                  }
                  className="text-xs text-slate-400 hover:text-white"
                >
                  {copied === "python" ? "Copied!" : "Copy"}
                </button>
              </div>

              <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30">
                <pre className="overflow-x-auto p-5 text-sm leading-7 text-cyan-300">
                  <code>{pythonCode}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* ERRORS */}
          <div
            id="errors"
            className="mt-20 scroll-mt-28"
          >
            <h2 className="text-2xl font-bold">
              Errors
            </h2>

            <p className="mt-4 text-slate-400">
              Errors are returned as JSON with an appropriate
              HTTP status code.
            </p>

            <div className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-black/30">
              <pre className="overflow-x-auto p-5 text-sm leading-7 text-red-300">
                <code>{errorCode}</code>
              </pre>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-white/10">
              <div className="grid grid-cols-3 border-b border-white/10 bg-white/[0.03] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <span>Status</span>
                <span>Meaning</span>
                <span>Example</span>
              </div>

              <div className="grid grid-cols-3 border-b border-white/10 px-5 py-4 text-sm">
                <span className="text-red-400">400</span>
                <span className="text-slate-400">
                  Bad Request
                </span>
                <span className="text-slate-300">
                  Missing prompt
                </span>
              </div>

              <div className="grid grid-cols-3 border-b border-white/10 px-5 py-4 text-sm">
                <span className="text-red-400">401</span>
                <span className="text-slate-400">
                  Unauthorized
                </span>
                <span className="text-slate-300">
                  Invalid API key
                </span>
              </div>

              <div className="grid grid-cols-3 px-5 py-4 text-sm">
                <span className="text-red-400">500</span>
                <span className="text-slate-400">
                  Server Error
                </span>
                <span className="text-slate-300">
                  AI provider error
                </span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-20 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-8">
            <h2 className="text-2xl font-bold">
              Ready to build?
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-slate-400">
              Create an API key and start integrating Santonius AI
              into your application.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard/api-keys"
                className="rounded-lg bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Create API Key
              </Link>

              <Link
                href="/api-hub"
                className="rounded-lg border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                Open API Hub
              </Link>
            </div>
          </div>

          {/* FOOTER */}
          <footer className="mt-20 border-t border-white/10 py-8 text-center text-sm text-slate-500">
            © 2026 Santonius AI · AI Developer Platform
          </footer>
        </section>
      </div>
    </main>
  );
}