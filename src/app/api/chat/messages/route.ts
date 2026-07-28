import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/chat/messages — get message history from DB
export async function GET() {
  try {
    // Auto-cleanup: delete messages older than 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await prisma.chatMessage.deleteMany({
      where: { createdAt: { lt: oneDayAgo } },
    });

    // Get last 50 messages
    const messages = await prisma.chatMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Count total messages
    const totalCount = await prisma.chatMessage.count();

    // Format for client
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

// DELETE /api/chat/messages — clear history (admin only)
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
