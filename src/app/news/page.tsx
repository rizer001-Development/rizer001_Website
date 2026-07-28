import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getNews() {
  try {
    return await prisma.news.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true, image: true } } },
      take: 20,
    });
  } catch {
    return [];
  }
}

export default async function NewsPage() {
  const newsList = await getNews();

  return (
    <div className="px-6 py-16">
      <div className="mx-auto" style={{ maxWidth: "1100px" }}>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 flex items-center gap-3">
          <span
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl border text-xl"
            style={{
              background: "linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(124, 58, 237, 0.1))",
              borderColor: "var(--border-color)",
              color: "var(--accent-cyan)",
            }}
          >
            <i className="fa-solid fa-newspaper"></i>
          </span>
          Новости
        </h1>
        <p className="text-base mb-12" style={{ color: "var(--text-secondary)", maxWidth: "600px" }}>
          Последние обновления проектов, анонсы и новости — синхронизируется с Discord
        </p>

        {newsList.length === 0 ? (
          <div className="text-center py-20" style={{ color: "var(--text-muted)" }}>
            <i className="fa-solid fa-newspaper text-5xl mb-4 opacity-30"></i>
            <p className="text-lg">Новостей пока нет</p>
            <p className="text-sm mt-2">Следи за Discord сервером — новости появятся здесь</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {newsList.map((news) => (
              <Link
                key={news.id}
                href={`/news/${news.slug}`}
                className="card p-6 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                    {news.author.image && (
                      <img src={news.author.image} alt="" className="w-5 h-5 rounded-full" />
                    )}
                    <span>{news.author.name || "Автор"}</span>
                    <span>·</span>
                    <span>{new Date(news.createdAt).toLocaleDateString("ru-RU")}</span>
                  </div>
                  {news.syncedToDiscord && (
                    <i className="fa-brands fa-discord text-xs" style={{ color: "#5865f2" }} title="Синхронизировано с Discord"></i>
                  )}
                </div>
                <h2 className="font-bold text-lg mb-2 group-hover:gradient-text transition-all">
                  {news.title}
                </h2>
                <p className="text-sm line-clamp-3" style={{ color: "var(--text-secondary)" }}>
                  {news.content.slice(0, 200)}
                  {news.content.length > 200 ? "..." : ""}
                </p>
                <div className="mt-4 text-xs font-semibold" style={{ color: "var(--accent-cyan)" }}>
                  Читать далее &rarr;
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
