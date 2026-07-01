# Deployment Checklist

Use this checklist for production changes and tagged releases.

## Repository

- [ ] Work is based on the latest `main`.
- [ ] The diff contains no temporary, local-only, or private files.
- [ ] `npm run check` passes.
- [ ] `git diff --check` passes.
- [ ] Content JSON contains no test or private entries.
- [ ] Uploaded images and PDFs are intended for public access.

## Public Site

- [ ] Home, About, Projects, Notes, note detail, Resume, Illustrations, and Minigames load over HTTP.
- [ ] Light and dark themes work and persist.
- [ ] Navigation, favicons, images, PDFs, and external links work.
- [ ] Empty CMS collections display a controlled state.
- [ ] Desktop and mobile layouts have no horizontal overflow.
- [ ] Keyboard focus and reduced-motion behavior remain usable.
- [ ] The contact modal validates errors and closes only after a successful submission.

## Service Boundaries

- [ ] No private credential is present in browser code or tracked files.
- [ ] Supabase Auth and database policies deny private message access to public users.
- [ ] Edge Function secrets and allowed origins are configured outside Git.
- [ ] CMS changes still receive normal Git review before deployment.

## Netlify

- [ ] Production deploys from `main` with repository root as the publish directory.
- [ ] No build command is required.
- [ ] The custom domain uses HTTPS.
- [ ] The deploy preview is checked before merge.
- [ ] The production domain is smoke-tested after merge.

## Release

- [ ] The changelog and README reflect the release.
- [ ] The release tag points to the validated `main` commit.
- [ ] Release notes contain only public information.
- [ ] Stale branches are deleted only after confirming they contain no unique work.

## Rollback

Revert the faulty change through a reviewed commit, redeploy `main`, and repeat the public-site smoke tests. Backend functions should be rolled back separately when their behavior changed.
