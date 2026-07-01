# Security

This repository contains a public static website. HTML, JavaScript, JSON content, and committed uploads must be treated as publicly readable.

## Trust Boundaries

- Public pages render repository-managed content and do not read private messages.
- Contact submissions pass through a Supabase Edge Function with server-side validation and rate limiting.
- Admin pages reveal protected data only after Supabase Auth succeeds.
- Supabase Row Level Security is the authorization boundary for private message data.
- Decap CMS edits public repository content; it is not a private file store.

The Supabase project URL and publishable browser key are not privileged credentials. Service-role keys, database passwords, salts, tokens, and exported messages must never be committed or placed in browser code.

## Repository Checks

Run before opening a pull request:

```bash
npm run check
```

The check validates CMS content, scans common secret patterns, and verifies local media references. It is a guardrail, not a complete security audit.

## Reporting a Problem

Do not include credentials, private messages, or personal data in a public issue. Use GitHub's private vulnerability reporting feature when available, or contact the repository owner privately.

If a credential is exposed, revoke or rotate it immediately. Removing the text from the latest commit does not invalidate a leaked secret.

## Deployment Responsibilities

Before release, confirm that provider-side authentication, database policies, allowed origins, and server-only secrets are configured in their respective dashboards. Static hosting cannot hide an HTML file; sensitive data must remain inaccessible at the backend boundary.
