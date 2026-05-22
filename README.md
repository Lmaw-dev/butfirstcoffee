# But First, Coffee - React App

This folder contains the React version of the But First, Coffee website.

## What it does

- Landing page at `/`
- Admin login at `/login`
- Customer menu and checkout at `/menu`
- Admin dashboard at `/admin`

The React app now uses Supabase for auth and data, which makes it suitable for Netlify deployment.

## Setup

Install dependencies:

```bash
npm install
```

Run the app locally:

```bash
npm start
```

Build for production:

```bash
npm run build
```

## Supabase configuration

Set these variables before starting or building the app:

```bash
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
REACT_APP_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

The API layer reads these values from `src/services/supabaseClient.js`.

## Deployment notes

- Deploy the React build output from `build/`.
- Make sure your host supports React routing or uses a rewrite to `index.html`.
- Keep Supabase online and add the anon key/url in Netlify environment variables.
- Use the included `public/_redirects` file for React Router.

## Free deployment options (quick)

1. Netlify (recommended for this React + Supabase setup). Connect the repo to Netlify, set the build command to `npm run build`, publish directory to `build`, and add `REACT_APP_SUPABASE_URL` plus `REACT_APP_SUPABASE_ANON_KEY` in Site settings → Environment.

2. Vercel. Connect the repo, set the Framework Preset to `Create React App`, and add the same Supabase environment variables in Project Settings.

3. Cloudflare Pages. Connect the repo, set the build command to `npm run build`, output directory to `build`, and add the Supabase environment variables in the Pages settings.

4. GitHub Pages is not a good fit here because you need Supabase env vars and router rewrites.

Common checklist before going live:

- Ensure `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` are set in your deployment host.
- Confirm the Supabase tables exist and the admin auth user has `role: admin` in metadata.
- Add HTTPS (Netlify/Vercel/Cloudflare provide certificates automatically).
- Optionally add a custom domain and update DNS as instructed by the host.

If you want, I can generate the exact Netlify/Vercel step-by-step with screenshots and the environment variable values you plan to use.

## Key files

- `src/App.js` - React routing
- `src/pages/Home.jsx` - Landing page
- `src/pages/Login.jsx` - Staff login
- `src/pages/Menu.jsx` - Ordering flow
- `src/pages/Admin.jsx` - Admin dashboard
- `src/services/api.js` - Supabase data layer
