# Security Review

This document records the repository's security boundaries and current verification expectations. It does not claim that external Supabase or hosting configuration has been audited automatically.

## Trust Boundaries

### Public static site

All HTML, CSS, JavaScript, content JSON, public images, and publishable configuration can be downloaded by visitors. Nothing committed to these paths is secret.

### Contact submission

The browser sends validated form data to the public `submit-message` Edge Function. The function performs server-side validation, spam scoring, rate limiting, IP hashing, and privileged insertion into `contact_messages`.

The endpoint is intentionally public. A publishable key identifies the Supabase project but does not authenticate a trusted sender.

### Admin operations

Supabase Auth establishes the browser session. The client-side allowed-email check controls presentation only. RLS policies backed by `admin_users` must authorize reads and updates to private messages.

### Decap CMS

The Supabase guard controls access to the custom admin wrapper. Decap requires its own Git/local backend authorization for repository writes. Neither mechanism replaces the other.

## Key Classification

Safe for frontend use:

- Supabase project URL
- Supabase publishable/anon key
- Edge Function public URL

Server-only:

- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_SECRET_KEY`
- `IP_HASH_SALT`
- database passwords and private API tokens

Server-only values must be stored as Supabase Edge Function secrets. They must never appear in HTML, browser JavaScript, screenshots, CMS content, or committed environment files.

## Repository Controls

- `.env` variants, credential files, private keys, local caches, and Supabase temporary state are ignored.
- `.env.example` contains placeholders only.
- `npm run scan:secrets` checks common privileged credential formats in tracked and unignored text files.
- GitHub Actions runs the same scan on pushes and pull requests.
- Content and media checks reduce broken or unsafe CMS references.

The scanner is intentionally lightweight and cannot prove that a repository is secret-free. GitHub secret scanning or another dedicated service should remain enabled where available.

## Known Limitations

- Static hosting cannot prevent users from downloading admin HTML or frontend configuration.
- Client-side email allowlists are not authorization.
- RLS and Supabase Auth configuration live outside Git and require manual verification.
- A public contact endpoint can still be called outside a browser; CORS is not an anti-abuse control.
- Rate limiting depends on the availability and correctness of the recent-message query.
- Third-party CDN scripts expand the supply-chain trust boundary.
- The current automated checks do not perform dynamic browser, accessibility, or penetration testing.

## Review Checklist

Before production deployment:

1. Confirm no public or anon SELECT/UPDATE policy exists for `contact_messages`.
2. Confirm authenticated message policies check membership in `admin_users`.
3. Confirm the service-role key and a random `IP_HASH_SALT` are Edge Function secrets.
4. Confirm allowed origins and publishable keys match the deployed environments.
5. Test unauthorized message reads directly against Supabase.
6. Test admin login, logout, token refresh, and denied-account behavior.
7. Test contact validation, rate limiting, failed insertion, and successful insertion.
8. Review CDN versions and consider CSP and Subresource Integrity where compatible.
9. Run `npm run check` and inspect the full staged diff.

Detailed SQL and setup instructions remain in `SUPABASE_SETUP.md` and `SUPABASE_ADMIN_AUTH_SETUP.md`.
