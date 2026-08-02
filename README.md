# Hotel Booking System (MERN Stack)

A full-stack hotel booking platform built with MongoDB, Express.js, React.js, and Node.js, with Tailwind CSS on the frontend. Built as a Final Year BCA project, following clean MVC architecture with manually implemented authentication (no Clerk/Firebase/Auth0/Passport/NextAuth/Supabase).

Three roles are supported: **User** (guest), **Hotel Owner**, and **Admin**.

> **Status: Pass 2 of an incremental build.** Pass 1 delivered the full project scaffold, every database model, and a complete manual authentication system for all three roles. Pass 2 adds the public-facing guest site: hotel search/browse/details backed by real (aggregation-driven) read endpoints, plus Home, Hotels, Hotel Details, About, Contact, FAQ, Privacy Policy, and Terms pages. Owner-side hotel/room management, booking, payments, reviews-writing, wishlist, recommendations, the AI chatbot, and the Owner/Admin dashboards are separate follow-up modules — each will be built and reviewed one at a time, per the project's own development rules. See [Feature status](#feature-status) below for what's implemented vs. pending.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 19, Vite, React Router DOM, Tailwind CSS v4, Axios, Context API |
| Backend | Node.js, Express.js (ESM) |
| Database | MongoDB, Mongoose |
| Auth | JWT + bcrypt, implemented manually (no auth libraries) |
| Image storage | Cloudinary (wired, needs credentials) |
| Email | Nodemailer (wired, needs SMTP credentials) |
| Payments | eSewa, Khalti (models/env ready; integration is a later module) |
| Other | Helmet, CORS, express-rate-limit, express-validator, Multer, PDFKit, Google Maps API (later module) |

## Folder structure

```
hotelbooking/
├── client/                    # React + Vite frontend
│   └── src/
│       ├── components/        # Reusable UI (Button, TextField, ProtectedRoute, Spinner, HotelCard, StarRating, Pagination, SearchBar, FilterSidebar, ReviewCard, Accordion, Testimonials, WhyChooseUs, ImageGallery, MapEmbed...)
│       ├── pages/              # Route-level pages (public/, auth/, user/, DashboardPage, NotFoundPage)
│       ├── layouts/             # AuthLayout, PublicLayout (header/nav/footer for the guest site)
│       ├── context/              # AuthContext (per-role sessions), ToastContext
│       ├── hooks/                  # useAuth(role), useToast
│       ├── services/                # apiClient (axios), authService, hotelService, contactService
│       ├── algorithms/                # (reserved for future client-side algorithm helpers)
│       ├── utils/                       # getErrorMessage
│       └── assets/
├── server/                     # Express backend
│   ├── config/                  # db.js, cloudinary.js, env.js
│   ├── controllers/              # auth.controller.js (User/Owner factory), admin.controller.js, hotel.controller.js, review.controller.js, contact.controller.js
│   ├── middleware/                 # auth (JWT verify + RBAC), error handler, rate limiter, validate
│   ├── models/                      # All 14 Mongoose models (see below)
│   ├── routes/                       # userAuth / ownerAuth / adminAuth (under /api/auth), hotel.routes.js (/api/hotels), contact.routes.js (/api/contact)
│   ├── services/                       # token.service.js, email.service.js
│   ├── algorithms/                      # (reserved: recommendation/, search/ for later modules)
│   ├── validators/                       # express-validator chains
│   ├── utils/                              # ApiError, ApiResponse, asyncHandler, crypto (secure tokens)
│   ├── emailTemplates/                      # HTML email templates
│   ├── uploads/                               # Local temp dir for Multer before Cloudinary upload
│   ├── scripts/                                # seedAdmin.js, seedPublicData.js
│   ├── app.js, server.js
│   └── .env.example
├── package.json                # Root: runs client + server together via `npm run dev`
└── .gitignore
```

## Getting started

### Prerequisites

- Node.js 20+ and npm
- A MongoDB instance — either [installed locally](https://www.mongodb.com/try/download/community) or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure environment variables

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env   # optional in dev — see note in the file
```

Edit `server/.env` — at minimum set `MONGO_URI` to your MongoDB connection string. See [Environment variables](#environment-variables) below for the full reference.

### 3. Seed the Admin account

Admin has no public registration route — it's created directly from env vars:

```bash
npm run seed:admin
```

This upserts an Admin using `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `server/.env`. Re-run it any time to reset the admin password.

### 4. Seed demo hotels (optional, recommended)

Owner-side hotel creation doesn't exist yet (that's a later module), so the public site has nothing to show against a fresh database. Run:

```bash
npm run seed:public
```

This creates 2 demo Owners, 10 demo Hotels (already `approved`, spread across a few Nepali cities) with rooms and reviews, and a handful of demo reviewer accounts — everything tagged with a fixed `@seed.demo` email domain, so it's safe to re-run any time without touching real accounts. It prints the demo login password when done.

### 5. Run the app

```bash
npm run dev
```

This starts the Express API on `http://localhost:5000` and the Vite dev server on `http://localhost:5173` together (via `concurrently`). The Vite dev server proxies `/api/*` to the backend (see `client/vite.config.js`), so the frontend talks to `/api/...` regardless of environment.

Visit `http://localhost:5173` — you'll land on the public homepage. Browse hotels, search/filter/sort results, and open a hotel's details page without an account. Sign-in/sign-up entry points for all three roles (Guest / Hotel Owner / Admin) live in the header and footer, each with its own login, register, forgot/reset-password, and email verification flow.

## Environment variables

All variables live in `server/.env` (copy from `server/.env.example`). Everything the auth module actually needs is required at boot; everything else is read lazily and simply logs a warning if missing (those features just won't work until configured).

| Variable | Required now? | Notes |
|---|---|---|
| `PORT` | Optional (default 5000) | |
| `MONGO_URI` | **Yes** | Local: `mongodb://localhost:27017/hotelbooking`. Atlas: connection string from your cluster. |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | **Yes** | Long random strings — e.g. `openssl rand -hex 64`. Must differ from each other. |
| `JWT_ACCESS_EXPIRY` / `JWT_REFRESH_EXPIRY` | Optional | Default `15m` / `7d`. |
| `CLIENT_URL` | **Yes** | Used for CORS and for building links inside emails. Default dev value: `http://localhost:5173`. |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Only for `npm run seed:admin` | `ADMIN_EMAIL` is also where Contact page messages are sent — without it, contact emails are skipped (logged, not sent). |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `EMAIL_FROM` | Optional | Without these, emails are skipped (logged, not sent) — registration/login still work. Gmail needs an "App Password", not your normal password. For local testing without a real inbox, [Ethereal](https://ethereal.email) works well. |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Not yet used | Needed starting the Owner-facing Hotel/Room module (real image uploads). The public read side and `seed:public` use static placeholder image URLs instead. |
| `ESEWA_MERCHANT_CODE` / `ESEWA_SECRET` / `KHALTI_SECRET_KEY` | Not yet used | Needed starting the Payment module. Get sandbox credentials from the [eSewa](https://developer.esewa.com.np) and [Khalti](https://docs.khalti.com) developer docs. |
| `GOOGLE_MAPS_API_KEY` | Not yet used server-side | The hotel details map instead reads a client-side `VITE_GOOGLE_MAPS_API_KEY` (see `client/.env.example`) directly for the embed URL; without it, a static placeholder is shown. |

## Database models

All 14 models from the spec are implemented. Only the ones marked "used" have real logic wired to them so far — the rest are structurally complete, ready for the modules that will use them.

| Model | Used so far? |
|---|---|
| User, Owner, Admin | ✅ |
| EmailVerificationToken, PasswordResetToken | ✅ |
| Hotel, Room | ✅ (public read only — write/CRUD is the Owner Hotel/Room module) |
| Review | ✅ (public read only — writing a review requires the booking module) |
| Booking, Payment | Schema only |
| Wishlist | Schema only |
| SearchHistory, RecentlyViewed | Schema only |
| Notification | Schema only |

## Authentication

Implemented entirely from scratch — no Clerk/Firebase/Auth0/Passport/NextAuth/Supabase.

- **Password hashing**: bcrypt (12 salt rounds).
- **Access tokens**: short-lived JWT (15 min default), returned in the response body and held only in memory on the client (never localStorage).
- **Refresh tokens**: longer-lived JWT (7 days default), stored as an **HTTP-only, Secure (in production), SameSite cookie** — scoped per role (`userRefreshToken` at `/api/auth/user`, `ownerRefreshToken` at `/api/auth/owner`, `adminRefreshToken` at `/api/auth/admin`), so a single browser can hold independent User, Owner, and Admin sessions simultaneously without one login clobbering another.
- **Session invalidation**: each account has a `refreshTokenVersion` counter embedded in its refresh token. Logging out or resetting a password increments it, immediately invalidating any outstanding refresh tokens — no server-side token store needed.
- **Email verification & password reset**: single-use tokens are generated with `crypto.randomBytes`, and only their SHA-256 hash is stored in the database — the raw token (sent in the email link) is never persisted, so a database leak alone can't be used to take over accounts.
- **RBAC**: `verifyJWT` middleware validates the access token and loads the account; `authorizeRoles(...)` middleware enforces which roles may hit a given route.

### API endpoints

Mounted under `/api/auth/{user|owner|admin}` (Admin has no `/register`):

| Method | Path | Description |
|---|---|---|
| POST | `/register` | Create account (User/Owner only), sends verification email |
| GET | `/verify-email/:token` | Verify email from the emailed link |
| POST | `/login` | Log in, returns access token + sets refresh cookie |
| POST | `/forgot-password` | Request a password reset email |
| POST | `/reset-password/:token` | Reset password from the emailed link |
| POST | `/refresh-token` | Exchange the refresh cookie for a new access token |
| POST | `/logout` | Invalidate the refresh token and clear the cookie |
| GET | `/me` | Get the current account (requires `Authorization: Bearer <accessToken>`) |

## Public hotel browsing

All routes below are public (no auth) and only ever return `status: 'approved'` hotels — owner name/avatar are populated, but email/password are never exposed.

| Method | Path | Description |
|---|---|---|
| GET | `/api/hotels` | List hotels — query params: `search`, `city`, `country`, `minPrice`, `maxPrice`, `rating`, `amenities` (comma list), `sort` (`price_asc`\|`price_desc`\|`rating`\|`newest`), `page`, `limit`. Price filtering/sorting joins `Room` via aggregation since price lives on the room, not the hotel. |
| GET | `/api/hotels/featured` | Top hotels by rating/views, for the homepage |
| GET | `/api/hotels/:id` | Hotel details + its active rooms (increments `viewCount`) |
| GET | `/api/hotels/:id/similar` | Up to 4 other approved hotels in the same city or with overlapping amenities |
| GET | `/api/hotels/:id/reviews` | Paginated reviews for a hotel |
| POST | `/api/contact` | Contact form — emails `ADMIN_EMAIL` via Nodemailer (skipped/logged if SMTP or `ADMIN_EMAIL` isn't configured) |

### Admin account creation

```bash
npm run seed:admin
```

Reads `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `server/.env` and upserts the Admin document — safe to re-run.

## Security measures in this pass

- `helmet` (secure HTTP headers), `cors` (locked to `CLIENT_URL`, credentials enabled)
- `express-rate-limit` on all auth routes (20 requests / 15 min) and a looser global API limiter
- `express-validator` on every auth input (email format, password complexity, phone format)
- Request body/param sanitization against MongoDB operator injection (e.g. `{ "$ne": null }` payloads)
- Centralized error handler — stack traces only in non-production
- No password/refresh-token-version fields ever returned in API responses

## Verification performed

- **Pass 1 (auth):** Full auth flow (register → verify → login → protected route → refresh → forgot/reset password → logout, plus RBAC, duplicate/weak-password/injection rejection, and independent multi-role cookie sessions) was exercised end-to-end against a real MongoDB instance during development — 30+ assertions, all passing.
- **Pass 2 (public pages):** `npm run seed:public` was run (and re-run, to confirm it's idempotent) against a real MongoDB instance. Every new endpoint (`GET /api/hotels` with each filter/sort/pagination combination, `/featured`, `/:id`, `/:id/similar`, `/:id/reviews`, and `POST /api/contact` including its 422 validation path) was exercised directly with `curl` against the running server. The full public UI was then driven headlessly end-to-end (Home → Hotels search/filter/sort/pagination → Hotel Details → logged-out "Book Now" redirect → About/FAQ accordion/Contact submission/Privacy/Terms → 404), with screenshots captured and the browser console checked for errors at each step. The pre-existing auth pages (`/user`, `/owner`, `/admin` login/register) were re-verified to confirm the routing changes didn't regress them.
- `npm run build --prefix client` compiles cleanly; `npm run lint --prefix client` (oxlint) shows no new warnings.
- The real entry points (`server/server.js` and the Vite dev server) were booted together and live requests were sent through the Vite proxy to a running backend and MongoDB instance.
- No automated test suite is included in these passes (not requested) — the checks above were manual/scripted verification during the build, not a committed test suite.

## Documentation

- **This README**: overview, install guide, env var reference, folder structure, feature status, auth API docs.
- **API docs**: only the auth endpoints are documented so far (table above) — the rest will be documented as each module lands.
- **Deployment guide**: not yet written — will follow once the app has enough surface area to deploy meaningfully.

## Feature status

Legend: ✅ done · ⏳ scaffolded (model/route exists, not wired) · ⬜ not started

| Feature | Status |
|---|---|
| Project scaffold (client/server, MVC folders, configs) | ✅ |
| All database models | ✅ |
| Manual auth (User/Owner/Admin) | ✅ |
| Public Pages (Home, Hotels, Hotel Details, About, Contact, FAQ, Privacy, Terms, 404) | ✅ |
| Hotel search, filters, sorting, pagination (public read side) | ✅ |
| Hotel & Room management + Admin approval workflow (Owner/Admin-facing CRUD) | ⏳ (demo data via `seed:public` in the meantime) |
| Search history / recently viewed | ⬜ |
| Booking workflow + double-booking prevention | ⬜ ("Book Now" links to a placeholder page today) |
| Payments (eSewa/Khalti) | ⬜ |
| PDF invoices | ⬜ |
| Google Maps integration | ⏳ (hotel details renders a live embed if `VITE_GOOGLE_MAPS_API_KEY` is set, else a placeholder) |
| Reviews & ratings (public display), wishlist | ⏳ (reading reviews works; writing a review requires the booking module) |
| Recommendation engine | ⬜ (public "Similar Hotels" uses simple city/amenity matching, not the full engine) |
| AI chatbot (rule-based fallback first) | ⬜ |
| Admin/Owner/User dashboards | ⬜ |
| UI/UX polish (dark mode, skeletons, empty states, lazy loading) | ⏳ (dark mode via OS preference; public pages have loading/empty states, later modules still pending) |

Each remaining item will be built and explained as its own module, with your approval before moving to the next — per the project's own development rules.
