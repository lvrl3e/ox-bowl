# Ox Bowl Resto & Grill — Online Ordering

Mobile-first pickup & delivery ordering site for Ox Bowl Resto & Grill.
Next.js (App Router) + TypeScript + Tailwind CSS v4, Supabase
(Postgres/Auth/Storage/Realtime), deployed on Vercel. No dine-in, no
payment gateway yet (manual QR payment; see `lib/payments` once Step 5
lands for where a gateway like PayMongo would plug in).

Build status: **Step 1 complete** — project scaffold, dark menu-board
theme tokens, and the full database schema + seed data. See the PR/chat
history for progress on later steps.

## Tech stack

- Next.js 15 (App Router), TypeScript, Tailwind CSS v4
- Supabase: Postgres + Row Level Security, Auth (admin login), Storage
  (menu photos, QR code image, private payment screenshots), Realtime
  (admin order board)
- Deployed on Vercel
- Currency: Philippine peso (₱). Timezone: Asia/Manila.

## Project structure

```
app/                   customer site (/) + admin (/admin) in one Next app
  admin/               hidden admin dashboard, noindex, login-gated
  ...                  customer pages (menu, cart, checkout, track, legal)
components/
  customer/            header, hero, menu grid, cart drawer, etc.
  admin/                orders board, menu manager, settings form
lib/
  supabase/            client.ts (browser), server.ts (SSR/RLS), admin.ts (service role)
  types/database.ts    hand-written types mirroring the SQL schema
  validations/         zod schemas for checkout/admin forms
store/                 zustand cart store
supabase/
  migrations/0001_init.sql   full schema, RLS policies, RPC functions, storage buckets
  seed.sql                   categories/menu/variants from the printed menu board
middleware.ts          refreshes Supabase session; gates /admin/*
```

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

| Variable | Where to get it | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page | Public, RLS-protected |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page | **Secret.** Server-only — used for order creation, screenshot uploads, admin signed URLs. Never expose to the client. |
| `NEXT_PUBLIC_SITE_URL` | Your deployed domain | Used for metadata/OG/sitemap |
| `TELEGRAM_BOT_TOKEN` | Message `@BotFather` on Telegram | Owner new-order alerts (Step 6) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` / `NEXT_PUBLIC_FB_PIXEL_ID` | Google Analytics / Meta Events Manager | Analytics placeholders (Step 8) |

## Database setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com) (or use the
   Supabase CLI locally).
2. Open the SQL editor and run, in order:
   - `supabase/migrations/0001_init.sql` — tables, RLS policies, RPC
     functions (`track_order`, `next_order_number`), storage buckets.
   - `supabase/seed.sql` — categories, menu items, and size variants
     from the printed menu board.
3. Create your first admin login:
   - In Authentication → Users, add a user with your email/password
     (or have them sign up, then promote them).
   - In the SQL editor:
     ```sql
     insert into public.admin_users (id, name, role)
     values ('<auth-user-uuid-from-step-above>', 'Owner Name', 'owner');
     ```
4. Copy the Project URL, anon key, and service role key into
   `.env.local` as above.

### Security model (why it's structured this way)

- **Customer-site reads** (menu, categories, settings) go straight to
  Supabase with the anon key — RLS allows public `select`.
- **Order creation and payment screenshot upload** always go through
  Next.js Route Handlers using the **service-role** key, never a direct
  client insert. The server re-validates store hours, re-computes every
  item/variant price from the database (so a tampered client payload
  can't change totals), checks the minimum order amount, and only then
  writes the order. This also keeps `orders`/`order_items` fully closed
  to the `anon` role in RLS — there is no public insert policy on
  either table.
- **Guest order tracking** (`/track/[orderNumber]`) does not get a
  public `select` policy on `orders` either (that would let anyone
  enumerate every order). Instead it calls the `track_order(text)`
  Postgres function, a `SECURITY DEFINER` RPC that returns a safe,
  limited projection of exactly one order by its order number.
- **Admin access** is enforced in RLS via `is_admin()` / `is_owner()`
  helper functions that check the `admin_users` table against
  `auth.uid()` — not just in the UI. Staff can manage orders; only the
  owner role can edit the menu, settings, or other admin users.
- **Payment screenshots** live in a private Storage bucket with no
  public policies at all; only the service-role key (server) can write
  or generate signed URLs to read them.

## Local development

```bash
npm install
cp .env.local.example .env.local   # then fill in the values above
npm run dev
```

Open http://localhost:3000. The homepage currently renders a short
"setup check" screen proving the theme tokens, fonts, and project
wiring work — the full menu/cart UI lands in Step 2.

```bash
npm run build   # production build check
npm run lint    # eslint
```

## Deploying to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Import it in Vercel.
3. Add the same environment variables from `.env.local` in Vercel
   Project Settings → Environment Variables (all of them — including
   the service role key, which Vercel keeps server-side only).
4. Deploy. Vercel will run `npm run build` automatically.

## Design tokens

Defined as CSS variables in `app/globals.css` and mapped to Tailwind
utilities via `@theme` (Tailwind v4's CSS-first config — there is no
`tailwind.config.js`):

| Token | Value | Tailwind utility |
|---|---|---|
| `--bg` | `#1A0D0A` | `bg-bg` |
| `--bg2` | `#2C1711` | `bg-bg2` |
| `--red` | `#C8102E` | `bg-red` / `text-red` / `border-red` |
| `--red-deep` | `#8F0B21` | `bg-red-deep` |
| `--gold` | `#F5C518` | `bg-gold` / `text-gold` |
| `--cream` | `#F6ECE0` | `text-cream` |
| `--line` | `#5A3228` | `border-line` |
| `--muted` | `#C9B8A8` | `text-muted` |

Fonts: Oswald 500/700 (`font-heading`, uppercase, headlines/prices) and
Inter 400/600 (`font-body`, default), loaded via `next/font/google` in
`app/layout.tsx` with `Impact, sans-serif` / `system-ui, sans-serif`
fallbacks baked into the same theme variables.

## Build order

1. ✅ Project setup, theme tokens, database schema + seed data
2. Menu page and cart
3. Checkout with cash payment, order creation, confirmation page
4. Admin login (hidden, noindex), orders board, sold-out toggles, settings
5. QR payment flow with screenshot upload and admin verification
6. Real-time alerts and notifications (Telegram)
7. Order tracking page
8. SEO, legal pages, testing, deployment
