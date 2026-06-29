# Enes Balaban Portfolio Website

## Project Title & Clear Value Proposition

A static personal portfolio for presenting software projects, development notes, skills, certificates, illustrations, minigames, and professional contact information. The public site is designed to remain readable, deployable on GitHub Pages, and maintainable without a frontend framework or build step.

## Core Architecture & System Flow

The repository has three deliberately separate responsibilities:

1. Public pages are plain HTML documents styled by `css/style.css` and enhanced by `js/main.js`.
2. Repository content is stored as JSON under `content/` and edited through Decap CMS.
3. Contact messages and protected admin operations use Supabase Auth, Row Level Security, and an Edge Function.

```txt
Public browser -> static HTML/CSS/JS -> content/*.json
Contact modal  -> submit-message Edge Function -> contact_messages table
Admin pages    -> Supabase Auth + RLS -> protected message operations
Decap CMS      -> Git/local backend -> repository JSON and uploaded media
```

Supabase and Decap CMS solve different problems. Supabase does not manage portfolio content, and Decap CMS does not provide authorization for private contact messages.

## Key Engineering Features

- Static HTML, CSS, and JavaScript with no frontend framework.
- Dark and light themes with persisted user preference.
- Responsive sidebar, archive lists, cards, and accessible interactions.
- JSON-driven Notes, Projects, Certificates, Illustrations, and Minigames.
- Defensive URL and media handling for CMS-managed public content.
- Supabase Edge Function submission with validation, spam scoring, and rate limiting.
- Supabase Auth and RLS boundaries for the custom admin area.
- Decap CMS local editing through `decap-server`.
- Dependency-free repository checks for content, secrets, and media references.

## Prerequisites & Local Environment Setup

- Git
- Node.js 20 or newer for repository checks and the Decap local proxy
- Python 3 for the local static server
- A Supabase CLI installation only when developing or deploying Edge Functions

Clone the repository and install the existing Node dependencies:

```bash
git clone https://github.com/Enes-Balaban17/portfolio-website.git
cd portfolio-website
npm install
```

`.env.example` documents configuration names. The static browser application does not automatically load `.env` files. Privileged Supabase values must be configured as Edge Function secrets, never in frontend code.

## Step-by-Step Installation & Execution Guide

Start the public site from the repository root:

```bash
python -m http.server 8080 --bind 127.0.0.1
```

Open `http://127.0.0.1:8080/`. Do not preview JSON-backed pages through `file://`; browser fetch restrictions can prevent content from loading.

For complete local instructions, see [Local Development](docs/LOCAL_DEVELOPMENT.md).

## Automated Testing / Validation Protocol

The project currently uses lightweight static checks rather than a browser test framework:

```bash
npm run validate:content
npm run scan:secrets
npm run check:media
npm run check
```

- `validate:content` checks JSON structure, required fields, dates, slugs, action types, and safe URLs.
- `scan:secrets` checks committed and unignored text files for common privileged-key patterns.
- `check:media` verifies local runtime references and CMS media paths.

These checks do not replace manual responsive, accessibility, Supabase, or CMS testing.

## Contribution & Governance Rules

- Create a focused branch instead of editing `main` directly.
- Keep the public implementation static HTML/CSS/JS unless an architectural change is explicitly approved.
- Keep commits small and use Conventional Commits, for example `docs: improve repository guidance`.
- Run `npm run check` before requesting review.
- Do not commit environment files, credentials, generated caches, or privileged Supabase keys.
- Treat `docs/SITE_PLAN.md`, `docs/FILE_STRUCTURE.md`, `docs/DESIGN_SYSTEM.md`, `docs/SKILLS_PLAN.md`, and `docs/ICON_SOURCES.md` as implementation sources of truth.

## Security Notes

- The Supabase publishable key is designed for browser use; database access must still be restricted by RLS.
- The service-role key and IP hash salt are server-only Edge Function secrets.
- Client-side admin email checks improve UX but do not authorize database access.
- Static hosting cannot hide admin HTML files. Supabase Auth and RLS must protect private data.
- The secret scanner detects common mistakes but is not a complete security audit.

See [Security Review](docs/SECURITY_REVIEW.md) and [Supabase Admin Auth Setup](docs/SUPABASE_ADMIN_AUTH_SETUP.md).

## Decap CMS Local Workflow

Run the local CMS proxy in one terminal:

```bash
npx decap-server
```

Run the static server in another terminal, then open `http://127.0.0.1:8080/admin/cms.html`. Local CMS saves modify repository files and still require normal Git review, commit, and push steps.

See [CMS Content Model](docs/CMS_CONTENT_MODEL.md) and [Decap CMS Setup](docs/DECAP_CMS_SETUP.md).

## Supabase Admin/Auth Setup Overview

The contact form submits through `supabase/functions/submit-message`. Protected message reading uses Supabase Auth and RLS; browser code never receives a service-role key. Creating the admin user, applying policies, and configuring Edge Function secrets are manual Supabase operations documented in:

- [Supabase Setup](docs/SUPABASE_SETUP.md)
- [Supabase Admin Auth Setup](docs/SUPABASE_ADMIN_AUTH_SETUP.md)
- [Admin Dashboard Setup](docs/ADMIN_DASHBOARD_SETUP.md)

## Deployment Notes

The public site can be deployed from the repository root with no build command. Before release, run the repository checks, inspect production content, verify local media, deploy the Supabase Edge Function separately, and confirm production CMS authentication. Use [Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md) as the release gate.

## Licensing

This project is licensed under the [MIT License](LICENSE).
