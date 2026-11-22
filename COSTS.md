# Ox Bowl — Hosting & Service Costs

A running record of what this project actually depends on, and what it
costs. Update this whenever a new third-party service gets wired in.

## Already in use

| Service | Used for | Cost |
|---|---|---|
| **Supabase** | Database, Auth, Storage, Realtime | Free tier works now. Pro ($25/mo) needed once live, mainly because free-tier projects **auto-pause after ~1 week of inactivity** |
| **Vercel** (hosting) | Deploying the Next.js app | Free "Hobby" tier works technically, but Vercel's terms restrict Hobby to non-commercial use — a for-profit restaurant site is supposed to be on Pro ($20/mo per member) |
| **Telegram Bot** | Owner order alerts | Free, no cost ever |
| **Google Analytics** | Traffic analytics | Free |
| **Meta/Facebook Pixel** | Ad tracking | Free |
| Google Maps links | "Visit/Pickup" address link | Free — just a `maps.google.com` URL, no billed API key involved |
| **Custom domain** (`oxbowl.com`) | Registered at Namecheap, being pointed at Vercel via DNS | ~$10–20/year, renews annually through Namecheap |

## Not integrated (so no cost yet), but worth knowing about

| Thing | Status | If you add it later |
|---|---|---|
| **Payment gateway** | None — payments are manual GCash QR + screenshot upload, verified by you in the admin panel | A gateway like PayMongo charges **per-transaction fees** (roughly 3.5% + ₱15 per successful payment, varies by method) — only kicks in if you decide to automate payments instead of manual verification |
| Distance-based delivery fee | Not implemented — delivery currently charges a flat fee regardless of distance | No paid API needed even if you build this later (can be done with free math, no Google Distance Matrix billing required) |

## Bottom line

$0 to build and test everything right now, aside from the domain.
Once you actually launch and want it reliably "always on" for real
customers, budget roughly:

- **$25/mo** — Supabase Pro
- **$20/mo** — Vercel Pro
- **≈ $14/year** domain (`oxbowl.com`, already purchased)

Nothing charges per-order unless you later add a payment gateway.

*Last updated: 2026-11-23.*
