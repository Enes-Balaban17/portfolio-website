# Files Changed

This file records the handoff-relevant files and why they exist.

## Certificate Implementation Files

### `about.html`

Contains the "Certificates & Completed Educations" section. Each certificate item now uses a text wrapper and a right-side logo frame:

- `.certificate-card`
- `.certificate-content`
- `.certificate-logo-frame`

Current image paths in this file point to PNG placeholder assets under `assets/images/certificates/`.

### `css/style.css`

Contains the certificate card layout and responsive rules:

- desktop flex layout
- fixed square logo frame
- contained logo image sizing
- mobile single-column stacking below 600px

This file also contains the broader site styling, so be careful when editing it.

### `assets/images/certificates/ege-university-logo.png`

Local placeholder logo for the Ege University certificate card.

### `assets/images/certificates/data-analysis-ai-logo.png`

Local placeholder logo for the Data Analysis School / Artificial Intelligence Module certificate card.

### `assets/images/certificates/tusas-lift-up-logo.png`

Local placeholder logo for the TUSAS LIFT UP certificate card.

## Handoff Files

### `handoff/PROJECT_STATE.md`

Summarizes project purpose, branch state, implemented files, design rules, certificate state, verification, and remaining tasks.

### `handoff/NEXT_MODEL_PROMPT.md`

Contains a complete prompt that can be pasted into a local Ollama-based coding model.

### `handoff/FILES_CHANGED.md`

Explains why each handoff-relevant file exists.

### `handoff/LOCAL_PREVIEW.md`

Explains how to run and verify the static site locally.

### `handoff/PATCH_main_to_certificate_logos.diff`

Patch generated from:

```powershell
git diff main..add-certificate-logos > handoff/PATCH_main_to_certificate_logos.diff
```

The patch is intended as a portable review artifact for the next model.

## Other Dirty Files Observed At Handoff

The repository had additional modified/untracked files before this handoff package was created. They may be intentional earlier portfolio edits. Inspect them before staging:

- `assets/icons/*.svg`
- `assets/icons/aboutme_icon.png`
- `assets/icons/filesection_icon.png`
- `docs/DESIGN_SYSTEM.md`
- `docs/FILE_STRUCTURE.md`
- `docs/ICON_SOURCES.md`
- `docs/SITE_PLAN.md`
- `docs/SKILLS_PLAN.md`
- `illustrations.html`
- `index.html`
- `minigames.html`
- `notes.html`
- `projects.html`
- `resume.html`
- deleted `skills.html`

Do not blindly revert or stage these files. Confirm scope first.
