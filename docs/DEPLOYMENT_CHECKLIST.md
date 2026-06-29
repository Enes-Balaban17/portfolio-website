# Deployment Checklist

Use this checklist for releases of the static site. Supabase and CMS authentication are deployed separately from the public files.

## Repository Preflight

- [ ] Work is on the intended release branch and the working tree contains no accidental files.
- [ ] `npm run check` passes.
- [ ] `git diff --check` passes.
- [ ] Content JSON contains no test, placeholder, private, or inappropriate entries.
- [ ] Every uploaded image and public PDF is intended for public access.
- [ ] README and setup documentation match the release behavior.
- [ ] No environment or privileged credential file is staged.

## Manual Public-Site Review

- [ ] Home, About, Notes, note detail, Projects, Resume, Illustrations, and Minigames load over HTTP.
- [ ] Dark and light themes work and persist.
- [ ] Desktop, tablet, and mobile layouts have no horizontal overflow.
- [ ] Internal navigation, external links, source links, images, and PDFs work.
- [ ] Missing or empty CMS content produces a controlled state.
- [ ] Keyboard focus and reduced-motion behavior remain usable.
- [ ] The contact modal validates errors, preserves failed submissions, and closes only after success.

## Supabase Release Gate

- [ ] `contact_messages` exists with RLS enabled.
- [ ] Public/anon users cannot select or update messages.
- [ ] Admin policies validate `auth.uid()` through `admin_users`.
- [ ] Edge Function secrets are configured outside Git.
- [ ] `IP_HASH_SALT` is a private random value, not a public project identifier.
- [ ] `submit-message` is deployed and returns the expected CORS headers.
- [ ] Valid, invalid, rate-limited, and backend-failure submissions are tested.
- [ ] Admin message read, mark-read, archive, spam, and soft-delete actions are tested.

## Decap CMS Release Gate

- [ ] `admin/config.yml` points to the intended production branch.
- [ ] Production Git Gateway or OAuth is configured and tested.
- [ ] Local-only proxy behavior is not mistaken for production authentication.
- [ ] Creating and editing each collection produces valid JSON.
- [ ] Uploads are written to the expected public media folders.
- [ ] CMS changes still receive normal Git review before release.

## Static Hosting

- [ ] Deploy the repository root with no build command.
- [ ] Confirm the host serves `.html`, `.json`, `.svg`, and `.pdf` files with appropriate content types.
- [ ] Confirm project-path hosting does not break root-relative assumptions.
- [ ] Use HTTPS and configure the custom domain or GitHub Pages URL consistently in Supabase allowed origins.
- [ ] Verify the deployed site with a clean browser session.

## Rollback

1. Identify the last known-good commit.
2. Revert the faulty release through a new reviewed commit; do not rewrite shared history.
3. Redeploy the static host.
4. Roll back the Edge Function separately when backend behavior changed.
5. Re-run the public, contact, and admin smoke tests.
