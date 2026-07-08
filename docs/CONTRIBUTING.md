# Contributing

This repository is the source for a static personal portfolio. Changes should keep the site simple, reviewable, and deployable from the repository root.

## Development Rules

- Keep the public site static HTML, CSS, and JavaScript.
- Do not introduce a frontend framework or build pipeline without an explicit architecture decision.
- Treat files under `content/` and `assets/uploads/` as public once committed.
- Do not commit `.env`, private notes, exported messages, credentials, or local tool state.
- Keep JavaScript defensive around missing DOM nodes, malformed JSON, unavailable browser APIs, and failed network requests.
- Prefer comments that explain a constraint or tradeoff. Avoid comments that repeat the next line of code.

## Workflow

1. Create a focused branch from the latest `main`.
2. Make the smallest change that solves the issue.
3. Run `npm run check`.
4. Preview affected pages through a local HTTP server.
5. Open a pull request with a clear summary and test notes.

## Commit Style

Use Conventional Commit prefixes where practical:

- `fix:` for bug fixes
- `feat:` for user-facing additions
- `docs:` for documentation changes
- `style:` for visual-only CSS or markup polish
- `refactor:` for behavior-preserving code cleanup
- `chore:` for repository maintenance

## Review Checklist

- Public pages still load without console errors.
- CMS JSON remains valid.
- Media paths resolve on a case-sensitive host.
- No private data appears in the diff.
- Admin and Supabase changes preserve the documented security boundary.
