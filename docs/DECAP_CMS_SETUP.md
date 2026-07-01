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

For production, Decap CMS still needs a real authentication setup. The recommended production path is Netlify Identity + Git Gateway. Sign in with the email and password from the Netlify Identity invitation. A GitHub account email/password and the Supabase admin credentials do not authenticate Decap CMS. If the site is hosted only on GitHub Pages, Decap CMS needs an external OAuth proxy for GitHub login.

On `admin/cms.html`, the Netlify Identity widget loads before the custom CMS login controller. The `Open Netlify Identity login` button initializes and opens that widget directly. A successful Identity login reloads the protected CMS wrapper so Decap can use the stored Git Gateway session.

Netlify Identity invitation, confirmation, email-change, and password-recovery emails can redirect to the main site with a token in the URL hash. `index.html` loads the Identity widget and `js/netlify-identity-flow.js`, which detects supported token parameter names and opens the appropriate widget flow automatically. The helper never logs, copies, or manually stores token values. If a reset link opens the homepage without a form, confirm that `netlify-identity-widget.js` and the helper both load successfully on `index.html`.

Do not claim production CMS login works until that auth setup is configured.

The CMS wrapper displays a readable connection status before Decap loads. If an external CMS or Identity script fails, it replaces short or opaque failures with a clear configuration/network error instead of exposing an unhelpful one-character message.

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
- featured
- featured_order
- tags
- summary
- body

Projects:

- title
- year
- featured
- featured_order
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

The canonical two-process local workflow is documented in `LOCAL_DEVELOPMENT.md`. Start the static server and `npx decap-server`, sign in through `admin/login.html`, and then open `admin/cms.html`.

Saved CMS edits modify repository files under `content/` and `assets/uploads/`. Review them with Git and run `npm run check`; the local proxy does not commit or push changes.

Collection fields, URL rules, media behavior, and note slug requirements are documented in `CMS_CONTENT_MODEL.md`.

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
- enable Netlify Identity and Git Gateway manually for the production site
- invite the CMS editor email through Netlify Identity before attempting to sign in
- complete the invitation and set the Netlify Identity password before using the production CMS
- confirm the backend branch is `main`
- confirm media uploads commit to `assets/uploads`
- remember that Supabase Auth protects the custom admin hub, while Decap/GitHub auth protects repository editing

Supabase admin credentials and GitHub passwords do not authenticate Decap CMS. Local editing uses `npx decap-server` and does not prove that production Git Gateway login is configured. If the production CMS accepts the custom admin login but then rejects Decap login, verify the Netlify Identity invitation and Git Gateway settings in the Netlify dashboard; do not add repository tokens or Supabase secrets to frontend files.

## 9. Remaining Production TODOs

- Configure real Decap CMS authentication for GitHub.
- Decide whether production CMS edits should go directly to `main` or through editorial workflow/pull requests.
- Add real illustration and minigame content when ready.
- Keep Supabase message access protected separately from Decap CMS.
