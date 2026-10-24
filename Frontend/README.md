# Aurel — The Social Atelier

A production-quality React front end for the MERN social-media API. Editorial layout,
ivory/ink/terracotta palette, Fraunces + Manrope typography, and a dark atelier sidebar.

Every screen talks to the real backend contract — no mock data, no invented endpoints.

---

## Stack

| Concern | Choice |
| --- | --- |
| Framework | React 19 + Vite 8 (JS/JSX) |
| Routing | React Router 7 |
| State | Redux Toolkit + React Redux |
| HTTP | Axios (Bearer token interceptor, 401 → session expiry) |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Feedback | React Hot Toast |

---

## Quick start

```bash
npm install
cp .env.example .env      # then set VITE_API_URL
npm run dev               # http://localhost:5173
```

The dev and preview servers are pinned to port **5173** (`strictPort: true`) because the
deployed backend's CORS allow-list only accepts that origin. If the port is taken, Vite
will fail fast rather than silently moving to another port.

```bash
npm run build             # production bundle in dist/
npm run preview           # serve dist/ on :5173
npm run lint              # ESLint
```

---

## Configuration

Only one variable is required:

```dotenv
VITE_API_URL=https://your-backend.example.com/api
```

- The value is normalised at runtime (trailing slashes are stripped in `src/services/api.mjs`).
- If it is missing, the app falls back to the Vercel deployment currently in `.env`.
- `.env.example` keeps the URL from the original brief.
  **That Render URL (`mern-stack-pre-hackathon.onrender.com`) returns 404 and is not in use.**
  The working deployment is `https://mern-stack-pre-hackathon-ptnt.vercel.app/api`.

### Deploying

1. Build with `VITE_API_URL` pointing at your backend.
2. Add the deployed front-end origin to the backend's CORS allow-list — it currently allows
   only `http://localhost:5173`, so a deployed site will be blocked until this is changed.
3. Set the backend's `FRONTEND_URL` so generated QR codes and share links point at the UI
   rather than at the API host.
4. Serve `dist/` with an SPA rewrite (`/* → /index.html`) so deep links resolve.

---

## Routes

| Path | Page | Access |
| --- | --- | --- |
| `/login` | Sign in | guest only |
| `/signup` | Create account | guest only |
| `/verify-email` | OTP verification | public |
| `/forgot-password` | Request reset link | public |
| `/reset-password` | Set new password (token in query) | public |
| `/` | Journal feed | protected |
| `/explore` | Search stories + people | protected |
| `/create` | New post | protected |
| `/posts/:postId` | Post detail + comments | protected |
| `/posts/:postId/edit` | Edit post | protected (author) |
| `/bookmarks` | Saved posts | protected |
| `/notifications` | Activity | protected |
| `/profile` | Own profile | protected |
| `/profile/edit` | Edit profile + avatar | protected |
| `/profile/change-password` | Change password | protected |
| `/users/:userId` | Another member's profile | protected |
| `*` | 404 | public |

Guests hitting a protected route are redirected to `/login` with the intended path
preserved, then returned there after sign-in.

---

## Backend contracts used

Verified against the backend source, routes, controllers, models and Postman collection.

**Auth** — `POST /auth/signup`, `/auth/login`, `/auth/verify-email`, `/auth/forgot-Password`
(note the capital **P**), `/auth/reset-password`, `/auth/logout`; `GET /auth/me`.

**Profile** — `GET|PUT /profile`; `PATCH|DELETE /profile/picture` (multipart field
`profilePicture`); `PATCH /profile/change-password` (`{ currentPassword, newPassword }`).

**Posts** — `GET /posts` (`page, limit, search, sort, userId`), `POST /posts` (multipart:
`title, content, images`), `GET|PATCH|DELETE /posts/:id`, `PATCH /posts/:id/like`,
`GET|POST /posts/:id/comments`, `DELETE /posts/:postId/comments/:commentId`,
`PATCH /posts/:id/bookmark`, `GET /posts/bookmarks/me`, `GET /posts/:id/qr`.

**People & activity** — `GET /users/search?q`, `GET /users/:userId`, `GET /notifications`,
`GET /notifications/unread-count`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`.

### Session model

- `POST /auth/login` returns a Bearer JWT; it is stored under `aurel.auth.token`.
- Every request attaches `Authorization: Bearer <token>` via an Axios interceptor.
- On boot the app re-hydrates from storage and calls `GET /auth/me`. A rejected token clears
  the session and drops the user on `/login` with a single, de-bounced toast (no toast storms).
- Any `401` outside the credential endpoints emits a `aurel:session-expired` event, which the
  store listens for and resets. Logout clears all slices so the next account starts clean.

### Bookmarks

Post payloads do not include per-user bookmark state, so the saved list is fetched once per
session after authentication and stored in the posts slice. That keeps every Save control
accurate on reload instead of only after visiting `/bookmarks`.

---

## Project structure

```
src/
  app/            Redux store
  components/
    layout/       AppShell, Sidebar, RightRail, MobileNav, AccountMenu
    posts/        PostCard, PostComposer, PostGallery, CommentSection, PostMenu, QrDialog
    profile/      AvatarEditor, ProfileSkeleton
    ui/           Button, Field, Avatar, Modal, ConfirmDialog, OtpInput, states, …
  features/       auth / posts / profile / notifications slices
  hooks/          useDebounce, useDocumentTitle, useOnClickOutside, useBodyScrollLock
  pages/          one file per route (+ pages/auth/)
  routes/         ProtectedRoute, GuestRoute, ScrollToTop
  schemas/        Zod validation for every form
  services/       Axios instance + one service module per backend area
  styles/         global tokens, shell, auth, feed, posts, profile, pages
  utils/          formatting, error normalisation, media limits, share helpers
```

---

## Design notes

- **Tokens** live in `src/styles/global.css` — paper `#f2ede3`, ink `#17150f`, terracotta
  accent `#a8442a`. All body/secondary text meets WCAG AA on the paper surface.
- **Type** is a two-family system: Fraunces for editorial display, Manrope for interface.
- **Motion** is limited to 0.18s colour/transform transitions; `prefers-reduced-motion` and
  focus-visible rings are respected throughout.
- **Responsive** at 1280 / 1024 / 760 / 520 px — the sidebar collapses to a rail, then to a
  bottom tab bar on mobile.
- **States** — every async surface has a skeleton or loader, an empty state with a next action,
  and an error state with retry. Destructive actions (delete post/comment, remove avatar,
  change password) go through a confirmation dialog.

---

## Verification performed

| Check | Result |
| --- | --- |
| `npm run build` | ✅ 2184 modules, 638.9 kB JS (199.7 kB gzip), 67.1 kB CSS (13.1 kB gzip) |
| Lighthouse — `/`, `/profile`, `/explore`, `/notifications`, `/bookmarks`, `/settings` | ✅ Accessibility 1.0 · Best Practices 1.0 · SEO 1.0 |
| Lighthouse — `/login` | ✅ Accessibility 1.0 (contrast + logo labelling fixed) |
| `npm run lint` | ✅ 0 errors, 0 warnings |
| Layout overflow at 1440/1024/760/390 px | ✅ none |
| Live backend reachability | ✅ login error path returns `Invalid email or password` from the Vercel API; CORS OK from `:5173` |
| Full CRUD flow | ✅ exercised against a temporary local mock that mirrors the documented contract (feed, create/edit/delete post, likes, comments, bookmarks, notifications, profile edit, avatar, change password, route guards, session persistence) |

The only build warning is Vite's >500 kB chunk advisory, which is expected for a
single-bundle app of this size.

---

## Known limitations

These come from the backend, not the front end:

1. **No OTP resend endpoint.** The verification screen can resend only by re-submitting the
   e-mail, so the button explains that a new code follows the same flow rather than pretending
   a dedicated endpoint exists.
2. **E-mail verification is not enforced at login.** Accounts can sign in before verifying.
3. **Post images are write-once.** `PATCH /posts/:id` accepts text only; the edit screen
   therefore shows existing images read-only instead of offering a replacement that the API
   would silently ignore.
4. **QR/share URLs** are generated server-side from the backend's `FRONTEND_URL`. Until that is
   set, scanned codes resolve to the API host.
5. **CORS** allows `http://localhost:5173` only, which is why both dev and preview are pinned
   to that port.
6. **Live end-to-end CRUD is unverified with real credentials.** The deployed API was probed
   for reachability and error handling, but creating an account on someone's live database was
   out of scope; the complete flow was validated against a contract-accurate local mock.

### Notes for maintainers

- `_backend_inspect/` is a read-only reference copy of the backend used to confirm every
  request/response shape. It is not imported by the app and can be deleted.
- `public/robots.txt` disallows authenticated routes and exposes only the auth entry points.
