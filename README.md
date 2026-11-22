<div align="center">

<img src="./Frontend/Blog_UI/public/logo.svg" alt="NXTHREADS logo" width="72" />

# NXTHREADS

**A calm home for writers and readers.**
Write stories, follow people you like, discuss in threads and chat in real time.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Prisma-47A248?logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-optional-DC382D?logo=redis&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?logo=socketdotio&logoColor=white)

<img src="./assets/screenshots/home.png" alt="NXTHREADS home feed" width="100%" />

</div>

---

## Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Getting started](#getting-started)
- [Demo data](#demo-data)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [API overview](#api-overview)
- [Project structure](#project-structure)
- [Security](#security)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

---

## Features

### ✍️ Writing
- **Rich posts** with a title, subtitle, topic and multiple images
- **Live preview** while you write, with character counts and reading time
- **Drag-and-drop image upload** straight to Cloudinary, with type and size checks
- Edit or delete your posts at any time

### 💬 Community
- **Threaded discussion** on every post, with author badges and moderation by the post owner
- **Like, dislike, save and share** posts
- **Follow** writers and get a personalised **For you** feed
- **Public profiles** with posts, followers, following and a private **Saved** tab

### ⚡ Real time
- **Direct messages** over Socket.IO with unread badges, read receipts and day grouping
- **Online presence** dots and **typing indicators** in chat
- **Notifications** for likes, comments and new followers, delivered instantly with a bell badge and toast

### 🔎 Discovery
- **Search** across all posts, authors and people, with results in the URL so they can be shared
- **Topics** browser with live post counts per topic
- **Trending topics**, **who to follow** and **community stats** with a 14-day activity trend

### 🛡️ Security and performance
- Every request is validated with **zod**; NoSQL operators, `javascript:` URLs and malformed bodies are rejected
- **Real logout**: sessions are revocable, and changing your password signs out every other device
- **Rate limiting** on sign-in, sign-up, verification codes, search, comments and messages
- **Redis** for shared rate limits, session revocation, presence, caching and the Socket.IO adapter, with an automatic in-memory fallback when Redis isn't configured
- Email verification with 6-digit codes that expire and lock after 5 attempts

### 🎨 Design
- Clean, card-based interface with **light, dark and system** themes
- **Mobile first**: bottom tab bar, slide-in menu and single-pane chat on phones
- Skeleton loading, empty states and accessible labels throughout

---

## Screenshots

<table>
  <tr>
    <td width="50%"><b>Post and discussion</b><br/><img src="./assets/screenshots/discussion.png" alt="Post discussion" /></td>
    <td width="50%"><b>Real-time messages with presence and typing</b><br/><img src="./assets/screenshots/messages.png" alt="Messages" /></td>
  </tr>
  <tr>
    <td><b>Notifications</b><br/><img src="./assets/screenshots/notifications.png" alt="Notifications" /></td>
    <td><b>Topics</b><br/><img src="./assets/screenshots/topics.png" alt="Topics" /></td>
  </tr>
  <tr>
    <td><b>Write with live preview</b><br/><img src="./assets/screenshots/write.png" alt="Write a post" /></td>
    <td><b>Profile</b><br/><img src="./assets/screenshots/profile.png" alt="Profile" /></td>
  </tr>
  <tr>
    <td><b>Explore</b><br/><img src="./assets/screenshots/explore.png" alt="Explore" /></td>
    <td><b>Settings</b><br/><img src="./assets/screenshots/settings.png" alt="Settings" /></td>
  </tr>
  <tr>
    <td><b>Dark mode</b><br/><img src="./assets/screenshots/home-dark.png" alt="Dark mode" /></td>
    <td><b>Sign in</b><br/><img src="./assets/screenshots/login.png" alt="Sign in" /></td>
  </tr>
</table>

### Mobile

<p align="center">
  <img src="./assets/screenshots/mobile-home.png" alt="Mobile feed" width="23%" />
  <img src="./assets/screenshots/mobile-post.png" alt="Mobile post" width="23%" />
  <img src="./assets/screenshots/mobile-chat.png" alt="Mobile chat" width="23%" />
  <img src="./assets/screenshots/mobile-notifications.png" alt="Mobile notifications" width="23%" />
</p>

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 7, Vite 8, Tailwind CSS, lucide icons, Socket.IO client |
| Backend | Node.js, Express 4, Socket.IO 4, zod, helmet, Nodemailer |
| Data | MongoDB (Atlas) through Prisma |
| Cache and real time | Redis (optional): sessions, rate limits, presence, cache, Socket.IO adapter |
| Media | Cloudinary (unsigned uploads from the browser) |
| Tooling | ESLint 9, Prettier |

---

## Architecture

```mermaid
flowchart LR
  subgraph Browser
    UI[React app]
  end
  subgraph Server[Express server]
    API[REST API<br/>zod validation, rate limits]
    WS[Socket.IO<br/>chat, presence, notifications]
  end
  DB[(MongoDB)]
  R[(Redis<br/>optional)]
  CDN[Cloudinary]
  Mail[SMTP]

  UI -- HTTPS + session cookie --> API
  UI <-- WebSocket --> WS
  UI -- image upload --> CDN
  API --> DB
  WS --> DB
  API --> R
  WS --> R
  API --> Mail
```

Without `REDIS_URL` the server keeps sessions, rate limits, presence and cache in memory, which is fine for one instance. Set `REDIS_URL` to share them across instances and survive restarts.

---

## Getting started

### Prerequisites
- **Node.js 20.19+** (Node 22 LTS recommended)
- A **MongoDB** database that supports transactions (a free MongoDB Atlas cluster works)
- Optional: **Redis** (Upstash, Redis Cloud or local), a **Gmail app password** for verification emails, and a **Cloudinary** unsigned upload preset for images

### 1. Clone

```bash
git clone https://github.com/vrbalbudhe/NXTHREADS.git
```

```bash
cd NXTHREADS
```

### 2. Backend

```bash
cd Backend
```

```bash
npm install
```

Copy `.env.example` to `.env` and fill in at least `DATABASE_URL` and `JWT_SECRET_KEY` (see [Environment variables](#environment-variables)). Then create the Prisma client and database indexes:

```bash
npm run prisma:generate
```

```bash
npm run db:push
```

Start the API on http://localhost:8000:

```bash
npm run dev
```

### 3. Frontend

In a second terminal:

```bash
cd Frontend/Blog_UI
```

```bash
npm install
```

Copy `.env.example` to `.env.local`, set `VITE_API_BASE_URL=http://localhost:8000` and your Cloudinary values, then start the app on http://localhost:5173:

```bash
npm run dev
```

---

## Demo data

Fill a local database with seven realistic users (with profile photos), thirteen posts across topics, comments, likes, follows, saved posts, conversations and notifications:

```bash
cd Backend
```

```bash
SEED_PASSWORD="choose-a-password" npm run seed
```

On Windows PowerShell:

```powershell
$env:SEED_PASSWORD="choose-a-password"; npm run seed
```

Every demo account uses the password you pass in. Sign in as `ava.martinez@example.com` to see unread notifications and messages. The other accounts are `bencarter`, `priya.sharma`, `danielkim`, `sofia.rossi`, `marcusj` and `lena.fischer`, all `@example.com`.

Running the seed again replaces the previous demo data. It refuses to run when `NODE_ENV=production`.

---

## Environment variables

### Backend (`Backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | MongoDB connection string |
| `JWT_SECRET_KEY` | ✅ | Secret for signing session tokens. At least 32 characters in production |
| `FRONTEND_URL` | | Allowed browser origin. Default `http://localhost:5173` |
| `PORT` | | API port. Default `8000` |
| `NODE_ENV` | | `production` enables secure cross-site cookies |
| `TRUST_PROXY` | | `true` when running behind a reverse proxy or load balancer |
| `REDIS_URL` | | Redis connection, e.g. `rediss://default:password@host:port`. Falls back to memory when empty |
| `SMTP_SERVICE` | | Nodemailer service. Default `Gmail` |
| `SMTP_USER` / `SMTP_PASS` | | Mail account and app password for verification codes |
| `SMTP_FROM` | | Sender address. Defaults to `SMTP_USER` |
| `SEED_PASSWORD` | | Password for demo accounts created by `npm run seed` |

### Frontend (`Frontend/Blog_UI/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | ✅ | Backend URL, e.g. `http://localhost:8000` |
| `VITE_CLOUDINARY_CLOUD_NAME` | | Cloudinary cloud name for image uploads |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | | Unsigned upload preset |

---

## Scripts

### Backend

| Command | What it does |
|---|---|
| `npm run dev` | Start the API with auto-restart on file changes |
| `npm start` | Start the API |
| `npm run prisma:generate` | Generate the Prisma client |
| `npm run db:push` | Sync collections and indexes with `prisma/schema.prisma` |
| `npm run seed` | Load realistic demo data (needs `SEED_PASSWORD`) |
| `npm run lint` / `lint:fix` | Check or fix code with ESLint |
| `npm run format` / `format:check` | Format or check code with Prettier |

### Frontend

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` / `lint:fix` | Check or fix code with ESLint |
| `npm run format` / `format:check` | Format or check code with Prettier |

---

## API overview

All endpoints are under `/api`. 🔒 marks endpoints that need a signed-in session.

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/verify-otp`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/isLogin` |
| Posts | `GET /post`, `GET /post/search`, `GET /post/fltr`, `GET /post/get/:id`, `GET /post/:userId`, `GET /post/categories`, `GET /post/stats`, 🔒 `POST /post`, 🔒 `PUT /post/upd/:id`, 🔒 `DELETE /post/:id` |
| Reactions | 🔒 `POST /post/like`, 🔒 `POST /post/unlike`, 🔒 `POST /post/fav`, 🔒 `GET /post/fav/:id`, 🔒 `GET /post/gfp/:userId` |
| Comments | `GET /comment/:postId`, 🔒 `POST /comment/create`, 🔒 `DELETE /comment/delete/:id` |
| Users | `GET /user/:id`, 🔒 `GET /user`, 🔒 `GET /user/search`, 🔒 `PUT /user/upd/:id`, 🔒 `DELETE /user/:id` |
| Follows | `GET /userfollow/followers/:id`, `GET /userfollow/following/:id`, 🔒 `POST /userfollow/follow` |
| Chat | 🔒 `GET /chat/contacts`, 🔒 `GET /chat/messages/:userId`, 🔒 `POST /chat/messages` |
| Notifications | 🔒 `GET /notifications`, 🔒 `GET /notifications/unread-count`, 🔒 `POST /notifications/read` |

**Socket.IO events**: `chat:send`, `chat:message`, `chat:read`, `chat:typing`, `presence:update`, `notification:new`, `notification:read`.

---

## Project structure

```
NXTHREADS/
├── Backend/
│   ├── app.js                 Express app, routes, startup and shutdown
│   ├── socket.js              Socket.IO: auth, chat, presence, typing
│   ├── Config/env.js          Validated environment settings
│   ├── Controller/            Route handlers
│   ├── Routes/                Express routers
│   ├── Middleware/            Auth, validation, rate limiting
│   ├── lib/                   Prisma, Redis store, sessions, schemas, notifications
│   └── prisma/                Schema, seed script and demo data
├── Frontend/Blog_UI/
│   └── src/
│       ├── pages/             Screens (Home, Post, Topics, Messages, …)
│       ├── Components/        layout, post, ui, user and widget components
│       ├── Context/           Auth, theme, follows, chat and notifications
│       ├── hooks/             Data fetching and UI hooks
│       └── lib/               API client, formatting, uploads
├── assets/screenshots/        Images used in this README
├── k8s/                       Kubernetes manifests
└── DEVELOPMENT_PLAN.md        Roadmap and change history
```

---

## Security

- Passwords are hashed with bcrypt. Sessions live in an HTTP-only cookie and can be revoked.
- Users can only change or delete their own posts, comments, profile and account.
- Email addresses are only shown to their owner.
- Secrets are read from environment variables and never committed. Example files contain placeholders only.

Found a vulnerability? Please email the maintainer instead of opening a public issue.

---

## Roadmap

See [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) for what has shipped and what comes next: automated tests, CI/CD, comment replies, password reset and a Markdown editor.

---

## Contributing

1. Fork the repository and create a feature branch.
2. Run `npm run lint` and `npm run build` in the app you changed.
3. Open a pull request describing the change and how you tested it.

---

If you like the project, consider giving it a ⭐
