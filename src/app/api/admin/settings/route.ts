import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth-utils";

// GET /api/admin/settings — get all settings
export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const settings = await prisma.setting.findMany();
    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }
    // Add values from .env as fallback (don't overwrite DB values)
    const envKeys = [
      "DISCORD_WEBHOOK_URL",
      "DISCORD_BOT_TOKEN",
      "DISCORD_GUILD_ID",
      "DISCORD_INVITE_CODE",
      "DISCORD_NEWS_CHANNEL_ID",
      "GITHUB_USERNAME",
    ];
    for (const key of envKeys) {
      if (!map[key] && process.env[key]) {
        map[key] = process.env[key];
      }
    }

    return NextResponse.json(map);
  } catch (error) {
    console.error("Settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/admin/settings — save a setting
export async function PUT(req: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const { key, value } = await req.json();
    if (!key || typeof key !== "string") {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    if (value === "" || value === null) {
      // Delete setting (so .env is used instead)
      await prisma.setting.delete({ where: { key } }).catch(() => {});
    } else {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    return NextResponse.json({ success: true, key, value: value || null });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
