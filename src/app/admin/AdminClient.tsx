"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Author {
  name: string | null;
  image: string | null;
}

interface NewsItem {
  id: string;
  title: string;
  content: string;
  slug: string;
  published: boolean;
  syncedToDiscord: boolean;
  discordMessageId: string | null;
  createdAt: string;
  author: Author;
}

interface DiscordMsg {
  id: string;
  content: string;
  authorName: string | null;
  createdAt: string;
}

interface AdminClientProps {
  adminUser: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  initialNews: NewsItem[];
  initialDiscordMessages: DiscordMsg[];
}

export default function AdminClient({ adminUser, initialNews, initialDiscordMessages }: AdminClientProps) {
  const [activeTab, setActiveTab] = useState<"news" | "discord" | "github" | "users">("news");
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", published: true });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setNews((prev) => [data, ...prev]);
      setShowForm(false);
      setForm({ title: "", content: "", published: true });
    } catch (err) {
      alert("Error: " + (err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete news article?")) return;
    try {
      const res = await fetch(`/api/news?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setNews((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      alert("Error: " + (err as Error).message);
    }
  };

  const handleTogglePublish = async (item: NewsItem) => {
    try {
      const res = await fetch("/api/news", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, published: !item.published }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setNews((prev) => prev.map((n) => (n.id === item.id ? { ...n, published: !n.published } : n)));
    } catch (err) {
      alert("Error: " + (err as Error).message);
    }
  };

  return (
    <div className="px-6 py-8">
      <div className="mx-auto" style={{ maxWidth: "1100px" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold gradient-text">Admin Panel</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              {adminUser.name || "Admin"}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b pb-4" style={{ borderColor: "var(--border-color)" }}>
          {[
            { key: "news" as const, label: "News", icon: "fa-newspaper" },
            { key: "discord" as const, label: "Discord", icon: "fa-discord" },
            { key: "users" as const, label: "Users", icon: "fa-users" },
            { key: "github" as const, label: "GitHub Logs", icon: "fa-code-branch" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: activeTab === tab.key
                  ? "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))"
                  : "var(--bg-card)",
                color: activeTab === tab.key ? "#fff" : "var(--text-secondary)",
                border: activeTab === tab.key ? "none" : "1px solid var(--border-color)",
              }}
            >
              <i className={`fa-solid ${tab.icon}`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB: News */}
        {activeTab === "news" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Manage News</h2>
              <button
                onClick={() => { setShowForm(!showForm); setEditing(null); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))",
                  color: "#fff",
                }}
              >
                <i className={`fa-solid ${showForm ? "fa-times" : "fa-plus"}`}></i>
                {showForm ? "Cancel" : "New Article"}
              </button>
            </div>

            {/* Create Form */}
            {showForm && (
              <form
                onSubmit={handleCreate}
                className="p-6 rounded-2xl border mb-8"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
              >
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">Title</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border text-sm"
                    style={{
                      background: "var(--bg-primary)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                    placeholder="News title"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">Content</label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border text-sm min-h-[150px]"
                    style={{
                      background: "var(--bg-primary)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                    placeholder="News content..."
                    required
                  />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="published"
                    checked={form.published}
                    onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  />
                  <label htmlFor="published" className="text-sm">Publish immediately</label>
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-full text-sm font-semibold"
                  style={{
                    background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))",
                    color: "#fff",
                  }}
                >
                  Create
                </button>
              </form>
            )}

            {/* News List */}
            <div className="space-y-3">
              {news.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-5 rounded-2xl border"
                  style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-sm truncate">{item.title}</h3>
                      {!item.published && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(245, 158, 11, 0.2)", color: "var(--accent-orange)" }}
                        >
                          Draft
                        </span>
                      )}
                      {item.syncedToDiscord && (
                        <i className="fa-brands fa-discord text-xs" style={{ color: "#5865f2" }}></i>
                      )}
                    </div>
                    <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                      {new Date(item.createdAt).toLocaleDateString("en-US")} · {item.author.name || "Author"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleTogglePublish(item)}
                      className="px-4 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-105"
                      style={{ borderColor: "var(--border-color)" }}
                      title={item.published ? "Unpublish" : "Publish"}
                    >
                      <i className={`fa-solid ${item.published ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-4 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-105"
                      style={{ borderColor: "rgba(236, 72, 153, 0.3)", color: "var(--accent-pink)" }}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}

              {news.length === 0 && (
                <div className="text-center py-10" style={{ color: "var(--text-muted)" }}>
                  <p>No news yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: Discord */}
        {activeTab === "discord" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Discord Management</h2>
              <Link
                href="/chat"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))",
                  color: "#fff",
                }}
              >
                <i className="fa-solid fa-comment"></i>
                Open Chat
              </Link>
            </div>

            {/* Webhook config */}
            <DiscordWebhookConfig />

            {/* Send test message */}
            <DiscordSendPanel />

            {/* Recent Discord Messages */}
            <h3 className="font-semibold mb-4 mt-8">Recent Messages</h3>
            <div className="space-y-3">
              {initialDiscordMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-4 rounded-xl border"
                  style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
                >
                  <p className="text-sm mb-2">{msg.content.slice(0, 200)}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {msg.authorName} · {new Date(msg.createdAt).toLocaleString("en-US")}
                  </p>
                </div>
              ))}
              {initialDiscordMessages.length === 0 && (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  No messages. Set up the Discord bot.
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB: Users */}
        {activeTab === "users" && (
          <UsersList currentUserId={adminUser.id} />
        )}

        {/* TAB: GitHub */}
        {activeTab === "github" && (
          <div>
            <h2 className="text-xl font-bold mb-6">GitHub Activity</h2>
            <GitHubLogs />
          </div>
        )}
      </div>
    </div>
  );
}

function DiscordWebhookConfig() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.DISCORD_WEBHOOK_URL) {
          setWebhookUrl(data.DISCORD_WEBHOOK_URL);
        }
      }
    } catch {}
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "DISCORD_WEBHOOK_URL", value: webhookUrl }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="p-6 rounded-2xl border mb-6"
      style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
    >
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <i className="fa-solid fa-link" style={{ color: "var(--accent-cyan)" }}></i>
        Discord Webhook URL
      </h3>
      <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
        Copy the webhook URL from your Discord channel and paste it here
      </p>

      <div className="flex gap-2 mb-4">
        <input
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          placeholder="https://discord.com/api/webhooks/..."
          className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-mono"
          style={{
            background: loading ? "var(--bg-primary)" : "var(--bg-primary)",
            borderColor: "var(--border-color)",
            color: "var(--text-primary)",
          }}
          disabled={loading || saving}
        />
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))",
            color: "#fff",
          }}
        >
          {saving ? (
            <i className="fa-solid fa-spinner fa-spin"></i>
          ) : status === "saved" ? (
            <i className="fa-solid fa-check"></i>
          ) : status === "error" ? (
            <i className="fa-solid fa-xmark"></i>
          ) : (
            "Save"
          )}
        </button>
      </div>

      <div className="text-xs space-y-1.5" style={{ color: "var(--text-muted)" }}>
        <p>1. Go to Discord → Edit Channel → Integrations → Webhooks</p>
        <p>2. Create a webhook → copy URL → paste above → Save</p>
        <p>3. If empty — the value from <code className="px-1 py-0.5 rounded" style={{ background: "var(--bg-primary)" }}>.env</code> is used</p>
      </div>
    </div>
  );
}

function DiscordSendPanel() {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/discord/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message.trim() }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("sent");
      setMessage("");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="p-6 rounded-2xl border mb-6"
      style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
    >
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <i className="fa-solid fa-paper-plane" style={{ color: "var(--accent-cyan)" }}></i>
        Send Test Message
      </h3>
      <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
        Send a message to the Discord channel via webhook
      </p>
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message text..."
          className="flex-1 px-4 py-2.5 rounded-xl border text-sm"
          style={{
            background: "var(--bg-primary)",
            borderColor: "var(--border-color)",
            color: "var(--text-primary)",
          }}
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !message.trim()}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, #5865f2, var(--accent-purple))",
            color: "#fff",
          }}
        >
          {sending ? (
            <i className="fa-solid fa-spinner fa-spin"></i>
          ) : status === "sent" ? (
            <i className="fa-solid fa-check"></i>
          ) : status === "error" ? (
            <i className="fa-solid fa-xmark"></i>
          ) : (
            <i className="fa-solid fa-paper-plane"></i>
          )}
          <span className="ml-2">{sending ? "..." : status === "sent" ? "Ok" : status === "error" ? "Error" : "Test"}</span>
        </button>
      </form>
    </div>
  );
}

function UsersList({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [changingId, setChangingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setUsers(data);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setChangingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (data.error) {
        alert("Error: " + data.error);
        return;
      }
      setUsers((prev) =>
        prev!.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch {
      alert("Failed to change role");
    } finally {
      setChangingId(null);
    }
  };

  if (error && users === null) {
    return (
      <div>
        <h2 className="text-xl font-bold mb-6">User Management</h2>
        <div
          className="p-6 rounded-2xl border text-center"
          style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
        >
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>{error}</p>
          <button
            onClick={fetchUsers}
            className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))",
              color: "#fff",
            }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">User Management</h2>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all hover:scale-105"
          style={{
            background: "var(--bg-card)",
            color: "var(--text-muted)",
            border: "1px solid var(--border-color)",
          }}
        >
          <i className={`fa-solid ${loading ? "fa-spinner fa-spin" : "fa-rotate"}`}></i>
          Refresh
        </button>
      </div>

      {loading && users === null ? (
        <div className="flex items-center justify-center py-16 text-sm" style={{ color: "var(--text-muted)" }}>
          <i className="fa-solid fa-spinner fa-spin mr-2"></i>
          Loading users...
        </div>
      ) : users && users.length === 0 ? (
        <div
          className="p-6 rounded-2xl border text-center"
          style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
        >
          <p style={{ color: "var(--text-muted)" }}>No users</p>
        </div>
      ) : users ? (
        <div className="space-y-2">
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            const isOwner = user.role === "owner";
            const isAdmin = user.role === "admin";
            const isStaff = isAdmin || isOwner;
            return (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 rounded-2xl border transition-all"
                style={{
                  background: isSelf ? "rgba(0,212,255,0.03)" : isOwner ? "rgba(236,72,153,0.04)" : "var(--bg-card)",
                  borderColor: isSelf ? "rgba(0,212,255,0.15)" : isOwner ? "rgba(236,72,153,0.2)" : "var(--border-color)",
                }}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold overflow-hidden"
                    style={{
                      background: user.image
                        ? "transparent"
                        : "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))",
                      color: "#fff",
                    }}
                  >
                    {user.image ? (
                      <img src={user.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (user.name || "?").charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate">
                        {user.name || "No name"}
                      </span>
                      {isSelf && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full"
                          style={{
                            background: "rgba(0,212,255,0.15)",
                            color: "var(--accent-cyan)",
                          }}
                        >
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                      <span>{user.email || "No email"}</span>
                      <span>·</span>
                      <span>{user._count?.news || 0} news</span>
                    </div>
                  </div>

                  {/* Role badge */}
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
                    style={{
                      background: isOwner
                        ? "linear-gradient(135deg, rgba(236,72,153,0.2), rgba(239,68,68,0.15))"
                        : isAdmin
                        ? "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15))"
                        : "var(--bg-primary)",
                      color: isOwner ? "var(--accent-pink)" : isAdmin ? "var(--accent-cyan)" : "var(--text-muted)",
                      border: isOwner ? "1px solid rgba(236,72,153,0.3)" : isAdmin ? "1px solid rgba(0,212,255,0.2)" : "1px solid var(--border-color)",
                    }}
                  >
                    {isOwner ? (
                      <><i className="fa-solid fa-crown mr-1"></i>Owner</>
                    ) : isAdmin ? "Admin" : "User"}
                  </span>
                </div>

                {/* Role change button */}
                <div className="ml-4 flex-shrink-0">
                  {isOwner ? (
                    <span
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] cursor-not-allowed"
                      style={{
                        background: "var(--bg-primary)",
                        color: "var(--text-muted)",
                        border: "1px solid var(--border-color)",
                      }}
                      title="Owner role cannot be changed"
                    >
                      <i className="fa-solid fa-lock"></i>
                      Owner
                    </span>
                  ) : isSelf && isAdmin ? (
                    <span
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] cursor-not-allowed"
                      style={{
                        background: "var(--bg-primary)",
                        color: "var(--text-muted)",
                        border: "1px solid var(--border-color)",
                      }}
                      title="Cannot remove admin from yourself"
                    >
                      <i className="fa-solid fa-lock"></i>
                      Cannot self-remove
                    </span>
                  ) : (
                    <button
                      onClick={() =>
                        handleRoleChange(user.id, isAdmin ? "user" : "admin")
                      }
                      disabled={changingId === user.id}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105"
                      style={{
                        background: isAdmin
                          ? "rgba(236,72,153,0.08)"
                          : "rgba(0,212,255,0.08)",
                        color: isAdmin ? "var(--accent-pink)" : "var(--accent-cyan)",
                        border: isAdmin
                          ? "1px solid rgba(236,72,153,0.2)"
                          : "1px solid rgba(0,212,255,0.2)",
                      }}
                    >
                      {changingId === user.id ? (
                        <i className="fa-solid fa-spinner fa-spin"></i>
                      ) : isAdmin ? (
                        <>
                          <i className="fa-solid fa-shield-halved"></i>
                          Remove admin
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-crown"></i>
                          Make admin
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function GitHubLogs() {
  const [repos, setRepos] = useState<any[]>([]);
  const [activeRepo, setActiveRepo] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);

  // Define function first, then use it in useEffect
  const fetchLogs = async (repo: string | null, p: number, reset: boolean) => {
    if (reset) {
      setLoading(true);
      setError("");
      setLogs([]);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams();
      if (repo) params.set("repo", repo);
      params.set("page", String(p));
      params.set("per_page", "10");

      const res = await fetch(`/api/github?${params}`);
      const data = await res.json();

      if (data.error === "rate_limited") {
        setError("⚠️ " + data.message);
        if (reset) {
          setRepos(data.repos || []);
        }
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch");
      }

      if (reset) {
        setRepos(data.repos || []);
        setLogs(data.logs || []);
      } else {
        setLogs((prev) => [...prev, ...(data.logs || [])]);
      }

      setHasMore((data.logs || []).length >= 10);
      setPage(p);
    } catch (err: any) {
      setError(err.message || "Failed to load GitHub logs");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setInitialLoading(false);
    }
  };

  const switchRepo = (repo: string | null) => {
    setActiveRepo(repo);
    fetchLogs(repo, 1, true);
  };

  const loadMore = () => {
    fetchLogs(activeRepo, page + 1, false);
  };

  // Load logs on mount (all, no filter)
  useEffect(() => {
    fetchLogs(null, 1, true);
  }, []);

  const repoIcons: Record<string, string> = {
    PushEvent: "fa-code-commit",
    CreateEvent: "fa-plus-circle",
    IssuesEvent: "fa-circle-exclamation",
    ReleaseEvent: "fa-tag",
    PullRequestEvent: "fa-code-pull-request",
    WatchEvent: "fa-star",
    ForkEvent: "fa-code-fork",
  };

  return (
    <div>
      {/* Actions */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {initialLoading ? "Loading..." : `${repos.length} repositories`}
        </p>
        <button
          onClick={() => switchRepo(activeRepo)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))",
            color: "#fff",
            opacity: loading ? 0.7 : 1,
          }}
        >
          <i className={`fa-solid ${loading ? "fa-spinner fa-spin" : "fa-rotate"}`}></i>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Repo Tabs */}
      {repos.length > 0 && (
        <div
          className="flex gap-1.5 mb-6 overflow-x-auto pb-2 scrollbar-thin"
          style={{ scrollbarWidth: "thin" }}
        >
          <button
            onClick={() => switchRepo(null)}
            className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all hover:scale-105"
            style={{
              background: activeRepo === null
                ? "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))"
                : "var(--bg-card)",
              color: activeRepo === null ? "#fff" : "var(--text-secondary)",
              border: activeRepo === null ? "none" : "1px solid var(--border-color)",
            }}
          >
            <i className="fa-solid fa-layer-group mr-1.5"></i>
            All
          </button>
          {repos.map((r: any) => (
            <button
              key={r.fullName}
              onClick={() => switchRepo(r.fullName)}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all hover:scale-105"
              style={{
                background: activeRepo === r.fullName
                  ? "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))"
                  : "var(--bg-card)",
                color: activeRepo === r.fullName ? "#fff" : "var(--text-secondary)",
                border: activeRepo === r.fullName ? "none" : "1px solid var(--border-color)",
              }}
            >
              <i className="fa-solid fa-folder"></i>
              {r.name}
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="p-5 rounded-2xl border mb-6 flex items-start gap-4"
          style={{
            background: "rgba(236,72,153,0.05)",
            borderColor: "rgba(236,72,153,0.2)",
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: "rgba(236,72,153,0.1)", color: "var(--accent-pink)" }}
          >
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div>
            <p className="text-sm font-semibold mb-1" style={{ color: "var(--accent-pink)" }}>
              GitHub API Error
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{error}</p>
            <button
              onClick={() => switchRepo(activeRepo)}
              className="mt-3 px-4 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))",
                color: "#fff",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && logs.length === 0 && (
        <div className="flex items-center justify-center py-16 gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
          <i className="fa-solid fa-spinner fa-spin"></i>
          Loading activity...
        </div>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <div className="space-y-2">
          {logs.map((log: any) => (
            <a
              key={log.id}
              href={log.url}
              target="_blank"
              rel="noopener"
              className="flex items-start gap-4 p-4 rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
            >
              {/* Event icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm"
                style={{
                  background: log.type === "PushEvent"
                    ? "rgba(16,185,129,0.12)"
                    : log.type === "IssuesEvent"
                    ? "rgba(239,68,68,0.12)"
                    : log.type === "ReleaseEvent"
                    ? "rgba(139,92,246,0.12)"
                    : log.type === "CreateEvent"
                    ? "rgba(59,130,246,0.12)"
                    : "var(--bg-primary)",
                  color: log.type === "PushEvent"
                    ? "var(--accent-green)"
                    : log.type === "IssuesEvent"
                    ? "var(--accent-pink)"
                    : log.type === "ReleaseEvent"
                    ? "var(--accent-purple)"
                    : log.type === "CreateEvent"
                    ? "var(--accent-blue)"
                    : "var(--text-muted)",
                }}
              >
                <i className={`fa-solid ${repoIcons[log.type] || "fa-code"}`}></i>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm mb-0.5">{log.title}</p>
                {log.description && (
                  <p
                    className={`text-xs ${log.commitCount > 1 ? "line-clamp-2" : "truncate"}`}
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {log.commitCount > 1 && (
                      <span
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium mr-1.5"
                        style={{ background: "rgba(16,185,129,0.1)", color: "var(--accent-green)" }}
                      >
                        <i className="fa-solid fa-code-commit"></i>
                        {log.commitCount}
                      </span>
                    )}
                    {log.description}
                  </p>
                )}
                <p className="text-xs mt-1.5 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                  <span className="flex items-center gap-1">
                    <i className="fa-solid fa-calendar"></i>
                    {new Date(log.createdAt).toLocaleDateString("en-US")}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <i className="fa-solid fa-folder"></i>
                    {log.repo?.split("/")[1] || log.repo}
                  </span>
                </p>
              </div>

              <i className="fa-solid fa-arrow-up-right-from-square text-xs mt-2 flex-shrink-0" style={{ color: "var(--text-muted)" }}></i>
            </a>
          ))}
        </div>
      )}

      {/* Page indicator + Load More */}
      {logs.length > 0 && (
        <div className="text-center mt-6">
          {page > 1 && (
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
              Loaded page {page}
            </p>
          )}
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50"
              style={{
                background: "var(--bg-card)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-color)",
              }}
            >
              {loadingMore ? (
                <><i className="fa-solid fa-spinner fa-spin"></i> Loading...</>
              ) : (
                <><i className="fa-solid fa-chevron-down"></i> Next page</>
              )}
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && logs.length === 0 && !initialLoading && (
        <div
          className="p-10 rounded-2xl border text-center"
          style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
            style={{ background: "rgba(0,212,255,0.1)", color: "var(--accent-cyan)" }}
          >
            <i className="fa-solid fa-code-branch"></i>
          </div>
          <p style={{ color: "var(--text-muted)" }}>No GitHub activity</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            In the last 90 days
          </p>
        </div>
      )}
    </div>
  );
}
