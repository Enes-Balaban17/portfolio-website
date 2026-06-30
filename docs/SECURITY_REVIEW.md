# Security Review

Review date: 2026-06-30

This is a defensive review of the repository and its documented deployment assumptions. It does not claim that the live Supabase project, hosting account, DNS, or production policies were independently audited.

## Review Scope

Reviewed areas:

- public HTML pages, `js/main.js`, and `css/style.css`
- protected admin HTML and scripts under `admin/`
- `admin/config.yml` and public CMS JSON under `content/`
- `supabase/functions/submit-message/index.ts` and `supabase/config.toml`
- `.gitignore`, `.env.example`, `package.json`, and scripts under `scripts/`
- Supabase, Decap CMS, deployment, and local-development documentation

Automated checks used:

```powershell
npm run validate:content
npm run scan:secrets
npm run check:media
```

No intrusive scan, external exploitation, authentication bypass, or production data access was performed.

## Secret Exposure Result

The repository scan found no high-confidence private key, Supabase secret key, service-role JWT, GitHub token, cloud access key, or credential-bearing database URL.

The following values are intentionally public and are not authorization secrets:

- Supabase project URL
- Supabase publishable/anon key
- public Edge Function URL

Server-only values must be configured as Supabase Edge Function secrets:

- `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SECRET_KEY`
- `IP_HASH_SALT`
- database passwords and private API tokens

Supabase CLI state under `supabase/.temp/` is ignored and must not be committed. If a real secret is ever discovered in Git history, remove it from use immediately and rotate it before cleaning history.

## Supabase Auth Findings

- Protected admin pages hide their content until `admin/admin-auth.js` confirms a current Supabase Auth session.
- Logged-out direct navigation redirects to `admin/login.html`.
- `admin/admin-messages.js` requests private rows only after the `admin:authenticated` event.
- The configured admin email list is a client-side UX guard only. It can be inspected or modified by a visitor and must not be treated as authorization.
- The browser contains no service-role or Supabase secret key.
- Static hosting cannot prevent the admin HTML files themselves from being downloaded. RLS protects the private data boundary.

## Supabase RLS Assumptions And Manual Checks

The repository documents an `admin_users` table keyed by the Supabase Auth user ID and authenticated-only SELECT/UPDATE policies for `contact_messages`. These policies cannot be verified from the static repository.

Manually confirm in the Supabase dashboard:

1. RLS is enabled on `public.contact_messages` and `public.admin_users`.
2. No `anon` or public SELECT/UPDATE policy exists for `contact_messages`.
3. The intended Auth user exists in `public.admin_users` with the correct UUID.
4. Authenticated SELECT and UPDATE policies require a matching `admin_users.user_id = auth.uid()` row.
5. Public clients do not receive INSERT access; contact submission occurs through the Edge Function.
6. Soft delete sets `status = 'deleted'`; it does not physically erase a row.

The SQL guidance is in `SUPABASE_ADMIN_AUTH_SETUP.md`. Apply it deliberately in the dashboard and test with both an unauthenticated client and a non-admin authenticated user.

## Supabase Edge Function Findings

`submit-message` is intentionally public (`verify_jwt = false`) because portfolio visitors are not signed-in users. The publishable-key allowlist identifies an expected client configuration but is not a secret or a substitute for abuse controls.

Implemented controls:

- only `POST` and `OPTIONS` are accepted
- `ALLOWED_ORIGINS` is required and disallowed browser origins fail closed
- JSON content type and a 16 KiB request-body limit are enforced
- required fields, email, phone, timing, field lengths, and the 2000-character message limit are validated server-side
- honeypot, readable-message, repeated-character, link-count, and timing checks are applied
- recent messages from the same salted IP hash are rate limited
- submissions fail closed when the server-side rate-limit lookup is unavailable
- `IP_HASH_SALT` is required; the project URL is not used as a salt fallback
- user-agent storage is capped and message bodies are not written to function logs
- public errors avoid returning stack traces, secret names, database responses, or raw exception messages
- JSON responses disable caching and MIME sniffing

Remaining operational checks:

- verify `ALLOWED_ORIGINS`, `ALLOWED_PUBLISHABLE_KEYS`, `IP_HASH_SALT`, and the privileged database key in Edge Function secrets
- confirm the recent-message query has a suitable `(ip_hash, created_at)` index
- monitor rate-limit failures and tune limits without logging private message content
- consider an atomic database-side rate-limit function if high-concurrency abuse becomes a concern
- add a server-verified challenge such as Turnstile only if abuse requires it

CORS restricts browser origins; it does not prevent direct requests. Server-side validation and rate limiting remain mandatory.

## Personal Data Handling Findings

The contact flow may store name, company, contact email, optional phone number, message, salted IP hash, user agent, timestamps, and spam metadata.

- Public pages do not query or render submitted messages.
- Private message rows are loaded only in the authenticated admin messages page and remain subject to RLS.
- Invalid or failed submissions preserve typed values; successful submissions reset the form after confirmation.
- The browser stores only theme preference and a contact cooldown timestamp in `localStorage`.
- Admin message data and Supabase sessions are not copied into custom local-storage keys by project code.
- Current delete behavior is a soft delete. Define a retention period and periodically purge old, spam, and soft-deleted rows through a trusted server-side process if permanent deletion is required.

Do not commit exported contact messages, production database dumps, screenshots containing private messages, or diagnostic logs containing form bodies.

## Decap CMS Findings

- `local_backend: true` is for the local `npx decap-server` workflow.
- Production editing still requires Netlify Identity/Git Gateway or a correctly configured external OAuth proxy.
- Supabase Auth protects the custom CMS wrapper UI; Decap/Git authentication separately authorizes repository writes.
- CMS JSON and uploaded assets are public repository content. They must never contain private contact submissions or secrets.
- Content renderers escape CMS text before inserting controlled markup.
- Certificate actions accept only HTTP(S) links or constrained PDF paths; `javascript:` targets are rejected.
- Media and PDF paths are checked by `npm run check:media`.

Uploaded certificate PDFs and images are public once committed. Review every uploaded file for personal data, metadata, licensing, and intended publication before pushing it.

## Frontend Security Findings

- CMS-backed text is escaped before controlled `innerHTML` templates are assigned.
- Note bodies are rendered as escaped text with controlled paragraph and line-break markup.
- External links created by renderers use `target="_blank"` with `rel="noopener"`.
- URL helpers reject unsupported schemes and unsafe certificate actions.
- Missing DOM nodes and failed content fetches produce clean fallback states.
- Contact backend failures are shown as controlled messages rather than raw non-JSON gateway responses.
- Third-party CDN scripts remain a supply-chain dependency. Pin exact versions and consider self-hosting critical admin dependencies before production.
- GitHub Pages cannot set arbitrary response headers. If stronger browser policy is required, deploy through a host that supports CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy` headers.

## Remaining Manual Checks

- Test admin login, logout, token refresh, expired sessions, and a disallowed account.
- Test direct admin URLs in a clean logged-out browser profile.
- Attempt unauthenticated and non-admin SELECT/UPDATE requests and confirm RLS denies them.
- Confirm `submit-message` rejects a disallowed Origin, non-JSON body, oversized body, malformed JSON, and excessive recent submissions.
- Confirm production Decap authentication before publishing `/admin/cms.html` as an operational editor.
- Review public CMS content and uploaded files for private data before every deployment.

## Production Hardening Checklist

- [ ] Verify RLS is enabled on `contact_messages`.
- [ ] Verify no public/anon SELECT policy exists for `contact_messages`.
- [ ] Verify the admin Auth user exists in `public.admin_users` with the correct user ID.
- [ ] Verify the `admin_users` policy and authenticated message SELECT/UPDATE policies work.
- [ ] Verify `ALLOWED_ORIGINS` contains only current local and production origins.
- [ ] Verify `ALLOWED_PUBLISHABLE_KEYS` contains the current publishable key.
- [ ] Verify `SUPABASE_URL`, the privileged database key, and a random `IP_HASH_SALT` are Edge Function secrets.
- [ ] Verify no service-role, secret, database password, or private token is committed or present in browser code.
- [ ] Verify Decap production authentication is configured and tested.
- [ ] Verify direct admin URLs while logged out reveal no private data and redirect to login.
- [ ] Verify submitted private messages never appear in public HTML, JSON, logs, or CMS content.
- [ ] Verify local uploaded certificate PDFs and images are safe and intended for public distribution.
- [ ] Define message retention and permanent-deletion procedures.
- [ ] Run `npm run check` and inspect the full diff before release.
