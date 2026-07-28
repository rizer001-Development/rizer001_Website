import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getWebhookUrl } from "@/lib/discord";
import { prisma } from "@/lib/prisma";

// Глобальная очередь: считаем сколько сообщений было отправлено за последнюю секунду
const sendTimestamps: number[] = [];
const QUEUE_WINDOW_MS = 1000;
const MAX_PER_WINDOW = 1; // 1 сообщение в секунду

function getQueueDepth(): number {
  const now = Date.now();
  // Удаляем старые записи
  while (sendTimestamps.length > 0 && sendTimestamps[0] < now - QUEUE_WINDOW_MS) {
    sendTimestamps.shift();
  }
  return sendTimestamps.length;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await req.json();
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: "Message too long (max 2000 chars)" }, { status: 400 });
    }

    // Сохраняем в БД ВСЕГДА (даже если очередь забита)
    const chatMessage = await prisma.chatMessage.create({
      data: {
        authorId: session.user.id,
        authorName: session.user.name || "Anonymous",
        authorAvatar: session.user.image,
        content: content.trim(),
      },
    });

    // Считаем общее кол-во сообщений
    const totalCount = await prisma.chatMessage.count();

    // Отправляем в Discord с учётом очереди (1 сообщение в секунду)
    const queueDepth = getQueueDepth();
    if (queueDepth < MAX_PER_WINDOW) {
      sendTimestamps.push(Date.now());
      const webhookUrl = await getWebhookUrl();
      if (webhookUrl) {
        const username = session.user.name || "Anonymous";
        const avatarUrl = session.user.image || undefined;

        const payload = {
          content: content.trim(),
          username: `${username} (via site)`,
          ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
        };

        fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => {});
      }
    }

    const newQueueDepth = getQueueDepth();

    return NextResponse.json({
      success: true,
      message: {
        id: chatMessage.id,
        content: chatMessage.content,
        author: {
          name: chatMessage.authorName || "Unknown",
          avatar: chatMessage.authorAvatar,
        },
        timestamp: chatMessage.createdAt.toISOString(),
      },
      totalCount,
      queueDepth: newQueueDepth,
    });
  } catch (error) {
    console.error("Chat send error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/discord/send — получить текущую глубину очереди
export async function GET() {
  return NextResponse.json({ queueDepth: getQueueDepth() });
}
