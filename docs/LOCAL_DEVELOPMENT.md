# Local Development

The portfolio is a static website. It does not require a build step, but it must be served over HTTP because the public pages fetch JSON content.

## Prerequisites

- Git
- Node.js 20 or newer
- Python 3

## Setup

```bash
git clone https://github.com/Enes-Balaban17/portfolio-website.git
cd portfolio-website
npm install
npm run check
```

## Preview the Public Site

```bash
python -m http.server 8080 --bind 127.0.0.1
```

Open `http://127.0.0.1:8080/`.

Opening pages through `file://` is unsupported because browsers commonly block local `fetch()` requests.

## Edit Content Locally

Keep the static server running. In a second terminal, run:

```bash
npx decap-server
```

Open `http://127.0.0.1:8080/admin/cms.html`. The local proxy writes changes to `content/` and `assets/uploads/`; it does not create commits.

After editing:

```bash
git diff
npm run check
```

Preview the affected public page before committing. Uploaded files are public once pushed.

## Validation

```bash
npm run validate:content
npm run scan:secrets
npm run check:media
npm run check
```

## Troubleshooting

- **Content does not load:** confirm the page is served over HTTP and inspect the browser Network panel.
- **CMS requests a production login locally:** confirm `npx decap-server` is running and `local_backend: true` remains in `admin/config.yml`.
- **Admin pages redirect to login:** protected pages require a configured Supabase Auth session.
- **Contact submission fails locally:** the public pages still load, but submission requires the configured remote service and an allowed local origin.
