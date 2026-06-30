# Local Development

This is the canonical local workflow for the static portfolio. Feature-specific documents link here instead of repeating the full setup.

## Prerequisites

- Git
- Node.js 20 or newer
- Python 3
- Supabase CLI only for local Edge Function work

The public website has no build step. Node.js is used for repository checks and the optional Decap local proxy.

## Initial Setup

```bash
git clone https://github.com/Enes-Balaban17/portfolio-website.git
cd portfolio-website
npm install
```

Run the repository checks before starting work:

```bash
npm run check
```

## Public Site Preview

From the repository root:

```bash
python -m http.server 8080 --bind 127.0.0.1
```

Open:

```txt
http://127.0.0.1:8080/
```

Use an HTTP server rather than opening HTML through `file://`. Notes, projects, certificates, illustrations, and minigames use `fetch()` to load repository JSON, and browsers commonly block those requests from local files.

## Decap CMS Preview

Keep the static server running. Start the Decap local backend in a second terminal:

```bash
npx decap-server
```

Then open:

```txt
http://127.0.0.1:8080/admin/login.html
http://127.0.0.1:8080/admin/cms.html
```

The Supabase admin guard and Decap content authentication are separate layers. The local Decap proxy writes changes to repository files; it does not commit or push them.

## Supabase Development

The public site can be previewed without running Supabase locally. Contact submission and protected message operations require either the configured remote project or a local Supabase stack.

Configuration names are documented in `.env.example`. Store privileged values through Supabase CLI secrets or an untracked local environment file. See `SUPABASE_SETUP.md` for Edge Function commands and `SUPABASE_ADMIN_AUTH_SETUP.md` for RLS requirements.

## Validation Commands

```bash
npm run validate:content
npm run scan:secrets
npm run check:media
npm run check
```

Run the combined check before committing. Also manually test theme switching, responsive layouts, contact modal validation, admin login, CMS editing, and message authorization when those areas change.

## Troubleshooting

- JSON content missing on a page: confirm the page is served over HTTP and inspect the browser Network panel.
- CMS redirects to Netlify locally: confirm `npx decap-server` is running and `local_backend: true` remains configured.
- Admin page redirects to login: confirm the Supabase Auth session and allowed admin account.
- Message queries fail: inspect RLS policies before changing browser code.
