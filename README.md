# Content Farm Dashboard

A live web dashboard for your channels — per-channel health (uploads, consecutive
failures, last activity, last error) + a realtime event feed. Reads from Supabase
server-side with your secret key (never exposed to the browser), password-protected,
auto-refreshes every 15s.

## Deploy to Vercel (≈5 min)

### 1. Test locally (optional)
```bash
cd web/dashboard
npm install
cp .env.example .env.local      # then fill in the 3 values
npm run dev                     # open http://localhost:3000
```

### 2. Push this folder to GitHub
The dashboard needs its own repo (or subfolder) on GitHub for Vercel to import.
Simplest: make a new repo containing the contents of `web/dashboard`.

### 3. Import into Vercel
1. <https://vercel.com> → **Add New → Project** → import your repo.
2. If the repo root is the whole `vi` project, set **Root Directory** to
   `web/dashboard`. If you pushed just the dashboard folder, leave it as `.`.
3. **Environment Variables** — add all three (from `.env.example`):
   - `SUPABASE_URL` — your project URL
   - `SUPABASE_SERVICE_KEY` — your `sb_secret_…` key (server-side only here)
   - `DASHBOARD_PASSWORD` — a strong password you'll type to log in
4. **Deploy.** Open the URL on your phone, enter the password.

That's it — as your laptop runs the pipeline and pushes events to Supabase, this
page reflects them within ~15s.

## Notes
- **Security:** the secret key lives only in Vercel's server env + your laptop. It is
  used in Server Components / route handlers, so it is never sent to the browser. The
  `DASHBOARD_PASSWORD` gate (httpOnly cookie) keeps strangers out — **always set it.**
- **Stack:** Next.js (App Router) + plain `fetch` against Supabase PostgREST. No
  Supabase SDK, minimal dependencies.
- **Email alerts** (Resend) are a separate step, added next.
