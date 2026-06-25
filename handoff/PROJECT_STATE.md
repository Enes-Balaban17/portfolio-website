# Project State

## Purpose

This repository is the first static version of Enes Balaban's personal portfolio website. It is intended for GitHub Pages and must stay simple: static HTML, CSS, and JavaScript only.

Do not add React, Vite, Next.js, Astro, Gatsby, Eleventy, or any other framework for this version.

## Source Of Truth

Before editing code, read the planning documents in this order:

1. `docs/SITE_PLAN.md`
2. `docs/FILE_STRUCTURE.md`
3. `docs/DESIGN_SYSTEM.md`
4. `docs/SKILLS_PLAN.md`
5. `docs/ICON_SOURCES.md`

Use those files for content structure, file layout, visual rules, skills order, and local icon usage.

## Current Branch

Current handoff branch:

```txt
add-certificate-logos
```

Note: this local checkout was initially found on `main`; the `add-certificate-logos` branch was created locally for this handoff.

## Implemented Files

Core static pages:

- `index.html`
- `about.html`
- `notes.html`
- `projects.html`
- `resume.html`
- `minigames.html`
- `illustrations.html`

Shared assets and behavior:

- `css/style.css`
- `js/main.js`
- `assets/icons/`
- `assets/images/`

Certificate logo assets currently present:

- `assets/images/certificates/ege-university-logo.png`
- `assets/images/certificates/data-analysis-ai-logo.png`
- `assets/images/certificates/tusas-lift-up-logo.png`

The latest user handoff text names expected future certificate paths as `.svg` files:

- `assets/images/certificates/ege-university-logo.svg`
- `assets/images/certificates/data-analysis-ai-logo.svg`
- `assets/images/certificates/tusas-lift-up-logo.svg`

At handoff time, the actual local placeholder files are PNG files and the current `about.html` paths resolve correctly. Do not rename, convert, or redesign the logos unless the user provides replacement files or a path is broken.

## Certificate Card State

The "Certificates & Completed Educations" section in `about.html` has been updated so each certificate item uses:

- left side: certificate title, description, and date
- right side: a logo inside `.certificate-logo-frame`

The CSS in `css/style.css` keeps the existing card style and adds:

- `.certificate-card`
- `.certificate-content`
- `.certificate-logo-frame`
- responsive mobile stacking for certificate cards below 600px

Desktop behavior:

- card uses flex row
- text remains on the left
- logo frame is aligned on the right
- frame is 96px by 96px
- logo image is contained with `object-fit: contain`

Mobile behavior:

- card stacks into a single column
- logo frame becomes 84px by 84px
- logo image becomes 72px by 72px

## Important Design Rules

- Keep the dark/light portfolio theme.
- Preserve the minimal developer-portfolio style.
- Use local assets only; do not add remote icon or image URLs.
- Keep sidebar width at 260px.
- Keep the primary sidebar nav to About Me, Notes, and Projects.
- Do not add a separate Skills page in the current version.
- Keep the homepage Skills grid in the exact order from `docs/SKILLS_PLAN.md`.
- Keep text readable and avoid stretching content too wide.
- Do not redesign the whole site when making targeted changes.

## Verification Already Done

- `about.html` contains the certificate card markup.
- `css/style.css` contains certificate card and logo frame rules.
- `assets/images/certificates/` exists and contains the three current local PNG placeholder logos.
- The local server returned `200 image/png` for all three certificate logo URLs.
- Browser measurement confirmed desktop cards use row layout and the logo images fit inside 96px frames.
- Browser measurement confirmed mobile cards stack and do not create horizontal overflow.

## Remaining Tasks

- Decide whether to keep current PNG certificate placeholders or replace them with user-provided SVG files later.
- If SVG replacements are provided, update `about.html`, docs, and asset paths consistently.
- Review the remaining dirty worktree changes before staging anything else.
- Push the branch and open a PR into `main`.
- If GitHub CLI is still unavailable, use the GitHub compare URL from `LOCAL_PREVIEW.md` or the final Codex response.
