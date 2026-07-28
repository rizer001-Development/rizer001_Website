import { prisma } from "@/lib/prisma";

/**
 * Получить настройку: сначала из БД, если нет — из .env
 */
export async function getSetting(key: string): Promise<string | null> {
  try {
    const setting = await prisma.setting.findUnique({ where: { key } });
    if (setting?.value) return setting.value;
  } catch {
    // DB not available, fall back to env
  }
  return process.env[key] || null;
}

/**
 * Получить Discord Webhook URL: из БД или .env
 */
export async function getDiscordWebhookUrl(): Promise<string | null> {
  return getSetting("DISCORD_WEBHOOK_URL");
}

/**
 * Сохранить настройку в БД
 */
export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}
