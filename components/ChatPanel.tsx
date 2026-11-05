"use client";
import { useState } from "react";

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
}

export default function ChatPanel({
  videoAId,
  videoBId,
}: ChatPanelProps) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!question.trim() || loading) return;

    const userQuestion = question.trim();

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userQuestion },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`rounded-lg p-4 ${
              message.role === "user"
                ? "ml-auto bg-blue-100"
                : "mr-auto bg-gray-100"
            }`}
          >
            <p className="whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
        ))}

        {loading && (
          <p className="text-sm text-gray-500">
            Analyzing videos...
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="Ask something about these videos..."
          className="flex-1 rounded-lg border p-3"
        />

        <button
          onClick={sendMessage}
          disabled={loading || !question.trim()}
          className="rounded-lg bg-blue-600 px-5 text-white disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${String(secs).padStart(2, "0")}`;
};