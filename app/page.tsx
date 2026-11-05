"use client"
import Nav from "@/components/Nav";
import { useState } from "react";
import { AnalyzeResponse } from "./api/videos/analyze/route";
import ChatPanel from "@/components/ChatPanel";

export default function Home() {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  const submitHandler = async (e: { preventDefault: () => void; currentTarget: HTMLFormElement | undefined; }) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const url1: FormDataEntryValue | null = data.get("url1");
    const url2: FormDataEntryValue | null = data.get("url2");
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const resp = await fetch("/api/videos/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url1, url2 }),
      })

      const data = await resp.json();

      if (!resp.ok) {
        setError(data.message ?? "Unable to analyze these videos.");
        return;
      }

      setResult(data);
    } catch {
      setError("Request failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans">
      <Nav />
      <div className="flex flex-1 items-center justify-center font-sans pt-5">
        <form
          onSubmit={submitHandler}
          className="flex flex-col gap-3 w-full max-w-md"
        >
          <input name="url1" type="url" placeholder="First clip URL" className="border rounded px-3 py-2" required />
          <input name="url2" type="url" placeholder="Second clip URL" className="border rounded px-3 py-2" required />
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </div>
      {result?.videos?.videoA.id &&
        result?.videos?.videoB.id && (
        <ChatPanel
          videoAId={result.videos.videoA.id}
          videoBId={result.videos.videoB.id}
        />
      )}
      {result && (
        <pre className="mt-5 w-full max-w-2xl overflow-auto rounded bg-white p-4 text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
