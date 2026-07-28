import { prisma } from "@/lib/prisma";

/**
 * Получить Discord Webhook URL: из БД (Setting) или .env
 */
export async function getWebhookUrl(): Promise<string | null> {
  // Try from DB
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "DISCORD_WEBHOOK_URL" },
    });
    if (setting?.value) return setting.value;
  } catch {
    // DB not available
  }
  return process.env.DISCORD_WEBHOOK_URL || null;
}

export async function sendNewsToDiscord(title: string, content: string, url: string): Promise<boolean> {
  const webhookUrl = await getWebhookUrl();
  if (!webhookUrl) return false;

  try {
    const embed = {
      embeds: [
        {
          title: title,
          description: content.length > 400 ? content.slice(0, 400) + "..." : content,
          url: url,
          color: 0x00d4ff,
          timestamp: new Date().toISOString(),
          footer: {
            text: "rizer001.dev",
            icon_url: "https://github.com/rizer001.png",
          },
        },
      ],
    };

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(embed),
    });

    return res.ok;
  } catch (err) {
    console.error("Discord webhook error:", err);
    return false;
  }
}

export async function sendDiscordMessage(content: string): Promise<boolean> {
  const webhookUrl = await getWebhookUrl();
  if (!webhookUrl) return false;

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    return res.ok;
  } catch (err) {
    console.error("Discord webhook message error:", err);
    return false;
  }
}
