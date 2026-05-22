# But First, Coffee - React App

This folder contains the React version of the But First, Coffee website.

## What it does

- Landing page at `/`
- Staff login at `/login`
- Customer menu and checkout at `/menu`
- Admin dashboard at `/admin`

The React app still talks to the PHP backend in `../bfc` for login, products, and orders.

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

## API configuration

Set the backend URL with `REACT_APP_API_BASE` before starting or building the app.

Local example:

```bash
REACT_APP_API_BASE=http://localhost/webdev/bfc
```

Live example:

```bash
REACT_APP_API_BASE=https://your-domain.com/bfc
```

The API layer reads this value from `src/services/api.js`.

## Deployment notes

- Deploy the React build output from `build/`.
- Make sure your host supports React routing or uses a rewrite to `index.html`.
- Keep the PHP backend online at the URL you set in `REACT_APP_API_BASE`.
- Enable CORS on the backend if the frontend and backend are on different domains.

## Free deployment options (quick)

1. Netlify (recommended for static builds). Build locally or let Netlify build by connecting your repo to Netlify. Set build command to `npm run build`, publish directory to `build`, and add `REACT_APP_API_BASE=https://your-backend.example` in Site settings → Environment. If the backend is on a different origin, enable CORS on the PHP endpoints.

2. Vercel. Connect the repo, set the Framework Preset to `Create React App`, and add `REACT_APP_API_BASE` in Project Settings. Vercel provides a free subdomain and supports custom domains.

3. Cloudflare Pages. Connect the repo, set the build command to `npm run build`, output directory to `build`, and add `REACT_APP_API_BASE` as an environment variable in the Pages settings.

4. GitHub Pages (simple, no env vars at deploy time). Run `npm run build` locally, then push the `build/` contents to the `gh-pages` branch or use the `gh-pages` package. Because you cannot set runtime env vars in static GH Pages, set `REACT_APP_API_BASE` locally before building.

Common checklist before going live:

- Ensure `REACT_APP_API_BASE` points to the live PHP backend URL.
- Confirm the backend endpoints (`log-in.php`, `store-api.php`, `admin-api.php`) are reachable and CORS-enabled if needed.
- Add HTTPS (Netlify/Vercel/Cloudflare provide certificates automatically).
- Optionally add a custom domain and update DNS as instructed by the host.

If you want, I can generate the exact Netlify/Vercel step-by-step with screenshots and the environment variable values you plan to use.

## Key files

- `src/App.js` - React routing
- `src/pages/Home.jsx` - Landing page
- `src/pages/Login.jsx` - Staff login
- `src/pages/Menu.jsx` - Ordering flow
- `src/pages/Admin.jsx` - Admin dashboard
- `src/services/api.js` - Backend API calls
