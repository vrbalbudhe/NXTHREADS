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

1. Backend layering: routes → controllers → services, shared Prisma selects.
2. Frontend: RTK Query instead of hand-written thunks and duplicate loader hooks.
3. Remove unused dependencies (`mongoose`, `redis`, `@redis/client`, `ws`, `body-parser`, `crypto`), move `nodemon` to devDependencies, remove debug logging.
4. ESLint + Prettier on both apps; consider TypeScript.
5. Schema-based request validation with `zod` replacing the hand-written validators.
6. Search over the full post collection on the server instead of the first page on the client.

## Phase 3 — Testing and delivery

1. Backend: Jest/Vitest + Supertest for auth, OTP, ownership rules.
2. Frontend: Vitest + React Testing Library; Playwright end-to-end for sign-up → post → comment → follow.
3. One CI pipeline (GitHub Actions): lint, test, build, Docker images tagged by commit SHA. Remove unused Jenkins / CodeDeploy / k8s paths.
4. Fix path casing (`backend/` vs `Backend/`) in `buildspec.yml`, `docker-compose.yml`, `scripts/`; production nginx image for the frontend; one Node LTS version everywhere; non-root containers.

## Phase 4 — Product

Rich-text editor with sanitizing, signed Cloudinary uploads, Atlas Search and tags, notifications, password reset, comment replies, SEO metadata, structured logging and error tracking.
