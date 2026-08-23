import Link from "next/link";
import ProjectsClient from "./ProjectsClient";

const langColors: Record<string, string> = {
  Java: "#b07219",
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Kotlin: "#A97BFF",
  Python: "#3572A5",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
};

async function getAllRepos() {
  try {
    const headers: HeadersInit = {};
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(
      "https://api.github.com/users/rizer001/repos?sort=updated&per_page=100",
      { headers, next: { revalidate: 300 } }
    );

    if (!res.ok) throw new Error("GitHub API error");

    const repos = await res.json();
    return repos
      .filter((r: any) => !r.fork && !r.archived)
      .sort((a: any, b: any) => b.stargazers_count - a.stargazers_count)
      .map((repo: any) => ({
        name: repo.name,
        description: repo.description || "No description",
        url: repo.html_url,
        language: repo.language || "N/A",
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        watchers: repo.watchers_count || 0,
        langColor: langColors[repo.language] || "#6a6a80",
        updatedAt: repo.updated_at,
        pushedAt: repo.pushed_at,
        topics: repo.topics || [],
        visibility: repo.visibility || "public",
      }));
  } catch {
    return null;
  }
}

export const metadata = {
  title: "Projects — rizer001",
  description: "All open-source projects by rizer001 on GitHub",
};

export default async function ProjectsPage() {
  const repos = await getAllRepos();

  return (
    <div className="min-h-screen" style={{ paddingTop: "var(--navbar-height)" }}>
      {/* Header */}
      <section className="px-6 py-16">
        <div className="mx-auto" style={{ maxWidth: "1100px" }}>
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:underline"
              style={{ color: "var(--accent-cyan)" }}
            >
              ← Home
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 gradient-text">
            <i className="fa-brands fa-github mr-3"></i>
            All Projects
          </h1>
          <p className="text-base" style={{ color: "var(--text-secondary)", maxWidth: "600px" }}>
            Open-source repositories on GitHub — sorted by popularity
          </p>
          {repos && (
            <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
              {repos.length} repositories
            </p>
          )}
        </div>
      </section>

      {/* Repos List */}
      <section className="px-6 pb-24">
        <div className="mx-auto" style={{ maxWidth: "1100px" }}>
          <ProjectsClient repos={repos} />
        </div>
      </section>
    </div>
  );
}
