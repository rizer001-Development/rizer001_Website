"use client";

interface Repo {
  name: string;
  description: string;
  url: string;
  language: string;
  stars: number;
  forks: number;
  watchers: number;
  langColor: string;
  updatedAt: string;
  pushedAt: string;
  topics: string[];
  visibility: string;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

function getRepoStatus(pushedAt: string): { label: string; color: string } {
  const now = new Date();
  const pushed = new Date(pushedAt);
  const daysSince = Math.floor(
    (now.getTime() - pushed.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSince <= 7) return { label: "Active", color: "#3fb950" };
  if (daysSince <= 30) return { label: "Maintained", color: "#d29922" };
  if (daysSince <= 90) return { label: "Stable", color: "#8b949e" };
  return { label: "Archived", color: "#f85149" };
}

export default function ProjectsClient({ repos }: { repos: Repo[] | null }) {
  if (!repos) {
    return (
      <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
        <i className="fa-solid fa-triangle-exclamation text-3xl mb-4" style={{ color: "var(--accent-orange)" }}></i>
        <p className="text-lg font-semibold mb-2">Failed to load repositories</p>
        <a
          href="https://github.com/rizer001?tab=repositories"
          target="_blank"
          rel="noopener"
          className="font-semibold"
          style={{ color: "var(--accent-cyan)" }}
        >
          View on GitHub &rarr;
        </a>
      </div>
    );
  }

  if (!repos.length) {
    return <p className="text-center py-16" style={{ color: "var(--text-muted)" }}>No repositories found</p>;
  }

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "var(--border-color)", background: "var(--bg-card)" }}>
      {/* Table header */}
      <div
        className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-wider border-b"
        style={{
          color: "var(--text-muted)",
          borderColor: "var(--border-color)",
          background: "var(--bg-secondary)",
        }}
      >
        <div className="col-span-4">Name</div>
        <div className="col-span-3">Description</div>
        <div className="col-span-1">Stars</div>
        <div className="col-span-1">Forks</div>
        <div className="col-span-1">Language</div>
        <div className="col-span-1">Status</div>
        <div className="col-span-1">Updated</div>
      </div>

      {/* Repo rows */}
      {repos.map((repo) => {
        const status = getRepoStatus(repo.pushedAt);
        return (
          <a
            key={repo.name}
            href={repo.url}
            target="_blank"
            rel="noopener"
            className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 border-b transition-colors hover:bg-white/5"
            style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}
          >
            {/* Name */}
            <div className="col-span-4 flex items-center gap-2">
              <i className="fa-solid fa-book text-sm" style={{ color: "var(--text-muted)" }}></i>
              <span className="font-semibold truncate">{repo.name}</span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase"
                style={{
                  background: "rgba(0, 212, 255, 0.1)",
                  color: "var(--accent-cyan)",
                  border: "1px solid rgba(0, 212, 255, 0.2)",
                }}
              >
                {repo.visibility}
              </span>
            </div>

            {/* Description */}
            <div className="col-span-3 text-sm line-clamp-2" style={{ color: "var(--text-secondary)" }}>
              {repo.description}
            </div>

            {/* Stars */}
            <div className="col-span-1 flex items-center gap-1 text-sm" style={{ color: "var(--text-muted)" }}>
              <i className="fa-solid fa-star text-xs" style={{ color: "var(--accent-orange)" }}></i>
              {repo.stars}
            </div>

            {/* Forks */}
            <div className="col-span-1 flex items-center gap-1 text-sm" style={{ color: "var(--text-muted)" }}>
              <i className="fa-solid fa-code-fork text-xs"></i>
              {repo.forks}
            </div>

            {/* Language */}
            <div className="col-span-1 flex items-center gap-1.5 text-sm" style={{ color: "var(--text-muted)" }}>
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ background: repo.langColor }}
              ></span>
              <span className="truncate">{repo.language}</span>
            </div>

            {/* Status */}
            <div className="col-span-1 flex items-center">
              <span
                className="text-xs px-2 py-1 rounded-full font-medium"
                style={{
                  background: `${status.color}15`,
                  color: status.color,
                  border: `1px solid ${status.color}30`,
                }}
              >
                {status.label}
              </span>
            </div>

            {/* Updated */}
            <div className="col-span-1 flex items-center text-sm" style={{ color: "var(--text-muted)" }}>
              {timeAgo(repo.updatedAt)}
            </div>
          </a>
        );
      })}
    </div>
  );
}
