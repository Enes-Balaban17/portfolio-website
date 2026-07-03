# SEO and Search Console Checklist

The public site uses page-specific titles, descriptions, canonical URLs, Open Graph metadata, Twitter Card metadata, structured data, `robots.txt`, and `sitemap.xml`. These signals help search engines understand the site, but they do not guarantee immediate indexing or ranking.

## After Deployment

1. Open [Google Search Console](https://search.google.com/search-console/).
2. Add the URL-prefix property `https://enesbalaban.dev`.
3. Complete Google's ownership verification flow.
4. Submit `https://enesbalaban.dev/sitemap.xml` in the Sitemaps report.
5. Use URL Inspection for:
   - `https://enesbalaban.dev/`
   - `https://enesbalaban.dev/about.html`
   - `https://enesbalaban.dev/projects.html`
6. Request indexing for the important public pages after the production deploy is verified.
7. Search for `site:enesbalaban.dev` periodically to review indexed pages.
8. Allow time for recrawling. Indexing and ranking can take days or weeks.

## Discoverability

- Add `enesbalaban.dev` to the GitHub profile website field.
- Add `enesbalaban.dev` to the LinkedIn profile.
- Link to the portfolio from relevant public project README files.
- Keep GitHub and LinkedIn links current on the portfolio.
- Continue publishing useful projects and development notes over time.

## Google Search Favicon

- The production hostname serves stable root assets at `/favicon.ico`, `/favicon-48x48.png`, `/favicon-192x192.png`, and `/apple-touch-icon.png`.
- Keep these paths stable. Replace the files in place when updating the brand icon instead of adding timestamped favicon URLs.
- Keep the favicon square, recognizable at small sizes, and accessible to crawlers through `robots.txt`.
- After a favicon update, inspect `https://enesbalaban.dev/` in Search Console and request indexing. Google may need time to recrawl the homepage before the search result icon changes.

## Sitelinks Eligibility

- Google generates sitelinks automatically; the site cannot force or submit them directly.
- Keep page titles and primary headings concise and distinct.
- Preserve the homepage `Explore the site` links and inner-page section navigation so important pages remain reachable through plain HTML links.
- Keep canonical URLs and sitemap entries aligned with the public routes.
- Use URL Inspection for the homepage and important section pages after navigation or metadata changes.
- Review search results over time rather than repeatedly changing titles solely to trigger sitelinks.

## Maintenance

- Run `npm run check:seo` after changing public page heads or routes.
- Update `sitemap.xml` when a new public page is added.
- Keep titles and descriptions accurate and readable.
- Avoid keyword stuffing and do not add a `meta keywords` tag.
- Keep admin pages out of the sitemap and protected with `noindex, nofollow`.
- Replace the current mascot-based social image with a purpose-designed 1200x630 image in a future visual asset pass.

## Analytics and Tag Management

- Google Tag Manager container: `GTM-NV8G86KK`.
- Google Analytics 4 measurement ID: `G-H30CXY75SF`.
- Public pages load GTM and GA4; admin pages intentionally load neither.
- If GA4 is configured inside the GTM container with the same measurement ID, disable one pageview source to avoid duplicate analytics events.
- Verify the published tags with Google Tag Assistant and confirm visits in the GA4 Realtime report after deployment.

## Reference Documentation

- [Google Search title guidance](https://developers.google.com/search/docs/appearance/title-link)
- [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google structured data introduction](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Google favicon guidance](https://developers.google.com/search/docs/appearance/favicon-in-search)
- [Google sitelinks guidance](https://developers.google.com/search/docs/appearance/sitelinks)
- [Google breadcrumb structured data](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)
