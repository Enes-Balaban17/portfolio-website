# Decap CMS Setup

This project uses Decap CMS as a lightweight content editor for repository-backed site content.

## 1. What Decap CMS Does

Decap CMS provides a content editor at:

```txt
admin/cms.html
```

It edits content files in the GitHub repository for:

- Notes
- Projects
- Certificates
- Illustrations
- Minigames

The public website stays static HTML, CSS, and JavaScript. No framework or build step is required for this CMS setup.

## 2. What Supabase Does Separately

Supabase is only used for the contact/message backend and admin message reading.

Decap CMS does not store private contact messages. Supabase does not manage Notes, Projects, Illustrations, or Minigames content.

## 3. Admin Access

The protected custom admin dashboard is:

```txt
admin/index.html
```

The CMS entry point is:

```txt
admin/cms.html
```

The config file is:

```txt
admin/config.yml
```

Current backend target:

```txt
local_backend: true
backend: git-gateway
branch: main
```

The CMS wrapper is protected by Supabase Auth first. Decap CMS then uses its own content-editing backend. Do not fake either layer in the static site.

For local development, Decap CMS uses `local_backend: true` with the Decap local proxy server. It should not redirect to Netlify auth locally.

For production, Decap CMS still needs a real authentication setup. The recommended production path is Netlify Identity + Git Gateway. If the site is hosted only on GitHub Pages, Decap CMS needs an external OAuth proxy for GitHub login.

Do not claim production CMS login works until that auth setup is configured.

## 4. Content Storage

Content is stored as JSON:

```txt
content/
  notes/
    notes.json
  projects/
    projects.json
  certificates/
    certificates.json
  illustrations/
    illustrations.json
  minigames/
    minigames.json
```

Each JSON file uses this shape:

```json
{
  "items": []
}
```

The frontend renderer in `js/main.js` loads these JSON files with `fetch()` and renders them into the existing static pages.

## 5. Content Fields

Notes:

- title
- slug
- date
- tags
- summary
- body

Projects:

- title
- year
- description
- technologies
- demo_url
- source_url
- status
- body

Certificates:

- title
- organization
- type
- date_range
- description
- logo (stable repository path for built-in logos)
- logo_upload (new image uploaded through Decap CMS)
- certificate_action_type (`none`, `link`, or `pdf`)
- certificate_url
- certificate_pdf
- body

Illustrations:

- title
- date
- image
- description
- tags
- body

Minigames:

- title
- year
- description
- play_url
- source_url
- technologies
- status
- body

## 6. Image Uploads

Uploaded CMS media is stored in:

```txt
assets/uploads
```

The Decap public upload path is also relative:

```txt
assets/uploads
```

This keeps image paths compatible with local preview and GitHub Pages project URLs.

Certificate PDF uploads use the file widget and are stored separately in:

```txt
assets/uploads/certificates
```

Certificate logos use two fields so Decap does not try to resolve built-in repository images through the upload media library:

- `logo` is a string path for existing files under `assets/images/certificates/`.
- `logo_upload` is an image widget that stores new files under `assets/uploads/certificates/`.
- `logo_upload` takes priority on the public page. If it is missing or fails to load, the renderer tries `logo`, then removes the logo area cleanly if neither image loads.

Set `certificate_action_type` to `link` and fill `certificate_url` for an external verification page. Set it to `pdf` and upload `certificate_pdf` for a PDF. Set it to `none` when no public certificate action should appear. The public renderer shows `View Certificate` only when the selected field contains a valid target.

External links must begin with `http://` or `https://`. PDF targets must be an `http(s)` PDF URL or a local `.pdf` path under `assets/`. Invalid, empty, and `javascript:` values are not rendered.

## 7. Local Preview

Local CMS editing needs two local processes.

First terminal, from the repository root:

```bash
npx decap-server
```

This starts the Decap local backend/proxy. It lets Decap CMS save changes into local repository files instead of redirecting to Netlify/GitHub OAuth.

Second terminal, from the repository root:

```powershell
python -m http.server 8080 --bind 127.0.0.1
```

Open:

```txt
http://127.0.0.1:8080/admin/cms.html
```

If the custom admin auth gate is active, sign in through:

```txt
http://127.0.0.1:8080/admin/login.html
```

Then open:

```txt
http://127.0.0.1:8080/admin/cms.html
```

Saved CMS edits modify local repository files under `content/` and `assets/uploads/`. After editing locally, commit and push the changed files with Git.

Public site preview:

```txt
http://127.0.0.1:8080/
```

The JSON content pages are:

```txt
http://127.0.0.1:8080/notes.html
http://127.0.0.1:8080/projects.html
http://127.0.0.1:8080/illustrations.html
http://127.0.0.1:8080/minigames.html
```

Notes open through a static detail route such as:

```txt
http://127.0.0.1:8080/note.html?slug=building-my-personal-portfolio-website
```

The `slug` field must be unique within `notes.json`. Use lowercase words separated by hyphens. The public renderer escapes note body content and preserves paragraphs and line breaks without injecting raw CMS HTML.

The About page loads certificates from `content/certificates/certificates.json`. Its saved HTML cards remain only as a resilient fallback when the JSON file cannot be loaded.

Without `npx decap-server`, the public pages still load JSON normally, but the CMS cannot save local edits through the local backend.

## 8. Deployment

Deploy the static files to GitHub Pages, Netlify, or another static host.

For GitHub Pages:

- deploy from `main`
- no build command is required
- keep JSON files committed under `content/`
- configure an external OAuth proxy if Decap CMS editing must work on GitHub Pages

For Decap CMS production editing:

- configure real CMS authentication
- recommended path: Netlify Identity + Git Gateway
- confirm the backend branch is `main`
- confirm media uploads commit to `assets/uploads`
- remember that Supabase Auth protects the custom admin hub, while Decap/GitHub auth protects repository editing

## 9. Remaining Production TODOs

- Configure real Decap CMS authentication for GitHub.
- Decide whether production CMS edits should go directly to `main` or through editorial workflow/pull requests.
- Add real illustration and minigame content when ready.
- Keep Supabase message access protected separately from Decap CMS.
