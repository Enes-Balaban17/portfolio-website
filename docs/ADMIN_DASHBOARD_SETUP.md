# Admin Dashboard Setup

This document explains the custom protected admin area.

## 1. Admin Routes

```txt
admin/login.html        public login page
admin/index.html        protected dashboard
admin/new-content.html  protected content hub
admin/messages.html     protected message reader
admin/cms.html          protected Decap CMS wrapper
admin/config.yml        Decap CMS config
```

Shared admin assets:

```txt
admin/admin.css
admin/admin-auth.js
admin/admin-dashboard.js
admin/admin-messages.js
```

## 2. Login Flow

The login page uses Supabase Auth email/password login.

No password is hardcoded in the site. The admin user must be created in Supabase Auth.

After successful login:

```txt
admin/index.html
```

After logout:

```txt
admin/login.html
```

## 3. Auth Guard

Protected pages use:

```html
<body class="admin-page admin-protected">
```

Protected content is hidden until `admin/admin-auth.js` confirms a Supabase session. After authentication succeeds, the script adds:

```txt
is-authenticated
```

to the body and dispatches:

```txt
admin:authenticated
```

Message fetching and Decap loading happen only after this event.

## 4. Dashboard Layout

`admin/index.html` includes:

- `Welcome Boss!`
- New Content card
- Read the Messages card
- Network info widget with conservative browser API signals
- Location info widget that stays inactive until the admin clicks `Use my location`

The network widget has a `Refresh network` button and uses feature detection for:

```txt
navigator.connection
navigator.mozConnection
navigator.webkitConnection
```

When the browser exposes the Network Information API, the widget can show browser-reported effective type, downlink estimate, RTT estimate, and Save-Data status. All estimates are labeled as browser estimates. Exact WiFi/LAN type is shown only when the browser exposes a reliable `connection.type` value. If the browser does not expose it, the dashboard shows:

```txt
Exact WiFi/LAN type: Not exposed by this browser
```

Upload speed is not faked. Without a real upload speed test endpoint, the dashboard shows:

```txt
Upload estimate: Not available without a test endpoint
```

Firefox, Tor Browser, and privacy-focused browser modes may hide or restrict network details. In those cases, the widget falls back to online/offline status from `navigator.onLine` and clean `Not available` values.

The page does not request geolocation on load and does not use a paid weather API. If the admin clicks `Use my location`, the browser permission prompt appears. After permission succeeds, the dashboard reverse-geocodes the coordinates through the free no-key Nominatim/OpenStreetMap reverse endpoint and displays city, region, and country instead of raw coordinates.

The last successful city/region/country lookup is cached in `localStorage` so the dashboard can show the last known location without asking for permission on every visit. The `Clear location` button removes that cached result.

Weather and temperature are hidden until a real weather service is configured.

## 5. New Content Flow

`admin/new-content.html` links to Decap CMS collections:

- Projects
- Certificates
- Notes
- Minigames
- Illustrations

Direct new-entry routes are not guaranteed across every Decap backend, so links open the relevant collection. Use the New button inside Decap CMS when creating entries.

## 6. Edit Content Flow

The same collection links support editing existing entries:

```txt
cms.html#/collections/projects
cms.html#/collections/certificates
cms.html#/collections/notes
cms.html#/collections/minigames
cms.html#/collections/illustrations
```

## 7. Decap CMS Integration

Decap CMS was moved from:

```txt
admin/index.html
```

to:

```txt
admin/cms.html
```

The CMS wrapper is protected by Supabase Auth first. Decap CMS may still require its own GitHub authentication after the Supabase-protected admin hub opens.

This creates two layers:

- Supabase Auth protects custom admin pages and the CMS wrapper route.
- Decap/GitHub auth protects repository content editing.

## 8. Read Messages Flow

`admin/messages.html` shows unread messages by default.

Filters:

- Unread
- Read
- Archived
- Spam
- All

Actions:

- Mark as read
- Archive
- Mark as spam
- Delete by setting `status = deleted`

The page uses Supabase Auth and RLS. It does not include a service key.

## 9. Auth Boundaries

Supabase Auth protects:

- dashboard access
- content hub access
- message reader access
- CMS wrapper access

Decap CMS auth protects:

- repository content edits
- media uploads through the CMS

Supabase RLS protects:

- private message reads
- message updates
- archive/delete/spam operations

## 10. Manual Setup Still Required

Required Supabase setup:

- create admin user in Supabase Auth
- create and populate `public.admin_users`
- apply RLS policies for `public.contact_messages`
- verify authenticated admin can select/update messages

See:

```txt
docs/SUPABASE_ADMIN_AUTH_SETUP.md
```

Required Decap setup:

- configure GitHub OAuth/auth for Decap CMS
- confirm `admin/config.yml` points to the correct repo and branch

See:

```txt
docs/DECAP_CMS_SETUP.md
```

## 11. Local Preview

Start the static server:

```powershell
python -m http.server 8080 --bind 127.0.0.1
```

Open:

```txt
http://127.0.0.1:8080/admin/login.html
```

## 12. Production Deploy

Deploy the static files normally.

For GitHub Pages:

- no build command
- deploy from `main`
- configure external OAuth/auth for Decap CMS

For stronger admin route protection, add host-level access control such as Cloudflare Access or Netlify access controls.
