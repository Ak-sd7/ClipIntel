"use client";
import Nav from "@/components/Nav";
import { useState } from "react";
import type { FormEvent } from "react";
import { AnalyzeResponse } from "./api/videos/analyze/route";
import ChatPanel from "@/components/ChatPanel";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const url1 = data.get("url1");
    const url2 = data.get("url2");

    setLoading(true);
    setResult(null);
    setError("");

    try {
      const resp = await fetch("/api/videos/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url1, url2 }),
      });

      const json = await resp.json();

      if (!resp.ok) {
        setError(json.message ?? "Unable to analyze these videos.");
        return;
      }

      setResult(json);
    } catch {
      setError("Request failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const videoAId = result?.videos?.videoA?.id;
  const videoBId = result?.videos?.videoB?.id;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans">
      <Nav />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-10">
        {/* Intro + form */}
        <section>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Compare two clips
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Paste two video links. Once they&apos;re analyzed, you can ask
            questions about both.
          </p>

          <form
            onSubmit={submitHandler}
            className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="url1"
                className="flex items-center gap-2 text-sm font-medium text-slate-800"
              >
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                Video A
              </label>
              <input
                id="url1"
                name="url1"
                type="url"
                placeholder="https://..."
                required
                disabled={loading}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="url2"
                className="flex items-center gap-2 text-sm font-medium text-slate-800"
              >
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Video B
              </label>
              <input
                id="url2"
                name="url2"
                type="url"
                placeholder="https://..."
                required
                disabled={loading}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeOpacity="0.3"
                    strokeWidth="3"
                  />
                  <path
                    d="M21 12a9 9 0 00-9-9"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              {loading ? "Analyzing both videos..." : "Analyze videos"}
            </button>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              >
                {error}
              </p>
            )}
          </form>
        </section>

        {/* Chat */}
        {videoAId && videoBId && (
          <ChatPanel videoAId={videoAId} videoBId={videoBId} />
        )}

        {/* Raw response, tucked away for debugging */}
        {result && (
          <details className="group rounded-2xl border border-slate-200 bg-white">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 [&::-webkit-details-marker]:hidden">
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4 transition-transform group-open:rotate-90"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.2 4.2a1 1 0 011.4 0l5 5a1 1 0 010 1.4l-5 5a1 1 0 01-1.4-1.4L11.6 10 7.2 5.6a1 1 0 010-1.4z"
                  clipRule="evenodd"
                />
              </svg>
              Analysis data
            </summary>
            <pre className="max-h-96 overflow-auto border-t border-slate-200 p-4 text-xs leading-relaxed text-slate-700">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        )}
      </main>
    </div>
  );
}