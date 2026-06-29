# Supabase Message Backend Setup

This document describes how the portfolio contact/message modal connects to Supabase through an Edge Function.

## Project

Supabase project:

```txt
https://supabase.com/dashboard/project/ufcvdlidsdrcdnjswocj
```

Project URL used by the frontend:

```txt
https://ufcvdlidsdrcdnjswocj.supabase.co
```

Frontend-safe publishable key:

```txt
sb_publishable_2qSMGPoQ9199wxowxnywDQ_ez2jsaj8
```

This publishable key is safe to use in browser JavaScript. It is not a privileged database key.

## Current Frontend Flow

The homepage hero `Email Newsletter` button opens the message modal.

Sidebar `Email signup` links remain direct mail links:

```txt
mailto:balabanenes111@icloud.com
```

Valid modal submissions are posted to:

```txt
https://ufcvdlidsdrcdnjswocj.supabase.co/functions/v1/submit-message
```

The frontend sends the publishable key only in the `apikey` header.

## Required Table

Existing table:

```txt
public.contact_messages
```

Expected columns:

```sql
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  contact_email text not null,
  phone_country_code text,
  phone_number text,
  message text not null,
  status text not null default 'unread',
  spam_score integer not null default 0,
  spam_reason text,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
```

Suggested indexes:

```sql
create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

create index if not exists contact_messages_ip_hash_created_at_idx
  on public.contact_messages (ip_hash, created_at desc);

create index if not exists contact_messages_status_idx
  on public.contact_messages (status);
```

## RLS Warning

Enable Row Level Security on the table before production:

```sql
alter table public.contact_messages enable row level security;
```

Do not allow public browser clients to read messages.

The current recommended path is:

- public users submit only through the Edge Function
- Edge Function inserts using a server-side secret key
- admin reads happen through authenticated Supabase Auth policies in the protected custom admin dashboard

Do not expose `service_role`, `sb_secret_...`, or any other privileged key in frontend JavaScript.

Custom admin setup details live in:

```txt
docs/SUPABASE_ADMIN_AUTH_SETUP.md
```

## Edge Function

Function path:

```txt
supabase/functions/submit-message/index.ts
```

Config:

```txt
supabase/config.toml
```

The function:

- handles CORS
- validates payload shape
- checks honeypot field
- checks form timestamp timing
- rejects obvious gibberish and repeated text
- hashes the requester IP before storing it
- checks recent messages from the same IP hash
- rejects excessive repeat submissions
- stores accepted messages in `public.contact_messages`
- marks high-scoring messages as `spam`

## Required Secrets

Set these secrets for the deployed function.

Required:

```txt
SUPABASE_URL=https://ufcvdlidsdrcdnjswocj.supabase.co
ALLOWED_PUBLISHABLE_KEYS=sb_publishable_2qSMGPoQ9199wxowxnywDQ_ez2jsaj8
IP_HASH_SALT=<generate-a-long-random-secret>
```

At least one privileged database key must be available to the function:

```txt
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

or, if using the newer key format:

```txt
SUPABASE_SECRET_KEY=<sb_secret_key>
```

The function also supports Supabase-provided JSON env values:

```txt
SUPABASE_SECRET_KEYS
SUPABASE_PUBLISHABLE_KEYS
```

Optional:

```txt
ALLOWED_ORIGINS=http://127.0.0.1:8080,http://localhost:8080,https://enes-balaban17.github.io
```

## Local Testing

Install and authenticate the Supabase CLI.

Start local functions:

```powershell
supabase functions serve submit-message --env-file .env.local
```

Example `.env.local`:

```txt
SUPABASE_URL=https://ufcvdlidsdrcdnjswocj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
ALLOWED_PUBLISHABLE_KEYS=sb_publishable_2qSMGPoQ9199wxowxnywDQ_ez2jsaj8
IP_HASH_SALT=<long-random-local-secret>
ALLOWED_ORIGINS=http://127.0.0.1:8080,http://localhost:8080
```

To test the deployed/static page locally:

```powershell
python -m http.server 8080 --bind 127.0.0.1
```

Then open:

```txt
http://127.0.0.1:8080/index.html
```

By default, `js/main.js` points at the deployed Supabase function. To test against a locally served function, temporarily define this before loading `js/main.js`:

```html
<script>
  window.PORTFOLIO_SUPABASE_CONFIG = {
    url: "http://127.0.0.1:54321",
    publishableKey: "sb_publishable_2qSMGPoQ9199wxowxnywDQ_ez2jsaj8",
    submitEndpoint: "http://127.0.0.1:54321/functions/v1/submit-message"
  };
</script>
```

Manual modal test:

1. Click the homepage hero `Email Newsletter` button.
2. Submit an invalid form and confirm errors appear.
3. Submit a valid form and confirm it sends to the Edge Function.
4. Confirm a row appears in `public.contact_messages`.
5. Confirm sidebar `Email signup` opens `mailto:balabanenes111@icloud.com` and does not open the modal.

## Deployment

Link the project if needed:

```powershell
supabase link --project-ref ufcvdlidsdrcdnjswocj
```

Set secrets:

```powershell
supabase secrets set SUPABASE_URL=https://ufcvdlidsdrcdnjswocj.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
supabase secrets set ALLOWED_PUBLISHABLE_KEYS=sb_publishable_2qSMGPoQ9199wxowxnywDQ_ez2jsaj8
supabase secrets set IP_HASH_SALT=<long-random-secret>
supabase secrets set ALLOWED_ORIGINS=http://127.0.0.1:8080,http://localhost:8080,https://enes-balaban17.github.io
```

Deploy:

```powershell
supabase functions deploy submit-message
```

## Production TODOs

- Confirm `public.contact_messages` exists with the required fields.
- Enable RLS and ensure public clients cannot select message rows.
- Confirm the Edge Function can insert using a server-side privileged key.
- Generate a real `IP_HASH_SALT` and keep it secret.
- Tune `RATE_LIMIT_WINDOW_MINUTES` and `RATE_LIMIT_MAX_MESSAGES` in the Edge Function if needed.
- Add Turnstile or another server-verified challenge if spam becomes an issue.
- Create the Supabase Auth admin user and apply admin RLS policies from `docs/SUPABASE_ADMIN_AUTH_SETUP.md`.
