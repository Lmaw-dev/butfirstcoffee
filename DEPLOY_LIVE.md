# Deploy But First, Coffee (React + Supabase) to Live Server

This app now has 2 parts:
- Frontend: `bfc-react` (React build)
- Backend: Supabase auth + Postgres

## 1) Prepare production config

Edit `bfc-react/.env.production`:

```env
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
REACT_APP_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## 2) Build the React app

From `bfc-react`:

```bash
npm run build
```

Output will be in `bfc-react/build`.

## 3) Deploy on Netlify

Recommended Netlify settings:
- Build command: `npm run build`
- Publish directory: `build`
- Environment variables: `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`

## 4) React Router support

This project includes `public/_redirects` so SPA routes work on refresh.

## 5) Supabase setup

Run the SQL in `SUPABASE_SETUP.md`, then create an admin auth user in Supabase Auth with `role: admin` in the user metadata.

## 6) Post-deploy checklist

- HTTPS is active on Netlify
- Supabase auth login works
- Orders can be created anonymously
- Admin can update order status
- Staff management works for authenticated admin
- Product images load from `/bfc/images/...`

## Troubleshooting

- Blank API errors: confirm `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` are set in Netlify and rebuild.
- `/admin` 404 on refresh: confirm `public/_redirects` is deployed.
- Login/session issues: make sure the admin auth user exists in Supabase Auth and has metadata `role: admin`.
