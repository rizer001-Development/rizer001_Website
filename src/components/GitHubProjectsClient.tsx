"use client";

interface Repo {
  name: string;
  description: string;
  url: string;
  language: string;
  stars: number;
  langColor: string;
}

export default function GitHubProjectsClient({ repos }: { repos: Repo[] | null }) {
  if (!repos) {
    return (
      <div className="text-center py-10" style={{ color: "var(--text-muted)" }}>
        <p className="mb-4"><i className="fa-solid fa-triangle-exclamation text-2xl" style={{ color: "var(--accent-orange)" }}></i></p>
        <p className="mb-3">Не удалось загрузить проекты</p>
        <a
          href="https://github.com/rizer001"
          target="_blank"
          rel="noopener"
          className="inline-block font-semibold"
          style={{ color: "var(--accent-cyan)" }}
        >
          Смотреть на GitHub &rarr;
        </a>
      </div>
    );
  }

  if (!repos.length) {
    return <p style={{ color: "var(--text-muted)" }}>Проекты не найдены</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {repos.map((repo) => (
        <a
          key={repo.name}
          href={repo.url}
          target="_blank"
          rel="noopener"
          className="card p-7 block group"
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
              style={{
                background: "linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(124, 58, 237, 0.1))",
                color: "var(--accent-cyan)",
              }}
            >
              <i className="fa-solid fa-code-branch"></i>
            </div>
            <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
              <i className="fa-solid fa-star" style={{ color: "var(--accent-orange)" }}></i>
              {repo.stars}
            </span>
          </div>
          <h3 className="font-bold mb-2 text-base">{repo.name}</h3>
          <p className="text-sm mb-4 line-clamp-3" style={{ color: "var(--text-secondary)" }}>
            {repo.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: repo.langColor }}></span>
              {repo.language}
            </span>
            <span className="text-xs font-semibold group-hover:underline" style={{ color: "var(--accent-cyan)" }}>
              Подробнее &rarr;
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}
