import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminClient from "./AdminClient";

function serializeNews(news: any) {
  return news.map((item: any) => ({
    ...item,
    createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt,
    updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : item.updatedAt,
  }));
}

function serializeDiscordMessages(msgs: any[]) {
  return msgs.map((msg: any) => ({
    ...msg,
    createdAt: msg.createdAt instanceof Date ? msg.createdAt.toISOString() : msg.createdAt,
    syncedAt: msg.syncedAt instanceof Date ? msg.syncedAt.toISOString() : msg.syncedAt,
  }));
}

function LoginRequired() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background: "var(--bg-primary)",
        paddingTop: "var(--navbar-height)",
      }}
    >
      <div
        className="w-full max-w-md p-10 rounded-3xl border text-center"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-color)",
        }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl"
          style={{
            background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15))",
            color: "var(--accent-cyan)",
            border: "2px solid rgba(0,212,255,0.15)",
          }}
        >
          <i className="fa-solid fa-lock"></i>
        </div>

        <h1 className="text-2xl font-extrabold mb-2 gradient-text">Доступ запрещён</h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
          Чтобы войти в админ-панель, нужно <strong>авторизоваться</strong>
        </p>

        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold transition-all hover:scale-105"
          style={{
            background: "#24292f",
            color: "#fff",
            boxShadow: "0 4px 15px rgba(36,41,47,0.3)",
          }}
        >
          <i className="fa-brands fa-github"></i>
          Войти через GitHub
        </Link>

        <p className="mt-6 text-xs" style={{ color: "var(--text-muted)" }}>
          <Link href="/" className="hover:underline" style={{ color: "var(--accent-cyan)" }}>
            Вернуться на главную
          </Link>
        </p>
      </div>
    </div>
  );
}

function NotAdmin() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background: "var(--bg-primary)",
        paddingTop: "var(--navbar-height)",
      }}
    >
      <div
        className="w-full max-w-md p-10 rounded-3xl border text-center"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-color)",
        }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl"
          style={{
            background: "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(239,68,68,0.15))",
            color: "var(--accent-pink)",
            border: "2px solid rgba(236,72,153,0.15)",
          }}
        >
          <i className="fa-solid fa-ban"></i>
        </div>

        <h1 className="text-2xl font-extrabold mb-2" style={{ color: "var(--accent-pink)" }}>
          Не админ
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
          У тебя нет прав администратора для доступа к этой странице
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))",
            color: "#fff",
          }}
        >
          <i className="fa-solid fa-arrow-left"></i>
          На главную
        </Link>
      </div>
    </div>
  );
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  // Not logged in
  if (!session?.user) {
    return <LoginRequired />;
  }

  // Прямой запрос к БД чтобы получить актуальную роль (не из JWT токена!)
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  const role = dbUser?.role || session.user.role;

  // Not admin or owner
  if (role !== "admin" && role !== "owner") {
    return <NotAdmin />;
  }

  // Admin — load data and render panel
  const [news, recentDiscord] = await Promise.all([
    prisma.news.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true, image: true } } },
      take: 50,
    }),
    prisma.discordMessage
      .findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
      })
      .catch(() => []),
  ]);

  return (
    <AdminClient
      adminUser={{
        id: session.user.id,
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
      }}
      initialNews={serializeNews(news)}
      initialDiscordMessages={serializeDiscordMessages(recentDiscord)}
    />
  );
}
