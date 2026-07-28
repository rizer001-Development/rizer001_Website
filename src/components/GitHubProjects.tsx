import GitHubProjectsClient from "./GitHubProjectsClient";

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

async function getRepos() {
  try {
    const headers: HeadersInit = {};
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(
      "https://api.github.com/users/rizer001/repos?sort=updated&per_page=20",
      { headers, next: { revalidate: 300 } }
    );

    if (!res.ok) throw new Error("GitHub API error");

    const repos = await res.json();
    return repos
      .filter((r: any) => !r.fork && !r.archived)
      .sort((a: any, b: any) => b.stargazers_count - a.stargazers_count)
      .slice(0, 9)
      .map((repo: any) => ({
        name: repo.name,
        description: repo.description || "Нет описания",
        url: repo.html_url,
        language: repo.language || "N/A",
        stars: repo.stargazers_count || 0,
        langColor: langColors[repo.language] || "#6a6a80",
      }));
  } catch {
    return null;
  }
}

export default async function GitHubProjects() {
  const repos = await getRepos();

  return <GitHubProjectsClient repos={repos} />;
}
