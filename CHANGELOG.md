# Changelog

Notable changes to the portfolio are recorded here.

## [1.1.0] - 2026-07-02

### Fixed

- Aligned the homepage Notes and Projects previews consistently on phone-sized screens.
- Added safe-area spacing so homepage actions remain reachable above mobile browser controls.

### Added

- Added canonical, social sharing, author, and crawler metadata to public pages.
- Added `robots.txt`, `sitemap.xml`, and structured data for the portfolio owner and website.
- Added dynamic SEO metadata for CMS-rendered note detail pages.

## [1.0.0] - 2026-07-01

### Added

- Responsive public portfolio pages with light and dark themes
- Repository-managed projects, notes, certificates, illustrations, and minigames
- Note detail pages and featured homepage content
- Resume, contact modal, and protected admin interfaces
- Local Decap CMS content workflow
- Content, media, and secret-pattern validation scripts

### Changed

- Prepared public documentation and repository structure for the first stable release
- Consolidated public maintenance guidance under `docs/`

### Security

- Kept privileged Supabase credentials out of browser code
- Documented the static hosting, authentication, and public upload boundaries
