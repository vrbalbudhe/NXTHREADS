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

1. **Replace Firebase chat with the backend** (Firebase is to be removed):
   - Attach Socket.IO to the Express HTTP server, authenticate sockets with the same session cookie.
   - Use the existing `Chat` / `Message` Prisma models and the now-secured `/api/chat` routes for history.
   - Rewrite `ChatingPage`, `useFirebaseChat`, `useFirebaseUsers` against REST + Socket.IO.
   - Delete `firebase.js`, `syncUsersToFirebase.js`, the `firebase` dependency and the `VITE_FIREBASE_*` variables.
   - One-off script to migrate existing Firestore messages into MongoDB if they are worth keeping.
2. Request validation (`zod`), central error handler, consistent `{ success, data, message }` responses.
3. `helmet`, request body size limit, replace the in-memory rate limiter with `express-rate-limit` + Redis when running more than one instance.
4. Like/unlike counters inside `prisma.$transaction`; database-side pagination for the personalized feed; frontend infinite scroll.
5. Fix the broken saved-posts endpoint (`/api/post/favourite/:id` does not exist), implement account deletion, 404 route on the frontend.

## Phase 2 — Code quality

1. Backend layering: routes → controllers → services, shared Prisma selects.
2. Frontend: RTK Query instead of hand-written thunks and duplicate loader hooks.
3. Remove unused dependencies (`mongoose`, `redis`, `@redis/client`, `ws`, `body-parser`, `crypto`), move `nodemon` to devDependencies, remove debug logging.
4. ESLint + Prettier on both apps; consider TypeScript.

## Phase 3 — Testing and delivery

1. Backend: Jest/Vitest + Supertest for auth, OTP, ownership rules.
2. Frontend: Vitest + React Testing Library; Playwright end-to-end for sign-up → post → comment → follow.
3. One CI pipeline (GitHub Actions): lint, test, build, Docker images tagged by commit SHA. Remove unused Jenkins / CodeDeploy / k8s paths.
4. Fix path casing (`backend/` vs `Backend/`) in `buildspec.yml`, `docker-compose.yml`, `scripts/`; production nginx image for the frontend; one Node LTS version everywhere; non-root containers.

## Phase 4 — Product

Rich-text editor with sanitizing, signed Cloudinary uploads, Atlas Search and tags, notifications, password reset, comment replies, SEO metadata, structured logging and error tracking.
