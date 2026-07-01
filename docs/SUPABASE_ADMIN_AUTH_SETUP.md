# Supabase Admin Auth Setup

This document explains the Supabase Auth setup for the custom admin dashboard.

## 1. Admin User

Create the admin user in Supabase Auth:

1. Open the Supabase dashboard.
2. Go to Authentication.
3. Create an email/password user for the admin account.
4. Do not store the password in this repository.

The frontend login page is:

```txt
admin/login.html
```

## 2. Frontend-Safe Key

The admin frontend uses only:

```txt
https://ufcvdlidsdrcdnjswocj.supabase.co
YOUR_SUPABASE_PUBLISHABLE_KEY
```

The publishable key is safe for browser JavaScript.

Never put these in frontend code:

```txt
service_role
sb_secret_...
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_SECRET_KEY
```

## 3. Allowed Admin Email UI Guard

The shared admin guard in `admin/admin-auth.js` supports:

```js
window.PORTFOLIO_ADMIN_CONFIG = {
  allowedAdminEmails: ["balabanenes111@icloud.com"]
};
```

This is a client-side UX guard only. It is not a substitute for Supabase RLS because browser code can be inspected.

For real authorization, use the RLS policies below.

## 4. Recommended Admin Authorization Table

Create a table that identifies admin users by Supabase Auth user id:

```sql
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create policy "Admins can read own admin row"
on public.admin_users
for select
to authenticated
using ((select auth.uid()) = user_id);
```

After creating the Auth user, insert the admin row:

```sql
insert into public.admin_users (user_id, email)
values ('AUTH_USER_UUID_HERE', 'balabanenes111@icloud.com')
on conflict (user_id) do update
set email = excluded.email;
```

## 5. Contact Message RLS

Messages are stored in:

```txt
public.contact_messages
```

Enable RLS:

```sql
alter table public.contact_messages enable row level security;
```

Grant access to authenticated users so RLS can evaluate policies:

```sql
grant usage on schema public to authenticated;
grant select on public.admin_users to authenticated;
grant select, update on public.contact_messages to authenticated;
```

Allow only configured admins to read and update messages:

```sql
create policy "Admins can read contact messages"
on public.contact_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users admin
    where admin.user_id = (select auth.uid())
  )
);

create policy "Admins can update contact messages"
on public.contact_messages
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users admin
    where admin.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.admin_users admin
    where admin.user_id = (select auth.uid())
  )
);
```

The admin dashboard uses soft delete by setting:

```txt
status = deleted
```

No browser-side delete policy is required.

## 6. How Message Operations Work

`admin/messages.html` loads `admin/admin-messages.js`.

After `admin/admin-auth.js` confirms a Supabase session, the messages script queries:

```txt
public.contact_messages
```

Actions:

- Mark as read: `status = read`, `read_at = now`
- Archive: `status = archived`
- Mark as spam: `status = spam`
- Delete: `status = deleted`

If RLS is missing or incorrect, the page shows an error and does not fall back to demo/private data.

## 7. Static Hosting Limitation

Static hosting cannot truly hide HTML, CSS, or JavaScript files from direct download.

The security model is therefore:

1. Protected admin pages render no protected content until Supabase Auth confirms a session.
2. Sensitive message data is fetched only after authentication.
3. Supabase RLS prevents unauthenticated or non-admin users from reading or updating private rows.

For true server-side blocking of admin HTML files, add host-level protection later, for example:

- Cloudflare Access
- Netlify password protection or role-based access
- a server-rendered authenticated admin area

## 8. Test Login

Local preview:

```powershell
python -m http.server 8080 --bind 127.0.0.1
```

Open:

```txt
http://127.0.0.1:8080/admin/login.html
```

Sign in with the Supabase Auth admin email/password.

## 9. Test Direct URL Protection

While logged out, open:

```txt
http://127.0.0.1:8080/admin/index.html
http://127.0.0.1:8080/admin/new-content.html
http://127.0.0.1:8080/admin/messages.html
http://127.0.0.1:8080/admin/cms.html
```

Expected behavior:

- protected content is hidden
- the page redirects to `admin/login.html`
- no message data is fetched

## 10. Production TODOs

- Create the real Supabase Auth admin user.
- Insert that user into `public.admin_users`.
- Apply the RLS policies above.
- Configure `allowedAdminEmails` in `admin/admin-auth.js` or through an inline config if desired.
- Keep JWT expiry short enough for admin use.
- Add host-level protection if raw admin HTML must also be blocked server-side.
