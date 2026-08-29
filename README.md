<div align="center">
  <br />
  <img src="https://avatars.githubusercontent.com/u/191371167?v=4" width="120" style="border-radius: 50%;" alt="rizer001" />
  
  # rizer001_Website
  
  ### Personal website of rizer001 — Minecraft Developer &amp; Creator
  
  <p align="center">
    <a href="https://github.com/rizer001-Development/rizer001_Website/blob/main/LICENSE">
      <img src="https://img.shields.io/badge/license-AGPLv3-blue.svg" alt="License: AGPL v3" />
    </a>
    <a href="https://nextjs.org/">
      <img src="https://img.shields.io/badge/Next.js-15-black" alt="Next.js 15" />
    </a>
    <a href="https://www.prisma.io/">
      <img src="https://img.shields.io/badge/Prisma-SQLite-green" alt="Prisma" />
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-5-blue" alt="TypeScript" />
    </a>
    <img src="https://img.shields.io/badge/status-Beta-orange" alt="Development status: Beta" />
  </p>
  
  <br />
</div>

### 📄 Organization Docs

[![Guide](https://img.shields.io/badge/Guide-rizer001--Development-00AEFF)](https://github.com/rizer001-Development/.github/blob/main/GUIDE.md) · [![Contributing](https://img.shields.io/badge/Contributing-rizer001--Development-4CAF50)](https://github.com/rizer001-Development/.github/blob/main/CONTRIBUTING.md) · [![Security](https://img.shields.io/badge/Security-rizer001--Development-D9534F)](https://github.com/rizer001-Development/.github/blob/main/SECURITY.md) · [![Code of Conduct](https://img.shields.io/badge/Code%20of%20Conduct-rizer001--Development-5BC0DE)](https://github.com/rizer001-Development/.github/blob/main/CODE_OF_CONDUCT.md)

---

## 📋 Overview

Personal website with Discord and GitHub integration. Features:

- **Blog/News** — post updates with cross-posting to Discord
- **Discord Chat** — send messages via webhook, message history in DB
- **GitHub Activity** — event logs with pagination, repo tabs, commit display
- **Admin Panel** — user management, roles (Owner/Admin), news, Discord webhook config
- **Authentication** — login via GitHub OAuth

## 🚀 Tech Stack

| Technology | Version | Purpose |
|-----------|--------|---------|
| **Next.js** | 15 | React framework (App Router) |
| **React** | 19 | UI library |
| **TypeScript** | 5 | Type safety |
| **Tailwind CSS** | 4 | Styling |
| **Prisma** | 6 | ORM (SQLite) |
| **NextAuth** | 4 | OAuth (GitHub) |
| **PostgreSQL** | — | Database |

## ✨ Features

### 🔐 Authentication
- GitHub OAuth login
- Role system: **Owner** (irremovable), **Admin**, **User**
- First user becomes Owner automatically

### 👑 Admin Panel
- **News** — create, publish, delete posts
- **Discord** — configure Webhook URL, send test messages
- **Users** — list, assign/remove admin roles
- **GitHub Logs** — activity feed with pagination & repo tabs

### 💬 Discord Chat
- Server preview (online status, member count)
- Send messages via webhook
- Message history in DB (auto-cleanup after 24h)
- Dynamic cooldown (1s base + 1s per message, -1s every 2s)
- Send queue (1 msg/sec for Discord)
- History purge with confirmation

### 📊 GitHub Activity
- Event feed (Push, Issue, PR, Release, Star, Fork)
- Per-repository tabs
- 10-events pagination
- Commit messages via Compare API
- Rate limit indicator

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Clone
```bash
git clone https://github.com/rizer001-Development/rizer001_Website.git
cd rizer001_Website
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
Create `.env` in the project root:

```env
# === GitHub OAuth (required) ===
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# === Database ===
DATABASE_URL="file:./dev.db"

# === GitHub API (optional, needed for commit display) ===
GITHUB_TOKEN=your_github_token
GITHUB_USERNAME=rizer001

# === Site owner ===
OWNER_USERNAME=rizer001

# === Discord (optional) ===
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
DISCORD_INVITE_CODE=your_invite_code
```

### 4. Init database
```bash
npx prisma db push
```

### 5. Run
```bash
# Development
npm run dev -- -p 3003

# Production
npm run build
npm start -- -p 3003
```

### 6. OAuth setup
1. Create a GitHub OAuth App: Settings → Developer settings → OAuth Apps
2. Homepage URL: `http://localhost:3003`
3. Authorization callback URL: `http://localhost:3003/api/auth/callback/github`

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_CLIENT_ID` | ✅ | GitHub OAuth Client ID |
| `GITHUB_CLIENT_SECRET` | ✅ | GitHub OAuth Client Secret |
| `DATABASE_URL` | ✅ | SQLite path (`file:./dev.db`) |
| `OWNER_USERNAME` | ✅ | GitHub username of the site owner |
| `GITHUB_TOKEN` | ❌ | GitHub API token (for commit display) |
| `GITHUB_USERNAME` | ❌ | GitHub username (default: rizer001) |
| `DISCORD_WEBHOOK_URL` | ❌ | Discord webhook URL |
| `DISCORD_INVITE_CODE` | ❌ | Discord server invite code |

## 📁 Project Structure

```
src/
├── app/
│   ├── admin/          # Admin panel
│   ├── api/            # API routes
│   │   ├── admin/      # Settings/user management
│   │   ├── chat/       # Message history
│   │   ├── discord/    # Discord integration
│   │   └── github/     # GitHub activity
│   ├── auth/           # Auth pages
│   ├── chat/           # Discord chat page
│   ├── news/           # News pages
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── Navbar.tsx
│   ├── ContactForm.tsx
│   ├── GitHubProjects.tsx
│   └── ...
└── lib/                # Utilities
    ├── auth.ts         # NextAuth config
    ├── discord.ts      # Discord API helpers
    ├── prisma.ts       # Prisma client
    └── settings.ts     # Settings manager

prisma/
└── schema.prisma       # Database schema
```

## ⚖️ License

Licensed under the **GNU Affero General Public License v3.0** (AGPLv3).

This means:
- ✅ You may use, modify, and redistribute the code
- ✅ If you modify and run it on a server, you must disclose your changes
- ❌ You may not use it in proprietary projects without open-sourcing your changes

Full text: [LICENSE](./LICENSE)

---

<div align="center">
  <p>
    <a href="https://github.com/rizer001">GitHub</a> ·
    <a href="https://dsc.gg/rizer001-development">Discord</a>
  </p>
  <p>© 2026 rizer001</p>
</div>
