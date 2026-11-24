# Ox Bowl Resto & Grill — Online Ordering

Mobile-first pickup & delivery ordering site for Ox Bowl Resto & Grill.
Next.js (App Router) + TypeScript + Tailwind CSS v4, Supabase
(Postgres/Auth/Storage), deployed on Vercel. No dine-in. Payment is
manual GCash QR + screenshot, verified by staff in the admin dashboard —
there is no payment gateway wired in (see `COSTS.md` for what that
would add if you automate it later).

**Live site:** https://oxbowl.com
**Admin dashboard:** https://oxbowl.com/admin (hidden from search
engines and not linked from the site; sign in with an admin account —
see "Admin accounts" below)

This project is a full build, not a work-in-progress — see "What's
built" below for the current feature set, and `COSTS.md` for what it
costs to run and what upgrades make sense before/after a real launch.

## Handoff: accounts this project depends on

If you're taking this project over, these are the external accounts
that make it work. Ask whoever is handing this off to add you to each
one (or transfer ownership outright) — the code alone isn't enough to
keep the site running.

| Service | What it's for | Notes |
|---|---|---|
| **GitHub** (`github.com/lvrl3e/ox-bowl`) | Source code | Vercel auto-deploys from the `master` branch on every push |
| **Vercel** | Hosting the Next.js app + the `oxbowl.com` domain | Currently on the free "Hobby" tier — see `COSTS.md`, this needs to move to Pro for commercial use |
| **Supabase** (project "Ox Bowl") | The database, admin login, and file storage (menu photos, payment screenshots) | Currently on the free tier, which **auto-pauses after ~1 week of no activity** — upgrade to Pro before relying on this for real orders |
| **Namecheap** | Domain registration for `oxbowl.com` | Renews annually; DNS is pointed at Vercel via manual A records (not Vercel-managed nameservers) |

Without access to the Supabase and Vercel accounts specifically, a new
owner/developer cannot change anything — the GitHub repo only holds the
code, not the live data or the deployment.

## Admin accounts

There are two roles:

- **Owner** — full access: orders, menu prices/descriptions, settings
  (store hours, delivery fee, QR payment details, pickup address),
  staff accounts.
- **Staff** — can manage the live orders board (advance status, verify
  payments) and mark menu items sold out, but can't change prices,
  descriptions, or settings.

Admin accounts are managed from `/admin/staff` (owner-only). To add the
first owner account from scratch (e.g. a fresh Supabase project), create
a user in Supabase Authentication → Users, then insert a matching row
into `admin_users` with `role = 'owner'` via the SQL editor.

## What's built

- **Customer site:** homepage with crowd favorites, full menu by
  category, cart (drawer + full page), checkout (pickup or delivery,
  schedule for later or ASAP, cash or GCash QR), order confirmation,
  guest order tracking by order number or mobile number, self-serve
  cancellation while an order is still "received".
- **Admin dashboard:** live orders board (received/preparing/ready),
  order history with search and date filters, payment screenshot
  review for GCash orders, menu manager (edit prices/descriptions, add
  new items, toggle sold-out), staff account management, store settings
  (hours, delivery fee, pickup address, QR payment details), per-admin
  password management.
- **Not implemented:** a payment gateway (PayMongo etc. — currently
  manual GCash verification by design), automated Telegram/SMS/email
  order notifications (there's a settings field for a Telegram chat ID
  but nothing currently sends to it — it's a placeholder for later),
  analytics (Google Analytics / Meta Pixel env vars exist as
  placeholders but aren't wired into any page yet), distance-based
  delivery pricing (currently a flat fee).

## Tech stack

- Next.js 15 (App Router), TypeScript, Tailwind CSS v4
- Supabase: Postgres + Row Level Security, Auth (admin login), Storage
  (menu photos, QR code image, private payment screenshots)
- Deployed on Vercel, with `export const dynamic = "force-dynamic"` on
  every customer-facing page that reads live menu/settings data — this
  is deliberate, not an oversight: without it, Vercel's edge cache would
  serve a stale snapshot of prices/sold-out status indefinitely instead
  of picking up admin changes.
- Currency: Philippine peso (₱). Timezone: Asia/Manila.

## Project structure

```
app/
  (customer)/          homepage, menu/order page, cart, checkout, track, legal
  admin/                hidden admin dashboard, noindex, login-gated
components/
  customer/             header, hero, menu grid, cart drawer, etc.
  admin/                 orders board, menu manager, settings form
lib/
  supabase/              client.ts (browser), server.ts (SSR/RLS), admin.ts (service role), public.ts (anon, server-side reads)
  data/                  cached reads for menu + settings (lib/data/menu.ts, lib/data/settings.ts)
  types/database.ts      hand-written types mirroring the SQL schema
  validations/           zod schemas for checkout/admin forms
store/                   zustand cart store
supabase/
  migrations/            full schema history, in order — run all of them on a fresh project
```

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

| Variable | Where to get it | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page | Public, RLS-protected |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page | **Secret.** Server-only — used for order creation, screenshot uploads, admin signed URLs. Never expose to the client. |
| `NEXT_PUBLIC_SITE_URL` | Your deployed domain | Used for metadata/OG/sitemap |
| `TELEGRAM_BOT_TOKEN` | Message `@BotFather` on Telegram | Placeholder only — not currently used by any code (see "What's built") |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` / `NEXT_PUBLIC_FB_PIXEL_ID` | Google Analytics / Meta Events Manager | Placeholder only — not currently used by any code |

All of these also need to be set in Vercel (Project Settings →
Environment Variables), not just locally — Vercel doesn't read
`.env.local`.

## Database setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com) (or use the
   Supabase CLI locally).
2. Open the SQL editor and run every file in `supabase/migrations/` **in
   order** (0001, 0002, 0003, ...) — this is the full schema, RLS
   policies, and RPC functions as they stand today, not a single seed
   file.
3. Create your first admin login (see "Admin accounts" above).
4. Copy the Project URL, anon key, and service role key into
   `.env.local` / Vercel as above.

### Security model (why it's structured this way)

- **Customer-site reads** (menu, categories, settings) go straight to
  Supabase with the anon key — RLS allows public `select`.
- **Order creation and payment screenshot upload** always go through
  Next.js Route Handlers using the **service-role** key, never a direct
  client insert. The server re-validates store hours, re-computes every
  item/variant price from the database (so a tampered client payload
  can't change totals), checks the minimum order amount, and only then
  writes the order. `orders`/`order_items` have no public insert policy
  in RLS at all.
- **Guest order tracking** (`/track/[orderNumber]`) requires the mobile
  number used at checkout to match, via a `SECURITY DEFINER` RPC —
  there's no public `select` policy on `orders` (that would let anyone
  enumerate every order by guessing order numbers). Completed/cancelled
  orders stop being trackable 24 hours after they're closed out.
- **Admin access** is enforced in RLS via `is_admin()` / `is_owner()`
  helper functions that check the `admin_users` table against
  `auth.uid()` — not just in the UI. Staff can manage orders and toggle
  sold-out status; only the owner role can edit prices/descriptions,
  settings, or other admin accounts.
- **Payment screenshots** live in a private Storage bucket with no
  public policies at all; only the service-role key (server) can write
  or generate signed URLs to read them.

## Local development

```bash
npm install
cp .env.local.example .env.local   # then fill in the values above
npm run dev
```

Open http://localhost:3000.

```bash
npm run build   # production build check
npm run lint    # eslint
```

## Deploying to Vercel

The live site auto-deploys from GitHub already — pushing to `master`
triggers a new production deployment within about a minute. To set this
up from scratch on a new Vercel project:

1. Import the GitHub repo in Vercel.
2. Add every environment variable from `.env.local` in Vercel Project
   Settings → Environment Variables (including the service role key,
   which Vercel keeps server-side only).
3. Deploy. Vercel runs `npm run build` automatically.
4. Point the custom domain at Vercel (Project Settings → Domains) —
   either Vercel-managed nameservers, or manual A/CNAME records at your
   registrar (this project currently uses the latter at Namecheap).

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

Fonts: Oswald 500/700 (`font-heading`, headlines/prices) and Inter
400/600 (`font-body`, default), loaded via `next/font/google` in
`app/layout.tsx`.

## Where to go next

See `COSTS.md` for a plain-language breakdown of what this costs to run
today versus once it needs to be reliably "always on" for real
customers, and what each unbuilt feature (payment gateway, distance-based
delivery, order notifications) would add if you build it later.
