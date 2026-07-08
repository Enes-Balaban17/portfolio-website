# Enes Balaban - Portfolio Website

A lightweight personal portfolio for software projects, technical notes, certificates, illustrations, and small game experiments. The public site uses plain HTML, CSS, and JavaScript and is deployed directly from this repository.

**Live site:** [enesbalaban.dev](https://enesbalaban.dev/)

**Current release:** `v1.2.0`

## V1 Status

- [x] Public portfolio deployed
- [x] Custom domain connected
- [x] Static HTML, CSS, and JavaScript frontend
- [x] Responsive light and dark interface
- [x] CMS-backed Projects content
- [x] CMS-backed Notes content and note details
- [x] CMS-backed Certificates content
- [x] CMS-backed Illustrations content
- [x] CMS-backed Minigames content
- [x] Resume page and downloadable CV
- [x] Contact message modal
- [x] Local Decap CMS workflow
- [x] Netlify production deployment
- [x] Repository content, media, and secret checks
- [x] Page-specific SEO, social metadata, sitemap, and crawler controls
- [x] Automated SEO validation
- [x] V1 release cleanup
- [x] v1.2 repository cleanup and contributor documentation

## Architecture

The website is served as static files with no frontend build step.

```txt
Browser
  |-- HTML pages and css/style.css
  |-- js/main.js
  |-- content/*/*.json
  |-- public assets
  |-- Supabase Edge Function (contact submission)
  `-- protected admin pages (Supabase Auth and RLS)
```

Public content is stored in JSON files under `content/`. Decap CMS provides a local editing interface for those files. Contact submissions are sent to a Supabase Edge Function; private message access remains behind Supabase authentication and database policies.

This repository is intentionally framework-free. The public portfolio should stay readable as static files unless a future version deliberately changes the architecture.

## Key Features

- Responsive sidebar and compact mobile navigation
- Persistent light and dark themes
- Repository-managed projects, notes, certificates, illustrations, and minigames
- Featured projects and notes on the homepage
- Safe content rendering with controlled empty and error states
- Accessible contact modal with validation and keyboard controls
- Lightweight repository checks with no application framework
- Page-specific SEO metadata, sitemap, robots rules, and social preview data
- Protected admin/message tooling separated from the public static pages

## Repository Layout

```txt
admin/       protected admin and local CMS pages
assets/      public images, icons, uploads, and CV files
content/     CMS-managed JSON collections
css/         shared public styles
docs/        public maintenance documentation
js/          public site behavior and renderers
scripts/     content, media, and secret checks
supabase/    contact Edge Function source and local config
```

## Local Development

Requirements:

- Git
- Node.js 20 or newer
- Python 3

```bash
git clone https://github.com/Enes-Balaban17/portfolio-website.git
cd portfolio-website
npm install
python -m http.server 8080 --bind 127.0.0.1
```

Open `http://127.0.0.1:8080/`. Do not use `file://`; JSON-backed pages require an HTTP server.

See [Local Development](docs/LOCAL_DEVELOPMENT.md) for the CMS workflow and troubleshooting.

## Content Management

Start the local Decap proxy in a second terminal:

```bash
npx decap-server
```

Then open `http://127.0.0.1:8080/admin/cms.html`. CMS saves modify repository files; they do not commit or push changes automatically. Review the diff and run validation before publishing.

Collection fields and media rules are documented in [CMS Content Model](docs/CMS_CONTENT_MODEL.md).

## Validation

```bash
npm run validate:content
npm run scan:secrets
npm run check:media
npm run check:seo
npm run check
```

- `validate:content` checks collection structure and required fields.
- `scan:secrets` detects common privileged credential patterns.
- `check:media` verifies local page and content references.
- `check:seo` verifies public metadata, sitemap, crawler files, and social preview references.
- `check` runs the complete validation sequence.

These checks support review; they do not replace browser, accessibility, or production security testing.

## Deployment

Netlify publishes the repository root from `main`; no build command is required. A release should pass `npm run check`, be reviewed through a pull request, and be smoke-tested on the production domain.

Use the [Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md) before tagging a release.

## Security

- Never commit environment files, private keys, exported messages, or database credentials.
- Browser-visible Supabase publishable keys identify the project but do not grant privileged access.
- Private contact data depends on Supabase Auth and Row Level Security, not hidden HTML.
- CMS content and uploads become public when committed.

See [Security](docs/SECURITY.md) for the public security boundary and reporting guidance.

## Contribution Guidelines

Start with [Contributing](docs/CONTRIBUTING.md). In short:

1. Create a focused branch from `main`.
2. Keep the site framework-free unless the architecture is intentionally reconsidered.
3. Review content and uploaded media for private data.
4. Run `npm run check` and preview affected pages.
5. Use a clear Conventional Commit message and open a pull request.

## Release Process

Release steps are documented in [Release Process](docs/RELEASE_PROCESS.md). The short version is: validate locally, merge through a pull request, let Netlify deploy from `main`, smoke-test production, then tag the release.

## Roadmap

### V2

- Spotify library integration
- Music player support on the website
- CMS-editable personal photo on the About Me page
- Detailed project pages
- Project demo screenshots and media previews

### V3

- Visitor comments
- Personal AI assistant
- More projects, notes, illustrations, and experiments

### Ongoing Maintenance

- Publish more technical notes and project case studies
- Complete dedicated accessibility and performance passes
- Expand minigame experiments without changing the static-site architecture

## License

Released under the [MIT License](LICENSE).
