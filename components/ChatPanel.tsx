"use client";
import { useEffect, useRef, useState } from "react";

interface ChatPanelProps {
  videoAId: string;
  videoBId: string;
}

interface ChatSource {
  sourceId: string;
  videoId: string;
  text: string;
  startTime: number;
  endTime: number;
  score: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  isError?: boolean;
}

const SUGGESTIONS = [
  "What are the main differences between these two videos?",
  "What do both videos agree on?",
  "Summarize each video in two sentences.",
];

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

export default function ChatPanel({ videoAId, videoBId }: ChatPanelProps) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Keep the newest message in view
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Grow the textarea with its content (up to a max height)
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [question]);

  const videoLabel = (id: string) =>
    id === videoAId ? "Video A" : id === videoBId ? "Video B" : "Video";

  const sendMessage = async (override?: string) => {
    const userQuestion = (override ?? question).trim();
    if (!userQuestion || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: userQuestion }]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userQuestion,
          videoIds: [videoAId, videoBId],
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Chat request failed");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result.answer,
          sources: result.sources as ChatSource[] | undefined,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          isError: true,
          content:
            error instanceof Error ? error.message : "Something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <section
      aria-label="Chat about your videos"
      className="flex h-[640px] max-h-[85vh] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      {/* Header */}
      <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Ask about your videos
          </h2>
          <p className="text-xs text-slate-500">
            Answers draw on both transcripts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
            Video A
          </span>
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
            Video B
          </span>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => setMessages([])}
              disabled={loading}
              className="ml-1 rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50"
            >
              Clear chat
            </button>
          )}
        </div>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-5 overflow-y-auto bg-slate-50 px-5 py-5"
        aria-live="polite"
      >
        {messages.length === 0 && !loading && (
          <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center text-center">
            <h3 className="text-base font-semibold text-slate-900">
              Compare these videos
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Ask a question, or start with one of these.
            </p>
            <div className="mt-5 flex w-full flex-col gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => sendMessage(suggestion)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => {
          const isUser = message.role === "user";

          return (
            <div
              key={index}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] ${isUser ? "" : "w-full sm:max-w-[80%]"}`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? "rounded-br-md bg-indigo-600 text-white"
                      : message.isError
                        ? "rounded-bl-md border border-red-200 bg-red-50 text-red-800"
                        : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>

                {message.sources && message.sources.length > 0 && (
                  <details className="group mt-2">
                    <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-md px-1 py-0.5 text-xs font-medium text-slate-500 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 [&::-webkit-details-marker]:hidden">
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-3.5 w-3.5 transition-transform group-open:rotate-90"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.2 4.2a1 1 0 011.4 0l5 5a1 1 0 010 1.4l-5 5a1 1 0 01-1.4-1.4L11.6 10 7.2 5.6a1 1 0 010-1.4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {message.sources.length}{" "}
                      {message.sources.length === 1 ? "source" : "sources"}
                    </summary>

                    <ul className="mt-2 space-y-2">
                      {message.sources.map((source) => {
                        const isA = source.videoId === videoAId;
                        return (
                          <li
                            key={source.sourceId}
                            className="rounded-xl border border-slate-200 bg-white p-3"
                          >
                            <div className="mb-1.5 flex items-center gap-2 text-xs">
                              <span
                                className={`rounded-full px-2 py-0.5 font-medium ${
                                  isA
                                    ? "bg-indigo-50 text-indigo-700"
                                    : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {videoLabel(source.videoId)}
                              </span>
                              <span className="tabular-nums text-slate-500">
                                {formatTime(source.startTime)}–
                                {formatTime(source.endTime)}
                              </span>
                            </div>
                            <p className="line-clamp-3 text-xs leading-relaxed text-slate-600">
                              {source.text}
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  </details>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div
              className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3.5"
              role="status"
              aria-label="Analyzing videos"
            >
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-slate-200 bg-white p-3">
        <div className="flex items-end gap-2 rounded-xl border border-slate-300 bg-white p-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
          <textarea
            ref={inputRef}
            value={question}
            rows={1}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask something about these videos..."
            aria-label="Your question"
            className="max-h-[140px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />

          <button
            type="button"
            onClick={() => sendMessage()}
            disabled={loading || !question.trim()}
            aria-label="Send message"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M3.1 3.3a.75.75 0 01.8-.1l13 6.5a.75.75 0 010 1.3l-13 6.5a.75.75 0 01-1.06-.9L4.9 10 2.84 4.2a.75.75 0 01.26-.9zM6.3 10.75l-1.4 4 9.1-4.5-9.1-4.5 1.4 4h4.45a.75.75 0 010 1.5H6.3z" />
            </svg>
          </button>
        </div>
        <p className="mt-1.5 px-1 text-xs text-slate-400">
          Enter to send, Shift+Enter for a new line
        </p>
      </div>
    </section>
  );
}