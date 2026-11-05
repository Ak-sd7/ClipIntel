"use client";
import Nav from "@/components/Nav";
import { useEffect, useRef, useState } from "react";
import type { SubmitEvent } from "react";
import { AnalyzeResponse } from "./api/videos/analyze/route";
import ChatPanel from "@/components/ChatPanel";

interface UrlPair {
  url1: string;
  url2: string;
}

const formatElapsed = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 disabled:text-slate-500";

function UrlField(props: {
  id: string;
  label: string;
  dot: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={props.id}
        className="flex items-center gap-2 text-sm font-medium text-slate-800"
      >
        <span className={`h-2 w-2 rounded-full ${props.dot}`} />
        {props.label}
      </label>
      <input
        id={props.id}
        name={props.id}
        type="url"
        placeholder="https://..."
        required
        value={props.value}
        disabled={props.disabled}
        onChange={(e) => props.onChange(e.target.value)}
        className={inputClass}
      />
    </div>
  );
}

export default function Home() {
  const [urls, setUrls] = useState<UrlPair>({ url1: "", url2: "" });
  const [analyzed, setAnalyzed] = useState<UrlPair | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(0);
  const [error, setError] = useState("");

  const chatRef = useRef<HTMLDivElement>(null);

  const videoAId = result?.videos?.videoA?.id;
  const videoBId = result?.videos?.videoB?.id;
  const hasSession = Boolean(videoAId && videoBId);

  const showForm = !hasSession || editing;

  useEffect(() => {
    if (!loading) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [loading]);

  const elapsed = loading ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0;

  useEffect(() => {
    if (videoAId && videoBId) {
      chatRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [videoAId, videoBId]);

  const submitHandler = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    const submitted = { ...urls };
    const start = Date.now();
    setStartedAt(start);
    setNow(start);
    setLoading(true);
    setError("");

    try {
      const resp = await fetch("/api/videos/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitted),
      });

      const json = await resp.json();

      if (!resp.ok) {
        setError(json.message ?? "Unable to analyze these videos.");
        return;
      }

      // Swap in the new session only after it succeeds, so a failed
      // re-analysis never takes away the chat the person already has.
      setResult(json);
      setAnalyzed(submitted);
      setEditing(false);
    } catch {
      setError("Request failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const cancelEditing = () => {
    if (analyzed) setUrls(analyzed);
    setError("");
    setEditing(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans">
      <Nav />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
        {showForm ? (
          <section>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {hasSession ? "Change videos" : "Compare two clips"}
            </h1>
            <p className="mt-1.5 text-sm text-slate-600">
              {hasSession
                ? "Your current chat stays available until the new analysis finishes."
                : "Paste two video links. Once they\u2019re analyzed, you can ask questions about both."}
            </p>

            <form
              onSubmit={submitHandler}
              className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <UrlField
                id="url1"
                label="Video A"
                dot="bg-indigo-500"
                value={urls.url1}
                disabled={loading}
                onChange={(url1) => setUrls((u) => ({ ...u, url1 }))}
              />
              <UrlField
                id="url2"
                label="Video B"
                dot="bg-amber-500"
                value={urls.url2}
                disabled={loading}
                onChange={(url2) => setUrls((u) => ({ ...u, url2 }))}
              />

              <div className="mt-1 flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
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
                  {loading ? "Analyzing..." : "Analyze videos"}
                </button>

                {hasSession && (
                  <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={loading}
                    className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {loading && (
                <div role="status" className="flex flex-col gap-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full w-full animate-pulse rounded-full bg-indigo-500" />
                  </div>
                  <p className="flex justify-between text-xs text-slate-500">
                    <span>
                      This usually takes about a minute. Keep this tab open.
                    </span>
                    <span className="tabular-nums">
                      {formatElapsed(elapsed)}
                    </span>
                  </p>
                </div>
              )}

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
        ) : (
          <section
            aria-label="Current videos"
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <p className="flex items-center gap-2 text-sm text-slate-700">
                <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                <span className="truncate">{analyzed?.url1}</span>
              </p>
              <p className="flex items-center gap-2 text-sm text-slate-700">
                <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                <span className="truncate">{analyzed?.url2}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Change videos
            </button>
          </section>
        )}

        {videoAId && videoBId && (
          <div
            ref={chatRef}
            aria-busy={loading}
            className={`scroll-mt-20 transition-opacity duration-300 motion-reduce:transition-none ${
              loading ? "pointer-events-none opacity-50" : "opacity-100"
            }`}
          >
            <ChatPanel
              key={`${videoAId}-${videoBId}`}
              videoAId={videoAId}
              videoBId={videoBId}
            />
          </div>
        )}

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