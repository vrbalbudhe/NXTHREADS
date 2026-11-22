# NXTHREADS Development Plan

## Phase 0 — Security and stability (in progress)

| # | Task | Status |
|---|------|--------|
| 0.1 | Move every hardcoded secret (SMTP, Cloudinary, Firebase, MongoDB, JWT) into environment variables and ship `.env.example` files | Done in code |
| 0.2 | Rotate every secret that was ever committed and purge it from git history | **Owner action** |
| 0.3 | Validate required environment variables at startup | Done |
| 0.4 | Fix backend startup crash (`bcrypt` → `bcryptjs`), add `start` / `dev` scripts | Done |
| 0.5 | OTP flow: never delete accounts on a wrong code, 10-minute expiry, 5-attempt limit, duplicate-account handling | Done |
| 0.6 | Login: block unverified accounts, generic error messages, cookie lifetime matches JWT, logout clears the same cookie | Done |
| 0.7 | Rate-limit login, register and OTP endpoints | Done |
| 0.8 | Never return password hashes; emails only to their owner | Done |
| 0.9 | Identity always comes from the session cookie, never from the request body | Done |
| 0.10 | Ownership checks on post update/delete, profile update, comment delete, chat history | Done |
| 0.11 | Authentication on comment, follow and chat mutations | Done |
| 0.12 | JSON 401 responses instead of HTML pages, no internal error messages in responses | Done |
| 0.13 | Remove crash-causing Socket.IO emits that were never wired up | Done |
| 0.14 | Password change requires the current password | Done |

### Owner actions required for Phase 0

1. Rotate: MongoDB Atlas user password, `JWT_SECRET_KEY`, Gmail app password, Cloudinary API secret. Restrict the Firebase API key to your domains.
2. Purge history with `git filter-repo` (or BFG) for `k8s/backend-configmap.yaml`, `Backend/Controller/Auth.Controller.js`, `Backend/Config/Cloudinary.js`, `Frontend/Blog_UI/src/firebase.js`, `Frontend/Blog_UI/.env`, then force-push.
3. Stop tracking the frontend env file: `git rm --cached Frontend/Blog_UI/.env`.
4. Regenerate the Prisma client after the schema change: `cd Backend && npx prisma generate`.
5. Create `Backend/.env` from `Backend/.env.example`, and the Kubernetes secret from `k8s/backend-secret.example.yaml`.
6. On Node 22+ run `cd Backend && npm install jsonwebtoken@latest` (the installed `jwa` / `buffer-equal-constant-time` chain crashes on Node 25).
7. Accounts that were never email-verified can no longer log in; those users must register again with the same email to receive a new code.

## Phase 1 — Make features correct (next)

Branch: `feature/phase-1-realtime-chat` (built on `feature/phase-0-security-hardening`).

| # | Task | Status |
|---|------|--------|
| 1.1 | Socket.IO on the Express server, authenticated with the session cookie, per-socket rate limit | Done |
| 1.2 | Chat on MongoDB: contacts (follows + conversations) with unread counts, paged history, read receipts, REST fallback | Done |
| 1.3 | Messaging allowed only between users where either follows the other, or who already have a conversation | Done |
| 1.4 | Frontend chat rewritten on REST + Socket.IO; Firebase code, dependency and env variables removed | Done |
| 1.5 | Old Firestore messages | Not migrated (start fresh) |
| 1.6 | `helmet` security headers, graceful shutdown | Done |
| 1.7 | Like/dislike return authoritative counts; counts correct in every feed | Done |
| 1.8 | Personalized feed paged in the database (chronological), infinite scroll on both feeds | Done |
| 1.9 | Save button on posts, Saved tab on own profile | Done |
| 1.10 | Account deletion with password + typed confirmation, full cascade | Done |
| 1.11 | 404 page; removed the empty `/:id` catch-all route and dead components | Done |
| 1.12 | Request validation | Kept as hand-written validators in `lib/validators.js`; `zod` moved to Phase 2 |
| 1.13 | Shared rate-limit store (Redis) | Only needed when running more than one backend instance; moved to Phase 3 |

Verified with an end-to-end script against a real database: 26/26 checks passed (auth, posts, likes, saves, permissions, live chat, unread counts, account deletion cascade).

## Phase 2 — Code quality

Branch: `feature/phase-2-code-quality` (built on `feature/phase-1-realtime-chat`).

| # | Task | Status |
|---|------|--------|
| 2.1 | `npm audit`: 0 vulnerabilities in both apps (nodemailer 10, zod 4, express patches, React Router 7, Vite 8) | Done |
| 2.2 | Removed unused dependencies (`mongoose`, `redis`, `@redis/client`, `ws`, `body-parser`, `crypto`, `redux-thunk`, `nodemon`); `npm run dev` uses `node --watch` | Done |
| 2.3 | Removed dead code: backend Cloudinary config, `NextPrevious`, placeholder post menu; removed debug logging | Done |
| 2.4 | `zod` schemas for every route (`lib/schemas.js` + `Middleware/validate.js`), also used by the socket chat; hand-written validators deleted | Done |
| 2.5 | Server-side search: `/api/post/search` (paged) and `/api/user/search`, regex characters escaped; search page rewritten with debounce and URL `?q=` | Done |
| 2.6 | ESLint 9 flat config in both apps, Prettier config; 0 lint errors (frontend has 12 hook-dependency warnings in older components) | Done |
| 2.7 | Bugs found on the way: login spinner never showed, search page passed the wrong `currentUser`, guests got 401 on category lists and the search filter, filter button did nothing on the search page | Fixed |
| 2.8 | Backend layering (routes → controllers → services) | Partly: validation moved out of controllers, chat has a service; rest stays as is until tests exist |
| 2.9 | RTK Query instead of hand-written thunks and loader hooks | Not started; do after frontend tests exist (Phase 3) |
| 2.10 | Run Prettier over the whole codebase | Not done on purpose: run `npm run format` in each app as its own formatting-only commit |
| 2.11 | TypeScript | Not started |

Verified against the real database: Phase 1 regression 26/26, Phase 2 checks 19/19 (validation, NoSQL operator rejection, `javascript:` URLs, search, regex escaping, paging limits).

## UI redesign

Branch: `feature/ui-redesign` (built on `feature/phase-2-code-quality`).

- New design system (Inter, neutral canvas, white panels, blue accent, full dark mode) and app shell: sidebar with profile card and menu sections, sticky header with live weekly stats, mobile drawer and bottom tab bar.
- Every screen rebuilt: Home (For you / Latest), Post page with threaded discussion, Write / Edit with live preview and drag-and-drop image upload, Topics (two-pane list with counts), Explore (posts and people), People, Profile (cover, stats, follower lists, Saved tab), Saved, Settings (profile photo, password, theme, delete account), Messages (two-pane live chat), Sign in, Register with OTP boxes, About, Privacy, 404. Old URLs redirect to the new ones.
- Data layer replaced: Redux and the loader hooks removed in favour of small hooks over one API client (`src/lib/api.js`); shared contexts for auth, theme, follows and chat (live unread badge on every page). This supersedes Phase 2 item 2.9.
- Backend support: posts return the viewer's own like / dislike / saved state and a comment count (no per-card status requests, no list of who saved a post); `/api/post/stats` and `/api/post/categories`; comment timestamps; public profiles (email only to the owner); `/auth/isLogin` reads the current profile from the database.
- Images upload directly to Cloudinary through an unsigned preset configured by `VITE_CLOUDINARY_CLOUD_NAME` / `VITE_CLOUDINARY_UPLOAD_PRESET`; the third-party widget script is gone.

## Redis and notifications

Branch: `feature/redis-notifications` (built on `feature/ui-redesign`).

- Redis integration (`REDIS_URL`, optional) with an automatic in-memory fallback: shared rate limits, revocable sessions, 30-second cache for stats and topic counts, presence, and the Socket.IO Redis adapter for multiple instances.
- Sessions: every token has an ID. Logout revokes it immediately; changing the password or deleting the account signs out all other devices.
- Notifications for likes, comments and follows: stored in MongoDB, delivered live over the socket, bell badge, toast, notifications page with Today / This week / Earlier, unread filter and mark as read. Removed with the comment, post or account they belong to.
- Chat: online presence dots and typing indicators, limited to people you are connected with.
- `npm run seed` loads realistic demo data (7 users with photos, 13 posts, comments, likes, follows, saves, conversations, notifications).
- `prisma db push` also created missing unique indexes, so duplicate likes, follows and saves are now blocked by the database.
- README rewritten with features, screenshots, setup, environment variables, scripts and API overview.

Verified: 70/70 end-to-end checks (Phase 1 regression 26, Phase 2 regression 19, this phase 25).

## Phase 3 — Testing and delivery

1. Backend: Jest/Vitest + Supertest for auth, OTP, ownership rules.
2. Frontend: Vitest + React Testing Library; Playwright end-to-end for sign-up → post → comment → follow.
3. One CI pipeline (GitHub Actions): lint, test, build, Docker images tagged by commit SHA. Remove unused Jenkins / CodeDeploy / k8s paths.
4. Fix path casing (`backend/` vs `Backend/`) in `buildspec.yml`, `docker-compose.yml`, `scripts/`; production nginx image for the frontend; one Node LTS version everywhere; non-root containers.

## Phase 4 — Product

Rich-text editor with sanitizing, signed Cloudinary uploads, Atlas Search and tags, notifications, password reset, comment replies, SEO metadata, structured logging and error tracking.
