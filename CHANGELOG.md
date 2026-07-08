# Changelog

Notable changes to the portfolio are recorded here.

## [1.2.0] - 2026-07-08

### Changed

- Refined public repository documentation for human contributors.
- Hardened ignored files and environment variable handling.
- Consolidated validation workflow coverage for cleaner pull request checks.
- Updated the release metadata for `enesbalaban.dev v1.2`.

### Security

- Rechecked the repository for common secret patterns and private local files.
- Clarified which configuration values are public browser settings and which belong only in server-side runtimes.

## [1.1.1] - 2026-07-02

### Fixed

- Corrected the Projects favicon colors for the saved light and dark site themes.
- Tightened the phone-only alignment of homepage Notes and Projects previews.

### Added

- Added a stable social preview image and expanded page-specific search and social metadata.
- Added an automated SEO validation script, Search Console checklist, sitemap priorities, and admin crawler headers.

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
