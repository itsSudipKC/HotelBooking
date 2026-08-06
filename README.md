# Hotel Booking System (MERN Stack)

A full-stack hotel booking platform built with MongoDB, Express.js, React.js, and Node.js, with Tailwind CSS on the frontend. Built as a Final Year BCA project, following clean MVC architecture with manually implemented authentication (no Clerk/Firebase/Auth0/Passport/NextAuth/Supabase).

Three roles are supported: **User** (guest), **Hotel Owner**, and **Admin**.

> **Status: Pass 7 of an incremental build.** Pass 1 delivered the full project scaffold, every database model, and a complete manual authentication system for all three roles. Pass 2 added the public-facing guest site: hotel search/browse/details backed by real (aggregation-driven) read endpoints, plus Home, Hotels, Hotel Details, About, Contact, FAQ, Privacy Policy, and Terms pages. Pass 2.5 shipped a single-theme visual redesign (dark mode removed — see [Design](#design)) and real per-role dashboard home pages for User/Owner/Admin. Pass 4 built out the Admin Module's core management surface: Manage Users, Manage Hotel Owners, Manage Hotels (+ the approve/reject workflow), and Manage Bookings. Pass 5 closed the loop on hotel data: Owners can Add/Edit Hotel and Add/Edit/Delete Room themselves. Pass 6 made bookings real: a guest requests a room from Hotel Details, the hotel Accepts or Rejects it from a Booking Requests page, and both Admin's Manage Bookings and the guest's My Bookings reflect it live — see [Booking flow](#booking-flow). Along the way, the public header was made auth-aware and login now returns you to whatever you were doing (e.g. booking) instead of always dropping you on the dashboard. Pass 7 completes the User side: a real Profile page (name/email/phone, password change, avatar) and Wishlist, plus **local disk image upload** (drag-and-drop, no Cloudinary — see [Image uploads](#image-uploads)) replacing pasted URLs on the Owner's Add/Edit Hotel and Room forms. This closes out the roadmap's core CRUD; see [Feature status](#feature-status) for what's genuinely left (payments, PDF invoices, recommendations, AI chatbot, notifications).

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 19, Vite, React Router DOM, Tailwind CSS v4, Axios, Context API |
| Backend | Node.js, Express.js (ESM) |
| Database | MongoDB, Mongoose |
| Auth | JWT + bcrypt, implemented manually (no auth libraries) |
| Image storage | Local disk via Multer, served from `/uploads` (see [Image uploads](#image-uploads)) — Cloudinary config still exists but is unused/no credentials |
| Email | Nodemailer (configured, needs valid SMTP credentials) |
| Payments | eSewa, Khalti (models/env ready; integration is a later module) |
| Other | Helmet, CORS, express-rate-limit, express-validator, Multer, PDFKit, Google Maps API (later module) |

## Design

One deliberate light theme — **no dark mode, no theme toggle**. Colors are token-driven: every component reads `brand-{50..900}` classes from a single `@theme` block in `client/src/index.css`, so the whole app's accent color lives in one place. The accent is a warm coral/terracotta (travel/hospitality-appropriate, distinct from generic SaaS blue); the "exclusive offers" banner on the homepage deliberately breaks to a teal gradient for contrast. Cards, buttons, and inputs use a consistent `rounded-xl`/`rounded-lg` radius with soft shadows for depth (`shadow-sm` → `hover:shadow-md`).

## Booking flow

`ESEWA_MERCHANT_CODE`/`ESEWA_SECRET`/`KHALTI_SECRET_KEY` are still empty, so there's no live payment gateway to build a "pay now" step against yet. Rather than fake one, the flow follows the spec's own Owner Dashboard → "Booking Requests (Accept/Reject)" design, which doesn't need payment to be meaningful:

```
Guest requests a room (status: pending)
        ↓
Hotel Owner reviews it on /owner/bookings
        ↓
   ┌────────────┴────────────┐
Accept                     Reject (reason required)
   ↓                           ↓
confirmed                  rejected
   ↓
Room.bookedDates gains an entry
(the double-booking guard below now sees it)
```

**Double-booking prevention** is real, not a stub: a room has `totalRooms` units of that type. A new request is only blocked if already-`confirmed` bookings overlapping those dates have reached `totalRooms` — multiple *pending* requests for the same dates are allowed (that's what gives the owner something to choose between). The same count is re-checked at Accept time in case the room filled up while a request was waiting. A `Payment`/gateway step can be inserted before "Accept" in a later pass without restructuring any of this.

## Image uploads

Hotel images, room images, and the user avatar are all uploaded from disk — dragged, dropped, or picked via a file browser — and stored locally on the server, **not Cloudinary**. `CLOUDINARY_*` credentials are still empty, and this sidesteps needing them at all for the core flows:

- `POST /api/uploads/image` (any authenticated role) takes one `multipart/form-data` image, validates its mimetype (JPEG/PNG/WEBP/GIF only) and size (5MB max) via `multer`, saves it under `server/uploads/` with a random filename (never the client's own filename), and returns `{ url: '/uploads/<file>', publicId: '<file>' }` — the exact `{url, publicId}` shape `Hotel.images`/`Room.images`/`User.avatar` already expected from the original Cloudinary-shaped schema, so nothing downstream needed to change.
- `app.js` serves `server/uploads/` at `/uploads`; `client/vite.config.js` proxies `/uploads` the same way it already proxies `/api`, so images load correctly in dev without any absolute-URL configuration.
- `client/src/components/ImageDropzone.jsx` is the reusable drag-and-drop widget (drag-over highlight, click-to-browse fallback, thumbnail previews with remove) used by Add/Edit Hotel, Add/Edit Room, and the Profile page's avatar (single-image mode shows a circular preview instead of a thumbnail grid). It uploads immediately on drop and hands the parent form back `{url, publicId}` pairs — the hotel/room create/update endpoints themselves are unchanged, they still just receive an array of URL strings.
- Swapping this for real Cloudinary upload later only touches `upload.middleware.js` (swap `multer.diskStorage` for a Cloudinary storage engine) — every form and the `{url, publicId}` contract stay the same.

## Folder structure

```
hotelbooking/
├── client/                    # React + Vite frontend
│   └── src/
│       ├── components/        # Reusable UI (Button, TextField, ProtectedRoute, Spinner, HotelCard, StarRating, Pagination, SearchBar, FilterSidebar, ReviewCard, Accordion, Testimonials, WhyChooseUs, ImageGallery, MapEmbed, ImageDropzone, dashboard/StatCard, dashboard/Badge...)
│       ├── pages/              # Route-level pages (public/, auth/, dashboard/, admin/, owner/, user/, NotFoundPage)
│       ├── layouts/             # AuthLayout, PublicLayout (guest site header/nav/footer), DashboardLayout (per-role dashboard chrome)
│       ├── context/              # AuthContext (per-role sessions + updateAccountAs for live profile edits), ToastContext
│       ├── hooks/                  # useAuth(role), useToast, useAdminSession, useOwnerSession, useUserSession
│       ├── services/                # apiClient (axios), authService, hotelService, contactService, ownerDashboardService, adminDashboardService, adminUser/adminOwner/adminHotel/adminBookingService, ownerHotelService, ownerRoomService, bookingService, ownerBookingService, uploadService, userProfileService, wishlistService
│       ├── algorithms/                # (reserved for future client-side algorithm helpers)
│       ├── utils/                       # getErrorMessage
│       └── assets/
├── server/                     # Express backend
│   ├── config/                  # db.js, cloudinary.js (unused — see Image uploads), env.js
│   ├── controllers/              # auth.controller.js (User/Owner factory), admin.controller.js, hotel.controller.js, review.controller.js, contact.controller.js, ownerDashboard.controller.js, adminDashboard.controller.js, adminUser/adminOwner/adminHotel/adminBooking.controller.js, ownerHotel.controller.js, ownerRoom.controller.js, booking.controller.js, ownerBooking.controller.js, upload.controller.js, userProfile.controller.js, wishlist.controller.js
│   ├── middleware/                 # auth (JWT verify + RBAC), error handler, rate limiter, validate, upload (multer disk storage)
│   ├── models/                      # All 14 Mongoose models (see below)
│   ├── routes/                       # userAuth / ownerAuth / adminAuth (under /api/auth), hotel.routes.js (/api/hotels), contact.routes.js (/api/contact), ownerDashboard/ownerHotel/ownerRoom/ownerBooking.routes.js (under /api/owner), adminDashboard/adminUser/adminOwner/adminHotel/adminBooking.routes.js (under /api/admin), booking.routes.js (/api/bookings), upload.routes.js (/api/uploads), userProfile.routes.js (/api/users), wishlist.routes.js (/api/wishlist)
│   ├── services/                       # token.service.js, email.service.js
│   ├── algorithms/                      # (reserved: recommendation/, search/ for later modules)
│   ├── validators/                       # express-validator chains
│   ├── utils/                              # ApiError, ApiResponse, asyncHandler, crypto (secure tokens)
│   ├── emailTemplates/                      # HTML email templates
│   ├── uploads/                               # Local image storage (see Image uploads) — served at /uploads, gitignored
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

## Dashboard summary endpoints

The first protected *non-auth* routes in the codebase — same `verifyJWT`/`authorizeRoles` chaining as the `/me` endpoints, just scoped to a different role and returning aggregate counts instead of an account.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/owner/dashboard-summary` | Owner only | The logged-in owner's hotels grouped by `pending`/`approved`/`rejected` (+ `total`), and `totalRooms` summed across their hotels' rooms. No available/occupied split yet — that needs the booking module. |
| GET | `/api/admin/dashboard-summary` | Admin only | `totalUsers`, `totalOwners`, and all hotels platform-wide grouped by status the same shape as above. |

## Admin management endpoints

All admin-only (`verifyJWT`, `authorizeRoles('admin')` applied to the whole router via `router.use(...)`).

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/users` | List users — `search` (name/email), `status`, `page`, `limit`. Each row includes `bookingCount`/`totalSpent` aggregated from `Booking` (0 until the booking module lands). |
| GET | `/api/admin/users/:id` | User profile + their written reviews + booking/spending totals |
| PATCH | `/api/admin/users/:id/suspend` \| `/activate` | Toggle `User.status` |
| DELETE | `/api/admin/users/:id` | Delete a user |
| GET | `/api/admin/owners` | List owners — `search` (name/email/business name), `status`, `page`, `limit`. Each row includes `hotelCount`. |
| POST | `/api/admin/owners` | Admin-created owner account — generates a temp password, emails it (`sendOwnerCreatedEmail`), no separate "set password" flow needed since the owner just uses the existing "Forgot password" |
| GET | `/api/admin/owners/:id` | Owner profile + business info + their hotels + aggregate room/rating stats |
| PATCH | `/api/admin/owners/:id/suspend` \| `/activate` | Toggle `Owner.status` |
| DELETE | `/api/admin/owners/:id` | Delete an owner — blocked with `400` if they still have hotels |
| GET | `/api/admin/hotels` | List hotels of **any** status — `search`, `city`, `status` (`pending`\|`approved`\|`rejected`), `sort`, `page`, `limit` |
| GET | `/api/admin/hotels/:id` | Full hotel details regardless of status, including `rejectionReason` |
| PATCH | `/api/admin/hotels/:id/approve` | Sets `status: 'approved'`, clears `rejectionReason`, emails the owner |
| PATCH | `/api/admin/hotels/:id/reject` | Requires `{ reason }` in the body, sets `status: 'rejected'`, stores the reason, emails the owner |
| DELETE | `/api/admin/hotels/:id` | Deletes the hotel and cascades to its `Room`s and `Review`s |
| GET | `/api/admin/bookings` | List all bookings — `status`, `page`, `limit`. Returns an empty list today; there's no booking-creation flow yet, but the endpoint is real and ready for it. |
| GET | `/api/admin/bookings/:id` | Full booking details (guest, hotel, room, payment) |

## Owner hotel/room management endpoints

Owner-only (`verifyJWT`, `authorizeRoles('owner')` on the whole router). Every hotel/room mutation is scoped to `req.account._id` — an owner can never read or modify another owner's hotel, and a room update re-verifies ownership through its parent hotel rather than trusting the room ID alone.

| Method | Path | Description |
|---|---|---|
| GET | `/api/owner/hotels` | The logged-in owner's hotels, each with a `roomCount` |
| POST | `/api/owner/hotels` | Create a hotel — always lands as `status: 'pending'` regardless of what's sent, emails `ADMIN_EMAIL` |
| GET | `/api/owner/hotels/:id` | Full hotel details + its rooms + its reviews (404s if it's not this owner's) |
| PUT | `/api/owner/hotels/:id` | Update a hotel — if it was `approved` or `rejected`, this resets it to `pending` and clears `rejectionReason` (resubmission for review), and emails `ADMIN_EMAIL` again |
| DELETE | `/api/owner/hotels/:id` | Delete the hotel, cascading to its `Room`s and `Review`s |
| GET | `/api/owner/hotels/:hotelId/rooms` | Rooms for one of the owner's hotels |
| POST | `/api/owner/hotels/:hotelId/rooms` | Add a room to one of the owner's hotels |
| PUT | `/api/owner/rooms/:id` | Update a room |
| DELETE | `/api/owner/rooms/:id` | Delete a room |
| PATCH | `/api/owner/rooms/:id/toggle-active` | Flip `Room.isActive` (stands in for a full availability calendar — see [Feature status](#feature-status)) |

Images on both are real drag-and-drop uploads to local disk (see [Image uploads](#image-uploads)) — the `{url, publicId}` shape means these two endpoints didn't need any changes when file upload replaced pasted URLs.

## Booking endpoints

See [Booking flow](#booking-flow) for the request/Accept/Reject design and the `totalRooms`-aware double-booking guard.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/bookings` | User | Create a booking request (`status: 'pending'`) — validates room availability, `guests <= room.capacity`, and the overlap-count guard; emails the hotel owner |
| GET | `/api/bookings/my` | User | The logged-in user's bookings — optional `status` filter |
| GET | `/api/bookings/my/:id` | User | One of the user's bookings |
| PATCH | `/api/bookings/my/:id/cancel` | User | Cancel a `pending`/`confirmed` booking (only before `checkIn`) — pulls the `Room.bookedDates` entry if it was confirmed |
| GET | `/api/owner/bookings` | Owner | Bookings across all of the owner's hotels — optional `status` filter |
| GET | `/api/owner/bookings/:id` | Owner | One booking, ownership-checked through its hotel |
| PATCH | `/api/owner/bookings/:id/accept` | Owner | Re-runs the overlap-count guard (409 if the room filled up since the request came in), sets `status: 'confirmed'`, pushes to `Room.bookedDates`, emails the guest |
| PATCH | `/api/owner/bookings/:id/reject` | Owner | Requires `{ reason }`, sets `status: 'rejected'`, emails the guest |

Admin's existing `/api/admin/bookings` endpoints (Pass 4) needed no changes — they already read the `Booking` collection generically regardless of status.

## Upload, profile, and wishlist endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/uploads/image` | Any authenticated role | `multipart/form-data` field `image` → `{ url, publicId }`. See [Image uploads](#image-uploads). |
| PATCH | `/api/users/me` | User | Update `name`/`phone`/`email` — an email change resets `isEmailVerified: false` and re-sends the real verification email (same template/token flow as registration) |
| PATCH | `/api/users/me/password` | User | Requires `currentPassword`; bumps `refreshTokenVersion` (same as the existing reset-password flow), so the frontend logs the user out right after a successful change |
| PATCH | `/api/users/me/avatar` | User | Body is an already-uploaded `{ url, publicId }` |
| GET | `/api/wishlist/my` | User | The user's saved hotels (only ones still `approved`) |
| GET | `/api/wishlist/status/:hotelId` | User | `{ wishlisted }` — used to set the heart icon's initial state on Hotel Details |
| PATCH | `/api/wishlist/toggle/:hotelId` | User | Adds or removes the hotel (`Wishlist` is one document per user with a `hotels: ObjectId[]` array, not one row per saved hotel) |

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
- **Pass 4 (Admin Module):** every new endpoint exercised with `curl` as an authenticated admin — list endpoints with each filter, get-by-id, the full suspend → confirm login now 403s → activate → delete lifecycle on a throwaway user, `createOwner` end-to-end (temp password generated and logged/emailed), the delete-owner-with-hotels 400 guard, and the full approve/reject/re-approve cycle on a real seeded hotel (confirmed it disappears from and reappears on the public `/hotels` listing as its status changes). Owner and non-admin tokens confirmed 403 on every admin route. One real bug caught and fixed during this pass: the two schema fields added for this module (`User.status`, `Owner.businessName`) don't retroactively apply their Mongoose defaults to documents that existed before the schema change when read via `.lean()` — existing accounts showed `status: undefined` until a one-time backfill (`updateMany` setting the default where the field was missing) was run. The full admin UI was then driven headlessly end-to-end (dashboard → each of the four management pages → each detail page → Add Owner form), screenshots captured, console checked for errors.
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
| Hotel & Room management + Admin approval workflow | ✅ (Owner Add/Edit/Delete Hotel + Room, resubmission-on-edit; Admin approve/reject/delete — full loop. Images are real drag-and-drop uploads to local disk — see [Image uploads](#image-uploads)) |
| Search history / recently viewed | ⬜ |
| Booking workflow + double-booking prevention | ✅ (request/Accept/Reject flow — see [Booking flow](#booking-flow); `totalRooms`-aware overlap guard at both request and accept time is the "double-booking prevention," made real instead of a calendar UI) |
| Payments (eSewa/Khalti) | ⬜ (bookings are confirmed by the owner directly — "pay at property" style — until sandbox credentials exist; `Booking.payment` is ready for it) |
| PDF invoices | ⬜ (`Booking.invoiceNumber` is generated and shown, but nothing renders a PDF yet) |
| Google Maps integration | ⏳ (hotel details renders a live embed if `VITE_GOOGLE_MAPS_API_KEY` is set, else a placeholder) |
| Reviews & ratings (public display), wishlist | ⏳ (**wishlist: done** — save/unsave from Hotel Details, `/user/wishlist` list. Reviews: reading works, writing now has real bookings to gate on, but the "write a review" UI itself isn't built yet) |
| Recommendation engine | ⬜ (public "Similar Hotels" uses simple city/amenity matching, not the full engine) |
| AI chatbot (rule-based fallback first) | ⬜ |
| Admin/Owner/User dashboards | ✅ (**Admin** — dashboard + Manage Users/Owners/Hotels/Bookings. **Owner** — dashboard + My Hotels + Add/Edit Hotel/Room + Booking Requests. **User** — dashboard + My Bookings + Wishlist + Profile (name/email/phone/avatar/password)) |
| UI/UX polish (dark mode, skeletons, empty states, lazy loading) | ⏳ (single light theme by design — dark mode intentionally removed, not scaffolded; loading/empty states in place on public + dashboard pages; lazy loading still pending) |

Each remaining item will be built and explained as its own module, with your approval before moving to the next — per the project's own development rules.
