import { NextResponse } from "next/server";

// GET /api/discord/messages — fetch recent public messages from Discord channel
export async function GET() {
  try {
    const channelId = process.env.DISCORD_NEWS_CHANNEL_ID;
    const botToken = process.env.DISCORD_BOT_TOKEN;

    if (!channelId || !botToken) {
      return NextResponse.json(
        { error: "Discord integration not configured" },
        { status: 503 }
      );
    }

    const res = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages?limit=20`,
      {
        headers: {
          Authorization: `Bot ${botToken}`,
        },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch Discord messages" },
        { status: res.status }
      );
    }

    const messages = await res.json();

    const formatted = messages
      .filter((msg: any) => !msg.author.bot || msg.webhook_id)
      .slice(0, 10)
      .map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        author: {
          name: msg.author.global_name || msg.author.username,
          avatar: msg.author.avatar
            ? `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`
            : null,
        },
        timestamp: msg.timestamp,
        attachments: msg.attachments?.map((a: any) => ({
          url: a.url,
          name: a.filename,
        })),
      }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Discord messages error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
