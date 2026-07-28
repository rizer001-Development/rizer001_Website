import { NextRequest, NextResponse } from "next/server";

const GITHUB_API = "https://api.github.com";

interface GHCommit {
  message: string;
  sha: string;
}

interface GHEvent {
  id: string;
  type: string;
  created_at: string;
  actor: { login: string } | null;
  repo: { name: string } | null;
  payload: {
    commits?: GHCommit[];
    ref?: string;
    ref_type?: string;
    action?: string;
    size?: number;
    head?: string;
    before?: string;
    issue?: { title: string; html_url: string };
    release?: { tag_name: string; name: string; html_url: string };
    pull_request?: { html_url: string; title: string };
  };
}

interface RateLimit {
  remaining: number;
  limit: number;
  reset: number;
}

function getHeaders() {
  const headers: HeadersInit = { Accept: "application/vnd.github.v3+json" };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = "Bearer " + process.env.GITHUB_TOKEN;
  }
  return headers;
}

async function fetchRateLimit(): Promise<RateLimit | null> {
  try {
    const res = await fetch(GITHUB_API + "/rate_limit", { headers: getHeaders() });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.resources?.core || null;
  } catch {
    return null;
  }
}

/** Для PushEvent получаем коммиты через compare API (GitHub events API не отдаёт commits) */
async function fetchPushCommits(repoName: string, base: string, head: string): Promise<{ commits: GHCommit[]; rawCount: number }> {
  try {
    const res = await fetch(
      GITHUB_API + "/repos/" + repoName + "/compare/" + base + "..." + head,
      { headers: getHeaders() }
    );
    if (!res.ok) return { commits: [], rawCount: 0 };
    const data = await res.json();
    return {
      commits: (data.commits || []).map((c: any) => ({
        message: c.commit?.message || "",
        sha: c.sha || "",
      })),
      rawCount: data.total_commits || data.commits?.length || 0,
    };
  } catch {
    return { commits: [], rawCount: 0 };
  }
}

export async function GET(req: NextRequest) {
  try {
    const username = process.env.GITHUB_USERNAME || "rizer001";
    const { searchParams } = new URL(req.url);
    const repo = searchParams.get("repo");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = 10;
    const hasToken = !!process.env.GITHUB_TOKEN;

    // Rate limit check
    const rateLimit = await fetchRateLimit();
    if (rateLimit && rateLimit.remaining <= 0) {
      const minutesLeft = Math.ceil((rateLimit.reset * 1000 - Date.now()) / 60000);
      return NextResponse.json({
        error: "rate_limited",
        message: "Достигнут лимит запросов к GitHub API. Сброс через " + minutesLeft + " мин.",
        repos: [], logs: [],
        rateLimit,
      }, { status: 429 });
    }

    // Fetch repos list
    const reposRes = await fetch(
      GITHUB_API + "/users/" + username + "/repos?sort=updated&per_page=50&type=owner",
      { headers: getHeaders(), next: { revalidate: 300 } }
    );

    if (!reposRes.ok) {
      if (reposRes.status === 403 || reposRes.status === 429) {
        return NextResponse.json({ error: "rate_limited", message: "Достигнут лимит запросов к GitHub API.", repos: [], logs: [] }, { status: 429 });
      }
      return NextResponse.json({ error: "GitHub API error", repos: [], logs: [] }, { status: reposRes.status });
    }

    const repos = await reposRes.json();
    const repoList = repos
      .filter((r: any) => !r.fork && !r.archived)
      .map((r: any) => ({ name: r.name, fullName: r.full_name, language: r.language, stars: r.stargazers_count }));

    // Fetch events — only the requested page
    const eventsUrl = repo
      ? GITHUB_API + "/repos/" + repo + "/events?per_page=" + perPage + "&page=" + page
      : GITHUB_API + "/users/" + username + "/events?per_page=" + perPage + "&page=" + page;

    const eventRes = await fetch(eventsUrl, { headers: getHeaders(), next: { revalidate: 60 } });
    if (!eventRes.ok) {
      if (eventRes.status === 403 || eventRes.status === 429) {
        return NextResponse.json({ error: "rate_limited", message: "Достигнут лимит запросов к GitHub API.", repos: repoList, logs: [] }, { status: 429 });
      }
      return NextResponse.json({ error: "GitHub API error", repos: repoList, logs: [] }, { status: eventRes.status });
    }

    const allEvents: GHEvent[] = await eventRes.json();

    // Параллельно получаем коммиты для всех PushEvent через compare API
    const pushEvents = allEvents.filter(
      (e) => e.type === "PushEvent" && e.payload?.head && e.payload?.before && hasToken
    );
    const pushResults = await Promise.all(
      pushEvents.map((e) =>
        fetchPushCommits(e.repo?.name || "unknown", e.payload!.before!, e.payload!.head!)
      )
    );
    // Сопоставляем результаты с событиями
    const pushCommitMap = new Map<string, { commits: GHCommit[]; rawCount: number }>();
    pushEvents.forEach((e, i) => {
      pushCommitMap.set(e.id, pushResults[i]);
    });

    // Формируем логи
    const logs = [];
    for (const event of allEvents) {
      const baseLog: any = {
        id: event.id,
        type: event.type,
        createdAt: event.created_at,
        actor: event.actor?.login || username,
        repo: event.repo?.name || "",
      };

      const repoName = event.repo?.name || "unknown";

      if (event.type === "PushEvent") {
        const head = event.payload?.head;
        const before = event.payload?.before;
        const compareResult = pushCommitMap.get(event.id);
        const commits = compareResult?.commits || [];
        const commitCount = compareResult?.rawCount || 0;
        const desc = commits.length > 0
          ? commits.map((c: GHCommit) => c.message.split("\n")[0]).join(" \u00b7 ").slice(0, 200)
          : hasToken ? "No commits" : "No commits (без токена)";
        const compareUrl = head && before
          ? "https://github.com/" + repoName + "/compare/" + before + "..." + head
          : "https://github.com/" + repoName + "/commits";

        logs.push({
          ...baseLog,
          title: "Pushed to " + repoName,
          description: desc,
          commitCount,
          commits,
          url: compareUrl,
        });
      } else if (event.type === "CreateEvent") {
        logs.push({
          ...baseLog,
          title: "Created " + (event.payload?.ref_type || "ref") + " in " + repoName,
          description: event.payload?.ref || "new reference",
          url: "https://github.com/" + repoName,
        });
      } else if (event.type === "IssuesEvent") {
        logs.push({
          ...baseLog,
          title: (event.payload?.action === "opened" ? "New issue in " : "Issue " + (event.payload?.action || "") + " in ") + repoName,
          description: event.payload?.issue?.title || "",
          url: event.payload?.issue?.html_url || ("https://github.com/" + repoName + "/issues"),
        });
      } else if (event.type === "ReleaseEvent") {
        logs.push({
          ...baseLog,
          title: "Release " + (event.payload?.release?.tag_name || "") + " in " + repoName,
          description: event.payload?.release?.name || "New release",
          url: event.payload?.release?.html_url || ("https://github.com/" + repoName + "/releases"),
        });
      } else if (event.type === "PullRequestEvent") {
        logs.push({
          ...baseLog,
          title: (event.payload?.action === "opened" ? "New PR in " : "PR " + (event.payload?.action || "") + " in ") + repoName,
          description: event.payload?.pull_request?.title || "",
          url: event.payload?.pull_request?.html_url || ("https://github.com/" + repoName + "/pulls"),
        });
      } else if (event.type === "WatchEvent") {
        logs.push({ ...baseLog, title: "Starred " + repoName, description: "", url: "https://github.com/" + repoName });
      } else if (event.type === "ForkEvent") {
        logs.push({ ...baseLog, title: "Forked " + repoName, description: "", url: "https://github.com/" + repoName });
      } else {
        logs.push({ ...baseLog, title: event.type + " in " + repoName, description: "", url: "https://github.com/" + repoName });
      }
    }

    return NextResponse.json({ logs, repos: repoList, page, perPage, rateLimit });
  } catch (error) {
    console.error("GitHub API error:", error);
    return NextResponse.json({ error: "Internal server error", repos: [], logs: [] }, { status: 500 });
  }
}
