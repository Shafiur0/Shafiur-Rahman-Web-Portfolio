"use client";

import { useEffect, useState } from "react";
import { Inbox, RotateCcw, Trash2 } from "lucide-react";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

export default function MessagesManager({ onDataChange }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/portfolio/messages", { cache: "no-store" });
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setMessages(list);
      onDataChange?.(list);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessage("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const clearInbox = async () => {
    if (!confirm("Clear all messages from inbox?")) return;

    setClearing(true);
    setMessage("");
    try {
      const res = await fetch("/api/portfolio/messages", { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Failed to clear inbox");
      }
      setMessage("Inbox cleared");
      await fetchMessages();
    } catch (error) {
      console.error("Error clearing inbox:", error);
      setMessage("Failed to clear inbox");
    } finally {
      setClearing(false);
    }
  };

  const removeMessage = async (id) => {
    try {
      const res = await fetch(`/api/portfolio/messages?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to remove message");
      }
      await fetchMessages();
    } catch (error) {
      console.error("Error removing message:", error);
      setMessage("Failed to remove message");
    }
  };

  return (
    <section className="rounded-2xl border border-cyan-500/20 bg-[#09152b] p-6 md:p-8">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h3 className="text-2xl font-bold text-white">Message Inbox</h3>
        <button
          onClick={clearInbox}
          disabled={clearing || messages.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-rose-500/40 text-rose-200 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
        >
          <RotateCcw size={14} />
          {clearing ? "Clearing..." : "Clear Inbox"}
        </button>
      </div>

      {message && <p className="text-sm text-cyan-200 mb-3">{message}</p>}

      {loading ? (
        <p className="text-slate-300">Loading messages...</p>
      ) : messages.length === 0 ? (
        <p className="text-slate-400 text-sm">No messages yet. Form submissions will appear here.</p>
      ) : (
        <div className="space-y-3">
          {messages.map((item) => (
            <div
              key={item.id}
              className="rounded-lg bg-[#0f1f3a] border border-cyan-500/10 p-4"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 text-slate-100 font-medium">
                  <Inbox size={14} className="text-cyan-300" />
                  {item.name}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>{item.email}</span>
                  <span>{formatDate(item.created_at)}</span>
                  <button
                    onClick={() => removeMessage(item.id)}
                    className="inline-flex items-center gap-1 text-rose-300 hover:text-rose-200"
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-300 whitespace-pre-wrap">{item.message}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
