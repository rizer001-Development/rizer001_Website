import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/discord/sync — receive Discord webhook messages and create news
export async function POST(req: NextRequest) {
  try {
    // Verify webhook secret (optional) — Discord sends secret as query param ?secret=
    const searchParams = req.nextUrl.searchParams;
    const webhookSecret = searchParams.get("secret");
    if (process.env.DISCORD_WEBHOOK_SECRET && webhookSecret !== process.env.DISCORD_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Handle Discord webhook payload
    const { id, channel_id, guild_id, author, content, attachments, timestamp } = body;

    if (!id || !content) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Check if message already synced
    const existing = await prisma.discordMessage.findUnique({ where: { id } });
    if (existing) {
      return NextResponse.json({ message: "Already synced" });
    }

    // Save Discord message
    await prisma.discordMessage.create({
      data: {
        id,
        channelId: channel_id,
        guildId: guild_id || null,
        authorId: author?.id || "unknown",
        authorName: author?.username || "Unknown",
        authorAvatar: author?.avatar
          ? `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png`
          : null,
        content,
        attachments: attachments?.length ? JSON.stringify(attachments) : null,
        createdAt: new Date(timestamp || Date.now()),
      },
    });

    // Auto-create a news post from Discord message if it looks like a news announcement
    // (messages starting with !news or marked with specific tag)
    if (content.startsWith("!news") || content.startsWith("📢")) {
      const newsContent = content.replace(/^!news\s*/i, "").replace(/^📢\s*/, "");
      const firstLine = newsContent.split("\n")[0].slice(0, 80);

      let slug = firstLine
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 80) || `discord-${Date.now().toString(36)}`;

      // Ensure unique slug
      const existingSlug = await prisma.news.findUnique({ where: { slug } });
      if (existingSlug) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }

      // Find an admin user for author
      const adminUser = await prisma.user.findFirst({ where: { role: "admin" } });

      await prisma.news.create({
        data: {
          title: firstLine || "News from Discord",
          content: newsContent,
          slug,
          published: true,
          authorId: adminUser?.id || "unknown",
          discordMessageId: id,
          discordChannelId: channel_id,
          syncedToDiscord: false,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Discord sync error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
