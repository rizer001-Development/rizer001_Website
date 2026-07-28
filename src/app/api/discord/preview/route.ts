import { NextResponse } from "next/server";

// GET /api/discord/preview — get Discord server info
export async function GET() {
  try {
    const guildId = process.env.DISCORD_GUILD_ID;
    const botToken = process.env.DISCORD_BOT_TOKEN;

    // Try via Guild API (if bot token and server ID are available)
    if (guildId && botToken) {
      const res = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}?with_counts=true`,
        {
          headers: {
            Authorization: `Bot ${botToken}`,
          },
          next: { revalidate: 120 }, // cache for 2 minutes
        }
      );

      if (res.ok) {
        const guild = await res.json();
        return NextResponse.json({
          name: guild.name,
          icon: guild.icon
            ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=256`
            : null,
          memberCount: guild.approximate_member_count ?? guild.members?.length ?? 0,
          onlineCount: guild.approximate_presence_count ?? 0,
          online: true,
          configured: true,
          description: guild.description || null,
        });
      }
    }

    // Fallback: try via Invite API
    const inviteCode = process.env.DISCORD_INVITE_CODE;
    if (inviteCode) {
      const res = await fetch(
        `https://discord.com/api/v10/invites/${inviteCode}?with_counts=true`,
        { next: { revalidate: 120 } }
      );

      if (res.ok) {
        const data = await res.json();
        const guild = data.guild;
        return NextResponse.json({
          name: guild?.name || "Discord Server",
          icon: guild?.icon
            ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=256`
            : null,
          memberCount: data.approximate_member_count ?? 0,
          onlineCount: data.approximate_presence_count ?? 0,
          online: true,
          configured: true,
          description: guild?.description || null,
        });
      }
    }

    // If nothing is configured — return default info
    return NextResponse.json({
      name: "rizer001 Development",
      icon: null,
      memberCount: 0,
      onlineCount: 0,
      online: false,
      configured: false,
      description: null,
    });
  } catch (error) {
    console.error("Discord preview error:", error);
    return NextResponse.json(
      {
        name: "rizer001 Development",
        icon: null,
        memberCount: 0,
        onlineCount: 0,
        online: false,
        configured: false,
        description: null,
      },
      { status: 200 }
    );
  }
}
