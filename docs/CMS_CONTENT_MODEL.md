# CMS Content Model

Decap CMS edits repository JSON. Each collection file has a single root object with an `items` array so vanilla JavaScript can load it without a build step.

## Storage

```txt
content/notes/notes.json
content/projects/projects.json
content/certificates/certificates.json
content/illustrations/illustrations.json
content/minigames/minigames.json
```

The schema definitions live in `admin/config.yml`. Public rendering lives in `js/main.js`.

## Notes

Required fields:

- `title`
- `slug`: unique lowercase words separated by hyphens
- `date`: `YYYY-MM-DD`
- `summary`

Optional fields: `tags`, `body`, `featured`, and `featured_order`.

Set `featured` to `true` to include a note in the homepage preview. Lower `featured_order` values appear first; date descending and title are stable fallbacks. At most three notes may be featured.

The archive links to `note.html?slug=...`. Changing a published slug changes its public URL.

## Projects

Required fields: `title`, integer `year`, `description`, and `status`.

Optional fields: `technologies`, `demo_url`, `source_url`, `body`, `featured`, and `featured_order`. Public URLs must use HTTP or HTTPS. Empty links are not rendered.

Set `featured` to `true` to include a project in the homepage preview. Lower `featured_order` values appear first; year descending and title are stable fallbacks. At most three projects may be featured.

## Certificates

Required fields: `title`, `organization`, `type`, `date_range`, and `description`.

Logo fields:

- `logo` references an existing repository image, normally under `assets/images/certificates/`.
- `logo_upload` is managed by Decap and stored under `assets/uploads/certificates/`.
- An uploaded logo takes priority. If it fails, the renderer attempts the built-in path and then removes the logo area.

Certificate actions:

- `none`: no public action
- `link`: `certificate_url` must be an HTTP or HTTPS URL
- `pdf`: `certificate_pdf` must be a safe local or remote PDF path

Invalid or incomplete actions are not rendered.

## Illustrations

Required fields: `title`, `date`, and `description`.

Optional fields: `image`, `tags`, and `body`. CMS-uploaded images normally live under `assets/uploads/`.

## Minigames

Required fields: `title`, integer `year`, `description`, and `status`.

Optional fields: `play_url`, `source_url`, `technologies`, and `body`. Public URLs must use HTTP or HTTPS.

## Rendering and Safety Rules

- JSON text is escaped before insertion into generated markup.
- Raw CMS HTML is not trusted.
- Unsafe URL schemes such as `javascript:` are rejected.
- Missing JSON displays a controlled error or preserved fallback where implemented.
- Empty collections display an explicit empty state.
- Local media paths must exist in the repository and preserve filename case for Linux hosting.

## Editing Workflow

1. Start the static server and `decap-server` as described in `LOCAL_DEVELOPMENT.md`.
2. Edit one collection at a time.
3. Review the resulting JSON and uploaded media with `git diff`.
4. Run `npm run check`.
5. Preview the affected public page before committing.

Decap list widgets rewrite the collection JSON file. Avoid simultaneous edits to the same collection on multiple branches because conflict resolution can be difficult.
