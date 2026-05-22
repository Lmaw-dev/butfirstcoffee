# Deploy But First, Coffee (React + PHP) to Live Server

This app has 2 parts:
- Frontend: `bfc-react` (React build)
- Backend: `bfc` (PHP + MySQL APIs)

## 1) Prepare production config

Edit `bfc-react/.env.production`:

```env
REACT_APP_API_BASE=https://YOUR_DOMAIN_HERE/bfc
```

Use your real domain, for example:

```env
REACT_APP_API_BASE=https://butfirstcoffee.com/bfc
```

## 2) Build the React app

From `bfc-react`:

```bash
npm install
npm run build
```

Output will be in `bfc-react/build`.

## 3) Upload to hosting

Recommended structure on Apache/cPanel hosting:
- Upload React build contents to `public_html/` (or your web root)
- Upload PHP backend folder as `public_html/bfc/`

Final URLs should look like:
- Frontend: `https://your-domain.com/`
- API: `https://your-domain.com/bfc/store-api.php?action=get_products`

## 4) React Router support

This project includes `public/.htaccess` for SPA routing. CRA copies it into build.

If deep links return 404 (example `/admin`), make sure `.htaccess` exists in your web root and `mod_rewrite` is enabled.

## 5) Database setup

On live server:
- Create MySQL database and user
- Update `bfc/db-config.php` with live DB credentials
- Open `https://your-domain.com/bfc/db-setup.php` once to initialize schema/data

## 6) API and auth checks

Verify these endpoints:
- `https://your-domain.com/bfc/store-api.php?action=get_products`
- `https://your-domain.com/bfc/log-in.php`
- `https://your-domain.com/bfc/admin-api.php?action=get_products`

Because frontend and backend are on the same domain in this setup, cookies and session auth work cleanly.

## 7) Post-deploy checklist

- HTTPS is active
- Admin login works
- Orders can be created
- Admin can update order status
- Staff management works
- Product images load from `/bfc/images/...`

## Troubleshooting

- Blank API errors: confirm `REACT_APP_API_BASE` in `.env.production` and rebuild.
- `/admin` 404 on refresh: fix `.htaccess` rewrite.
- Login/session issues: ensure frontend and backend are same origin or CORS + credentials are configured correctly.
