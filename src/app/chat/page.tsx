"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface ChatMsg {
  id: string;
  content: string;
  author: { name: string; avatar: string | null };
  timestamp: string;
}

interface ServerPreview {
  name: string;
  icon: string | null;
  memberCount: number;
  onlineCount: number;
  online: boolean;
  configured: boolean;
  description: string | null;
}

export default function ChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [sendStatus, setSendStatus] = useState<"idle" | "sent" | "error">("idle");
  const [preview, setPreview] = useState<ServerPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeConfirmed, setPurgeConfirmed] = useState(false);
  const [purging, setPurging] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [queueDepth, setQueueDepth] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const DISCORD_INVITE = "https://dsc.gg/rizer001-development";
  const isAdmin = session?.user?.role === "admin";

  // Cooldown timer: every 2s cooldown decreases by 1
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 2000);
    return () => clearInterval(interval);
  }, [cooldown > 0]);

  // Fetch queue depth periodically
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/discord/send");
        if (res.ok) {
          const data = await res.json();
          setQueueDepth(data.queueDepth ?? 0);
        }
      } catch {}
    }, 2000);
    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    fetchMessages();
    fetchPreview();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/chat/messages");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setMessages(Array.isArray(data.messages) ? data.messages : []);
      setTotalCount(data.totalCount ?? 0);
    } catch {
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const fetchPreview = async () => {
    setPreviewLoading(true);
    try {
      const res = await fetch("/api/discord/preview");
      if (res.ok) {
        const data = await res.json();
        setPreview(data);
      }
    } catch {} finally {
      setPreviewLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending || cooldown > 0) return;

    setSending(true);
    setSendStatus("idle");
    try {
      const res = await fetch("/api/discord/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input.trim() }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();

      if (data.queued) {
        // Message queued
        setQueueDepth(data.queueDepth ?? 1);
        setSendStatus("sent");
        setInput("");
        setTimeout(() => setSendStatus("idle"), 3000);
      } else {
        if (data.message) setMessages((prev) => [...prev, data.message]);
        if (data.totalCount !== undefined) setTotalCount(data.totalCount);
        if (data.queueDepth !== undefined) setQueueDepth(data.queueDepth);
        setSendStatus("sent");
        setInput("");
        setTimeout(() => setSendStatus("idle"), 3000);

        // Add cooldown: +1s per sent message (minimum 1)
        setCooldown((prev) => prev + 1);
      }
    } catch {
      setSendStatus("error");
      setTimeout(() => setSendStatus("idle"), 3000);
    } finally {
      setSending(false);
    }
  };

  const handlePurge = async () => {
    if (!purgeConfirmed) return;
    setPurging(true);
    try {
      const res = await fetch("/api/chat/messages", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setMessages([]);
      setTotalCount(0);
      setShowPurgeModal(false);
      setPurgeConfirmed(false);
    } catch {
      alert("Failed to clear history");
    } finally {
      setPurging(false);
    }
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto" style={{ maxWidth: "1050px" }}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(88,101,242,0.15), rgba(124,58,237,0.15))",
              color: "#5865f2",
              border: "2px solid rgba(88,101,242,0.2)",
            }}
          >
            <i className="fa-brands fa-discord"></i>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold gradient-text">Discord</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              rizer001 community — message history
            </p>
          </div>
          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noopener"
            className="ml-auto hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
            style={{
              background: "#5865f2", color: "#fff",
              boxShadow: "0 4px 15px rgba(88,101,242,0.3)",
            }}
          >
            <i className="fa-brands fa-discord"></i> Join
          </a>
        </div>

        {/* Server Preview Card */}
        <a href={DISCORD_INVITE} target="_blank" rel="noopener" className="block mb-10 group">
          <div
            className="rounded-2xl border overflow-hidden transition-all hover:scale-[1.01] hover:-translate-y-1"
            style={{ background: "linear-gradient(135deg, rgba(88,101,242,0.08), rgba(124,58,237,0.05))", borderColor: "rgba(88,101,242,0.2)" }}
          >
            <div className="flex items-center gap-5 p-6">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl overflow-hidden transition-transform group-hover:scale-105"
                style={{ background: preview?.icon ? "transparent" : "linear-gradient(135deg, #5865f2, var(--accent-purple))", color: "#fff" }}
              >
                {preview?.icon ? <img src={preview.icon} alt="" className="w-full h-full object-cover" /> : <i className="fa-brands fa-discord"></i>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-extrabold truncate">{preview?.name || "Discord Server"}</h2>
                  <span
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
                    style={{
                      background: previewLoading ? "var(--bg-primary)" : preview?.configured && preview?.online ? "rgba(16,185,129,0.12)" : preview?.configured && !preview?.online ? "rgba(239,68,68,0.12)" : "var(--bg-primary)",
                      color: previewLoading ? "var(--text-muted)" : preview?.configured && preview?.online ? "var(--accent-green)" : preview?.configured && !preview?.online ? "var(--accent-pink)" : "var(--text-muted)",
                      border: "1px solid", borderColor: previewLoading ? "var(--border-color)" : preview?.configured && preview?.online ? "rgba(16,185,129,0.25)" : preview?.configured && !preview?.online ? "rgba(239,68,68,0.25)" : "var(--border-color)",
                    }}
                  >
                    {previewLoading ? (<><i className="fa-solid fa-spinner fa-spin text-[10px]"></i> Checking...</>)
                    : preview?.configured && preview?.online ? (<><i className="fa-solid fa-circle text-[8px]"></i> Online</>)
                    : preview?.configured && !preview?.online ? (<><i className="fa-solid fa-circle text-[8px]"></i> Unavailable</>)
                    : (<><i className="fa-solid fa-minus text-[8px]"></i> Not configured</>)}
                  </span>
                </div>
                {preview?.description && <p className="text-sm mb-2 line-clamp-1" style={{ color: "var(--text-secondary)" }}>{preview.description}</p>}
                <div className="flex items-center gap-4 text-sm" style={{ color: "var(--text-muted)" }}>
                  <span className="flex items-center gap-1.5"><i className="fa-solid fa-user-group text-xs"></i>{previewLoading ? <span>...</span> : <span>{preview?.memberCount || 0}</span>}</span>
                  {preview?.configured && <span className="flex items-center gap-1.5"><i className="fa-solid fa-signal text-xs" style={{ color: preview?.online ? "var(--accent-green)" : undefined }}></i>{previewLoading ? <span>...</span> : <span>{preview?.onlineCount || 0} online</span>}</span>}
                  <span className="hidden sm:flex items-center gap-1.5 ml-auto"><i className="fa-solid fa-arrow-up-right-from-square text-xs"></i> Open in Discord</span>
                </div>
              </div>
            </div>
          </div>
        </a>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main chat area */}
          <div className="lg:col-span-2">
            {/* Messages */}
            <div
              className="rounded-2xl border overflow-hidden mb-6"
              style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
            >
              <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--border-color)" }}>
                <span className="text-sm font-semibold flex items-center gap-2">
                  <i className="fa-solid fa-hashtag text-xs" style={{ color: "var(--text-muted)" }}></i>
                  message history
                </span>
                <div className="flex items-center gap-2">
                  {isAdmin && messages.length > 0 && (
                    <button
                      onClick={() => { setShowPurgeModal(true); setPurgeConfirmed(false); }}
                      className="text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105"
                      style={{ background: "rgba(236,72,153,0.08)", color: "var(--accent-pink)", border: "1px solid rgba(236,72,153,0.2)" }}
                    >
                      <i className="fa-solid fa-trash-can mr-1"></i>
                      Clear
                    </button>
                  )}
                  <button
                    onClick={fetchMessages}
                    className="text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105"
                    style={{ background: "var(--bg-primary)", color: "var(--text-muted)", border: "1px solid var(--border-color)" }}
                  >
                    <i className="fa-solid fa-rotate mr-1"></i>
                    Refresh
                  </button>
                </div>
              </div>

              <div className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {loading ? (
                  <div className="flex items-center justify-center gap-2 py-16 text-sm" style={{ color: "var(--text-muted)" }}>
                    <i className="fa-solid fa-spinner fa-spin"></i> Loading messages...
                  </div>
                ) : error ? (
                  <div className="py-16 text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl" style={{ background: "rgba(236,72,153,0.1)", color: "var(--accent-pink)" }}>
                      <i className="fa-solid fa-circle-exclamation"></i>
                    </div>
                    <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>{error}</p>
                    <button onClick={fetchMessages} className="px-5 py-2 rounded-full text-sm font-medium transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))", color: "#fff" }}>
                      Try again
                    </button>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl" style={{ background: "rgba(0,212,255,0.1)", color: "var(--accent-cyan)" }}>
                      <i className="fa-solid fa-comment-slash"></i>
                    </div>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>No messages yet</p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Send the first message!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="px-5 py-4 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold overflow-hidden"
                          style={{ background: msg.author.avatar ? "transparent" : "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))", color: "#fff" }}
                        >
                          {msg.author.avatar
                            ? <img src={msg.author.avatar} alt="" className="w-full h-full object-cover" />
                            : msg.author.name.charAt(0).toUpperCase()
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold truncate">{msg.author.name}</span>
                            <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>{formatTime(msg.timestamp)}</span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap break-words" style={{ color: "var(--text-secondary)" }}>{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Send */}
            <div className="rounded-2xl border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
              {session ? (
                <>
                  <form onSubmit={handleSend} className="flex gap-3">
                    <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Write a message..." maxLength={2000}
                      className="flex-1 px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:border-[var(--accent-cyan)]"
                      style={{ background: "var(--bg-primary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                      disabled={sending || cooldown > 0} />
                    <button type="submit" disabled={sending || !input.trim() || cooldown > 0}
                      className="px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: !input.trim() || cooldown > 0 ? "var(--bg-primary)" : "linear-gradient(135deg, #5865f2, var(--accent-purple))",
                        color: !input.trim() || cooldown > 0 ? "var(--text-muted)" : "#fff", border: !input.trim() || cooldown > 0 ? "1px solid var(--border-color)" : "none" }}
                    >
                      {sending ? <i className="fa-solid fa-spinner fa-spin"></i>
                      : sendStatus === "sent" ? <i className="fa-solid fa-check" style={{ color: "var(--accent-green)" }}></i>
                      : sendStatus === "error" ? <i className="fa-solid fa-xmark" style={{ color: "var(--accent-pink)" }}></i>
                      : cooldown > 0 ? <i className="fa-solid fa-hourglass-half"></i>
                      : <i className="fa-solid fa-paper-plane"></i>}
                      <span className="ml-2 hidden sm:inline">
                        {sending ? "Sending..." : sendStatus === "sent" ? "Sent" : sendStatus === "error" ? "Error" : cooldown > 0 ? `${cooldown}s` : "Send"}
                      </span>
                    </button>
                  </form>

                  {/* Cooldown + Queue indicators */}
                  <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
                    <span className="flex items-center gap-1.5">
                      <i className={`fa-solid ${cooldown > 1 ? "fa-hourglass-half" : "fa-circle"}`}
                        style={{ color: cooldown > 1 ? "var(--accent-orange)" : "var(--accent-green)" }}>
                      </i>
                      CD: {cooldown > 1 ? `${cooldown}s` : "1s"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <i className="fa-solid fa-list-ol" style={{ color: queueDepth > 0 ? "var(--accent-cyan)" : undefined }}></i>
                      Queue: {queueDepth}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center py-3">
                  <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
                    <i className="fa-solid fa-lock mr-2" style={{ color: "var(--accent-cyan)" }}></i>
                    Sign in with GitHub to send messages
                  </p>
                  <Link href="/auth/signin" className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105"
                    style={{ background: "#24292f", color: "#fff" }}>
                    <i className="fa-brands fa-github"></i> Sign in with GitHub
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border p-6" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
              <div className="text-4xl mb-4" style={{ color: "#5865f2" }}><i className="fa-brands fa-discord"></i></div>
              <h3 className="text-xl font-extrabold mb-3" style={{ background: "linear-gradient(135deg, #5865f2, var(--accent-purple))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Discord Server
              </h3>
              <p className="text-sm mb-5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Join the server! We discuss development, Minecraft, projects, and just hang out.
              </p>
              <div className="space-y-2.5 mb-6">
                {[{ icon: "fa-headset", text: "Project support" }, { icon: "fa-bullhorn", text: "Updates & announcements" }, { icon: "fa-comments", text: "Chat with the developer" }, { icon: "fa-flask", text: "Test new features" }]
                  .map((f) => (
                    <div key={f.text} className="flex items-center gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                      <i className={`fa-solid ${f.icon}`} style={{ color: "#5865f2", width: "16px" }}></i>
                      <span>{f.text}</span>
                    </div>
                  ))}
              </div>
              <a href={DISCORD_INVITE} target="_blank" rel="noopener"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full text-sm font-bold transition-all hover:scale-105"
                style={{ background: "#5865f2", color: "#fff", boxShadow: "0 4px 15px rgba(88,101,242,0.4)" }}>
                <i className="fa-brands fa-discord"></i> Join
              </a>
            </div>

            {/* Stats */}
            <div className="rounded-2xl border p-6" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
              <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <i className="fa-solid fa-chart-simple" style={{ color: "var(--accent-cyan)" }}></i>
                Statistics
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: "var(--text-secondary)" }}>Messages sent</span>
                  <span className="font-bold gradient-text">{totalCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: "var(--text-secondary)" }}>Showing</span>
                  <span className="font-bold text-xs" style={{ color: "var(--text-muted)" }}>{messages.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: "var(--text-secondary)" }}>Server</span>
                  <span className="font-bold text-xs" style={{ color: "var(--text-muted)" }}>
                    {previewLoading ? <span>...</span>
                    : preview?.configured && preview?.online ? <span style={{ color: "var(--accent-green)" }}>Available</span>
                    : preview?.configured && !preview?.online ? <span style={{ color: "var(--accent-pink)" }}>Unavailable</span>
                    : <span>Not configured</span>}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: "var(--text-secondary)" }}>Webhook</span>
                  <span className="font-bold text-xs" style={{ color: "var(--text-muted)" }}>
                    {totalCount > 0 ? <span style={{ color: "var(--accent-green)" }}>Active</span> : "Not configured"}
                  </span>
                </div>
              </div>
            </div>

            {/* Purge (admin only, in sidebar) */}
            {isAdmin && totalCount > 0 && (
              <button
                onClick={() => { setShowPurgeModal(true); setPurgeConfirmed(false); }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-semibold border transition-all hover:scale-105"
                style={{ borderColor: "rgba(236,72,153,0.3)", color: "var(--accent-pink)" }}
              >
                <i className="fa-solid fa-trash-can"></i>
                Clear history
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Purge Confirmation Modal */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6" onClick={() => setShowPurgeModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md p-8 rounded-3xl border z-10"
            style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning icon */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl"
              style={{ background: "rgba(236,72,153,0.12)", color: "var(--accent-pink)", border: "2px solid rgba(236,72,153,0.2)" }}
            >
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>

            <h2 className="text-xl font-extrabold text-center mb-2" style={{ color: "var(--accent-pink)" }}>
              Clear history?
            </h2>
            <p className="text-sm text-center mb-6" style={{ color: "var(--text-secondary)" }}>
              This action cannot be undone
            </p>

            {/* What will be deleted */}
            <div
              className="p-4 rounded-2xl mb-5 space-y-2"
              style={{ background: "var(--bg-primary)", border: "1px solid var(--border-color)" }}
            >
              <p className="text-xs font-semibold flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                <i className="fa-solid fa-list"></i>
                Will be deleted:
              </p>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>Messages in history</span>
                  <span className="font-bold" style={{ color: "var(--accent-pink)" }}>{totalCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>Send statistics</span>
                  <span className="font-bold" style={{ color: "var(--accent-pink)" }}>Will be reset</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>Discord messages</span>
                  <span style={{ color: "var(--text-muted)" }}>Unaffected</span>
                </div>
              </div>
            </div>

            {/* Checkbox */}
            <label className="flex items-start gap-3 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={purgeConfirmed}
                onChange={(e) => setPurgeConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-[var(--accent-pink)]"
              />
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                I understand that {totalCount} message{totalCount !== 1 ? "s" : ""} will be permanently deleted and statistics will be reset
              </span>
            </label>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowPurgeModal(false)}
                className="flex-1 py-3 rounded-full text-sm font-semibold transition-all hover:scale-105"
                style={{ background: "var(--bg-primary)", color: "var(--text-secondary)", border: "1px solid var(--border-color)" }}
              >
                Cancel
              </button>
              <button
                onClick={handlePurge}
                disabled={!purgeConfirmed || purging}
                className="flex-1 py-3 rounded-full text-sm font-semibold transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: !purgeConfirmed ? "var(--bg-primary)" : "linear-gradient(135deg, var(--accent-pink), #ef4444)",
                  color: !purgeConfirmed ? "var(--text-muted)" : "#fff",
                  border: !purgeConfirmed ? "1px solid var(--border-color)" : "none",
                }}
              >
                {purging ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Clearing...</> : "Clear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
