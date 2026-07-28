import { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import GitHubProvider from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET
      ? [DiscordProvider({ clientId: process.env.DISCORD_CLIENT_ID, clientSecret: process.env.DISCORD_CLIENT_SECRET })]
      : []),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? [GitHubProvider({ clientId: process.env.GITHUB_CLIENT_ID, clientSecret: process.env.GITHUB_CLIENT_SECRET })]
      : []),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      const providerId = account?.providerAccountId;
      if (providerId && (account?.provider === "github" || account?.provider === "discord")) {
        try {
          // GitHub login (username) comes from profile.login
          const githubLogin = account?.provider === "github" ? (profile as any)?.login || null : null;
          const ownerUsername = process.env.OWNER_USERNAME;
          const isOwner = githubLogin && ownerUsername && githubLogin === ownerUsername;

          const existingUser = await prisma.user.findUnique({
            where: { id: providerId },
          });

          if (existingUser) {
            // Owner must always be owner in DB (protection against removal)
            const role = isOwner ? "owner" : existingUser.role;
            await prisma.user.update({
              where: { id: providerId },
              data: {
                name: user.name,
                username: githubLogin,
                image: user.image,
                email: user.email,
                role,
              },
            });
          } else {
            const role = isOwner ? "owner" : "user";
            await prisma.user.create({
              data: {
                id: providerId,
                name: user.name,
                username: githubLogin,
                email: user.email,
                image: user.image,
                role,
              },
            });
          }
        } catch (err) {
          console.error("Failed to save user to DB:", err);
        }
      }
      return true;
    },

    async jwt({ token, account }) {
      if (account) {
        token.id = account.providerAccountId;
        token.role = "user";
      }

      // Always check role from DB on every request
      // (not just on login, so owner/admin role applies instantly)
      // Use token.id or token.sub (for old tokens without id)
      const userId = token.id || token.sub;
      if (userId) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: userId as string },
            select: { role: true, username: true },
          });

          if (dbUser) {
            token.role = dbUser.role;
            // If this user is owner (checked by username) but DB role is not owner — fix it
            const ownerUsername = process.env.OWNER_USERNAME;
            if (ownerUsername && dbUser.username === ownerUsername && dbUser.role !== "owner") {
              await prisma.user.update({
                where: { id: userId as string },
                data: { role: "owner" },
              });
              token.role = "owner";
            }
          } else if (account) {
            // First login — user not in DB yet (rare edge case)
            const adminCount = await prisma.user.count({
              where: { role: { in: ["admin", "owner"] } },
            });
            if (adminCount === 0) {
              token.role = "admin";
              await prisma.user.upsert({
                where: { id: userId as string },
                update: { role: "admin" },
                create: {
                  id: userId as string,
                  role: "admin",
                },
              });
            }
          }
        } catch (err) {
          console.error("Failed to read user role from DB:", err);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || "user";
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};
