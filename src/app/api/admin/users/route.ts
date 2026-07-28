import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth-utils";

// GET /api/admin/users — list all users (admin only)
export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        _count: {
          select: { news: true },
        },
      },
      take: 100,
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/admin/users — change user role (admin only)
export async function PUT(req: NextRequest) {
  const { session, error } = await requireAdminApi();
  if (error) return error;

  try {
    const { userId, role } = await req.json();

    if (!userId || !role || !["user", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Check that target user exists
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 🛡️ Cannot modify owner role (non-removable)
    if (targetUser.role === "owner") {
      return NextResponse.json(
        { error: "Cannot change the site owner's role" },
        { status: 403 }
      );
    }

    // 🛡️ Cannot remove admin from yourself
    if (userId === session.user.id && role !== "admin") {
      return NextResponse.json(
        { error: "Cannot remove admin rights from yourself" },
        { status: 403 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Admin users update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
