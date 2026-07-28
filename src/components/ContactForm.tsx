"use client";

import { useState, FormEvent } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !message.trim()) return;
    if (message.length > 1000) {
      setErrorText("Message too long (max 1000 characters)");
      return;
    }

    setStatus("sending");
    setErrorText("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), message: message.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");

      setStatus("success");
      setName("");
      setMessage("");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setStatus("error");
      setErrorText(err instanceof Error ? err.message : "Failed to send");
    }
  };

  return (
    <div
      className="max-w-lg mx-auto p-8 rounded-2xl border"
      style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
    >
      <h3 className="text-lg font-bold mb-2">Send me a message</h3>
      <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
        Your message will be sent to my Discord channel
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border text-sm"
            style={{
              background: "var(--bg-primary)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
            placeholder="Your name"
            required
            maxLength={50}
            disabled={status === "sending"}
          />
        </div>
        <div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border text-sm min-h-[120px] resize-y"
            style={{
              background: "var(--bg-primary)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
            placeholder="Your message..."
            required
            maxLength={1000}
            disabled={status === "sending"}
          />
          <p className="text-xs mt-1 text-right" style={{ color: "var(--text-muted)" }}>
            {message.length}/1000
          </p>
        </div>

        {errorText && (
          <p className="text-xs" style={{ color: "var(--accent-pink)" }}>{errorText}</p>
        )}

        <button
          type="submit"
          disabled={status === "sending" || !name.trim() || !message.trim()}
          className="w-full py-3 rounded-full text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          style={{
            background: status === "success"
              ? "var(--accent-green)"
              : "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))",
            color: "#fff",
          }}
        >
          {status === "sending" && <span className="flex items-center justify-center gap-2"><i className="fa-solid fa-spinner fa-spin"></i> Sending...</span>}
          {status === "success" && <span className="flex items-center justify-center gap-2"><i className="fa-solid fa-check"></i> Sent!</span>}
          {status === "idle" && <span className="flex items-center justify-center gap-2"><i className="fa-brands fa-discord"></i> Send</span>}
          {status === "error" && <span className="flex items-center justify-center gap-2"><i className="fa-solid fa-rotate"></i> Try again</span>}
        </button>
      </form>
    </div>
  );
}
