# File Structure Plan

This document defines the planned file structure before implementation starts.

## SSG / Framework Decision

First version decision:

- Do not use Gatsby for the first version.
- Do not use React, Vite, Astro, Next.js, or another SSG in the first version.
- Build the first version with static HTML, CSS, and JavaScript.
- Host the website with GitHub Pages.

Reasoning:

- The first version should stay simple and easy to maintain.
- The project is currently a personal portfolio with static pages.
- Notes and Projects can be managed as static HTML pages at first.
- A static structure is enough for the first release.
- The maintained architecture remains static HTML, CSS, and JavaScript.

Growth strategy:

- Keep content in repository JSON and improve the existing vanilla JavaScript renderers as collections grow.
- Treat any future framework or build-system proposal as a separate architectural decision, not an automatic migration path.

## Final First Version Structure

```txt
portfolio-website/
│
├── index.html
├── notes.html
├── note.html
├── projects.html
├── about.html
├── resume.html
├── minigames.html
├── illustrations.html
│
├── README.md
├── LICENSE
├── .gitignore
├── .env.example
├── package.json
├── package-lock.json
│
├── .github/
│   └── workflows/
│       └── static-validation.yml
│
├── scripts/
│   ├── validate-content.mjs
│   ├── scan-secrets.mjs
│   └── check-media.mjs
│
├── assets/
│   ├── icons/
│   │   ├── aboutme-icon.svg
│   │   ├── aboutme_icon.png
│   │   ├── assembly.svg
│   │   ├── blender.svg
│   │   ├── c.svg
│   │   ├── cpp.svg
│   │   ├── csharp.svg
│   │   ├── css.svg
│   │   ├── email-newsletter.svg
│   │   ├── filesection_icon.png
│   │   ├── folder-open.svg
│   │   ├── github-dark-theme.svg
│   │   ├── github-light-theme.svg
│   │   ├── html.svg
│   │   ├── java.svg
│   │   ├── javascript.svg
│   │   ├── kotlin.svg
│   │   ├── mailnewsletter-icon.svg
│   │   ├── notebook.svg
│   │   ├── oracle-db.svg
│   │   ├── projects.svg
│   │   ├── react.svg
│   │   ├── sql.svg
│   │   ├── terminal.svg
│   │   ├── theme-moon.svg
│   │   ├── theme-sun.svg
│   │   └── typescript.svg
│   │
│   ├── images/
│   │   ├── enescot.png
│   │   ├── gba-icon.png
│   │   └── profile/optional
│   │
│   ├── cv/
│   │   └── enes-balaban-cv.pdf
│   │
│   ├── uploads/
│   │   └── certificates/
│   │       └── uploaded-certificate.pdf
│   │
│   └── screenshots/
│
├── admin/
│   ├── login.html
│   ├── index.html
│   ├── new-content.html
│   ├── messages.html
│   ├── cms.html
│   ├── config.yml
│   ├── admin.css
│   ├── admin-auth.js
│   ├── admin-dashboard.js
│   └── admin-messages.js
│
├── content/
│   ├── notes/
│   │   └── notes.json
│   ├── projects/
│   │   └── projects.json
│   ├── certificates/
│   │   └── certificates.json
│   ├── illustrations/
│   │   └── illustrations.json
│   └── minigames/
│       └── minigames.json
│
├── css/
│   └── style.css
│
├── js/
│   └── main.js
│
└── docs/
    ├── SITE_PLAN.md
    ├── DESIGN_SYSTEM.md
    ├── SKILLS_PLAN.md
    ├── ICON_SOURCES.md
    ├── FILE_STRUCTURE.md
    ├── CMS_AND_MESSAGES_SETUP.md
    ├── SUPABASE_SETUP.md
    ├── SUPABASE_ADMIN_AUTH_SETUP.md
    ├── ADMIN_DASHBOARD_SETUP.md
    ├── DECAP_CMS_SETUP.md
    ├── LOCAL_DEVELOPMENT.md
    ├── CMS_CONTENT_MODEL.md
    ├── SECURITY_REVIEW.md
    └── DEPLOYMENT_CHECKLIST.md
```

## Page Responsibilities

### `index.html`

Home page with the left sidebar and main hero/about intro.

Includes:

- Sidebar
- About Me / Hero intro
- Hero mascot with CSS accent circle
- About Me and Email Newsletter action buttons
- Skills grid section
- Notes preview section
- Projects preview section
- Contact block in sidebar
- Homepage Email Newsletter opens the contact/message modal; sidebar Email signup remains a mailto link

### `about.html`

Full About Me page.

Includes:

- About Me introduction
- Contact
- Certificates & Completed Educations
- What I'm Doing Right Now
- Tools
- Hardware
- Miscellaneous links

### `notes.html`

Notes archive page.

Includes:

- Year in Review notes
- Events attended
- Completed projects
- Completed educations
- Short development notes
- Search input if needed

### `note.html`

Static-friendly note detail page. It reads the `slug` query parameter, loads `content/notes/notes.json`, and safely renders the matching note without injecting CMS HTML.

### `projects.html`

Projects archive page.

Includes:

- Year-based project list
- Project descriptions
- Demo / Source / Details links
- Optional project status labels

### `resume.html`

Web version of the resume/CV.

PDF CV can also be linked from here later.

### `minigames.html`

Page for small games and experiments.

### `illustrations.html`

Page for illustration/design work.

## Shared Components in Static HTML

Since the first version will not use a framework, the sidebar will be repeated in each HTML file.

This is acceptable for the first version because the website is small.

The repeated layout is deliberate for the current no-build architecture. Any future component-generation step requires an explicit tooling decision and must preserve GitHub Pages output.

## CSS Plan

All first-version styling will be in:

```txt
css/style.css
```

Main CSS sections:

- CSS variables
- Base styles
- Sidebar layout
- Main content layout
- Typography
- Links/buttons
- Cards
- Skills grid
- Archive lists
- Theme styles
- Responsive styles

## JavaScript Plan

All first-version JavaScript will be in:

```txt
js/main.js
```

Initial JavaScript responsibilities:

- Dark/light theme toggle
- Save selected theme to localStorage
- Load JSON content for Notes, Projects, Certificates, Illustrations, and Minigames
- Render individual note details from a stable note slug
- Optional search/filter for Notes
- Contact/message modal behavior, client-side validation, and Supabase submission

## CMS Content Structure

Decap CMS manages repository JSON files for content editing:

```txt
content/notes/notes.json
content/projects/projects.json
content/certificates/certificates.json
content/illustrations/illustrations.json
content/minigames/minigames.json
```

Each file uses:

```json
{
  "items": []
}
```

This keeps the first version static and avoids adding a framework or static site generator.

## Skills Structure Decision

The current version does not use a separate `skills.html` page.

Skills are shown as a homepage section in `index.html` using the order and grid rules from `docs/SKILLS_PLAN.md`.

## Deployment Plan

First version deployment:

- Use GitHub Pages
- Deploy from the `main` branch
- Root directory deployment

No build command is needed for the first static version.
