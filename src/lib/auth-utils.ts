import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "./prisma";

export async function getSession() {
  return getServerSession(authOptions);
}

/**
 * Get user role directly from DB (not from JWT token).
 * This ensures owner/admin permissions apply instantly.
 */
async function getDbRole(userId: string | undefined): Promise<string | null> {
  if (!userId) return null;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    return user?.role || null;
  } catch {
    return null;
  }
}

const isStaff = (role: string) => role === "admin" || role === "owner";

/** Use in Server Components */
export async function requireAdmin() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/");
  }
  
  // Direct DB query — ignore role from JWT token
  const dbRole = await getDbRole(session.user.id);
  if (!dbRole || !isStaff(dbRole)) {
    redirect("/");
  }
  
  return session;
}

/** Use in API Routes — returns NextResponse with 401/403 if not authorized */
export async function requireAdminApi() {
  const session = await getSession();
  if (!session?.user) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  
  // Direct DB query — ignore role from JWT token
  const dbRole = await getDbRole(session.user.id);
  if (!dbRole || !isStaff(dbRole)) {
    return { session: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  
  return { session, error: null };
}
