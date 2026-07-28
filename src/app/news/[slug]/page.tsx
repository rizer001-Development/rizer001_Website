import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const news = await prisma.news.findUnique({
    where: { slug, published: true },
    include: { author: { select: { name: true, image: true } } },
  });

  if (!news) notFound();

  return (
    <div className="px-6 py-16">
      <div className="mx-auto" style={{ maxWidth: "800px" }}>
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-sm font-semibold mb-8 transition-colors hover:gap-3"
          style={{ color: "var(--accent-cyan)" }}
        >
          <i className="fa-solid fa-arrow-left"></i> Back to news
        </Link>

        <article>
          <div className="flex items-center gap-3 text-xs mb-6" style={{ color: "var(--text-muted)" }}>
            {news.author.image && (
              <img src={news.author.image} alt="" className="w-6 h-6 rounded-full" />
            )}
            <span>{news.author.name || "Author"}</span>
            <span>·</span>
            <time>{new Date(news.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</time>
            {news.syncedToDiscord && (
              <>
                <span>·</span>
                <i className="fa-brands fa-discord" style={{ color: "#5865f2" }} title="Synced with Discord"></i>
              </>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold mb-8">{news.title}</h1>

          <div className="prose prose-invert max-w-none leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {news.content.split("\n").map((line, i) => (
              <p key={i} className="mb-4">{line}</p>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
