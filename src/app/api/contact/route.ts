import { NextRequest, NextResponse } from "next/server";
import { sendDiscordMessage } from "@/lib/discord";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, message } = body;

    if (!name || !message) {
      return NextResponse.json({ error: "Name and message are required" }, { status: 400 });
    }

    if (message.length > 1000) {
      return NextResponse.json({ error: "Message too long (max 1000 chars)" }, { status: 400 });
    }

    const discordMessage = `**📬 New message from the site**\n**From:** ${name}\n**Message:** ${message}`;
    const sent = await sendDiscordMessage(discordMessage);

    if (!sent) {
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
