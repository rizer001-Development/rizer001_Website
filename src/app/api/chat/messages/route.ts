import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/chat/messages — получить историю сообщений из БД
export async function GET() {
  try {
    // Авто-очистка: удаляем сообщения старше 24 часов
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await prisma.chatMessage.deleteMany({
      where: { createdAt: { lt: oneDayAgo } },
    });

    // Получаем последние 50 сообщений
    const messages = await prisma.chatMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Считаем общее количество
    const totalCount = await prisma.chatMessage.count();

    // Форматируем под клиент
    const formatted = messages.reverse().map((msg) => ({
      id: msg.id,
      content: msg.content,
      author: {
        name: msg.authorName || "Unknown",
        avatar: msg.authorAvatar,
      },
      timestamp: msg.createdAt.toISOString(),
    }));

    return NextResponse.json({
      messages: formatted,
      totalCount,
    });
  } catch (error) {
    console.error("Chat messages error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/chat/messages — очистить историю (только админ)
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const result = await prisma.chatMessage.deleteMany({});
    return NextResponse.json({
      success: true,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error("Chat purge error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
