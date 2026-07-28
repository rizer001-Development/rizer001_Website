import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth-utils";
import { sendNewsToDiscord } from "@/lib/discord";

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 80) || "post";
}

// GET /api/news
export async function GET(req: NextRequest) {
  const { session } = await requireAdminApi().catch(() => ({ session: null }));
  const searchParams = req.nextUrl.searchParams;
  const publishedOnly = searchParams.get("published") !== "false";

  const news = await prisma.news.findMany({
    where: session ? {} : { published: true },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true, image: true } } },
    take: 50,
  });

  return NextResponse.json(news);
}

// POST /api/news
export async function POST(req: NextRequest) {
  const { session, error } = await requireAdminApi();
  if (error) return error;

  try {
    const body = await req.json();
    const { title, content, image, published } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    let slug = createSlug(title);

    const existing = await prisma.news.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const news = await prisma.news.create({
      data: {
        title,
        content,
        slug,
        image: image || null,
        published: published ?? true,
        authorId: session!.user.id,
      },
    });

    // Sync to Discord
    if (news.published) {
      const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const newsUrl = `${siteUrl}/news/${news.slug}`;
      const synced = await sendNewsToDiscord(news.title, news.content, newsUrl);

      if (synced) {
        await prisma.news.update({
          where: { id: news.id },
          data: { syncedToDiscord: true },
        });
        news.syncedToDiscord = true;
      }
    }

    return NextResponse.json(news, { status: 201 });
  } catch (err) {
    console.error("News create error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/news
export async function PUT(req: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const body = await req.json();
    const { id, title, content, image, published } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const news = await prisma.news.update({
      where: { id },
      data: {
        ...(title && { title, slug: createSlug(title) }),
        ...(content !== undefined && { content }),
        ...(image !== undefined && { image }),
        ...(published !== undefined && { published }),
      },
    });

    return NextResponse.json(news);
  } catch (err) {
    console.error("News update error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/news
export async function DELETE(req: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.news.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("News delete error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
