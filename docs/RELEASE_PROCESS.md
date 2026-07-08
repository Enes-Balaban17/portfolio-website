# Release Process

Use this process for tagged public releases.

## Before Opening a Pull Request

1. Sync with `main`.
2. Confirm the diff does not include local-only files, private notes, credentials, or exported data.
3. Run:

```bash
npm run check
git diff --check
```

4. Preview the public site:

```bash
python -m http.server 8080 --bind 127.0.0.1
```

5. Smoke-test the main routes:
   - `/`
   - `/about.html`
   - `/projects.html`
   - `/notes.html`
   - `/resume.html`
   - `/illustrations.html`
   - `/minigames.html`
   - `/robots.txt`
   - `/sitemap.xml`

## Merge and Deploy

Netlify deploys from `main`. After the pull request is merged, confirm the production deploy completes and smoke-test `https://enesbalaban.dev/`.

If a deploy appears stale, trigger a clear-cache deploy from the Netlify dashboard.

## Tagging

Create releases from the validated `main` commit. Release notes must contain only public information.

Example:

```bash
gh release create v1.2.0 --target main --title "enesbalaban.dev v1.2" --notes-file RELEASE_NOTES.md
```

Use a temporary notes file outside the repository when it contains release-drafting text that should not be committed.

## Branch Cleanup

Delete only branches proven to be merged:

```bash
git branch --merged main
git branch -r --merged origin/main
```

Do not delete `main`, protected branches, or branches with unique unmerged commits.
