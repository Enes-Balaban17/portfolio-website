# Enes Balaban — Portfolio Website

A CMS-driven personal portfolio for sharing software projects, development notes, certificates, illustrations, minigames, and ongoing experiments. The site is built with plain HTML, CSS, and JavaScript so it stays fast, portable, and easy to maintain.

![Static Site](https://img.shields.io/badge/Static%20Site-HTML%20%2B%20CSS%20%2B%20JS-d33682)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-f7df1e?logo=javascript&logoColor=111111)
![CMS Driven](https://img.shields.io/badge/Content-CMS%20Driven-6c63ff)
![Portfolio](https://img.shields.io/badge/Project-Developer%20Portfolio-1f6feb)
![Status](https://img.shields.io/badge/Status-In%20Progress-f08c46)

## Preview

Screenshots will be added after the final visual pass.

## Overview

This repository is the working home of my personal developer website. It brings together project archives, short technical notes, completed education and certificates, visual work, small game experiments, a web resume, and contact options in one responsive interface.

## Features

- [x] Static HTML, CSS, and JavaScript structure
- [x] Responsive dark and light interface
- [x] CMS-managed projects
- [x] CMS-managed notes and note details
- [x] CMS-managed certificates
- [x] CMS-managed illustrations
- [x] CMS-managed minigames
- [x] Contact message modal
- [x] Protected admin area foundation
- [x] Local content, media, and secret-pattern checks
- [ ] Final production deployment
- [ ] Final screenshot gallery
- [ ] Accessibility pass
- [ ] Performance pass

## Project Progress

| Area | Status | Notes |
| --- | --- | --- |
| Public pages | Stable locally | Home, About, Projects, Notes, Resume, Illustrations, and Minigames |
| CMS content | Stable locally | Public content is loaded from repository-managed JSON files |
| Admin dashboard | In progress | Authentication and content-management workflow require production configuration |
| Contact flow | Testing | Managed submission flow is implemented; production settings still need verification |
| Security review | Reviewed | Defensive repository checks and a release checklist are in place |
| Deployment | Pending | Final hosting and production integration checks remain |

## Tech Stack

| Layer | Tools |
| --- | --- |
| Frontend | HTML, CSS, vanilla JavaScript |
| Content | JSON content files and a CMS editing workflow |
| Admin | Static admin UI with authenticated data access |
| Validation | Lightweight Node.js scripts |
| Hosting target | Static hosting |

## Repository Structure

```txt
portfolio-website/
├── admin/                  # Admin and CMS entry pages
├── assets/                 # Icons, images, uploads, and CV assets
├── content/                # Public CMS-managed JSON content
├── css/                    # Global styles
├── docs/                   # Design, setup, and maintenance notes
├── js/                     # Public site behavior and content renderers
├── scripts/                # Local validation and repository checks
├── supabase/               # Managed backend function source and local config
├── index.html
├── about.html
├── projects.html
├── notes.html
├── note.html
├── resume.html
├── illustrations.html
├── minigames.html
├── package.json
└── README.md
```

## Local Development

```bash
git clone https://github.com/Enes-Balaban17/portfolio-website.git
cd portfolio-website
npm install
python -m http.server 8080 --bind 127.0.0.1
```

Open:

```txt
http://127.0.0.1:8080/
```

Do not open the pages through `file://`. JSON-backed pages require a local HTTP server.

For additional local notes, see [Local Development](docs/LOCAL_DEVELOPMENT.md).

## CMS Local Editing

Start the local CMS proxy in a separate terminal:

```bash
npx decap-server
```

Then open:

```txt
http://127.0.0.1:8080/admin/cms.html
```

Local CMS edits modify repository files. Review the resulting Git diff before committing, and remember that uploaded files become public when they are committed.

The public content fields are documented in [CMS Content Model](docs/CMS_CONTENT_MODEL.md).

## Validation

```bash
npm run validate:content
npm run scan:secrets
npm run check:media
npm run check
```

- `validate:content` checks CMS JSON structure and required fields.
- `scan:secrets` checks common privileged credential patterns.
- `check:media` verifies local content and media references.
- `check` runs the complete validation sequence.

These lightweight checks support review but do not replace a full security, accessibility, or browser audit.

## Security Notes

- Never commit private keys, credentials, or local environment files.
- Review CMS content and uploaded files before deployment; committed content is public.
- Contact and admin features depend on provider-side authentication and access rules.
- Production configuration must be verified before release.
- Do not commit exported messages, private submissions, database dumps, or diagnostic files containing personal data.

Use the [Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md) before publishing a release.

## Roadmap

### Completed

- [x] Static page structure and sidebar navigation
- [x] Theme support
- [x] CMS-rendered projects, notes, certificates, illustrations, and minigames
- [x] Contact message modal
- [x] Admin interface foundation
- [x] Local validation scripts

### In Progress

- [ ] Final visual polish
- [ ] Screenshot gallery
- [ ] Accessibility review
- [ ] Responsive QA
- [ ] Content cleanup
- [ ] Production deployment setup

### Planned

- [ ] More project case studies
- [ ] More technical notes
- [ ] Better illustration gallery filtering
- [ ] Minigame experiments
- [ ] Performance audit

## Git Workflow

- Work on focused feature branches.
- Use Conventional Commits.
- Run `npm run check` before pushing.
- Keep secrets and generated local files out of commits.

```bash
git checkout -b feature/readme-refresh
npm run check
git add README.md
git commit -m "docs: refresh public repository readme"
```

## License

This project is available under the [MIT License](LICENSE).
