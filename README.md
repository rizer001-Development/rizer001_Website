<div align="center">
  <br />
  <img src="https://avatars.githubusercontent.com/u/191371167?v=4" width="120" style="border-radius: 50%;" alt="rizer001" />
  
  # rizer001_Website
  
  ### Личный сайт rizer001 — Minecraft Developer &amp; Creator
  
  <p align="center">
    <a href="https://github.com/rizer001/rizer001_Website/blob/main/LICENSE">
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
  </p>
  
  <br />
</div>

---

## 📋 Описание

Персональный веб-сайт с интеграцией Discord и GitHub. Содержит:

- **Блог/Новости** — публикация обновлений с синхронизацией в Discord
- **Чат с Discord** — отправка сообщений через вебхук, история сообщений в БД
- **GitHub активность** — логи с пагинацией, вкладками по репозиториям, отображением коммитов
- **Админ-панель** — управление пользователями, ролями (Owner/Admin), новостями, Discord вебхуком
- **Авторизация** — вход через GitHub OAuth

## 🚀 Технологии

| Технология | Версия | Назначение |
|-----------|--------|-----------|
| **Next.js** | 15 | React-фреймворк (App Router) |
| **React** | 19 | UI библиотека |
| **TypeScript** | 5 | Типизация |
| **Tailwind CSS** | 4 | Стилизация |
| **Prisma** | 6 | ORM (SQLite) |
| **NextAuth** | 4 | OAuth авторизация (GitHub) |
| **PostgreSQL** | — | База данных |

## ✨ Возможности

### 🔐 Авторизация
- Вход через GitHub OAuth
- Система ролей: **Owner** (неснимаемый), **Admin**, **User**
- Первый пользователь — автоматически Owner

### 👑 Админ-панель
- **Новости** — создание, публикация, удаление
- **Discord** — настройка Webhook URL, тестовая отправка
- **Пользователи** — список, назначение/снятие админки
- **GitHub логи** — активность с пагинацией и вкладками по репозиториям

### 💬 Чат / Discord
- Превью Discord сервера (онлайн, участники)
- Отправка сообщений через вебхук
- История сообщений в БД (авто-очистка 24ч)
- Динамическое КД на отправку (1с + 1с за сообщение, -1с каждые 2с)
- Очередь сообщений (1/сек для Discord)
- Очистка истории с подтверждением

### 📊 GitHub активность
- Просмотр событий (Push, Issue, PR, Release, Star, Fork)
- Вкладки по каждому репозиторию
- Пагинация по 10 событий
- Отображение коммитов через Compare API
- Индикатор лимита запросов GitHub API

## 🛠️ Установка и запуск

### Требования
- Node.js 18+
- npm или yarn

### 1. Клонирование
```bash
git clone https://github.com/rizer001/rizer001_Website.git
cd rizer001_Website
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Настройка переменных окружения
Создайте файл `.env` в корне проекта:

```env
# === GitHub OAuth (обязательно) ===
GITHUB_CLIENT_ID=ваш_гитхаб_client_id
GITHUB_CLIENT_SECRET=ваш_гитхаб_client_secret

# === База данных ===
DATABASE_URL="file:./dev.db"

# === GitHub API (опционально, для коммитов в логах) ===
GITHUB_TOKEN=ваш_гитхаб_токен
GITHUB_USERNAME=rizer001

# === Владелец сайта ===
OWNER_USERNAME=rizer001

# === Discord (опционально) ===
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
DISCORD_INVITE_CODE=код_приглашения
```

### 4. Инициализация БД
```bash
npx prisma db push
```

### 5. Запуск
```bash
# Режим разработки
npm run dev -- -p 3003

# Продакшен сборка
npm run build
npm start -- -p 3003
```

### 6. OAuth настройка
1. Создай GitHub OAuth App: Settings → Developer settings → OAuth Apps
2. Homepage URL: `http://localhost:3003`
3. Authorization callback URL: `http://localhost:3003/api/auth/callback/github`

## 🔑 Переменные окружения

| Переменная | Обязательно | Описание |
|-----------|------------|---------|
| `GITHUB_CLIENT_ID` | ✅ | GitHub OAuth Client ID |
| `GITHUB_CLIENT_SECRET` | ✅ | GitHub OAuth Client Secret |
| `DATABASE_URL` | ✅ | Путь к SQLite БД (`file:./dev.db`) |
| `OWNER_USERNAME` | ✅ | GitHub username владельца сайта |
| `GITHUB_TOKEN` | ❌ | Токен GitHub API (для коммитов) |
| `GITHUB_USERNAME` | ❌ | GitHub username (по умолч. rizer001) |
| `DISCORD_WEBHOOK_URL` | ❌ | URL вебхука Discord |
| `DISCORD_INVITE_CODE` | ❌ | Код приглашения Discord сервера |

## 📁 Структура проекта

```
src/
├── app/
│   ├── admin/          # Админ-панель
│   ├── api/            # API роуты
│   │   ├── admin/      # Управление настройками/пользователями
│   │   ├── chat/       # История сообщений
│   │   ├── discord/    # Discord интеграция
│   │   └── github/     # GitHub активность
│   ├── auth/           # Страницы авторизации
│   ├── chat/           # Чат/Discord страница
│   ├── news/           # Новости
│   └── page.tsx        # Главная
├── components/         # React компоненты
│   ├── Navbar.tsx
│   ├── ContactForm.tsx
│   ├── GitHubProjects.tsx
│   └── ...
└── lib/                # Утилиты
    ├── auth.ts         # NextAuth конфиг
    ├── discord.ts      # Discord API
    ├── prisma.ts       # Prisma клиент
    └── settings.ts     # Настройки

prisma/
└── schema.prisma       # Схема БД
```

## ⚖️ Лицензия

Проект распространяется под лицензией **GNU Affero General Public License v3.0** (AGPLv3).

Это означает:
- ✅ Вы можете использовать, модифицировать и распространять код
- ✅ Если вы изменяете код и запускаете его на сервере, вы обязаны公开ить изменения
- ❌ Запрещено использовать в проприетарных проектах без открытия исходного кода

Подробнее: [LICENSE](./LICENSE)

---

<div align="center">
  <p>
    <a href="https://github.com/rizer001">GitHub</a> ·
    <a href="https://dsc.gg/rizer001-development">Discord</a>
  </p>
  <p>© 2026 rizer001</p>
</div>
